import * as Origin from '../../origin/src/index'
import { ResponseError } from '../../origin/src/utils/types';
import { Prefs } from './prefs';

export async function soundcloud_download_from_id(permalink: string, quality: string): Promise<{"url":string}|ResponseError> {
    const use_cookies_on_download = Prefs.get_pref('use_cookies_on_download');
    const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
    const url = await Origin.SoundCloudDL.get_download_info_from_permalink(permalink, use_cookies_on_download ? cookie_jar : undefined);
    if(typeof url === "object") return url;
    return {"url": url}
}
export async function youtube_download_from_id(video_id: string, quality: string): Promise<{"url":string}|ResponseError> {
    try {
        const use_cookies_on_download = Prefs.get_pref('use_cookies_on_download');
        const cookie_jar = Prefs.get_pref('youtube_cookie_jar');
        const format = await Origin.YouTubeDL.ytdl(video_id, {"quality": quality, "requestOptions": use_cookies_on_download ? {"headers": {"cookie": cookie_jar.toString()}} : {}});
        return {"url": format.url};
    } catch (error) { return { "error": String(error) }; }
}