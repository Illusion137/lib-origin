import * as Origin from '@origin/index'
import type { ResponseError } from '@common/types';
import { Prefs } from '@illusive/prefs';
import type { DownloadFromIdResult,Track } from '@illusive/types';
import { generror_catch } from '@common/utils/error_util';
import { milliseconds_of } from '@common/utils/util';
import { youtube_search } from './search';
import { number_epsilon_distance } from './illusive_utils';

async function youtube_download_from_id_retry(old_error: ResponseError, retry_track?: Track){
    if(retry_track === undefined) return old_error;
    console.warn(`Retrying...: ${retry_track.title} | ${retry_track.artists[0].name}`);
    const search_query = `${retry_track.title} ${retry_track.artists[0].name}`;
    const search_result = await youtube_search(search_query);
    if("error" in search_result && search_result.error) return search_result.error;
    const new_track = search_result.tracks.find(track => number_epsilon_distance(track.duration, retry_track.duration, 10));
    if(!new_track?.youtube_id) return old_error;
    return youtube_download_from_id(new_track?.youtube_id, "18", undefined);
}

export async function soundcloud_download_from_id(permalink: string, _: string, retry_track?: Track): Promise<DownloadFromIdResult | ResponseError> {
    const use_cookies_on_download = Prefs.get_pref('use_cookies_on_download');
    const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
    const url = await Origin.SoundCloudDL.get_download_info_from_permalink(permalink, use_cookies_on_download ? cookie_jar : undefined);
    // fallback as YouTube
    if (typeof url === "object") return await youtube_download_from_id_retry(url, retry_track);
    return { url: url };
}
export async function youtube_download_from_id(video_id: string, quality: string, retry_track?: Track): Promise<DownloadFromIdResult | ResponseError> {
    try {
        const sabr_result = await Origin.YouTubeDL.resolve_sabr_url(video_id);
        if ("error" in sabr_result) return youtube_download_from_id_retry(sabr_result, retry_track);
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

export async function audiomack_download_from_id(track_id: string, _: string): Promise<DownloadFromIdResult | ResponseError> {
    const url = await Origin.AudiomackDL.get_stream_url({ track_id });
    if (typeof url === "object") return url;
    return { url };
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