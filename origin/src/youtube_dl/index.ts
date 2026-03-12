import {
    generror,
    generror_catch
} from '@common/utils/error_util';
import { parse_runs } from '@common/utils/parse_util';
import Innertube, { Constants, Log, Platform, YT, YTNodes, type IPlayerResponse, type Types } from 'youtubei.js';
import { buildSabrFormat } from 'googlevideo/utils';
import type { ResponseError } from '@common/types';
import {
    fs,
    load_native_fs
} from '@native/fs/fs';
import { load_native_potoken, potoken } from '@native/potoken/potoken';
import type { PoTokenResult } from '@native/potoken/potoken.base';
import { urlid } from '@common/utils/util';
import type { ReloadPlaybackContext } from 'googlevideo/protos';
import { RCache } from './rcache';

export type VideoInfo = Awaited<ReturnType<Innertube['getInfo']>>;

Platform.shim.eval = async (data: Types.BuildScriptResult, env: Record<string, Types.VMPrimative>) => {
    const properties: string[] = [];

    if (env.n) {
        properties.push(`n: exportedVars.nFunction("${env.n}")`);
    }

    if (env.sig) {
        properties.push(`sig: exportedVars.sigFunction("${env.sig}")`);
    }

    const code = `${data.output}\nreturn { ${properties.join(', ')} }`;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-implied-eval
    return new Function(code)();
};

interface WatchResult {
    video_info: YT.VideoInfo;
    content_pot_result: PoTokenResult;
    session_pot_result: PoTokenResult;
}

async function resolve_watch_response(client: Innertube, video_id: string): Promise<WatchResult | ResponseError> {
    const content_pot_result = await potoken().generate_potoken(client, video_id);
    if ("error" in content_pot_result) return content_pot_result;

    const session_pot_result = await potoken().generate_potoken(client, content_pot_result.visitor_data);
    if ("error" in session_pot_result) return session_pot_result;

    const watch_endpoint = new YTNodes.NavigationEndpoint({
        watchEndpoint: { videoId: video_id },
    });

    const watch_response = await watch_endpoint.call(client.actions, {
        playbackContext: {
            adPlaybackContext: { pyv: true },
            contentPlaybackContext: {
                vis: 0,
                splay: false,
                lactMilliseconds: '-1',
                signatureTimestamp: client.session.player?.signature_timestamp ?? 0,
            },
        },
        serviceIntegrityDimensions: {
            poToken: content_pot_result.po_token,
        },
        contentCheckOk: true,
        racyCheckOk: true,
    });

    const video_info = new YT.VideoInfo([watch_response], client.actions, '');
    return { video_info, content_pot_result, session_pot_result };
}

export namespace YouTubeDL {
    export interface Chapter { title: string, start_time: number };
    let innertube_client: Innertube;

    export async function get_innertube_client(): Promise<Innertube> {
        Log.setLevel(Log.Level.NONE);
        if (innertube_client) return innertube_client;
        await load_native_fs();
        await load_native_potoken();
        innertube_client = await Innertube.create({
            cache: new RCache(true, await fs().temp_directory()),
            player_id: '6c5cb4f4'
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
            return info;
        } catch (error) {
            return generror_catch(error, "YTDL Failed", { link });
        }
    };

    // https://github.com/lovegaoshi/azusa-player-mobile/blob/1b0a00b77620804c863e78bda888b524b108134b/src/utils/mediafetch/ytbvideo.ytbi.ts#L42
    export async function resolve_url(video_id: string, options?: Types.FormatOptions): Promise<string | ResponseError> {
        try {
            video_id = urlid(video_id, "youtube.com/", "playlist?list=", "watch?v=", /&.+/);
            const client = await get_innertube_client();

            const result = await resolve_watch_response(client, video_id);
            if ("error" in result) return result;

            const { video_info, session_pot_result } = result;
            const format = video_info.chooseFormat({ quality: 'best', type: 'audio', ...options });
            const url = await format.decipher(client.session.player);
            return `${url}&pot=${session_pot_result.po_token}`;
        } catch (error) {
            return generror_catch(error, "Failed to choose a YTDL format", { options, video_id });
        }
    }

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

    export async function makePlayerRequest(innertube: Innertube, videoId: string, reloadPlaybackContext?: ReloadPlaybackContext): Promise<IPlayerResponse> {
        const watchEndpoint = new YTNodes.NavigationEndpoint({ watchEndpoint: { videoId } });

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

        return await watchEndpoint.call<IPlayerResponse>(innertube.actions, { ...extraArgs, parse: true });
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

            // Generate po_token for the video_id content binding.
            const content_pot_result = await potoken().generate_potoken(client, video_id);
            if ("error" in content_pot_result) return content_pot_result;

            const player_response = await makePlayerRequest(client, video_id);
            const video_playback_ustreamer_config = player_response.player_config?.media_common_config.media_ustreamer_request_config?.video_playback_ustreamer_config;
            if (video_playback_ustreamer_config === undefined) return generror("ustreamerConfig not found", { video_id });

            const sabr_server_url = await client.session.player?.decipher(player_response.streaming_data?.server_abr_streaming_url);
            if (sabr_server_url === undefined) return generror("serverAbrStreamingUrl not found", { video_id });

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
            return generror_catch(error, "Failed to resolve SABR URL", { video_id });
        }
    }
}
