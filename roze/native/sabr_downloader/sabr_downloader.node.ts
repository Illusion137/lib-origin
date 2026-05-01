import { createWriteStream } from "fs";
import { SabrStream } from "googlevideo/sabr-stream";
import { EnabledTrackTypes } from "googlevideo/utils";
import type { ReloadPlaybackContext } from "googlevideo/protos";
import type { SabrDownloader, SabrDownloadParams } from "./sabr_downloader.base";

export const node_sabr_downloader: SabrDownloader = {
	download_sabr: async (params: SabrDownloadParams, output_path: string, on_progress?: (progress: number) => void) => {
		const { sabrServerUrl, sabrUstreamerConfig, sabrFormats, poToken, placeholder_po_token, clientInfo, cookie } = params;

		const sabr_fetch: typeof fetch = async (input, init) => {
			const extra_headers: Record<string, string> = {
				"origin": "https://www.youtube.com",
				"referer": "https://www.youtube.com/",
			};
			if (cookie) extra_headers.cookie = cookie;
			const resp = await fetch(input, {
				...init,
				headers: {
					...((init?.headers as Record<string, string>) ?? {}),
					...extra_headers,
				},
			});
			if (!resp.ok) {
				console.error(`[sabr_fetch] ${resp.status} ${resp.statusText} url=${input.toString().substring(0, 100)}`);
			}
			return resp;
		};

		// Start with placeholder token; real token is applied on first SPS=2 event.
		const initial_token = placeholder_po_token ?? poToken;

		const sabr_stream = new SabrStream({
			serverAbrStreamingUrl: sabrServerUrl,
			videoPlaybackUstreamerConfig: sabrUstreamerConfig,
			formats: sabrFormats,
			poToken: initial_token,
			clientInfo: clientInfo,
			fetch: sabr_fetch,
		});

		let real_token_applied = false;
		sabr_stream.on('streamProtectionStatusUpdate', async (status: any) => {
			// console.log(`[SABR] streamProtectionStatus: ${JSON.stringify(status)}`);
			if (status.status === 2) {
				if (!real_token_applied) {
					real_token_applied = true;
					if (poToken) sabr_stream.setPoToken(poToken);
				} else if (params.on_refresh_po_token) {
					try {
						const refreshed = await params.on_refresh_po_token("expired");
						sabr_stream.setPoToken(refreshed);
					} catch (e) { console.error('[SABR] Failed to refresh poToken:', e); }
				}
			}
		});

		sabr_stream.on('reloadPlayerResponse', async (ctx: ReloadPlaybackContext) => {
			if (!params.on_reload_player_response) return;
			try {
				const updated = await params.on_reload_player_response(ctx);
				if (updated) {
					sabr_stream.setStreamingURL(updated.sabrServerUrl);
					sabr_stream.setUstreamerConfig(updated.sabrUstreamerConfig);
				}
			} catch (e) { console.error('[SABR] Failed to reload player response:', e); }
		});

		sabr_stream.on('error', (e: any) => console.log('[SABR] error:', e));
		// try logging ALL events if SabrStream extends EventEmitter:

		const { audioStream, selectedFormats } = await sabr_stream.start({
			enabledTrackTypes: EnabledTrackTypes.AUDIO_ONLY,
			preferOpus: params.preferOpus,
		});

		const content_length = selectedFormats.audioFormat.contentLength;

		await new Promise<void>((resolve, reject) => {
			const write_stream = createWriteStream(output_path);
			const reader = audioStream.getReader();

			let bytes_received = 0;

			function pump(): void {
				reader.read().then(({ done, value }) => {
					if (done) {
						write_stream.end(resolve);
						return;
					}
					bytes_received += value.byteLength;
					if (on_progress && content_length && content_length > 0) {
						on_progress(bytes_received / content_length);
					}
					write_stream.write(value, (err) => {
						if (err) {
							reader.cancel();
							write_stream.destroy(err);
							reject(err);
							return;
						}
						pump();
					});
				}).catch((err) => {
					console.warn(err);
					write_stream.destroy(err);
					reject(err as Error);
				});
			}

			write_stream.on("error", reject);
			pump();
		});
	}
};
