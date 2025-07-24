import * as Origin from '../../origin/src/index'
import type { ResponseError } from '../../common/types';
import type { DownloadOptions, YTDLQuality } from '../../origin/src/youtube_dl/types';
import { youtube_info_metadata } from './parsers/youtube_parser';
import { Prefs } from './prefs';
import type { DownloadFromIdResult } from './types';

export async function soundcloud_download_from_id(permalink: string, _: string): Promise<DownloadFromIdResult|ResponseError> {
    const use_cookies_on_download = Prefs.get_pref('use_cookies_on_download');
    const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
    const url = await Origin.SoundCloudDL.get_download_info_from_permalink(permalink, use_cookies_on_download ? cookie_jar : undefined);
    if(typeof url === "object") return url;
    return {url: url}
}
export async function youtube_download_from_id(video_id: string, quality: string): Promise<DownloadFromIdResult|ResponseError> {
    const ytdl_opts: DownloadOptions = {
        quality: Prefs.get_pref('force_youtube_18_quality') ? "18" : quality as YTDLQuality, 
        playerClients: ["WEB_EMBEDDED", "IOS", "ANDROID", "TV"]};
    try {
        try {
            // FIXME: YouTube Download From ID is silly
            const av_info = (await Origin.YouTubeDL.get_info(video_id, ytdl_opts));
            if("error" in av_info) throw new Error(av_info.error as string);
            const av_format = Origin.YouTubeDL.choose_format(av_info.info, ytdl_opts);
            if(Prefs.get_pref('force_youtube_18_quality'))
                return {url: av_format.url, metadata: youtube_info_metadata(av_info.info)};
            // const status_fetch = await fetch(av_format.url);
            // if(!status_fetch.ok) {
            //     const av_format_18 = Origin.YouTubeDL.choose_format(av_info.info, {...ytdl_opts, quality: "18"});
            //     return {url: av_format_18.url, metadata: youtube_info_metadata(av_info.info)};
            // }
            return {url: av_format.url, metadata: youtube_info_metadata(av_info.info)};
        } catch (error) {
            const use_cookies_on_download = Prefs.get_pref('use_cookies_on_download');
            if(!use_cookies_on_download) throw error;
            const cookie_jar = Prefs.get_pref('youtube_cookie_jar');
            const av_result = await Origin.YouTubeDL.ytdl(video_id, {...ytdl_opts, requestOptions: {headers: {cookie: cookie_jar.toString()}}});
            if("error" in av_result) throw new Error(av_result.error as string);
            return {url: av_result.av.url, metadata: youtube_info_metadata(av_result.info)};
        }
    } catch (error) { return { error: error as Error }; }
}