import { DownloadEvent, DownloadManager, DownloadState } from 'react-native-everything-player';
import type { Download, SabrStreamingInfo } from 'react-native-everything-player';
import type { SabrDownloader } from './sabr_downloader.base';
import { reinterpret_cast } from '@common/cast';
import { fs } from '@native/fs/fs';

export const mobile_sabr_downloader: SabrDownloader = {
	download_sabr: async (params, output_path, on_progress) => {
		const track_id = `sabr-download:${params.videoId}:${Date.now()}`;
		const streaming_info = reinterpret_cast<SabrStreamingInfo>(params);

		let unsub: { remove: () => void } | undefined;
		try {
			const finished = new Promise<Download>((resolve, reject) => {
				const settle = (download: Download) => {
					if (download.state === DownloadState.Completed) resolve(download);
					else if (download.state === DownloadState.Failed || download.state === DownloadState.Cancelled)
						reject(new Error(download.error?.message ?? `SABR download ${download.state}`));
				};
				unsub = DownloadManager.addEventListener(DownloadEvent.DownloadChanged, (download) => {
					if (download.trackId !== track_id) return;
					on_progress?.(download.progress);
					settle(download);
				});
				DownloadManager.download({
					id: track_id,
					title: params.videoId,
					artist: '',
					duration: params.duration,
					streamingInfo: streaming_info
				}).then(settle, reject);
			});
			const download = await finished;
			const downloaded_path = download.audioPath ?? download.localPath;
			if (downloaded_path === undefined) throw new Error('SABR download completed without a file path');
			await fs().move(downloaded_path, output_path, {});
		} finally {
			unsub?.remove();
			await DownloadManager.remove(track_id).catch(() => { });
		}
	}
};
