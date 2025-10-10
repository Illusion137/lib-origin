import { RCache } from './rcache';
import { generror_catch } from '@common/utils/error_util';
import { parse_runs } from '@common/utils/parse_util';
import type { VideoInfo } from 'youtubei.js/dist/src/parser/youtube';
import type { FormatOptions } from 'youtubei.js/dist/src/types';
import Innertube from 'youtubei.js/react-native';

export namespace YouTubeDL {
    let innertube_client: Innertube;
    async function get_innertube_client(): Promise<Innertube>{
        if(innertube_client) return innertube_client;
        innertube_client = await Innertube.create({
            cache: new RCache(false),
            generate_session_locally: false,
            enable_session_cache: true,
            player_id: '0004de42'
        });
        return innertube_client;
    }

    export function get_chapters(info: VideoInfo){
        const markers_map = info?.player_overlays?.decorated_player_bar?.player_bar?.markers_map;
        const marker = Array.isArray(markers_map) && markers_map.find(mark => mark.value && Array.isArray(mark.value.chapters));
        if (!marker) return [];
        const chapters = marker.value.chapters;
    
        return chapters?.map((chapter: any) => ({
            title: parse_runs(chapter.chapterRenderer.title),
            start_time: chapter.chapterRenderer.timeRangeStartMillis / 1000,
        })) ?? [];
    }

    export async function get_info(link: string) {
        try {
            const client = await get_innertube_client();
            const info = await client.getInfo(link);
            return info;
        } catch (error) {
            return generror_catch(error, "YTDL Failed", {link});
        }
    };
    
    export async function choose_format(info: VideoInfo, options: FormatOptions){
        const client = await get_innertube_client();
        return info.chooseFormat(options).decipher(client.session.player);
    }
}
