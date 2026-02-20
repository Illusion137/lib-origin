import { RCache } from './rcache';
import { generror_catch } from '@common/utils/error_util';
import { parse_runs } from '@common/utils/parse_util';
import Innertube, { ClientType, Log, Platform, type Types } from 'youtubei.js';
import type { ResponseError } from '@common/types';
import { fs, load_native_fs } from '@native/fs/fs';

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
        innertube_client = await Innertube.create({
            cache: new RCache(true, await fs().temp_directory()),
            generate_session_locally: false,
            enable_session_cache: true,
            fail_fast: true,
            retrieve_player: true,
            client_type: ClientType.MWEB,
            // TODO further investigate cookies for YTDL
            // cookie: GCC.dotenv_of("YOUTUBE_COOKIE_JAR")
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
    export async function resolve_url(link: string, options?: Types.FormatOptions): Promise<string | ResponseError> {
        try {
            const client = await get_innertube_client();

            // const extractedVideoInfo = await client.getBasicInfo(link, {
            //     client: 'IOS',
            // });

            // const maxAudioQualityStream = extractedVideoInfo.chooseFormat({
            //     quality: 'best',
            //     type: 'audio',
            // });

            // console.log(await maxAudioQualityStream.decipher(client.actions.session.player));
            // const url = extractedVideoInfo.streaming_data?.hls_manifest_url;
            // if(url) return url;
            // else return generror("No HLS manifest URL found", {link});

            const extractedVideoInfo = await client.getShortsVideoInfo(link, 'ANDROID');
            const maxAudioQualityStream = extractedVideoInfo.chooseFormat({
                quality: 'best',
                type: 'audio',
            });
            return await maxAudioQualityStream.decipher(client.actions.session.player);

            // const iOS = true;
            // const hls_manifest_url = iOS ? (await client.getBasicInfo(link, {client: "IOS"})).streaming_data?.hls_manifest_url : undefined;

            // if(hls_manifest_url){
            //     return hls_manifest_url;
            // }

            // // client.session.po_token = await getPoT(link);
            // const extracted_video_info = await client.getBasicInfo(link, {client: client.session.player?.po_token === undefined ? "WEB_EMBEDDED" : "MWEB"});
            // const max_audio_quality_stream = extracted_video_info.chooseFormat({
            //     itag: 18
            //     // quality: 'best',
            //     // type: 'audio',
            // });

            // return max_audio_quality_stream.decipher(client.actions.session.player);
        } catch (error) {
            return generror_catch(error, "Failed to choose a YTDL format", { options });
        }
    }
}
