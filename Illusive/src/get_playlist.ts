import * as Origin from '@origin/index';
import type * as SCSearch from '@origin/soundcloud/types/Search';
import type { Album } from '@origin/spotify/types/Album';
import type { Collection } from '@origin/spotify/types/Collection';
import type { UserPlaylist } from '@origin/spotify/types/UserPlaylist';
import type { ResponseError } from '@common/types';
import { get_main_key, is_empty, milliseconds_of, urlid } from '@common/utils/util';
import type { YTMPlaylistResult, YTPlaylistResult } from '@origin/youtube/parser';
import { clean_album_title, parse_apple_music_album_track, parse_apple_music_artwork, parse_apple_music_playlist_track, parse_apple_music_user_playlist_track } from '@illusive/parsers/apple_music_parser';
import { musi_parse_track } from '@illusive/parsers/musi_parser';
import { soundcloud_parse_track } from '@illusive/parsers/soundcloud_parser';
import { ytm_named, ytm_track } from '@illusive/parsers/youtube_music_parser';
import { youtube_parse_playlist_header, youtube_parse_videos } from '@illusive/parsers/youtube_parser';
import { best_thumbnail, create_uri, spotify_uri_to_uri } from '@illusive/illusive_utils';
import { Prefs } from '@illusive/prefs';
import { parse_amazon_music_playlist_track } from '@illusive/parsers/track_parser';
import type { ISOString, MusicServicePlaylist, MusicServicePlaylistContinuation, NamedUUID } from '@illusive/types';
import { Constants } from '@illusive/constants';
import { generror } from '@common/utils/error_util';
import { parse_spotify_album_track, parse_spotify_collection_track, parse_spotify_playlist_track } from './parsers/spotify_parser';
import type { RoZFetchRequestInit } from '@common/rozfetch';
import { bandlab_parse_track } from './parsers/bandlab_parser';
import { audiomack_parse_track } from './parsers/audiomack_parser';
import { deezer_parse_track } from './parsers/deezer_parser';
import { pandora_parse_track } from './parsers/pandora_parser';
import { tidal_parse_track, tidal_cover_url } from './parsers/tidal_parser';
import rozfetch from '@common/rozfetch';
import { Illusi } from '@origin/illusi/illusi';
import type { TrackView } from '@origin/illusi/types';
import { IllusiAccount } from './db/sync/illusi_account';
import { IllusiViews } from './illusi_views';
import { GLOBALS } from './globals';

export const album_fetch_opts: RoZFetchRequestInit = {
	cache_opts: {
		cache_ms: milliseconds_of({ days: 30 }),
		cache_mode: 'file',
		cache_ms_fail: 0,
		cache_on: 'url'
	}
};

function default_playlist(error?: ResponseError): MusicServicePlaylist {
	return { ...(error !== undefined ? { error: error } : {}), title: '', tracks: [], continuation: null };
}

export async function musi_get_playlist(url: string): Promise<MusicServicePlaylist> {
	const playlist_response = await Origin.Musi.get_playlist(url);
	if ('error' in playlist_response) return default_playlist(playlist_response);
	return {
		title: playlist_response.success.data.title,
		tracks: playlist_response.success.data.data.map(musi_parse_track),
		continuation: null
	};
}

interface YouTubePlaylistContinuation { continuation: string }
export async function youtube_get_playlist(url: string, fetch_opts?: RoZFetchRequestInit): Promise<MusicServicePlaylist> {
	const cookie_jar = Prefs.get_pref('youtube_cookie_jar');
	const playlist_response = await Origin.YouTube.get_playlist({
		cookie_jar,
		fetch_opts: fetch_opts ?? (Origin.YouTubeMusic.playlist_type(url) === 'ALBUM' ? album_fetch_opts : undefined)
	}, url);
	if ('error' in playlist_response) return default_playlist(playlist_response);
	return {
		...youtube_parse_playlist_header(playlist_response.data.header),
		tracks: youtube_parse_videos(playlist_response.data.tracks),
		continuation: playlist_response.continuation === null ? null : { continuation: playlist_response.continuation } as YouTubePlaylistContinuation
	};
}
export async function youtube_get_playlist_continuation(opts: YouTubePlaylistContinuation): Promise<MusicServicePlaylistContinuation> {
	const cookie_jar = Prefs.get_pref('youtube_cookie_jar');
	const playlist_response = await Origin.YouTube.get_continuation({ cookie_jar }, opts.continuation);
	if ('error' in playlist_response) return { tracks: [], continuation: null, error: playlist_response };
	const data = playlist_response.data as YTPlaylistResult;
	return { tracks: youtube_parse_videos(data.tracks), continuation: playlist_response.continuation === null ? null : { continuation: playlist_response.continuation } as YouTubePlaylistContinuation };
}

interface YouTubeMusicPlaylistContinuation { continuation: string }
export async function youtube_music_get_playlist(url: string, fetch_opts?: RoZFetchRequestInit): Promise<MusicServicePlaylist> {
	const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
	const is_album = Origin.YouTubeMusic.playlist_type(url) === 'ALBUM';
	const playlist_response = await Origin.YouTubeMusic.get_playlist({ cookie_jar, fetch_opts: fetch_opts ?? (is_album ? album_fetch_opts : undefined) }, url);
	if ('error' in playlist_response) return { title: '', tracks: [], continuation: null, error: playlist_response };
	return {
		title: playlist_response.data.header.title,
		creator: playlist_response.data.header.artists.map(ytm_named),
		artwork_url: best_thumbnail(playlist_response.data.header.thumbnails)?.url,
		description: playlist_response.data.header.description,
		tracks: playlist_response.data.tracks.map(ytm_track),
		continuation: playlist_response.continuation === null ? null : { continuation: playlist_response.continuation } as YouTubeMusicPlaylistContinuation
	};
}
export async function youtube_music_get_playlist_continuation(opts: YouTubeMusicPlaylistContinuation): Promise<MusicServicePlaylistContinuation> {
	const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
	const playlist_response = await Origin.YouTubeMusic.get_continuation({ cookie_jar }, opts.continuation);
	if ('error' in playlist_response) return { tracks: [], continuation: null, error: playlist_response };
	const data = playlist_response.data as YTMPlaylistResult;
	return { tracks: data.tracks.map(ytm_track), continuation: playlist_response.continuation === null ? null : { continuation: playlist_response.continuation } as YouTubeMusicPlaylistContinuation };
}

interface SpotifyPlaylistContinuation { client: Origin.Spotify.Client; id: string; current: number; total: number; limit: number; type: 'ALBUM' | 'PLAYLIST' | 'COLLECTION' }

export async function spotify_get_playlist(url: string): Promise<MusicServicePlaylist> {
	let playlist_response: UserPlaylist | Album | Collection | ResponseError;
	const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
	const playlist_limit: number = Constants.spotify_playlist_limit;
	const client = await Origin.Spotify.get_client(url, cookie_jar);
	if ('error' in client) return { title: '', tracks: [], continuation: null, error: client };
	const playlist_id = urlid(url, 'open.spotify.com/', 'playlist/', 'album/', 'collection/');
	const playlist_type = urlid(url, 'open.spotify.com/', /\/.+/);
	switch (playlist_type) {
		case 'playlist': playlist_response = await Origin.Spotify.get_playlist({ cookie_jar, client, var: { limit: playlist_limit, uri: playlist_id } }); break;
		case 'album': playlist_response = await Origin.Spotify.get_album({ cookie_jar, client, var: { limit: playlist_limit, uri: playlist_id }, fetch_opts: album_fetch_opts }); break;
		case 'tracks':
		case 'collection': playlist_response = await Origin.Spotify.get_collection({ cookie_jar, client, var: { limit: playlist_limit } }); break;
		default: return { title: '', tracks: [], continuation: null };
	}
	if (playlist_response === undefined) return { title: '', tracks: [], continuation: null, error: generror('Spotify playlist_response is undefined', 'MEDIUM', { url, playlist_limit, playlist_type }) };
	if ((typeof playlist_response === 'object' && 'error' in playlist_response)) return { title: '', tracks: [], continuation: null, error: playlist_response };
	if ('playlistV2' in playlist_response.data) {
		return {
			title: playlist_response.data.playlistV2.name,
			creator: [{ name: playlist_response.data.playlistV2.ownerV2.data.name, uri: spotify_uri_to_uri(playlist_response.data.playlistV2.ownerV2.data.uri) }],
			description: playlist_response.data.playlistV2.description,
			tracks: playlist_response.data.playlistV2.content.items.map(parse_spotify_playlist_track),
			continuation: playlist_limit >= playlist_response.data.playlistV2.content.totalCount
				? null
				: { client, id: playlist_id, current: playlist_limit, total: playlist_response.data.playlistV2.content.totalCount, limit: playlist_limit, type: 'PLAYLIST' } as SpotifyPlaylistContinuation
		};
	} else if ('albumUnion' in playlist_response.data) {
		const album_union = playlist_response.data.albumUnion;
		const artwork = best_thumbnail(playlist_response.data.albumUnion.coverArt.sources);
		return {
			title: album_union.name,
			creator: playlist_response.data.albumUnion.artists.items.map((artist) => {
				return { name: artist.profile.name, uri: spotify_uri_to_uri(artist.uri) };
			}),
			artwork_url: playlist_response.data.albumUnion.coverArt.sources[0].url,
			date: playlist_response.data.albumUnion.date.isoString as ISOString,
			tracks: playlist_response.data.albumUnion.tracks.items.map(track => parse_spotify_album_track(track, { name: album_union.name, uri: album_union.uri }, artwork?.url)),
			continuation: playlist_limit >= playlist_response.data.albumUnion.tracks.totalCount
				? null
				: { client, id: playlist_id, current: playlist_limit, total: playlist_response.data.albumUnion.tracks.totalCount, limit: playlist_limit, type: 'ALBUM' } as SpotifyPlaylistContinuation
		};
	} else {
		return {
			title: 'Spotify Library',
			tracks: playlist_response.data.me.library.tracks.items.map(parse_spotify_collection_track),
			continuation: playlist_limit >= playlist_response.data.me.library.tracks.totalCount
				? null
				: { client, id: playlist_id, current: playlist_limit, total: playlist_response.data.me.library.tracks.totalCount, limit: playlist_limit, type: 'COLLECTION' } as SpotifyPlaylistContinuation
		};
	}
}
export async function spotify_get_playlist_continuation(opts: SpotifyPlaylistContinuation): Promise<MusicServicePlaylistContinuation> {
	let playlist_response;
	const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
	switch (opts.type) {
		case 'PLAYLIST': playlist_response = await Origin.Spotify.get_playlist({ cookie_jar, client: opts.client, var: { limit: opts.limit, offset: opts.current, uri: opts.id } }); break;
		case 'ALBUM': playlist_response = await Origin.Spotify.get_album({ cookie_jar, client: opts.client, var: { limit: opts.limit, offset: opts.current, uri: opts.id } }); break;
		case 'COLLECTION': playlist_response = await Origin.Spotify.get_collection({ cookie_jar, client: opts.client, var: { limit: opts.limit, offset: opts.current } }); break;
		default: return { tracks: [], continuation: null };
	}
	if (playlist_response === undefined || 'error' in playlist_response) return { tracks: [], continuation: null, error: playlist_response };
	if ('playlistV2' in playlist_response.data) {
		return {
			tracks: playlist_response.data.playlistV2.content.items.map(parse_spotify_playlist_track),
			continuation: opts.current + opts.limit >= playlist_response.data.playlistV2.content.totalCount
				? null
				: { client: opts.client, id: opts.id, current: opts.current + opts.limit, total: playlist_response.data.playlistV2.content.totalCount, limit: opts.limit, type: 'PLAYLIST' } as SpotifyPlaylistContinuation
		};
	} else if ('albumUnion' in playlist_response.data) {
		const album_union = playlist_response.data.albumUnion;
		const artwork = best_thumbnail(playlist_response.data.albumUnion.coverArt.sources);
		return {
			tracks: playlist_response.data.albumUnion.tracks.items.map(track => parse_spotify_album_track(track, album_union, artwork?.url)),
			continuation: opts.current + opts.limit >= playlist_response.data.albumUnion.tracks.totalCount
				? null
				: { client: opts.client, id: opts.id, current: opts.current + opts.limit, total: playlist_response.data.albumUnion.tracks.totalCount, limit: opts.limit, type: 'ALBUM' } as SpotifyPlaylistContinuation
		};
	} else {
		return {
			tracks: playlist_response.data.me.library.tracks.items.map(parse_spotify_collection_track),
			continuation: opts.current + opts.limit >= playlist_response.data.me.library.tracks.totalCount
				? null
				: { client: opts.client, id: opts.id, current: opts.current + opts.limit, total: playlist_response.data.me.library.tracks.totalCount, limit: opts.limit, type: 'COLLECTION' } as SpotifyPlaylistContinuation
		};
	}
}

export async function amazon_music_get_playlist(url: string): Promise<MusicServicePlaylist> {
	const cookie_jar = Prefs.get_pref('amazon_music_cookie_jar');
	const playlist_response = await Origin.AmazonMusic.get_playlist(url, { cookie_jar });
	if ('error' in playlist_response) return { title: '', tracks: [], continuation: null, error: playlist_response };
	return {
		title: playlist_response.title,
		tracks: playlist_response.tracks.map(track => parse_amazon_music_playlist_track(track)),
		continuation: null
	};
}

interface SoundcloudPlaylistContinuation { next_href: string | null; client_id: string; depth: number }
export async function soundcloud_get_playlist(url: string): Promise<MusicServicePlaylist> {
	const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
	const playlist_limit: number = Constants.soundcloud_playlist_limit;

	const hydration = await Origin.SoundCloud.get_hydration('https://www.soundcloud.com', { cookie_jar });
	if ('error' in hydration) return { title: '', tracks: [], continuation: null, error: hydration };
	const client_id = await Origin.SoundCloud.get_client_id({ cookie_jar, scripts: hydration.scripts_urls });
	if ('error' in client_id) return { title: '', tracks: [], continuation: null, error: client_id };

	if (url.includes('you/likes')) {
		const playlist_response = await Origin.SoundCloud.liked_music({ cookie_jar });
		if ('error' in playlist_response) return { title: '', tracks: [], continuation: null, error: playlist_response };
		return {
			title: 'Liked Music',
			creator: [{ name: 'You', uri: null }],
			tracks: playlist_response.data.collection.map(({ track }) => track).map(soundcloud_parse_track),
			continuation: { next_href: playlist_response.data.next_href, client_id: client_id.client_id, depth: 1 } as SoundcloudPlaylistContinuation
		};
	} else if (url.includes('/sets/')) {
		const playlist_response = await Origin.SoundCloud.get_playlist({ cookie_jar, playlist_path: url });
		if ('error' in playlist_response) return { title: '', tracks: [], continuation: null, error: playlist_response };
		return {
			title: playlist_response.hydration.data.title,
			creator: [{ name: playlist_response.hydration.data.user.username, uri: create_uri('soundcloud', playlist_response.hydration.data.user.permalink) }],
			description: playlist_response.hydration.data.description,
			artwork_url: playlist_response.hydration.data.artwork_url,
			date: playlist_response.hydration.data.created_at as ISOString,
			tracks: playlist_response.tracks.map(soundcloud_parse_track),
			continuation: null
		};
	}
	const artist_response = await Origin.SoundCloud.get_artist('TRACKS', { cookie_jar, client_id: client_id.client_id, artist_id: url, limit: playlist_limit });
	if ('error' in artist_response) return { title: '', tracks: [], continuation: null, error: artist_response };
	return {
		title: artist_response.user.data.username,
		creator: [{ name: artist_response.user.data.username, uri: create_uri('soundcloud', artist_response.user.data.permalink) }],
		description: artist_response.user.data.description,
		artwork_url: artist_response.user.data.avatar_url,
		date: artist_response.user.data.created_at as ISOString,
		tracks: artist_response.artist_data.collection.map(soundcloud_parse_track),
		continuation: { next_href: artist_response.artist_data.next_href, client_id: client_id.client_id, depth: 1 } as SoundcloudPlaylistContinuation
	};
}
export async function soundcloud_get_playlist_continuation(opts: SoundcloudPlaylistContinuation): Promise<MusicServicePlaylistContinuation> {
	if (opts.next_href === null) return { tracks: [], continuation: null };
	const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
	const artist_response = await Origin.SoundCloud.continuation(opts.next_href, { ...opts, cookie_jar }, opts.depth) as unknown as SCSearch.SearchOf<SCSearch.Track> | SCSearch.SearchOf<SCSearch.LikedTrack>;
	return {
		tracks: artist_response.collection.length > 0 && 'kind' in artist_response.collection[0] && artist_response.collection[0].kind === 'like'
			? artist_response.collection.map(track => (track as SCSearch.LikedTrack).track).map(soundcloud_parse_track)
			: (artist_response as SCSearch.SearchOf<SCSearch.Track>).collection.map(soundcloud_parse_track),
		continuation: { next_href: artist_response.next_href, client_id: opts.client_id, depth: 1 } as SoundcloudPlaylistContinuation
	};
}

interface AppleMusicPlaylistContinuation { playlist_id: string; offset: number; total: number; authorization: string }
export async function apple_music_get_playlist(url: string): Promise<MusicServicePlaylist> {
	const cookie_jar = Prefs.get_pref('apple_music_cookie_jar');
	if (url.includes('/album')) {
		const playlist_response = await Origin.AppleMusic.get_album(url, { fetch_opts: album_fetch_opts });
		if ('error' in playlist_response) return { title: '', tracks: [], continuation: null, error: playlist_response };
		const playlist_header = playlist_response.data.sections.find(item => item.id.includes('album-detail-header'))?.items[0];
		const title = clean_album_title(playlist_header?.title ?? '');
		const album_data: NamedUUID = { name: title, uri: create_uri('applemusic', playlist_response.data.canonicalURL) };
		const artist_data: NamedUUID = { name: playlist_header?.subtitleLinks?.[0].title ?? '', uri: playlist_header?.subtitleLinks?.[0].segue?.destination.contentDescriptor.url === undefined ? null : create_uri('applemusic', playlist_header?.subtitleLinks?.[0].segue?.destination.contentDescriptor.url) };
		const artwork_url = parse_apple_music_artwork(playlist_header?.artwork?.dictionary.url);
		return {
			title: title,
			creator: [artist_data],
			artwork_url: artwork_url,
			tracks: playlist_response.data.sections.find(item => item.id.includes('track-list - '))?.items.map(item => parse_apple_music_album_track(item, album_data, artist_data, artwork_url ?? '')) ?? [],
			continuation: null
		};
	} else {
		const playlist_response = await Origin.AppleMusic.get_playlist(url, { cookie_jar });
		if ('error' in playlist_response) return { title: '', tracks: [], continuation: null, error: playlist_response };
		if ('resources' in playlist_response.data) { // User Playlist
			const playlist_data_main_key = get_main_key(playlist_response.data.resources.playlists);
			const playlist_data = playlist_response.data.resources.playlists[playlist_data_main_key];
			const playlist_songs = playlist_response.data.resources['library-songs'] ?? playlist_response.data.resources.songs;
			const playlist_id = Origin.AppleMusic.playlist_urlid(url);
			const song_keys = Object.keys(playlist_songs);

			const __playlists__ = playlist_response.data.resources['library-playlists'] ?? playlist_response.data.resources.playlists;
			const playlist_meta_main_key = get_main_key(__playlists__);

			const total_songs = __playlists__[playlist_meta_main_key].relationships?.tracks?.meta?.total ?? song_keys.length;
			return {
				title: playlist_data.attributes.name,
				creator: [{ name: playlist_data.attributes.curatorName, uri: null }],
				artwork_url: parse_apple_music_artwork(playlist_data.attributes?.artwork?.url),
				description: playlist_data.attributes?.description?.standard,
				date: playlist_data.attributes.lastModifiedDate as ISOString,
				tracks: song_keys.map(key => parse_apple_music_user_playlist_track(playlist_songs[key])),
				continuation: 0 + song_keys.length >= total_songs ? null : { playlist_id, offset: 0 + song_keys.length, total: total_songs, authorization: playlist_response.authorization } as AppleMusicPlaylistContinuation
			};
		} else {
			return {
				title: playlist_response?.data?.sections[0].items[0].title,
				creator: playlist_response?.data?.sections?.[0]?.items?.[0]?.subtitleLinks.map((link) => {
					return { name: link.title, uri: is_empty(link?.segue?.destination?.contentDescriptor?.identifiers?.storeAdamID) ? null : create_uri('applemusic', link?.segue?.destination?.contentDescriptor?.identifiers?.storeAdamID) };
				}) ?? [],
				artwork_url: playlist_response.data.sections[0].items[0].artwork.dictionary.url,
				tracks: playlist_response.data.sections[1].items.map(track => parse_apple_music_playlist_track(track)),
				continuation: null
			};
		}
	}
}
export async function apple_music_get_playlist_continuation(opts: AppleMusicPlaylistContinuation): Promise<MusicServicePlaylistContinuation> {
	const cookie_jar = Prefs.get_pref('apple_music_cookie_jar');
	if (opts === undefined || opts.offset >= opts.total) return { tracks: [], continuation: null };
	const playlist_response = await Origin.AppleMusic.get_playlist_continuation(opts.playlist_id, opts.offset, opts.authorization, { cookie_jar });
	if ('error' in playlist_response) return { tracks: [], continuation: null, error: playlist_response };
	const playlist_songs = playlist_response.resources['library-songs'] ?? playlist_response.resources.songs;
	const song_keys = Object.keys(playlist_songs);
	return {
		tracks: song_keys.map(key => parse_apple_music_user_playlist_track(playlist_songs[key])),
		continuation: { playlist_id: opts.playlist_id, offset: opts.offset + song_keys.length, total: opts.total, authorization: opts.authorization } as AppleMusicPlaylistContinuation
	};
}

interface IllusiPlaylistContinuation { uuid: string; cursor: string }
const ILLUSI_PAGE_LIMIT = 100;

function illusi_library_tracks(tracks: TrackView[]) {
	return IllusiViews.prefer_local(tracks.map(IllusiViews.track), GLOBALS.global_var.sql_tracks);
}
/** A playlist uuid or `album.<id>`, from an `illusi:` uri, a bare id or an illusi.dev/playlist link */
function illusi_playlist_id(url: string): string {
	const id = urlid(url);
	return id.slice(id.lastIndexOf('/') + 1);
}
export async function illusi_get_playlist(url: string): Promise<MusicServicePlaylist> {
	const id = illusi_playlist_id(url);
	if (!IllusiAccount.is_logged_in()) return default_playlist(generror('User not authenticated', 'LOW', { url }));
	const album_id = IllusiViews.album_id_of(id);
	if (album_id !== null) {
		const detail = await Illusi.Albums.get(album_id);
		if (Illusi.is_error(detail)) return default_playlist(detail);
		const compact = IllusiViews.album(detail.album);
		return {
			title: detail.album.name,
			creator: compact.artist,
			tracks: illusi_library_tracks(detail.tracks),
			artwork_url: IllusiViews.best_thumbnail_url(detail.album.thumbnails) || undefined,
			...(compact.date ? { date: compact.date } : {}),
			continuation: null
		};
	}
	const [playlist, page] = await Promise.all([Illusi.Playlists.get(id), Illusi.Playlists.tracks(id, { limit: ILLUSI_PAGE_LIMIT })]);
	if (Illusi.is_error(playlist)) return default_playlist(playlist);
	if (Illusi.is_error(page)) return default_playlist(page);
	return {
		title: playlist.title,
		creator: [{ name: playlist.owner.username, uri: null }],
		tracks: illusi_library_tracks(page.items),
		...(playlist.description ? { description: playlist.description } : {}),
		artwork_url: IllusiViews.best_thumbnail_url(playlist.thumbnails) || undefined,
		date: playlist.created_at as ISOString,
		continuation: page.next_cursor === null ? null : { uuid: id, cursor: page.next_cursor } as IllusiPlaylistContinuation
	};
}
export async function illusi_get_playlist_continuation(opts: IllusiPlaylistContinuation): Promise<MusicServicePlaylistContinuation> {
	if (!IllusiAccount.is_logged_in()) return default_playlist(generror('User not authenticated', 'LOW', { opts }));
	const page = await Illusi.Playlists.tracks(opts.uuid, { cursor: opts.cursor, limit: ILLUSI_PAGE_LIMIT });
	if (Illusi.is_error(page)) return default_playlist(page);
	return {
		tracks: illusi_library_tracks(page.items),
		continuation: page.next_cursor === null ? null : { uuid: opts.uuid, cursor: page.next_cursor } as IllusiPlaylistContinuation
	};
}

export async function api_get_playlist(url: string): Promise<MusicServicePlaylist> {
	const playlist_response = await rozfetch<MusicServicePlaylist>(url);
	if ('error' in playlist_response) return default_playlist(playlist_response);
	const playlist = await playlist_response.json();
	if ('error' in playlist && playlist.error !== undefined) return default_playlist(playlist as ResponseError);
	return playlist as MusicServicePlaylist;
}

interface BandlabPlaylistContinuation { url: string; after: string }
const BANDLAB_TRACK_LIMIT = 50;
export async function bandlab_get_playlist(url: string): Promise<MusicServicePlaylist> {
	const cookie_jar = Prefs.get_pref('bandlab_cookie_jar');
	const playlist_response = await Origin.BandLab.projects_list(url, { cookie_jar, limit: BANDLAB_TRACK_LIMIT });
	if ('error' in playlist_response) return default_playlist(playlist_response);
	return {
		title: 'Projects List',
		tracks: playlist_response.data.map(bandlab_parse_track),
		continuation: playlist_response.data.length < BANDLAB_TRACK_LIMIT || typeof playlist_response.paging.cursors.after !== 'string' ? null : { url, after: playlist_response.paging.cursors.after } as BandlabPlaylistContinuation
	};
}
export async function bandlab_get_playlist_continuation(opts: BandlabPlaylistContinuation): Promise<MusicServicePlaylistContinuation> {
	const cookie_jar = Prefs.get_pref('bandlab_cookie_jar');
	const playlist_response = await Origin.BandLab.projects_list(opts.url, { cookie_jar, after: opts.after, limit: BANDLAB_TRACK_LIMIT });
	if ('error' in playlist_response) return default_playlist(playlist_response);
	return {
		tracks: playlist_response.data.map(bandlab_parse_track),
		continuation: playlist_response.data.length < BANDLAB_TRACK_LIMIT || typeof playlist_response.paging.cursors.after !== 'string' ? null : { url: opts.url, after: playlist_response.paging.cursors.after } as BandlabPlaylistContinuation
	};
}

export async function audiomack_get_playlist(url: string): Promise<MusicServicePlaylist> {
	const slug = Origin.Audiomack.url_to_slug(url);
	const parts = slug.split('/');
	if (parts.length >= 3 && parts[1] === 'album') {
		const result = await Origin.Audiomack.get_album({ artist_slug: parts[0], album_slug: parts[2] });
		if ('error' in result) return default_playlist(result);
		return {
			title: result.title,
			creator: [{ name: result.artist, uri: create_uri('audiomack', result.artist_slug) }],
			artwork_url: result.image_large || result.image,
			tracks: (result.tracks ?? []).map(audiomack_parse_track),
			continuation: null
		};
	}
	if (parts.length >= 2) {
		const result = await Origin.Audiomack.get_playlist({ playlist_slug: slug });
		if ('error' in result) return default_playlist(result);
		return {
			title: result.title,
			creator: [{ name: result.artist, uri: create_uri('audiomack', result.artist_slug) }],
			artwork_url: result.image,
			tracks: (result.tracks ?? []).map(audiomack_parse_track),
			continuation: null
		};
	}
	return default_playlist(generror('Invalid Audiomack playlist URL', 'LOW', { url }));
}

const DEEZER_TRACK_LIMIT = 100;
export async function deezer_get_playlist(url: string): Promise<MusicServicePlaylist> {
	const cookie_jar = Prefs.get_pref('deezer_cookie_jar');
	const id = Origin.Deezer.url_to_id(url);
	if (url.includes('/album/')) {
		const album = await Origin.Deezer.get_album({ album_id: id, cookie_jar });
		if ('error' in album) return default_playlist(album);
		const tracks_response = await Origin.Deezer.get_album_tracks({ album_id: id, cookie_jar, limit: DEEZER_TRACK_LIMIT });
		if ('error' in tracks_response) return default_playlist(tracks_response);
		return {
			title: album.title,
			creator: [{ name: album.artist.name, uri: create_uri('deezer', String(album.artist.id)) }],
			artwork_url: album.cover_xl || album.cover_big,
			date: album.release_date as ISOString,
			tracks: (tracks_response.data).map(deezer_parse_track),
			continuation: null
		};
	}
	const playlist = await Origin.Deezer.get_playlist({ playlist_id: id, cookie_jar });
	if ('error' in playlist) return default_playlist(playlist);
	const tracks_response = await Origin.Deezer.get_playlist_tracks({ playlist_id: id, cookie_jar, limit: DEEZER_TRACK_LIMIT });
	if ('error' in tracks_response) return default_playlist(tracks_response);
	return {
		title: playlist.title,
		creator: [{ name: playlist.creator.name, uri: null }],
		artwork_url: playlist.picture_xl || playlist.picture_big,
		description: playlist.description,
		tracks: (tracks_response.data).map(deezer_parse_track),
		continuation: null
	};
}

export async function pandora_get_playlist(url: string): Promise<MusicServicePlaylist> {
	const cookie_jar = Prefs.get_pref('pandora_cookie_jar');
	const pandora_id_match = /\b((?:PL|SF):[A-Za-z0-9:]+)/.exec(url);
	if (!pandora_id_match) return default_playlist(generror('Could not extract Pandora ID from URL', 'LOW', { url }));
	const pandora_id = pandora_id_match[1];
	if (pandora_id.startsWith('SF:')) {
		const result = await Origin.Pandora.get_station_playlist({ station_id: pandora_id, cookie_jar });
		if ('error' in result) return default_playlist(result);
		return {
			title: pandora_id,
			tracks: result.tracks.map(pandora_parse_track),
			continuation: null
		};
	}
	const result = await Origin.Pandora.get_playlist({ pandora_id, cookie_jar });
	if ('error' in result) return default_playlist(result);
	return {
		title: '',
		tracks: result.tracks.map(pandora_parse_track),
		continuation: null
	};
}

const TIDAL_TRACK_LIMIT = 100;
export async function tidal_get_playlist(url: string): Promise<MusicServicePlaylist> {
	const cookie_jar = Prefs.get_pref('tidal_cookie_jar');
	const id = Origin.Tidal.url_to_id(url);
	if (url.includes('/album/')) {
		const album = await Origin.Tidal.get_album({ album_id: id, cookie_jar });
		if ('error' in album) return default_playlist(album);
		const tracks_response = await Origin.Tidal.get_album_tracks({ album_id: id, cookie_jar, limit: TIDAL_TRACK_LIMIT });
		if ('error' in tracks_response) return default_playlist(tracks_response);
		return {
			title: album.title,
			creator: album.artists.map(a => ({ name: a.name, uri: create_uri('tidal', String(a.id)) })),
			artwork_url: tidal_cover_url(album.cover),
			date: album.releaseDate as ISOString,
			tracks: tracks_response.items.map(tidal_parse_track),
			continuation: null
		};
	}
	const playlist = await Origin.Tidal.get_playlist({ playlist_uuid: id, cookie_jar });
	if ('error' in playlist) return default_playlist(playlist);
	const tracks_response = await Origin.Tidal.get_playlist_tracks({ playlist_uuid: id, cookie_jar, limit: TIDAL_TRACK_LIMIT });
	if ('error' in tracks_response) return default_playlist(tracks_response);
	return {
		title: playlist.title,
		creator: [{ name: playlist.creator.name ?? String(playlist.creator.id), uri: null }],
		artwork_url: tidal_cover_url(playlist.squareImage),
		description: playlist.description,
		tracks: tracks_response.items.map(tidal_parse_track),
		continuation: null
	};
}
