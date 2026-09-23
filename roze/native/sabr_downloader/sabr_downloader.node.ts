import { createWriteStream } from "fs";
import { SabrStream, type ReloadResponse } from "googlevideo/sabr-stream";
import type { SabrDownloader, SabrDownloadParams } from "./sabr_downloader.base";
import { YouTubeDL } from "@origin/youtube_dl";
import { catch_log } from "@common/utils/error_util";
import { EnabledTrackTypes } from "googlevideo/utils";

export const node_sabr_downloader: SabrDownloader = {
	download_sabr: async (params: SabrDownloadParams, output_path: string, on_progress?: (progress: number) => void) => {
		// Logger.getInstance().setLogLevels(99);

		const sabr_fetch: typeof fetch = async (input, init) => {
			const extra_headers: Record<string, string> = {
				"origin": "https://www.youtube.com",
				"referer": "https://www.youtube.com/",
			};
			if (params.cookie) extra_headers.cookie = params.cookie;
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
		const initial_token = params.placeholder_po_token;

		const sabr_stream = new SabrStream({
			clientInfo: params.clientInfo!,
			serverAbrStreamingUrl: params.sabrServerUrl,
			formats: params.sabrFormats ?? [],
			videoPlaybackUstreamerConfig: params.sabrUstreamerConfig,
			// ? Assuming video_id is content_binding
			videoId: params.content_binding,
			poToken: initial_token,
			fetchFunction: sabr_fetch,
			callbacks: {
				onReloadPlayerResponse: async(ctx): Promise<ReloadResponse> => {
					const BAD = {
						serverAbrStreamingUrl: '',
						videoPlaybackUstreamerConfig: ''
					};
					if (!params.on_reload_player_response) return BAD;
					try {
						const updated = await params.on_reload_player_response(ctx);
						if (updated) {
							return {
								serverAbrStreamingUrl: updated.sabrServerUrl,
								videoPlaybackUstreamerConfig: updated.sabrUstreamerConfig
							}
						}
					} catch (e) {
						console.error('[SABR] Failed to reload player response:', e);
					}
					return BAD;
				},
				onMintPoToken: async () => await YouTubeDL.fetch_potoken_bytes(params.content_binding)
			},
		});

		sabr_stream.on('abort', () => console.log('[SABR] aborted'));
		// try logging ALL events if SabrStream extends EventEmitter:

		const { audioStream, selectedFormats } = await sabr_stream.start({
			isPostLiveDvr: false,
			enabledTrackTypes: EnabledTrackTypes.AUDIO_ONLY,
			audioPreferences: { preferredAudioCodec: 'opus', dynamicRangeCompression: false, voiceBoost: false }
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
							reader.cancel().catch(catch_log);
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
