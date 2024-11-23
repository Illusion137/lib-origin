import * as Origin from '../../origin/src/index'
import { ResponseError } from '../../origin/src/utils/types';
import { YTDLQuality } from '../../origin/src/youtube_dl/types';
import { youtube_info_metadata } from './gen/youtube_parser';
import { Prefs } from './prefs';
import { DownloadFromIdResult } from './types';

export async function soundcloud_download_from_id(permalink: string, _: string): Promise<DownloadFromIdResult|ResponseError> {
    const use_cookies_on_download = Prefs.get_pref('use_cookies_on_download');
    const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
    const url = await Origin.SoundCloudDL.get_download_info_from_permalink(permalink, use_cookies_on_download ? cookie_jar : undefined);
    if(typeof url === "object") return url;
    return {url: url}
}
export async function youtube_download_from_id(video_id: string, quality: string): Promise<DownloadFromIdResult|ResponseError> {
    try {
        try {            
            const av_result = await Origin.YouTubeDL.ytdl(video_id, {quality: quality as YTDLQuality});
            if("error" in av_result) throw new Error(av_result.error as string);
            return {url: av_result.av.url, metadata: youtube_info_metadata(av_result.info)};
        } catch (error) {
            const use_cookies_on_download = Prefs.get_pref('use_cookies_on_download');
            if(!use_cookies_on_download) throw error;
            const cookie_jar = Prefs.get_pref('youtube_cookie_jar');
            const av_result = await Origin.YouTubeDL.ytdl(video_id, {quality: quality as YTDLQuality, requestOptions: use_cookies_on_download ? {headers: {cookie: cookie_jar.toString()}} : {}});
            if("error" in av_result) throw new Error(av_result.error as string);
            return {url: av_result.av.url, metadata: youtube_info_metadata(av_result.info)};
        }
    } catch (error) { return { error: error as Error }; }
}