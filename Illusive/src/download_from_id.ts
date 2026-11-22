import * as Origin from '@origin/index';
import type { ResponseError } from '@common/types';
import { Prefs } from '@illusive/prefs';
import type { DownloadFromIdResult, Track } from '@illusive/types';
import { generror, generror_catch } from '@common/utils/error_util';
import { milliseconds_of } from '@common/utils/util';
import { youtube_search } from './search';
import { number_epsilon_distance } from './illusive_utils';
import { IllusiAccount } from './db/sync/illusi_account';

async function youtube_download_from_id_retry(old_error: ResponseError, retry_track?: Track) {
	if (retry_track === undefined) return old_error;
	console.warn(`Retrying...: ${retry_track.title} | ${retry_track.artists[0].name}`);
	const search_query = `${retry_track.title} ${retry_track.artists[0].name}`;
	const search_result = await youtube_search(search_query);
	if ('error' in search_result && search_result.error) return search_result.error;
	const new_track = search_result.tracks.find(track => number_epsilon_distance(track.duration, retry_track.duration, 10));
	if (!new_track?.youtube_id) return old_error;
	return youtube_download_from_id(new_track?.youtube_id, undefined);
}

export async function soundcloud_download_from_id(permalink: string, retry_track?: Track): Promise<DownloadFromIdResult | ResponseError> {
	const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
	const url = await Origin.SoundCloudDL.get_download_info_from_permalink(permalink, cookie_jar);
	if (typeof url === 'object') return Origin.SoundCloudDL.is_encrypted_error(url) ? await youtube_download_from_id_retry(url, retry_track) : url;
	return { url: url };
}
export async function youtube_download_from_id(video_id: string, retry_track?: Track): Promise<DownloadFromIdResult | ResponseError> {
	try {
		const sabr_params = await Origin.YouTubeDL.resolve_sabr_info(video_id);
		if ('error' in sabr_params) return Origin.YouTubeDL.is_unavailable_error(sabr_params) ? sabr_params : youtube_download_from_id_retry(sabr_params, retry_track);
		return {
			url: sabr_params.serverAbrStreamingUrl,
			duration: sabr_params.duration,
			sabr_params
		};
	} catch (error) { return generror_catch(error, 'Couldn\'t Download YouTube Video', 'MEDIUM', { video_id }); }
}

export async function audiomack_download_from_id(track_id: string): Promise<DownloadFromIdResult | ResponseError> {
	const url = await Origin.AudiomackDL.get_stream_url({ track_id });
	if (typeof url === 'object') return url;
	return { url };
}

export async function bandlab_download_from_id(song_id: string): Promise<DownloadFromIdResult | ResponseError> {
	const cookie_jar = Prefs.get_pref('bandlab_cookie_jar');
	const url_response = await Origin.BandLab.get_download_url(song_id, {
		cookie_jar: cookie_jar, fetch_opts: {
			cache_opts: {
				cache_ms: milliseconds_of({ hours: 6 }),
				cache_mode: 'file',
				cache_ms_fail: 0,
				cache_on: 'url'
			}
		}
	});
	if (typeof url_response === 'object') return url_response;
	return {
		url: url_response
	};
}

export async function illusi_download_from_id(illusi_id: string): Promise<DownloadFromIdResult | ResponseError> {
	if (!IllusiAccount.is_logged_in()) return generror('Not logged in', 'INFO', { illusi_id });
	const result = await Origin.Illusi.Tracks.get(illusi_id);
	if (Origin.Illusi.is_error(result)) return result;
	if (result.resource_id === null) return generror('Track has no media', 'INFO', { illusi_id });
	const media = await Origin.Illusi.MediaFiles.resolve(result.resource_id);
	if (Origin.Illusi.is_error(media)) return media;
	return {
		url: media.url,
		headers: media.headers,
		...(result.duration_ms === null ? {} : { duration: result.duration_ms / 1000 })
	};
}
