import { downloadOptions } from '@distube/ytdl-core';
import { urlid } from '../utils/util';
import * as formatUtils from './format-utils';
import * as getInfo from './info';
import * as urlUtils from './url-utils';

export namespace YouTubeDL {
    export async function ytdl (link: string, options: downloadOptions) {
        const video_id = urlid(link, "m.youtube.com/", "youtube.com/", "watch?v=");
        const info = await ytdl.getInfo(video_id, options);
        const format = ytdl.chooseFormat(info.formats, options);
        return {av: format, info};
    };
    
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
