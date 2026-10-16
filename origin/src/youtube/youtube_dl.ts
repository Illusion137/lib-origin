import { catch_log, generror, generror_catch } from '@common/utils/error_util';
import { parse_runs } from '@common/utils/parse_util';
import type Innertube from 'youtubei.js';
import { Constants, Platform, YT, YTNodes, type ClientType, type IPlayerResponse, type Types } from 'youtubei.js';
import { buildSabrFormat } from 'googlevideo/utils';
import type { PromiseResult, ResponseError } from '@common/types';
import { urlid } from '@common/utils/util';
import { retry_result } from '@common/utils/retry_util';
import type { ReloadPlaybackContext } from 'googlevideo/protos';
import { jseval, load_native_jseval } from '@native/jseval/jseval';
import { createColdStartToken } from 'bgutils-js/webpo';
import { PoToken, type PoTokenResult } from './potoken';
import type { SabrFormat } from 'googlevideo/shared-types';
import { YouTubeSession } from '@origin/youtube/session';
import type { CookieJar } from '@common/utils/cookie_util';
import { reinterpret_cast } from '@common/cast';

export type VideoInfo = Awaited<ReturnType<Innertube['getInfo']>>;

Platform.shim.eval = async (data: Types.BuildScriptResult, _: Record<string, Types.VMPrimative>) => {
	return jseval().eval_in_webview(data.output);
};

export namespace YouTubeDL {
	export interface Chapter { title: string; start_time: number }
	let preloaded_cookies: string | undefined;

	export function preload_cookies(cookie?: string) {
		preloaded_cookies = cookie ?? (typeof process !== 'undefined' ? process?.env?.YOUTUBE_COOKIE_JAR : undefined);
		YouTubeSession.preload_cookies(cookie);
	}

	function session_opts(cookie?: string): YouTubeSession.Opts {
		const resolved = cookie ?? preloaded_cookies;
		if (resolved === undefined) return {};
		return { cookie_jar: reinterpret_cast<CookieJar>({ toString: () => resolved }) };
	}

	export async function get_innertube_client(client_type?: ClientType, cookie?: string): Promise<Innertube> {
		await load_native_jseval();
		return await YouTubeSession.get(session_opts(cookie), client_type, { retrieve_player: true });
	}

	export function get_chapters(info: VideoInfo) {
		const markers_map = info?.player_overlays?.decorated_player_bar?.player_bar?.markers_map;
		const marker = Array.isArray(markers_map) && markers_map.find(mark => mark.value && Array.isArray(mark.value.chapters));
		if (!marker) return [];
		const chapters = marker.value.chapters;

		return (chapters?.map((chapter: any) => ({
			title: parse_runs(chapter.chapterRenderer.title),
			start_time: chapter.chapterRenderer.timeRangeStartMillis / 1000
		})) ?? []) as Chapter[];
	}

	export interface SabrClientInfo {
		clientName?: number;
		clientVersion?: string;
	}

	export interface SabrTrackParams {
		content_binding: string;
		url: string;
		isSabr: true;
		sabrServerUrl: string;
		sabrUstreamerConfig: string;
		sabrFormats: SabrFormat[];
		placeholder_po_token: string;
		clientInfo?: SabrClientInfo;
		cookie?: string;
		duration?: number;
		preferOpus?: boolean;
		on_reload_player_response: (context: any) => Promise<{ sabrServerUrl: string; sabrUstreamerConfig: string } | null>;
	}

	export async function fetch_potoken(content_binding: string): PromiseResult<PoTokenResult> {
		const client = await get_innertube_client();
		return PoToken.generate_potoken(client.botguard, content_binding);
	}
	export async function fetch_potoken_bytes(content_binding: string): Promise<Uint8Array> {
		const client = await get_innertube_client();
		const po_token = await PoToken.generate_potoken_bytes(client.botguard, content_binding);
		if ('error' in po_token) return new Uint8Array();
		return po_token;
	}

	export async function make_player_request(innertube: Innertube, videoId: string, reloadPlaybackContext?: ReloadPlaybackContext): Promise<IPlayerResponse> {
		const watch_endpoint = new YTNodes.NavigationEndpoint({ watchEndpoint: { videoId } });

		const extraArgs: Record<string, any> = {
			playbackContext: {
				contentPlaybackContext: {
					vis: 0,
					splay: false,
					lactMilliseconds: '-1',
					signatureTimestamp: innertube.session.player?.signature_timestamp
				}
			},
			contentCheckOk: true,
			racyCheckOk: true
		};

		if (reloadPlaybackContext) {
			extraArgs.playbackContext.reloadPlaybackContext = reloadPlaybackContext;
		}

		return await watch_endpoint.call<IPlayerResponse>(innertube.actions, { ...extraArgs, parse: true });
	}

	export async function get_streaming_data(video_id: string) {
		const client = await get_innertube_client();
		const player = await make_player_request(client, video_id);
		return { streaming_data: player.streaming_data, placeholder_token: generate_placeholder_potoken(video_id) };
	}

	function generate_placeholder_potoken(content_binding: string) {
		return createColdStartToken(content_binding);
	}

	export async function resolve_sabr_info(video_id: string): Promise<SabrTrackParams | ResponseError> {
		const try_resolve_sabr_info = async () => {
			try { return await resolve_sabr_info_attempt(video_id); } catch (error) { return generror_catch(error, 'resolve_sabr_info attempt failed', 'LOW', { video_id }); }
		};
		const result = await retry_result<SabrTrackParams>(try_resolve_sabr_info, { wait_for_network: true });
		if (typeof result === 'object' && result !== null && 'error' in result) {
			return generror_catch(result.error, 'Failed to resolve SABR URL', 'CRITICAL', { video_id });
		}
		return result;
	}

	async function resolve_sabr_info_attempt(video_id: string): Promise<SabrTrackParams | ResponseError> {
		video_id = urlid(video_id, 'youtube.com/', 'playlist?list=', 'watch?v=', /&.+/);
		const client = await get_innertube_client();
		fetch_potoken(video_id).catch(catch_log);

		const player_response = await make_player_request(client, video_id);
		const video_playback_ustreamer_config = player_response.player_config?.media_common_config.media_ustreamer_request_config?.video_playback_ustreamer_config;
		if (video_playback_ustreamer_config === undefined) return generror('ustreamerConfig not found', 'LOW', { video_id, player_response });

		const sabr_server_url = await client.session.player?.decipher(player_response.streaming_data?.server_abr_streaming_url);
		if (sabr_server_url === undefined) return generror('serverAbrStreamingUrl not found', 'LOW', { video_id, player_response });

		const all_formats: SabrFormat[] = (player_response.streaming_data?.adaptive_formats ?? [])

			.map((f: any) => buildSabrFormat(f));

		const ctx = client.session.context.client;
		const client_name_id = parseInt(
			(Constants.CLIENT_NAME_IDS as Record<string, string>)[ctx.clientName] ?? '1'
		);
		const client_info: SabrClientInfo = {
			clientName: client_name_id,
			clientVersion: ctx.clientVersion
		};

		return {
			content_binding: video_id,
			url: sabr_server_url,
			isSabr: true,
			sabrServerUrl: sabr_server_url,
			sabrUstreamerConfig: video_playback_ustreamer_config,
			sabrFormats: all_formats,
			placeholder_po_token: generate_placeholder_potoken(video_id),
			clientInfo: client_info,
			cookie: client.session.cookie,
			duration: player_response.video_details?.duration ?? 0,
			on_reload_player_response: async (reload_ctx: any) => {
				const watch_endpoint = new YTNodes.NavigationEndpoint({ watchEndpoint: { videoId: video_id } });
				const watch_response = await watch_endpoint.call(client.actions, {
					playbackContext: {
						contentPlaybackContext: {
							vis: 0, splay: false, lactMilliseconds: '-1',
							signatureTimestamp: client.session.player?.signature_timestamp ?? 0
						},
						reloadPlaybackContext: reload_ctx
					},
					contentCheckOk: true, racyCheckOk: true
				});
				const new_info = new YT.VideoInfo([watch_response], client.actions, '');
				const new_url = await client.session.player?.decipher(new_info.streaming_data?.server_abr_streaming_url);
				const new_config = new_info.player_config?.media_common_config?.media_ustreamer_request_config?.video_playback_ustreamer_config;
				if (!new_url || !new_config) return null;
				return { sabrServerUrl: new_url, sabrUstreamerConfig: new_config };
			}
		};
	}
}
