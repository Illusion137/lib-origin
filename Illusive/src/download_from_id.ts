import * as Origin from '@origin/index'
import type { ResponseError } from '@common/types';
import { youtube_info_metadata } from '@illusive/parsers/youtube_parser';
import { Prefs } from '@illusive/prefs';
import type { DownloadFromIdResult } from '@illusive/types';
import { generror_catch } from '@common/utils/error_util';
import type { FormatOptions } from 'youtubei.js/dist/src/types';

export async function soundcloud_download_from_id(permalink: string, _: string): Promise<DownloadFromIdResult|ResponseError> {
    const use_cookies_on_download = Prefs.get_pref('use_cookies_on_download');
    const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
    const url = await Origin.SoundCloudDL.get_download_info_from_permalink(permalink, use_cookies_on_download ? cookie_jar : undefined);
    if(typeof url === "object") return url;
    return {url: url};
}
export async function youtube_download_from_id(video_id: string, quality: string): Promise<DownloadFromIdResult|ResponseError> {
    const ytdl_opts: FormatOptions = {
        itag: Prefs.get_pref('force_youtube_18_quality') ? 18 : Number(quality),
        client: "TV"
    };
    try {
        try {
            // FIXME: YouTube Download From ID is silly
            const av_info = await Origin.YouTubeDL.get_info(video_id);
            if("error" in av_info) throw av_info.error;
            const av_format_url = await Origin.YouTubeDL.choose_format(av_info, ytdl_opts);
            return {url: av_format_url, metadata: youtube_info_metadata(av_info)};
        } catch (error) {
            // FIXME: YouTube Download With cookies is silly
            // const use_cookies_on_download = Prefs.get_pref('use_cookies_on_download');
            // if(!use_cookies_on_download) throw error;
            // const cookie_jar = Prefs.get_pref('youtube_cookie_jar');
            // const av_result = await Origin.YouTubeDL.ytdl(video_id, {...ytdl_opts, requestOptions: {headers: {cookie: cookie_jar.toString()}}});
            // if("error" in av_result) throw av_result.error;
            // return {url: av_result.av.url, metadata: youtube_info_metadata(av_result.info)};
            return {url: '', metadata: {} as never};
        }
    } catch (error) { return generror_catch(error, "Couldn't Download YouTube Video", {video_id, quality}); }
}