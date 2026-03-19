import { generror, generror_catch } from '@common/utils/error_util';
import { parse_runs } from '@common/utils/parse_util';
import Innertube, { Constants, Log, Platform, UniversalCache, YT, YTNodes, type IPlayerResponse, type Types } from 'youtubei.js';
import { buildSabrFormat } from 'googlevideo/utils';
import type { ResponseError } from '@common/types';
import { load_native_fs } from '@native/fs/fs';
import { load_native_potoken, potoken } from '@native/potoken/potoken';
import { urlid } from '@common/utils/util';
import type { ReloadPlaybackContext } from 'googlevideo/protos';
import { jseval, load_native_jseval } from '@native/jseval/jseval';

export type VideoInfo = Awaited<ReturnType<Innertube['getInfo']>>;

Platform.shim.eval = async (data: Types.BuildScriptResult, _: Record<string, Types.VMPrimative>) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return jseval().eval_in_webview(data.output);
};

export namespace YouTubeDL {
    export interface Chapter { title: string, start_time: number };
    let innertube_client: Innertube;

    export async function get_innertube_client(): Promise<Innertube> {
        Log.setLevel(Log.Level.NONE);
        if (innertube_client) return innertube_client;
        await load_native_fs();
        await load_native_potoken();
        await load_native_jseval();
        innertube_client = await Innertube.create({
            cache: new UniversalCache(true),
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
        /** The SABR server URL — used as the track url and passed to the native SABR engine. */
        url: string;
        /** Flag consumed by the native player to activate SABR mode. */
        isSabr: true;
        sabrServerUrl: string;
        sabrUstreamerConfig: string;
        sabrFormats: SabrFormat[];
        poToken: string;
        placeholder_po_token: string;
        clientInfo?: SabrClientInfo;
        cookie?: string;
        duration?: number;
        on_refresh_po_token: () => Promise<string>;
        on_reload_player_response: (context: any) => Promise<{ sabrServerUrl: string; sabrUstreamerConfig: string } | null>;
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

    /**
     * Resolves a YouTube video into SABR (server-adaptive bitrate) stream parameters.
     * The returned params are passed directly to TrackPlayer.load()
     *
     * Unlike resolve_url, this does NOT include serviceIntegrityDimensions in the player request.
     * The po_token is supplied directly to SabrStream (placeholder on init, real on SPS=2).
     * This matches the reference implementation in googlevideo/examples/downloader.
     */
    export async function resolve_sabr_url(video_id: string): Promise<SabrTrackParams | ResponseError> {
        try {
            video_id = urlid(video_id, "youtube.com/", "playlist?list=", "watch?v=", /&.+/);
            const client = await get_innertube_client();

            const content_pot_result = await potoken().generate_potoken(client, video_id);
            if ("error" in content_pot_result) return content_pot_result;

            const player_response = await make_player_request(client, video_id);
            const video_playback_ustreamer_config = player_response.player_config?.media_common_config.media_ustreamer_request_config?.video_playback_ustreamer_config;
            if (video_playback_ustreamer_config === undefined) return generror("ustreamerConfig not found", "MEDIUM", { video_id });

            const sabr_server_url = await client.session.player?.decipher(player_response.streaming_data?.server_abr_streaming_url);
            if (sabr_server_url === undefined) return generror("serverAbrStreamingUrl not found", "MEDIUM", { video_id });

            const all_formats: SabrFormat[] = (player_response.streaming_data?.adaptive_formats ?? [])
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
                url: sabr_server_url,
                isSabr: true,
                sabrServerUrl: sabr_server_url,
                sabrUstreamerConfig: video_playback_ustreamer_config,
                sabrFormats: all_formats,
                poToken: content_pot_result.po_token,
                placeholder_po_token: content_pot_result.placeholder_po_token,
                clientInfo: client_info,
                cookie: client.session.cookie,
                duration: player_response.video_details?.duration ?? 0,
                on_refresh_po_token: async () => {
                    const potoken_result = await potoken().generate_potoken(client, video_id);
                    if ('error' in potoken_result) throw potoken_result.error;
                    return potoken_result.po_token;
                },
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
        } catch (error) {
            return generror_catch(error, "Failed to resolve SABR URL", "CRITICAL", { video_id });
        }
    }
}
