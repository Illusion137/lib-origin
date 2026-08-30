import {
    catch_log,
    generror,
    generror_catch
} from '@common/utils/error_util';
import { parse_runs } from '@common/utils/parse_util';
import Innertube, { Constants, Log, Platform, YT, YTNodes, type ClientType, type IPlayerResponse, type Types } from 'youtubei.js';
import { buildSabrFormat } from 'googlevideo/utils';
import type { PromiseResult, ResponseError } from '@common/types';
import {
    fs,
    load_native_fs
} from '@native/fs/fs';
import { load_native_potoken, potoken } from '@native/potoken/potoken';
import { urlid } from '@common/utils/util';
import { retry_result } from '@common/utils/retry_util';
import type { ReloadPlaybackContext } from 'googlevideo/protos';
import { jseval, load_native_jseval } from '@native/jseval/jseval';
import { RCache } from './rcache';
import type { PoTokenResult } from '@native/potoken/potoken.base';
import { createColdStartToken } from 'bgutils-js/webpo';

export type VideoInfo = Awaited<ReturnType<Innertube['getInfo']>>;

Platform.shim.eval = async (data: Types.BuildScriptResult, _: Record<string, Types.VMPrimative>) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return jseval().eval_in_webview(data.output);
};

export namespace YouTubeDL {
    export interface Chapter { title: string, start_time: number };
    let innertube_client: Innertube;
    let preloaded_cookies: string | undefined;

    export function preload_cookies(cookie?: string){
        preloaded_cookies = cookie ?? process ? process?.env?.YOUTUBE_COOKIE_JAR : undefined;
    }

    export async function get_innertube_client(client_type?: ClientType, cookie?: string): Promise<Innertube> {
        Log.setLevel(Log.Level.NONE);
        if (innertube_client) return innertube_client;
        await load_native_fs();
        await load_native_potoken();
        await load_native_jseval();
        innertube_client = await Innertube.create({
            client_type: client_type,
            cache: new RCache(true, await fs().temp_directory()),
            cookie: preloaded_cookies ?? cookie
        });
        return innertube_client;
    }

    export function get_chapters(info: VideoInfo) {
        const markers_map = info?.player_overlays?.decorated_player_bar?.player_bar?.markers_map;
        const marker = Array.isArray(markers_map) && markers_map.find(mark => mark.value && Array.isArray(mark.value.chapters));
        if (!marker) return [];
        const chapters = marker.value.chapters;

        return (chapters?.map((chapter: any) => ({
            title: parse_runs(chapter.chapterRenderer.title),
            start_time: chapter.chapterRenderer.timeRangeStartMillis / 1000,
        })) ?? []) as Chapter[];
    }

    export async function get_info(link: string) {
        try {
            const client = await get_innertube_client();
            const info = await client.getShortsVideoInfo(link, 'ANDROID');
            return info as unknown;
        } catch (error) {
            return generror_catch(error, "YTDL Failed", "MEDIUM", { link });
        }
    };

    export interface SabrFormat {
        itag: number;
        mimeType?: string;
        bitrate: number;
        approxDurationMs: number;
        audioQuality?: string;
        lastModified: string;
        contentLength?: number;
        averageBitrate?: number;
    }

    export interface SabrClientInfo {
        clientName?: number;
        clientVersion?: string;
    }

    export interface SabrTrackParams {
	    content_binding: string;
        /** The SABR server URL — used as the track url and passed to the native SABR engine. */
        url: string;
        /** Flag consumed by the native player to activate SABR mode. */
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

    type PoTokenStatusResultSent = ["sent", PromiseResult<PoTokenResult>];
    type PoTokenStatusResultRecieved = ["recieved", PoTokenResult];
    type PoTokenContentBindingStatusMap = Record<string, PoTokenStatusResultSent|PoTokenStatusResultRecieved>;
    const content_binding_status_map: PoTokenContentBindingStatusMap = {};
    export async function fetch_potoken(content_binding: string): PromiseResult<PoTokenResult> {
        if(content_binding_status_map?.[content_binding]?.[0] === 'recieved') return content_binding_status_map[content_binding][1];
        if(content_binding_status_map?.[content_binding]?.[0] === 'sent') {
            const recieved = await content_binding_status_map[content_binding][1];
            if ("error" in recieved) delete content_binding_status_map[content_binding];
            else content_binding_status_map[content_binding] = ["recieved", recieved];
            return recieved;
        };
        const sent_token = potoken().generate_potoken(innertube_client, content_binding);
        content_binding_status_map[content_binding] = [
            "sent",
            sent_token
        ];
        const result = await sent_token;
        if ("error" in result) delete content_binding_status_map[content_binding];
        else content_binding_status_map[content_binding] = ["recieved", result];
        return result;
    }

    export function inject_potoken(content_binding: string, po_token: string) {
        content_binding_status_map[content_binding] = ["recieved", {
            identifier: content_binding,
            po_token
        }];
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

    function generate_placeholder_potoken(content_binding: string){
        return createColdStartToken(content_binding);
    }

    export async function resolve_sabr_info(video_id: string): Promise<SabrTrackParams | ResponseError> {
        const try_resolve_sabr_info = async () => {
            try { return await resolve_sabr_info_attempt(video_id); }
            catch (error) { return generror_catch(error, "resolve_sabr_info attempt failed", "LOW", { video_id }); }
        };
        const result = await retry_result<SabrTrackParams>(try_resolve_sabr_info, {wait_for_network: true});
        if (typeof result === "object" && result !== null && "error" in result) {
            return generror_catch(result.error, "Failed to resolve SABR URL", "CRITICAL", { video_id });
        }
        return result;
    }

    async function resolve_sabr_info_attempt(video_id: string): Promise<SabrTrackParams | ResponseError> {
        video_id = urlid(video_id, "youtube.com/", "playlist?list=", "watch?v=", /&.+/);
        const client = await get_innertube_client();
        fetch_potoken(video_id).catch(catch_log);

        const player_response = await make_player_request(client, video_id);
        const video_playback_ustreamer_config = player_response.player_config?.media_common_config.media_ustreamer_request_config?.video_playback_ustreamer_config;
        if (video_playback_ustreamer_config === undefined) return generror("ustreamerConfig not found", "LOW", { video_id, player_response });

        const sabr_server_url = await client.session.player?.decipher(player_response.streaming_data?.server_abr_streaming_url);
        if (sabr_server_url === undefined) return generror("serverAbrStreamingUrl not found", "LOW", { video_id, player_response });

        const all_formats: SabrFormat[] = (player_response.streaming_data?.adaptive_formats ?? [])
             
            .map((f: any) => buildSabrFormat(f));

        const ctx = client.session.context.client;
        const client_name_id = parseInt(
            (Constants.CLIENT_NAME_IDS as Record<string, string>)[ctx.clientName] ?? '1'
        );
        const client_info: SabrClientInfo = {
            clientName: client_name_id,
            clientVersion: ctx.clientVersion,
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
                            signatureTimestamp: client.session.player?.signature_timestamp ?? 0,
                        },
                        reloadPlaybackContext: reload_ctx,
                    },
                    contentCheckOk: true, racyCheckOk: true,
                });
                const new_info = new YT.VideoInfo([watch_response], client.actions, '');
                const new_url = await client.session.player?.decipher(new_info.streaming_data?.server_abr_streaming_url);
                const new_config = new_info.player_config?.media_common_config?.media_ustreamer_request_config?.video_playback_ustreamer_config;
                if (!new_url || !new_config) return null;
                return { sabrServerUrl: new_url, sabrUstreamerConfig: new_config };
            },
        };
    }
}
