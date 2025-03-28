import * as Origin from '../../origin/src/index'
import { ResponseError } from '../../origin/src/utils/types';
import { DownloadOptions, YTDLQuality } from '../../origin/src/youtube_dl/types';
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
    const ytdl_opts: DownloadOptions = {quality: Prefs.get_pref('force_youtube_18_quality') ? "18" : quality as YTDLQuality, playerClients: ["WEB_EMBEDDED", "IOS", "ANDROID", "TV"]};
    try {
        try {            
            const av_result = await Origin.YouTubeDL.ytdl(video_id, ytdl_opts);
            if("error" in av_result) throw new Error(av_result.error as string);
            const status_fetch = await fetch(av_result.av.url);
            if(!status_fetch.ok) {
                const av_result_18 = await Origin.YouTubeDL.ytdl(video_id, {...ytdl_opts, quality: "18"});
                if("error" in av_result_18) throw new Error(`AV-URL Returns ${status_fetch.status} :: ` + (av_result_18.error as string));
                return {url: av_result_18.av.url, metadata: youtube_info_metadata(av_result_18.info)};
            }
            return {url: av_result.av.url, metadata: youtube_info_metadata(av_result.info)};
        } catch (error) {
            const use_cookies_on_download = Prefs.get_pref('use_cookies_on_download');
            if(!use_cookies_on_download) throw error;
            const cookie_jar = Prefs.get_pref('youtube_cookie_jar');
            const av_result = await Origin.YouTubeDL.ytdl(video_id, {...ytdl_opts, requestOptions: use_cookies_on_download ? {headers: {cookie: cookie_jar.toString()}} : {}});
            if("error" in av_result) throw new Error(av_result.error as string);
            return {url: av_result.av.url, metadata: youtube_info_metadata(av_result.info)};
        }
    } catch (error) { return { error: error as Error }; }
}