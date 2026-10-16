import TrackPlayer, { Event } from 'react-native-track-player';
import type { SabrDownloader, SabrTokenCallbackReason } from './sabr_downloader.base';
import { YouTubeDL } from '@origin/youtube/youtube_dl';

export const mobile_sabr_downloader: SabrDownloader = {
	download_sabr: async (params, output_path, on_progress) => {
		let unsub: { remove: () => void } | undefined;
		let unsub_reload: { remove: () => void } | undefined;
		if (on_progress) {
			unsub = TrackPlayer.addEventListener(Event.SabrDownloadProgress, (event: { outputPath: string; progress: number }) => {
				if (event.outputPath === output_path) on_progress(event.progress);
			});
		}
		if (params.callbacks?.onReloadPlayerResponse) {
			unsub_reload = TrackPlayer.addEventListener(Event.SabrReloadPlayerResponse, async (event: { outputPath: string; token: string | null }) => {
				if (event.outputPath !== output_path) return;
				try {
					const result = await params.callbacks?.onReloadPlayerResponse!({ reloadPlaybackParams: { token: event.token ?? '' } });
					if (result) {
						await TrackPlayer.updateSabrStream(output_path, result.serverAbrStreamingUrl, result.videoPlaybackUstreamerConfig);
					}
				} catch { }
			});
		}
		let token_refresh_in_flight = false;
		const unsub_refresh = TrackPlayer.addEventListener(Event.SabrRefreshPoToken, async (event: { outputPath?: string; reason: SabrTokenCallbackReason }) => {
			if (event.outputPath !== output_path) return;
			if (token_refresh_in_flight) return;
			token_refresh_in_flight = true;
			try {
				const token = await YouTubeDL.fetch_potoken(params.videoId);
				if ('error' in token) throw token.error;
				await TrackPlayer.updateSabrPoToken(output_path, token.po_token);
			} catch { } finally {
				token_refresh_in_flight = false;
			}
		});
		try {
			await TrackPlayer.downloadSabr({
				sabrServerUrl: params.serverAbrStreamingUrl,
				sabrUstreamerConfig: params.videoPlaybackUstreamerConfig,
				clientInfo: params.clientInfo,
				cookie: params.cookie,
				duration: params.duration,
				placeholder_po_token: params.poToken,
				preferOpus: true,
				sabrFormats: params.formats as Record<string, any>[]
			}, output_path);
		} finally {
			unsub?.remove();
			unsub_reload?.remove();
			unsub_refresh?.remove();
		}
	}
};
