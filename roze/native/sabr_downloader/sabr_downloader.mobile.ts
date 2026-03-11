import TrackPlayer from 'react-native-track-player';
import type { SabrDownloader } from "./sabr_downloader.base";

export const mobile_sabr_downloader: SabrDownloader = {
	download_sabr: async (params, output_path, on_progress) => {
		let unsub: { remove: () => void } | undefined;
		if (on_progress) {
			// SabrDownloadProgress = 'sabr-download-progress' (RNTPvE extension)
			unsub = (TrackPlayer as any).addEventListener('sabr-download-progress', (event: { outputPath: string; progress: number }) => {
				if (event.outputPath === output_path) on_progress(event.progress);
			});
		}
		try {
			await (TrackPlayer as any).downloadSabr(params, output_path);
		} finally {
			unsub?.remove();
		}
	}
};
