import { RCache } from './rcache';
import { generror_catch } from '@common/utils/error_util';
import { parse_runs } from '@common/utils/parse_util';
import Innertube, { ClientType, Log, Platform, YT, YTNodes, type Types } from 'youtubei.js';
import type { ResponseError } from '@common/types';
import { fs, load_native_fs } from '@native/fs/fs';
import { load_native_potoken,potoken } from '@native/potoken/potoken';
import { urlid } from '@common/utils/util';

export type VideoInfo = Awaited<ReturnType<Innertube['getInfo']>>;

Platform.shim.eval = async (data: Types.BuildScriptResult, env: Record<string, Types.VMPrimative>) => {
    const properties: string[] = [];

    if (env.n) {
        properties.push(`n: exportedVars.nFunction("${env.n}")`)
    }

    if (env.sig) {
        properties.push(`sig: exportedVars.sigFunction("${env.sig}")`)
    }

    const code = `${data.output}\nreturn { ${properties.join(', ')} }`;

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    return new Function(code)() as typeof Platform.shim.eval;
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
            generate_session_locally: false,
            enable_session_cache: true,
            fail_fast: true,
            retrieve_player: true,
            client_type: ClientType.MWEB,
            player_id: "140dafda"
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

            // const extracted_video_info = await client.getShortsVideoInfo(link, 'ANDROID');
            // const max_audio_quality_stream = extracted_video_info.chooseFormat({
            //     quality: 'best',
            //     type: 'audio',
            // });
            // return await max_audio_quality_stream.decipher(client.actions.session.player);

            const content_pot_result = await potoken().generate_potoken(client, video_id);
            if ("error" in content_pot_result) return content_pot_result;

            const session_pot_result = await potoken().generate_potoken(client, content_pot_result.visitor_data);
            if ("error" in session_pot_result) return session_pot_result;

            const watch_endpoint = new YTNodes.NavigationEndpoint({
                watchEndpoint: { videoId: video_id },
            });

            const watch_response = await watch_endpoint.call(client.actions, {
                playbackContext: {
                    contentPlaybackContext: {
                        vis: 0,
                        splay: false,
                        lactMilliseconds: '-1',
                        signatureTimestamp: client.session.player?.signature_timestamp,
                    },
                },
                serviceIntegrityDimensions: {
                    poToken: content_pot_result.po_token,
                },
            });

            const video_info = new YT.VideoInfo([watch_response], client.actions, '');
            const format = video_info.chooseFormat({ quality: 'best', type: 'audio', ...options });
            const url = await format.decipher(client.session.player);
            return `${url}&pot=${session_pot_result.po_token}`;
        } catch (error) {
            return generror_catch(error, "Failed to choose a YTDL format", { options, video_id });
        }
    }
}
