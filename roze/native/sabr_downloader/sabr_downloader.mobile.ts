import TrackPlayer, { Event } from 'react-native-track-player';
import type { SabrDownloader } from "./sabr_downloader.base";

export const mobile_sabr_downloader: SabrDownloader = {
	download_sabr: async (params, output_path, on_progress) => {
		let unsub: { remove: () => void } | undefined;
		let unsub_reload: { remove: () => void } | undefined;
		if (on_progress) {
			// SabrDownloadProgress = 'sabr-download-progress' (RNTPvE extension)
			unsub = TrackPlayer.addEventListener(Event.SabrDownloadProgress, (event: { outputPath: string; progress: number }) => {
				if (event.outputPath === output_path) on_progress(event.progress);
			});
		}
		if (params.on_reload_player_response) {
			unsub_reload = TrackPlayer.addEventListener(Event.SabrReloadPlayerResponse, async (event: { outputPath: string; token: string | null }) => {
				if (event.outputPath !== output_path) return;
				try {
					const result = await params.on_reload_player_response!(event.token);
					if (result) {
						await TrackPlayer.updateSabrStream(output_path, result.sabrServerUrl, result.sabrUstreamerConfig);
					}
				} catch {
					// ignore errors in reload handler — download will time out naturally
				}
			});
		}
		try {
			await TrackPlayer.downloadSabr(params as Parameters<typeof TrackPlayer.downloadSabr>[0], output_path);
		} finally {
			unsub?.remove();
			unsub_reload?.remove();
		}
	}
};
