import * as Origin from '@origin/index'
import type { ResponseError } from '@common/types';
import { Prefs } from '@illusive/prefs';
import type { DownloadFromIdResult } from '@illusive/types';
import { generror_catch } from '@common/utils/error_util';
import { milliseconds_of } from '@common/utils/util';
// import type { Types } from 'youtubei.js';

export async function soundcloud_download_from_id(permalink: string, _: string): Promise<DownloadFromIdResult | ResponseError> {
    const use_cookies_on_download = Prefs.get_pref('use_cookies_on_download');
    const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
    const url = await Origin.SoundCloudDL.get_download_info_from_permalink(permalink, use_cookies_on_download ? cookie_jar : undefined);
    if (typeof url === "object") return url;
    return { url: url };
}
export async function youtube_download_from_id(video_id: string, quality: string): Promise<DownloadFromIdResult | ResponseError> {
    try {
        const sabr_result = await Origin.YouTubeDL.resolve_sabr_url(video_id);
        if ("error" in sabr_result) return sabr_result;
        return {
            url: sabr_result.url,
            duration: sabr_result.duration,
            isSabr: sabr_result.isSabr,
            sabrServerUrl: sabr_result.sabrServerUrl,
            sabrUstreamerConfig: sabr_result.sabrUstreamerConfig,
            sabrFormats: sabr_result.sabrFormats,
            poToken: sabr_result.poToken,
            placeholder_po_token: sabr_result.placeholder_po_token,
            clientInfo: sabr_result.clientInfo,
            cookie: sabr_result.cookie,
            on_refresh_po_token: sabr_result.on_refresh_po_token,
            on_reload_player_response: sabr_result.on_reload_player_response,
        };
    } catch (error) { return generror_catch(error, "Couldn't Download YouTube Video", "MEDIUM", { video_id, quality }); }
}

export async function bandlab_download_from_id(song_id: string, _: string): Promise<DownloadFromIdResult | ResponseError> {
    const cookie_jar = Prefs.get_pref('bandlab_cookie_jar');
    const url_response = await Origin.BandLab.get_download_url(song_id, {
        cookie_jar: cookie_jar, fetch_opts: {
            cache_opts: {
                cache_ms: milliseconds_of({ hours: 6 }),
                cache_mode: "file",
                cache_ms_fail: 0,
                cache_on: "url"
            }
        }
    });
    if (typeof url_response === "object") return url_response;
    return {
        url: url_response,
    };
}