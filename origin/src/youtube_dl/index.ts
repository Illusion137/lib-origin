import { urlid } from '../utils/util';
import * as formatUtils from './format-utils';
import * as getInfo from './info';
import * as urlUtils from './url-utils';
import type { DownloadOptions, VideoInfo } from './types';

export namespace YouTubeDL {
    export async function ytdl(link: string, options: DownloadOptions) {
        const video_id = urlid(link, "m.youtube.com/", "youtube.com/", "watch?v=", /&.+/);
        const info: VideoInfo = await ytdl.getInfo(video_id, options);
        const format = ytdl.chooseFormat(info.formats, options);
        return {av: format, info, formats: info.formats};
    };
    
    export async function get_info(link: string, options: DownloadOptions){
        const video_id = urlid(link, "m.youtube.com/", "youtube.com/", "watch?v=", /&.+/);
        const info: VideoInfo = await ytdl.getInfo(video_id, options);
        return {info};
    }

    export function choose_format(info: VideoInfo, options: DownloadOptions){
        return ytdl.chooseFormat(info.formats, options);
    }

    ytdl.getBasicInfo = getInfo.getBasicInfo;
    ytdl.getInfo = getInfo.getInfo;
    ytdl.chooseFormat = formatUtils.chooseFormat;
    ytdl.filterFormats = formatUtils.filterFormats;
    ytdl.validateID = urlUtils.validateID;
    ytdl.validateURL = urlUtils.validateURL;
    ytdl.getURLVideoID = urlUtils.getURLVideoID;
    ytdl.getVideoID = urlUtils.getVideoID;
    ytdl.cache = {
        info: getInfo.cache,
        watch: getInfo.watchPageCache,
    };
}
