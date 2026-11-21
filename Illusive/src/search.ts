import * as Origin from '@origin/index';
import type { ClientSearchOf, Playlist, Track, User } from '@origin/soundcloud/types/Search';
import { CookieJar } from '@common/utils/cookie_util';
import type { ResponseError } from '@common/types';
import { is_empty } from '@common/utils/util';
import { Illusi } from '@origin/illusi/illusi';
import { IllusiAccount } from '@illusive/db/sync/illusi_account';
import { IllusiViews } from '@illusive/illusi_views';
import { GLOBALS } from '@illusive/globals';
import type { YTSearchResult } from '@origin/youtube/parser';
import { parse_apple_music_search_album, parse_apple_music_search_artist, parse_apple_music_search_playlist, parse_apple_music_search_track } from '@illusive/parsers/apple_music_parser';
import { soundcloud_parse_playlist, soundcloud_parse_track, soundcloud_parse_user } from '@illusive/parsers/soundcloud_parser';
import { ytm_album, ytm_artist, ytm_track } from '@illusive/parsers/youtube_music_parser';
import { youtube_parse_channels, youtube_parse_playlists, youtube_parse_videos } from '@illusive/parsers/youtube_parser';
import { spotify_uri_to_uri } from '@illusive/illusive_utils';
import { Prefs } from '@illusive/prefs';
import { parse_amazon_music_search_track } from '@illusive/parsers/track_parser';
import type { CompactArtist, CompactPlaylist, MusicSearchResponse, SearchOpts } from '@illusive/types';
import type * as IllusiveTypes from '@illusive/types';
import { parse_spotify_search_album, parse_spotify_search_track, parse_spotify_similar_artist } from './parsers/spotify_parser';
import { audiomack_parse_track } from './parsers/audiomack_parser';
import { deezer_parse_track } from './parsers/deezer_parser';
import { pandora_parse_track } from './parsers/pandora_parser';
import { tidal_parse_track } from './parsers/tidal_parser';
import type { Track as AudiomackTrack } from '@origin/audiomack/types';
import type { DeezerTrack } from '@origin/deezer/types';

function default_search(error?: ResponseError): MusicSearchResponse {
	return {
		...(error !== undefined ? { error: error } : {}),
		tracks: [],
		playlists: [],
		albums: [],
		artists: [],
		continuation: null
	};
}
function get_cookie_jar(pref_opt: Prefs.PrefOptions) {
	return Prefs.get_pref('use_cookies_on_search') ? Prefs.get_pref(pref_opt) as CookieJar : new CookieJar([]);
}

export async function spotify_search(query: string, opts?: SearchOpts): Promise<MusicSearchResponse> {
	const cookie_jar = get_cookie_jar('spotify_cookie_jar');
	const search_response = await Origin.Spotify.search({ cookie_jar, var: { searchTerm: query, limit: opts?.limit }, proxy: opts?.proxy });
	if ('error' in search_response) return default_search(search_response);
	return {
		tracks: search_response.data.searchV2.tracksV2.items.map(parse_spotify_search_track),
		playlists: search_response.data.searchV2.playlists.items.map((playlist) => {
			if (playlist.data.__typename === 'NotFound') return null;
			return {
				title: { name: playlist.data.name, uri: spotify_uri_to_uri(playlist.data.uri) },
				artist: [{ name: playlist.data.ownerV2.data.name, uri: spotify_uri_to_uri(playlist.data.ownerV2.data.uri) }],
				artwork_thumbnails: playlist.data.images.items[0].sources.map(source => ({ ...source, height: source.height ?? 0, width: source.width ?? 0 }))
			};
		}).filter(item => item !== null),
		albums: search_response.data.searchV2.albumsV2.items.map(parse_spotify_search_album),
		artists: search_response.data.searchV2.artists.items.map(item => parse_spotify_similar_artist(item.data)),
		continuation: null
	};
}

export async function amazon_music_search(query: string, _?: SearchOpts): Promise<MusicSearchResponse> {
	const cookie_jar = get_cookie_jar('amazon_music_cookie_jar');
	const search_response = await Origin.AmazonMusic.search_tracks(query, { cookie_jar });
	if ('error' in search_response) return default_search(search_response);
	return {
		tracks: search_response.map(track => parse_amazon_music_search_track(track)),
		playlists: [],
		albums: [],
		artists: [],
		continuation: null
	};
}
interface YouTubeSearchContinuation { continuation: string }
function youtube_parse_search(data: YTSearchResult, continuation: string | null): MusicSearchResponse {
	return {
		tracks: youtube_parse_videos(data.tracks),
		playlists: youtube_parse_playlists(data.playlists),
		artists: youtube_parse_channels(data.artists),
		albums: [],
		continuation: continuation === null ? null : { continuation } as YouTubeSearchContinuation
	};
}
export async function youtube_search(query: string, _opts?: SearchOpts): Promise<MusicSearchResponse> {
	const cookie_jar = get_cookie_jar('youtube_cookie_jar');
	const search_response = await Origin.YouTube.search({ cookie_jar }, query);
	if ('error' in search_response) return default_search(search_response);
	return youtube_parse_search(search_response.data, search_response.continuation);
}
export async function youtube_search_continuation(opts: YouTubeSearchContinuation): Promise<MusicSearchResponse> {
	const cookie_jar = get_cookie_jar('youtube_cookie_jar');
	const search_response = await Origin.YouTube.get_continuation({ cookie_jar }, opts.continuation);
	if ('error' in search_response) return default_search(search_response);
	return youtube_parse_search(search_response.data as YTSearchResult, search_response.continuation);
}

export async function youtube_music_search(query: string, _opts?: SearchOpts): Promise<MusicSearchResponse> {
	const cookie_jar = get_cookie_jar('youtube_music_cookie_jar');
	const search_response = await Origin.YouTubeMusic.search({ cookie_jar }, query);
	if ('error' in search_response) return default_search(search_response);

	const tracks: IllusiveTypes.Track[] = search_response.tracks.map(ytm_track);
	const albums: CompactPlaylist[] = search_response.albums.map(album => ytm_album(album, 'ALBUM'));
	const playlists: CompactPlaylist[] = search_response.playlists.map(playlist => ytm_album(playlist, 'PLAYLIST'));
	const artists: CompactArtist[] = search_response.artists.map(ytm_artist);

	const top_result = search_response.top_result;
	if (top_result?.type === 'TRACK' && top_result.track) tracks.unshift(ytm_track(top_result.track));
	else if (top_result?.type === 'ALBUM' && top_result.album) albums.unshift(ytm_album(top_result.album, 'ALBUM'));
	else if (top_result?.type === 'ARTIST' && top_result.artist) artists.unshift(ytm_artist(top_result.artist));

	return {
		tracks,
		playlists,
		albums,
		artists,
		continuation: null
	};
}

interface SoundcloudSearchContinuation { next_href: string | null; client_id: string; depth: number }
export function soundcloud_parse_search(search_response: ClientSearchOf<Playlist | Track | User>): MusicSearchResponse {
	const playlists_and_albums = search_response.data.collection.filter(item => item.kind === 'playlist');
	const playlists = playlists_and_albums.filter(item => !item.is_album);
	const albums = playlists_and_albums.filter(item => item.is_album);
	const users = search_response.data.collection.filter(item => item.kind === 'user');
	const tracks = search_response.data.collection.filter(item => item.kind === 'track');
	return {
		tracks: tracks.map(soundcloud_parse_track),
		playlists: playlists.map(soundcloud_parse_playlist),
		albums: albums.map(soundcloud_parse_playlist),
		artists: users.map(soundcloud_parse_user),
		continuation: { next_href: search_response.data.next_href, client_id: search_response.client_id, depth: 1 } as SoundcloudSearchContinuation
	};
}
export async function soundcloud_search(query: string, opts?: SearchOpts): Promise<MusicSearchResponse> {
	const cookie_jar = get_cookie_jar('soundcloud_cookie_jar');
	const search_response = await Origin.SoundCloud.search('EVERYTHING', { query, cookie_jar, limit: opts?.limit, fetch_opts: { proxy: opts?.proxy } });
	if ('error' in search_response) return default_search(search_response);
	return soundcloud_parse_search(search_response);
}
export async function soundcloud_search_continuation(opts: SoundcloudSearchContinuation): Promise<MusicSearchResponse> {
	if (opts.next_href === null) return default_search();
	const cookie_jar = get_cookie_jar('soundcloud_cookie_jar');
	const search_response = await Origin.SoundCloud.continuation<Playlist | Track | User>(opts.next_href, { cookie_jar, client_id: opts.client_id }, 1);
	return soundcloud_parse_search({ data: search_response, client_id: opts.client_id });
}

export async function illusi_search(query: string, opts?: SearchOpts): Promise<MusicSearchResponse> {
	if (!IllusiAccount.is_logged_in()) return default_search();
	const result = await Illusi.search(query, { limit: Math.min(opts?.limit ?? 50, 200) });
	if (Illusi.is_error(result)) return default_search(result);
	return {
		tracks: IllusiViews.prefer_local((result.tracks?.items ?? []).map(IllusiViews.track), GLOBALS.global_var.sql_tracks),
		playlists: (result.playlists?.items ?? []).map(IllusiViews.playlist),
		albums: (result.albums?.items ?? []).map(IllusiViews.album),
		artists: (result.artists?.items ?? []).map(IllusiViews.artist),
		continuation: null
	};
}

export async function audiomack_search(query: string, opts?: SearchOpts): Promise<MusicSearchResponse> {
	const search_response = await Origin.Audiomack.search({ query, limit: opts?.limit ?? 20, fetch_opts: { proxy: opts?.proxy } });
	if ('error' in search_response) return default_search(search_response);
	return {
		tracks: (search_response.results as AudiomackTrack[]).map(audiomack_parse_track),
		playlists: [],
		albums: [],
		artists: [],
		continuation: null
	};
}

export async function deezer_search(query: string, opts?: SearchOpts): Promise<MusicSearchResponse> {
	const cookie_jar = get_cookie_jar('deezer_cookie_jar');
	const search_response = await Origin.Deezer.search({ query, type: 'track', limit: opts?.limit ?? 25, cookie_jar, fetch_opts: { proxy: opts?.proxy } });
	if ('error' in search_response) return default_search(search_response);
	return {
		tracks: (search_response.data as DeezerTrack[]).map(deezer_parse_track),
		playlists: [],
		albums: [],
		artists: [],
		continuation: null
	};
}

export async function pandora_search(query: string, opts?: SearchOpts): Promise<MusicSearchResponse> {
	const cookie_jar = get_cookie_jar('pandora_cookie_jar');
	const search_response = await Origin.Pandora.search({ query, types: ['TR'], page_size: opts?.limit ?? 20, cookie_jar, fetch_opts: { proxy: opts?.proxy } });
	if ('error' in search_response) return default_search(search_response);
	const track_ids = search_response.results.tracks?.pandoraIds ?? [];
	const tracks = track_ids.map(id => search_response.annotations[id]).filter(t => t?.type === 'TR');
	return {
		tracks: tracks.map(pandora_parse_track),
		playlists: [],
		albums: [],
		artists: [],
		continuation: null
	};
}

export async function tidal_search(query: string, opts?: SearchOpts): Promise<MusicSearchResponse> {
	const cookie_jar = get_cookie_jar('tidal_cookie_jar');
	const search_response = await Origin.Tidal.search({ query, types: ['TRACKS'], limit: opts?.limit ?? 20, cookie_jar, fetch_opts: { proxy: opts?.proxy } });
	if ('error' in search_response) return default_search(search_response);
	return {
		tracks: search_response.tracks.items.map(tidal_parse_track),
		playlists: [],
		albums: [],
		artists: [],
		continuation: null
	};
}

export async function apple_music_search(query: string, opts?: SearchOpts): Promise<MusicSearchResponse> {
	const cookie_jar = get_cookie_jar('apple_music_cookie_jar');
	const search_response = await Origin.AppleMusic.search(query, { cookie_jar, fetch_opts: { proxy: opts?.proxy } });
	if ('error' in search_response) return default_search(search_response);

	const tracks = is_empty(search_response.data.resources.songs) ? [] : Object.values(search_response.data.resources.songs);
	const playlists = is_empty(search_response.data.resources.playlists) ? [] : Object.values(search_response.data.resources.playlists);
	const albums = is_empty(search_response.data.resources.albums) ? [] : Object.values(search_response.data.resources.albums);
	const artists = is_empty(search_response.data.resources.artists) ? [] : Object.values(search_response.data.resources.artists);

	return {
		tracks: tracks.map(parse_apple_music_search_track),
		playlists: playlists.map(parse_apple_music_search_playlist),
		albums: albums.map(parse_apple_music_search_album),
		artists: artists.map(parse_apple_music_search_artist),
		continuation: null
	};
}
