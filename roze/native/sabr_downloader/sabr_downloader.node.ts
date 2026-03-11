import { createWriteStream } from "fs";
import { SabrStream } from "googlevideo/sabr-stream";
import { EnabledTrackTypes } from "googlevideo/utils";
import type { SabrDownloader, SabrDownloadParams } from "./sabr_downloader.base";

export const node_sabr_downloader: SabrDownloader = {
	download_sabr: async (params: SabrDownloadParams, output_path: string, on_progress?: (progress: number) => void) => {
		const { sabrServerUrl, sabrUstreamerConfig, sabrFormats, poToken, clientInfo, cookie } = params;

		const sabr_fetch: typeof fetch = async (input, init) => {
			const extra_headers: Record<string, string> = {
				"origin": "https://www.youtube.com",
				"referer": "https://www.youtube.com/",
			};
			if (cookie) extra_headers["cookie"] = cookie;
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

		const sabr_stream = new SabrStream({
			serverAbrStreamingUrl: sabrServerUrl,
			videoPlaybackUstreamerConfig: sabrUstreamerConfig,
			formats: sabrFormats as any,
			poToken,
			clientInfo: clientInfo as any,
			fetch: sabr_fetch,
		});

		sabr_stream.on('streamProtectionStatusUpdate', (status: any) => {
			console.log(`[SABR] streamProtectionStatus: ${JSON.stringify(status)}`);
		});

		const { audioStream, selectedFormats } = await sabr_stream.start({
			enabledTrackTypes: EnabledTrackTypes.AUDIO_ONLY,
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
					write_stream.destroy(err);
					reject(err as Error);
				});
			}

			write_stream.on("error", reject);
			pump();
		});
	}
};
