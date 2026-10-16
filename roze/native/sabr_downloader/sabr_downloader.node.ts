import { createWriteStream } from 'fs';
import { SabrStream } from 'googlevideo/sabr-stream';
import type { SabrDownloader } from './sabr_downloader.base';
import { catch_log } from '@common/utils/error_util';
import { EnabledTrackTypes } from 'googlevideo/utils';
import type { ExtendedSabrStreamConfig } from '@origin/youtube/youtube_dl';

export const node_sabr_downloader: SabrDownloader = {
	download_sabr: async (params: ExtendedSabrStreamConfig, output_path: string, on_progress?: (progress: number) => void) => {
		const sabr_stream = new SabrStream(params);

		sabr_stream.on('abort', () => console.log('[SABR] aborted'));

		const { audioStream, selectedFormats } = sabr_stream.start({
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

			write_stream.on('error', reject);
			pump();
		});
	}
};
