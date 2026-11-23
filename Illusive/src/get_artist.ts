import { AppleMusic, SoundCloud, Spotify, YouTube, YouTubeMusic } from '@origin/index';
import { CookieJar } from '@common/utils/cookie_util';
import type { PromiseResult, ResponseError } from '@common/types';
import { urlid } from '@common/utils/util';
import { parse_apple_music_artist_album, parse_apple_music_artist_latest_album, parse_apple_music_artist_similar_artist, parse_apple_music_artist_track, parse_apple_music_artwork } from '@illusive/parsers/apple_music_parser';
import { soundcloud_parse_playlist, soundcloud_parse_track, soundcloud_parse_track_to_song } from '@illusive/parsers/soundcloud_parser';
import { ytm_album, ytm_artist, ytm_track } from '@illusive/parsers/youtube_music_parser';
import { youtube_parse_channels, youtube_parse_playlists, youtube_parse_videos } from '@illusive/parsers/youtube_parser';
import { best_thumbnail, create_uri } from '@illusive/illusive_utils';
import { Prefs } from '@illusive/prefs';
import type { ArtistOpts, CompactArtist, CompactPlaylist, Continuation, ContinuationPage, MusicServiceArtist, NamedUUID, Track } from '@illusive/types';
import type { Cursor, Page, PageQuery, PlaylistView, TrackView } from '@origin/illusi/types';
import type { YTChannelResult, YTCompactPlaylist, YTMAlbum, YTMArtist, YTMTrack, YTTrack } from '@origin/youtube/parser';
import type * as SCSearch from '@origin/soundcloud/types/Search';
import { Constants } from './constants';
import { GLOBALS } from './globals';
import { is_empty } from '@common/utils/util';
import { SQLArtists } from './sql/sql_artists';
import { reinterpret_cast } from '@common/cast';
import { parse_spotify_artist_album, parse_spotify_artist_appears_on, parse_spotify_artist_track, parse_spotify_similar_artist } from './parsers/spotify_parser';
import { catch_log } from '@common/utils/error_util';
import { Illusi } from '@origin/illusi/illusi';
import { IllusiAccount } from './db/sync/illusi_account';
import { IllusiViews } from './illusi_views';
import { compact_artist_key, compact_playlist_key, continue_once, track_key } from './continuation';

function get_cookie_jar(pref_opt: Prefs.PrefOptions) {
	return Prefs.get_pref('use_cookies_on_artist') ? Prefs.get_pref(pref_opt) as CookieJar : new CookieJar([]);
}

async function empty_async_call() {
	return undefined;
}

function default_artist(error?: ResponseError): MusicServiceArtist {
	return {
		...(error !== undefined ? { error: error } : {}),
		name: '',
		albums: [],
		singles_eps: [],
		playlists: [],
		latest_release: undefined,
		similar_artists: [],
		tracks: [],
		background_artwork_url: undefined,
		profile_artwork_url: undefined,
		is_following: undefined,
		follow: empty_async_call,
		unfollow: empty_async_call
	};
}

type ContinuationFetch = (token: string) => PromiseResult<{ data: unknown; continuation: string | null }>;

function artist_continuation<O, R>(token: string | null, fetch: ContinuationFetch, map: (items: O[]) => R[]): Continuation<R> | undefined {
	if (token === null) return undefined;
	let pending: Promise<ContinuationPage<R>> | undefined;
	return () => pending ??= fetch(token).then((page) => {
		if ('error' in page) throw page.error;
		return { items: map(page.data as O[]), next: artist_continuation(page.continuation, fetch, map) };
	});
}

export async function load_artist_first_pages(artist: MusicServiceArtist): Promise<MusicServiceArtist> {
	const [tracks, albums, singles_eps, playlists, similar_artists] = await Promise.all([
		continue_once(artist.tracks, artist.tracks_continuation, track_key),
		continue_once(artist.albums, artist.albums_continuation, compact_playlist_key),
		continue_once(artist.singles_eps, artist.singles_eps_continuation, compact_playlist_key),
		continue_once(artist.playlists, artist.playlists_continuation, compact_playlist_key),
		continue_once(artist.similar_artists, artist.similar_artists_continuation, compact_artist_key)
	]);
	return {
		...artist,
		tracks: tracks.items,
		tracks_continuation: tracks.continuation,
		albums: albums.items,
		albums_continuation: albums.continuation,
		singles_eps: singles_eps.items,
		singles_eps_continuation: singles_eps.continuation,
		playlists: playlists.items,
		playlists_continuation: playlists.continuation,
		similar_artists: similar_artists.items,
		similar_artists_continuation: similar_artists.continuation
	};
}

function remember_artist_artwork(artists: CompactArtist[]): CompactArtist[] {
	artists.filter(artist => artist.profile_artwork_url && artist.name.uri).forEach((artist) => {
		SQLArtists.insert_sql_artists({
			artwork_url: reinterpret_cast<string>(artist.profile_artwork_url),
			name: artist.name.name,
			uri: artist.name.uri!
		}).catch(catch_log);
	});
	return artists;
}

export async function youtube_music_get_artist(id: string, _opts?: ArtistOpts): Promise<MusicServiceArtist> {
	const artist_response = await YouTubeMusic.get_artist({ cookie_jar: get_cookie_jar('youtube_music_cookie_jar') }, id);
	if ('error' in artist_response) return default_artist(artist_response);

	const name = artist_response.artist.name;
	const background_thumbnail = best_thumbnail(artist_response.artist.thumbnails)?.url;
	const albums = artist_response.albums.map(album => ytm_album(album, 'ALBUM'));
	const singles_eps = artist_response.singles.map(single => ytm_album(single, 'ALBUM'));
	const similar_artists = remember_artist_artwork(artist_response.similar_artists.map(ytm_artist));
	const ytm_continuation: ContinuationFetch = token => YouTubeMusic.get_continuation({ cookie_jar: get_cookie_jar('youtube_music_cookie_jar') }, token);

	if (background_thumbnail) {
		SQLArtists.insert_sql_artists({
			artwork_url: background_thumbnail,
			name: name,
			uri: create_uri('youtubemusic', id)
		}).catch(catch_log);
	}

	return {
		name: name,
		albums: albums,
		singles_eps: singles_eps,
		playlists: artist_response.playlists.map(playlist => ytm_album(playlist, 'PLAYLIST')),
		appears_on: artist_response.appears_on.map(album => ytm_album(album, 'ALBUM')),
		latest_release: albums[0] ?? singles_eps[0],
		similar_artists: similar_artists,
		tracks: artist_response.top_tracks.map(ytm_track),
		albums_continuation: artist_continuation<YTMAlbum, CompactPlaylist>(artist_response.albums_continuation, ytm_continuation, albums => albums.map(album => ytm_album(album, 'ALBUM'))),
		singles_eps_continuation: artist_continuation<YTMAlbum, CompactPlaylist>(artist_response.singles_continuation, ytm_continuation, singles => singles.map(single => ytm_album(single, 'ALBUM'))),
		playlists_continuation: artist_continuation<YTMAlbum, CompactPlaylist>(artist_response.playlists_continuation, ytm_continuation, playlists => playlists.map(playlist => ytm_album(playlist, 'PLAYLIST'))),
		tracks_continuation: artist_continuation<YTMTrack, Track>(artist_response.tracks_continuation, ytm_continuation, tracks => tracks.map(ytm_track)),
		similar_artists_continuation: artist_continuation<YTMArtist, CompactArtist>(artist_response.similar_artists_continuation, ytm_continuation, artists => remember_artist_artwork(artists.map(ytm_artist))),
		background_artwork_url: background_thumbnail,
		profile_artwork_url: undefined,
		is_following: undefined,
		follow: empty_async_call,
		unfollow: empty_async_call
	};
}

export async function youtube_get_artist(id: string, _opts?: ArtistOpts): Promise<MusicServiceArtist> {
	const artist_response = await YouTube.get_artist({ cookie_jar: get_cookie_jar('youtube_cookie_jar') }, id);
	if ('error' in artist_response) return default_artist(artist_response);

	const name = artist_response.artist.name;
	const background_thumbnail = best_thumbnail(artist_response.artist.thumbnails)?.url;
	const albums = youtube_parse_playlists(artist_response.albums);
	const tracks = youtube_parse_videos(artist_response.tracks);
	const similar_artists = youtube_parse_channels(artist_response.similar_artists);
	const youtube_continuation: ContinuationFetch = token => YouTube.get_continuation({ cookie_jar: get_cookie_jar('youtube_cookie_jar') }, token);

	if (background_thumbnail) {
		SQLArtists.insert_sql_artists({
			artwork_url: background_thumbnail,
			name: name,
			uri: create_uri('youtube', artist_response.artist.channel_id)
		}).catch(catch_log);
	}

	return {
		name: name,
		albums: albums,
		singles_eps: [],
		playlists: youtube_parse_playlists(artist_response.playlists),
		latest_release: albums[0],
		similar_artists: similar_artists,
		tracks: tracks,
		albums_continuation: artist_continuation<YTCompactPlaylist, CompactPlaylist>(artist_response.albums_continuation, youtube_continuation, youtube_parse_playlists),
		tracks_continuation: artist_continuation<YTTrack, Track>(artist_response.tracks_continuation, youtube_continuation, youtube_parse_videos),
		similar_artists_continuation: artist_continuation<YTChannelResult, CompactArtist>(artist_response.similar_artists_continuation, youtube_continuation, youtube_parse_channels),
		background_artwork_url: background_thumbnail,
		profile_artwork_url: undefined,
		is_following: undefined,
		follow: empty_async_call,
		unfollow: empty_async_call
	};
}

export async function apple_music_get_artist(id: string, opts?: ArtistOpts): Promise<MusicServiceArtist> {
	const artist_response = await AppleMusic.get_artist(id, { cookie_jar: get_cookie_jar('apple_music_cookie_jar'), fetch_opts: { proxy: opts?.proxy } });
	if ('error' in artist_response) return default_artist(artist_response);

	const artist_info: NamedUUID = { name: artist_response.data.pageMetrics.pageFields.pageDetails.content, uri: create_uri('applemusic', urlid(artist_response.data.canonicalURL)) };
	const latest_release_and_top_songs = artist_response.data.sections.find(section => section.id.includes('latest-release-and-top-songs'));
	const full_albums = artist_response.data.sections.find(section => section.id.includes('full-albums'));
	const singles = artist_response.data.sections.find(section => section.id.includes('singles'));
	const appears_on = artist_response.data.sections.find(section => section.id.includes('appears-on-albums'));
	const similar_artists = artist_response.data.sections.find(section => section.id.includes('similar-artists'));

	const artwork = parse_apple_music_artwork(artist_response.data.sections[0].items[0].artwork?.dictionary.url, artist_response.data.sections[0].items[0].artwork?.dictionary.width);

	if (artwork) {
		SQLArtists.insert_sql_artists({
			artwork_url: artwork,
			name: artist_info.name,
			uri: create_uri('applemusic', id)
		}).catch(catch_log);
	}

	const parsed_similar_artists = similar_artists?.items.map(parse_apple_music_artist_similar_artist) ?? [];

	parsed_similar_artists.filter(artist => artist.profile_artwork_url && artist.name.uri).forEach((artist) => {
		SQLArtists.insert_sql_artists({
			artwork_url: reinterpret_cast<string>(artist.profile_artwork_url),
			name: artist.name.name,
			uri: artist.name.uri!
		}).catch(catch_log);
	});

	return {
		name: artist_info.name,
		albums: full_albums?.items.map(item => parse_apple_music_artist_album(item, artist_info, 'ALBUM')) ?? [],
		singles_eps: singles?.items.map(item => parse_apple_music_artist_album(item, artist_info)) ?? [],
		appears_on: appears_on?.items.map(item => parse_apple_music_artist_album(item, artist_info)) ?? [],
		playlists: [],
		latest_release: parse_apple_music_artist_latest_album(latest_release_and_top_songs?.pinnedLeadingItem?.item, artist_info),
		similar_artists: parsed_similar_artists,
		tracks: latest_release_and_top_songs?.items.map(item => parse_apple_music_artist_track(item, artist_info)) ?? [],
		background_artwork_url: undefined,
		profile_artwork_url: artwork,
		is_following: undefined,
		follow: empty_async_call,
		unfollow: empty_async_call
	};
}

export async function soundcloud_get_artist(id: string, opts?: ArtistOpts): Promise<MusicServiceArtist> {
	const artist_id = await SoundCloud.permalink_to_artist_id({ artist_permalink: id, cookie_jar: get_cookie_jar('soundcloud_cookie_jar'), fetch_opts: { proxy: opts?.proxy } });
	if ('error' in artist_id) return default_artist(artist_id);

	const soundcloud_opts = { cookie_jar: get_cookie_jar('soundcloud_cookie_jar'), fetch_opts: { proxy: opts?.proxy }, client_id: artist_id.client_id };
	const [artist_tracks_response, artist_albums_response, artist_playlists_response] = await Promise.all([
		SoundCloud.get_artist('TRACKS', { ...soundcloud_opts, artist_id: artist_id.id, user_hyrdration: artist_id.hydration, limit: 40 }),
		SoundCloud.get_artist('ALBUMS', { ...soundcloud_opts, artist_id: artist_id.id, user_hyrdration: artist_id.hydration, limit: 8 }),
		SoundCloud.get_artist('PLAYLISTS', { ...soundcloud_opts, artist_id: artist_id.id, user_hyrdration: artist_id.hydration, limit: 8 })
	]);

	if ('error' in artist_tracks_response) return default_artist(artist_tracks_response);
	if ('error' in artist_albums_response) return default_artist(artist_albums_response);
	if ('error' in artist_playlists_response) return default_artist(artist_playlists_response);

	const tracks = artist_tracks_response.artist_data.collection.map(item => soundcloud_parse_track(item));
	const soundcloud_next = (next_href: string | null) => is_empty(next_href) ? null : next_href;
	const soundcloud_continuation: ContinuationFetch = async (token) => {
		const page = await SoundCloud.continuation(token, soundcloud_opts, 1);
		if ('error' in page) return page;
		return { data: page.collection, continuation: soundcloud_next(page.next_href) };
	};

	if (artist_id.hydration.data.avatar_url) {
		SQLArtists.insert_sql_artists({
			artwork_url: artist_id.hydration.data.avatar_url,
			name: artist_id.hydration.data.username,
			uri: create_uri('soundcloud', id)
		}).catch(catch_log);
	}

	const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
	const is_following = await SoundCloud.is_following({ cookie_jar, artist_id: id });

	return {
		name: artist_id.hydration.data.username,
		albums: artist_albums_response?.artist_data?.collection?.map(soundcloud_parse_playlist) ?? [],
		playlists: artist_playlists_response?.artist_data?.collection?.map(soundcloud_parse_playlist) ?? [],
		latest_release: tracks.length <= 0 ? undefined : soundcloud_parse_track_to_song(tracks[0], artist_tracks_response.artist_data.collection[0]),
		tracks: tracks ?? [],
		tracks_continuation: artist_continuation<SCSearch.Track, Track>(soundcloud_next(artist_tracks_response.artist_data.next_href), soundcloud_continuation, items => items.map(soundcloud_parse_track)),
		albums_continuation: artist_continuation<SCSearch.Playlist, CompactPlaylist>(soundcloud_next(artist_albums_response.artist_data.next_href), soundcloud_continuation, items => items.map(soundcloud_parse_playlist)),
		playlists_continuation: artist_continuation<SCSearch.Playlist, CompactPlaylist>(soundcloud_next(artist_playlists_response.artist_data.next_href), soundcloud_continuation, items => items.map(soundcloud_parse_playlist)),
		singles_eps: [],
		similar_artists: [],
		background_artwork_url: undefined,
		profile_artwork_url: artist_id.hydration.data.avatar_url,
		is_following: 'error' in is_following ? undefined : is_following.following,
		follow: 'error' in is_following ? empty_async_call : async () => SoundCloud.follow_artist({ cookie_jar, artist_id: id }),
		unfollow: 'error' in is_following ? empty_async_call : async () => SoundCloud.unfollow_artist({ cookie_jar, artist_id: id })
	};
}

export async function spotify_get_artist(id: string, opts?: ArtistOpts): Promise<MusicServiceArtist> {
	const artist = await Spotify.get_artist({ cookie_jar: get_cookie_jar('soundcloud_cookie_jar'), var: { uri: id, includePrerelease: false }, fetch_opts: { proxy: opts?.proxy } });
	if ('error' in artist) return default_artist(artist);
	const union_artist = artist.data.artistUnion;
	const artist_uri: NamedUUID = { name: union_artist.profile.name, uri: create_uri('spotify', id) };
	const popular_release_albums = union_artist?.discography?.popularReleasesAlbums?.items?.map(item => parse_spotify_artist_album(item, artist_uri)) ?? [];

	const background_artwork_url = best_thumbnail(union_artist.visuals?.avatarImage?.sources)?.url;
	const profile_artwork_url = best_thumbnail(union_artist.visuals?.headerImage?.sources)?.url;
	const similar_artists = union_artist.relatedContent.relatedArtists.items.map(parse_spotify_similar_artist);

	if (profile_artwork_url) {
		SQLArtists.insert_sql_artists({
			artwork_url: profile_artwork_url,
			name: union_artist.profile.name,
			uri: create_uri('spotify', id)
		}).catch(catch_log);
	}
	similar_artists.filter(artist => artist.profile_artwork_url && artist.name.uri).forEach((artist) => {
		SQLArtists.insert_sql_artists({
			artwork_url: reinterpret_cast<string>(artist.profile_artwork_url),
			name: artist.name.name,
			uri: artist.name.uri!
		}).catch(catch_log);
	});

	return {
		name: union_artist.profile.name,
		albums: popular_release_albums.concat(union_artist.discography.albums.items?.[0]?.releases?.items?.map(item => parse_spotify_artist_album(item, artist_uri)) ?? []),
		playlists: [],
		latest_release: union_artist?.discography?.latest ? parse_spotify_artist_album(union_artist.discography.latest, artist_uri) : undefined,
		tracks: union_artist.discography?.topTracks?.items.map(parse_spotify_artist_track) ?? [],
		singles_eps: union_artist.discography.singles.items?.map(item => item.releases.items)?.flat()?.map(item => parse_spotify_artist_album(item, artist_uri)) ?? [],
		appears_on: union_artist.relatedContent.appearsOn.items?.map(item => item.releases.items)?.flat()?.map(parse_spotify_artist_appears_on),
		similar_artists: similar_artists,
		background_artwork_url: background_artwork_url,
		profile_artwork_url: profile_artwork_url,
		is_following: undefined,
		follow: empty_async_call,
		unfollow: empty_async_call
	};
}

export async function illusi_get_artist(id: string): Promise<MusicServiceArtist> {
	if (id === Constants.import_uri_id) {
		return {
			name: Constants.import_uri_id,
			tracks: GLOBALS.global_var.sql_tracks.filter(track => !is_empty(track.imported_id)).slice().reverse(),
			albums: [],
			singles_eps: [],
			playlists: [],
			similar_artists: [],
			profile_artwork_url: Constants.sudo_profile_picture_index,
			is_following: false,
			follow: empty_async_call,
			unfollow: empty_async_call
		};
	}
	if (id === Constants.local_illusi_uri_id) {
		return {
			name: Constants.local_illusi_uri_id,
			tracks: [],
			albums: [],
			singles_eps: [],
			playlists: [],
			similar_artists: [],
			profile_artwork_url: Constants.sumi_profile_picture_index,
			is_following: undefined,
			follow: empty_async_call,
			unfollow: empty_async_call
		};
	}
	const user_id = IllusiViews.user_id_of(id);
	if (user_id !== null) return illusi_get_user_artist(user_id);
	return illusi_get_server_artist(id);
}

const ILLUSI_USER_PAGE_LIMIT = 50;

function illusi_continuation<V, T>(load: (query: PageQuery) => PromiseResult<Page<V>>, map: (items: V[]) => T[], cursor: Cursor | null): Continuation<T> | undefined {
	if (cursor === null) return undefined;
	return async () => {
		const page = await load({ cursor, limit: ILLUSI_USER_PAGE_LIMIT });
		if (Illusi.is_error(page)) return { items: [] };
		const next = illusi_continuation(load, map, page.next_cursor);
		return { items: map(page.items), ...(next === undefined ? {} : { next }) };
	};
}

/** A user as an artist: the tracks they imported, when they're public or the caller's, and their public playlists */
async function illusi_get_user_artist(user_id: string): Promise<MusicServiceArtist> {
	if (!IllusiAccount.is_logged_in()) return default_artist();
	const profile = await Illusi.Users.get(user_id);
	if (Illusi.is_error(profile)) return default_artist(profile);
	const load_imports = async (query: PageQuery) => Illusi.Users.imports(user_id, query);
	const load_playlists = async (query: PageQuery) => Illusi.Playlists.of_user(user_id, query);
	const map_tracks = (items: TrackView[]) => IllusiViews.prefer_local(items.map(IllusiViews.track), GLOBALS.global_var.sql_tracks);
	const map_playlists = (items: PlaylistView[]) => items.map(IllusiViews.playlist);
	const [imports, playlists] = await Promise.all([
		profile.import_count === null ? null : load_imports({ limit: ILLUSI_USER_PAGE_LIMIT }),
		load_playlists({ limit: ILLUSI_USER_PAGE_LIMIT })
	]);
	const import_page = imports === null || Illusi.is_error(imports) ? null : imports;
	const playlist_page = Illusi.is_error(playlists) ? null : playlists;
	const tracks_continuation = illusi_continuation(load_imports, map_tracks, import_page?.next_cursor ?? null);
	const playlists_continuation = illusi_continuation(load_playlists, map_playlists, playlist_page?.next_cursor ?? null);
	return {
		name: profile.username,
		tracks: import_page === null ? [] : map_tracks(import_page.items),
		...(tracks_continuation === undefined ? {} : { tracks_continuation }),
		albums: [],
		singles_eps: [],
		playlists: playlist_page === null ? [] : map_playlists(playlist_page.items),
		...(playlists_continuation === undefined ? {} : { playlists_continuation }),
		similar_artists: [],
		...(profile.avatar_id === null ? {} : { profile_artwork_url: Illusi.Account.avatar_url(profile.avatar_id) }),
		is_following: undefined,
		follow: empty_async_call,
		unfollow: empty_async_call
	};
}

async function illusi_get_server_artist(id: string): Promise<MusicServiceArtist> {
	if (!IllusiAccount.is_logged_in()) return default_artist();
	const [artist, tracks, albums, singles_eps, similar] = await Promise.all([
		Illusi.Artists.get(id),
		Illusi.Artists.tracks(id, { sort: 'popular', limit: 50 }),
		Illusi.Artists.albums(id, { album_type: 'ALBUM', limit: 50 }),
		Illusi.Artists.albums(id, { limit: 100 }),
		Illusi.Artists.similar(id, 20)
	]);
	if (Illusi.is_error(artist)) return default_artist(artist);
	const album_items = Illusi.is_error(albums) ? [] : albums.items;
	const other_items = Illusi.is_error(singles_eps) ? [] : singles_eps.items.filter(album => album.album_type !== 'ALBUM');
	const newest = [...album_items, ...other_items].sort((a, b) => new Date(b.release_date ?? 0).getTime() - new Date(a.release_date ?? 0).getTime())[0];
	const compact = IllusiViews.artist(artist);
	return {
		name: artist.name,
		tracks: Illusi.is_error(tracks) ? [] : IllusiViews.prefer_local(tracks.items.map(IllusiViews.track), GLOBALS.global_var.sql_tracks),
		albums: album_items.map(IllusiViews.album),
		singles_eps: other_items.map(IllusiViews.album),
		playlists: [],
		...(newest === undefined ? {} : { latest_release: IllusiViews.album(newest) }),
		similar_artists: Illusi.is_error(similar) ? [] : similar.items.map(IllusiViews.artist),
		...(compact.profile_artwork_url === undefined ? {} : { profile_artwork_url: compact.profile_artwork_url }),
		is_following: undefined,
		follow: empty_async_call,
		unfollow: empty_async_call
	};
}
