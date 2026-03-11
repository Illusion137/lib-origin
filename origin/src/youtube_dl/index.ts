import { RCache } from './rcache';
import { generror_catch } from '@common/utils/error_util';
import { parse_runs } from '@common/utils/parse_util';
import Innertube, { ClientType, Constants, Log, Platform, YT, YTNodes, type Types } from 'youtubei.js';
import { buildSabrFormat } from 'googlevideo/utils';
import type { ResponseError } from '@common/types';
import { fs, load_native_fs } from '@native/fs/fs';
import { load_native_potoken, potoken } from '@native/potoken/potoken';
import { get_native_platform } from '@native/native_mode';
import type { PoTokenResult } from '@native/potoken/potoken.base';
import { urlid } from '@common/utils/util';

export type VideoInfo = Awaited<ReturnType<Innertube['getInfo']>>;

// On React Native/iOS, calling fetch(RequestObject, { body: overrideBody, ... }) is broken:
// NSURLSession sees the Request's pre-set body stream as already-consumed when we try to pass a
// different body via the second argument, which produces NSURLErrorCancelled → "Load failed".
// This wrapper always converts Request objects into plain fetch(urlString, options) calls so
// that the body/headers overrides applied by youtubei.js's HTTPClient are correctly respected.
function make_rn_fetch() {
    return async (input: any, init?: any): Promise<Response> => {
        if (typeof input !== 'string') {
            const url: string = typeof input.href === 'string' ? input.href : input.url;
            return fetch(url, {
                method: init?.method ?? input.method,
                headers: init?.headers ?? input.headers,
                body: init?.body ?? (input.bodyUsed ? undefined : input.body),
                redirect: init?.redirect ?? input.redirect,
                credentials: init?.credentials ?? input.credentials,
            });
        }
        return fetch(input, init);
    };
}

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
        const platform = get_native_platform();
        const is_mobile = platform === "REACT_NATIVE";
        if (platform === "NODE" || is_mobile) {
            Platform.shim.eval = async (data: Types.BuildScriptResult, env: Record<string, Types.VMPrimative>) => {
                const properties: string[] = [];
                if (env.n) properties.push(`n: exportedVars.nFunction("${env.n}")`);
                if (env.sig) properties.push(`sig: exportedVars.sigFunction("${env.sig}")`);
                const code = `${data.output}\nreturn { ${properties.join(', ')} }`;
                // eslint-disable-next-line @typescript-eslint/no-implied-eval
                return new Function(code)() as typeof Platform.shim.eval;
            };
        }
        innertube_client = await Innertube.create({
            cache: new RCache(true, await fs().temp_directory()),
            // On React Native, sw.js_data is a browser service-worker endpoint and
            // will fail ("Load failed") because it requires Cookie/Referer headers in
            // a browser context. Generate the session locally instead.
            generate_session_locally: is_mobile,
            enable_session_cache: true,
            // fail_fast on mobile would surface sw.js_data / player-fetch errors as
            // unrecoverable. Keep it true only on Node where we need a hard failure.
            fail_fast: !is_mobile,
            // SABR never calls decipher(), so the player JS is not needed on mobile.
            // Skipping it avoids a ~4 MB fetch that also sets forbidden headers on iOS.
            retrieve_player: !is_mobile,
            // WEB client SABR doesn't require PoToken authentication; MWEB does.
            // On desktop we use WEB; on mobile MWEB is required for iOS compatibility.
            client_type: is_mobile ? ClientType.MWEB : ClientType.WEB,
            // Pass YouTube cookie when available so the session is authenticated.
            // Authenticated sessions get SABR URLs that don't need additional PoToken validation.
            cookie: is_mobile ? undefined : (typeof process !== 'undefined' ? process.env.YOUTUBE_COOKIE_JAR : undefined),
            // On React Native/iOS, fetch(Request, overrideInit) is broken: NSURLSession
            // sees the Request's pre-set body stream as consumed when a different body is
            // passed in the second argument, producing "Load failed". The wrapper always
            // converts Request objects into plain fetch(urlString, options) calls.
            fetch: is_mobile ? make_rn_fetch() : undefined,
            // youtubei.js v16.0.1 has a broken nFunction/sigFunction matcher for the new
            // YouTube player JS format (issue #1146). Pin an older known-working player ID
            // to avoid the broken extraction. Remove once a fixed youtubei.js is released.
            player_id: is_mobile ? undefined : '140dafda',
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
        clientInfo?: SabrClientInfo;
        cookie?: string;
        duration?: number;
    }

    /**
     * Resolves a YouTube video into SABR (server-adaptive bitrate) stream parameters.
     * The returned params are passed directly to TrackPlayer.load() with url="sabr://stream".
     */
    export async function resolve_sabr_url(video_id: string): Promise<SabrTrackParams | ResponseError> {
        try {
            video_id = urlid(video_id, "youtube.com/", "playlist?list=", "watch?v=", /&.+/);
            const client = await get_innertube_client();

            const result = await resolve_watch_response(client, video_id);
            if ("error" in result) return result;

            const { video_info, content_pot_result } = result;
            const streaming_data = video_info.streaming_data;

            // The server_abr_streaming_url is ciphered and must be deciphered before use.
            // If decipher fails (e.g. player n-function extraction broke), fall back to raw URL.
            let sabr_server_url = streaming_data!.server_abr_streaming_url ?? '';
            const raw_sabr_url = sabr_server_url;
            let decipher_succeeded = false;
            try {
                sabr_server_url = await client.session.player?.decipher(sabr_server_url) ?? sabr_server_url;
                decipher_succeeded = sabr_server_url !== raw_sabr_url;
            } catch (decipher_err) {
                console.warn('[SABR] decipher failed:', (decipher_err as Error).message);
            }
            console.log(`[SABR] decipher ${decipher_succeeded ? 'succeeded' : 'FAILED (using raw URL)'}`);

            const all_formats: SabrFormat[] = (streaming_data!.adaptive_formats ?? [])
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
                sabrUstreamerConfig: video_info.player_config?.media_common_config?.media_ustreamer_request_config?.video_playback_ustreamer_config ?? '',
                sabrFormats: all_formats,
                poToken: content_pot_result.po_token,
                clientInfo: client_info,
                cookie: client.session.cookie,
                duration: video_info.basic_info.duration,
            };
        } catch (error) {
            return generror_catch(error, "Failed to resolve SABR URL", { video_id });
        }
    }
}
