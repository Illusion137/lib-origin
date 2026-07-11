import TrackPlayer, { Event } from 'react-native-track-player';
import type { SabrDownloader, SabrTokenCallbackReason } from "./sabr_downloader.base";
import { YouTubeDL } from '@origin/youtube_dl';

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
		let token_refresh_in_flight = false;
		const unsub_refresh = TrackPlayer.addEventListener(Event.SabrRefreshPoToken, async (event: { outputPath?: string, reason: SabrTokenCallbackReason }) => {
			if (event.outputPath !== output_path) return;
			if (token_refresh_in_flight) return;
			token_refresh_in_flight = true;
			try {
				const token = await YouTubeDL.fetch_potoken(params.content_binding);
				if("error" in token) throw token.error;
				await TrackPlayer.updateSabrPoToken(output_path, token.po_token);
			} catch {
				// ignore — stream will fail naturally if token can't be refreshed
			} finally {
				token_refresh_in_flight = false;
			}
		});
		try {
			await TrackPlayer.downloadSabr(params as Parameters<typeof TrackPlayer.downloadSabr>[0], output_path);
		} finally {
			unsub?.remove();
			unsub_reload?.remove();
			unsub_refresh?.remove();
		}
	}
};
