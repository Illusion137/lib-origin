import { AppleMusic, SoundCloud, Spotify, YouTube, YouTubeMusic } from '@origin/index';
import { CookieJar } from '@common/utils/cookie_util';
import type { PromiseResult, ResponseError } from '@common/types';
import { urlid } from '@common/utils/util';
import { parse_apple_music_artist_album, parse_apple_music_artist_latest_album, parse_apple_music_artist_similar_artist, parse_apple_music_artist_track, parse_apple_music_artwork } from '@illusive/parsers/apple_music_parser';
import { soundcloud_parse_playlist, soundcloud_parse_track, soundcloud_parse_track_to_song } from '@illusive/parsers/soundcloud_parser';
import { ytm_album, ytm_artist, ytm_track } from '@illusive/parsers/youtube_music_parser';
import { youtube_parse_channels, youtube_parse_playlists, youtube_parse_videos } from '@illusive/parsers/youtube_parser';
import { best_thumbnail, create_uri, split_uri } from '@illusive/illusive_utils';
import { IllusiIngest } from './db/sync/illusi_ingest';
import { Prefs } from '@illusive/prefs';
import type { ArtistOpts, CompactArtist, CompactPlaylist, Continuation, ContinuationPage, IllusiveURI, MusicSearchResponse, MusicServiceArtist, MusicServiceURI, NamedUUID, Track } from '@illusive/types';
import type { Cursor, Page, PageQuery, PlaylistView, ServiceIds, TrackView } from '@origin/illusi/types';
import type { YTChannelResult, YTCompactPlaylist, YTMAlbum, YTMArtist, YTMTrack, YTTrack } from '@origin/youtube/parser';
import type * as SCSearch from '@origin/soundcloud/types/Search';
import { Constants } from './constants';
import { GLOBALS } from './globals';
import { is_empty } from '@common/utils/util';
import { SQLArtists } from './sql/sql_artists';
import type { SQLArtistInsert } from './legacy/1810/schema';
import { reinterpret_cast } from '@common/cast';
import { parse_spotify_artist_album, parse_spotify_artist_appears_on, parse_spotify_artist_track, parse_spotify_similar_artist } from './parsers/spotify_parser';
import { catch_log } from '@common/utils/error_util';
import { breadcrumb } from '@common/sentry_error_handler';
import { remove_topic } from '@common/utils/clean_util';
import { youtube_music_search } from './search';
import { artist_service_ids } from './db/sync/illusi_entities';
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
	IllusiIngest.similar_artists('youtubemusic', { name, uri: create_uri('youtubemusic', id) }, similar_artists);
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

	const sections = artist_response.data.sections;
	const section = (...markers: string[]) => sections.find(candidate => markers.some(marker => candidate.id.toLowerCase().includes(marker)));
	const header = section('artistdetailheader')?.items[0] ?? sections[0]?.items[0];
	const artist_info: NamedUUID = { name: header?.title ?? artist_response.data.pageMetrics?.pageFields?.pageDetails.content ?? '', uri: create_uri('applemusic', urlid(artist_response.data.canonicalURL)) };
	const latest_release_and_top_songs = section('latest-release-and-top-songs');
	const featured = section('topsongs')?.items[0];
	const full_albums = section('full-albums', '.albums-');
	const singles = section('singles');
	const appears_on = section('appears-on-albums', 'appearson');
	const similar_artists = section('similar-artists', 'similarartists');

	const header_artwork = header?.artwork ?? header?.circleArtwork ?? header?.fallbackArtwork ?? undefined;
	const artwork = parse_apple_music_artwork(header_artwork?.dictionary.url, header_artwork?.dictionary.width);
	const featured_release = featured?.featuredContent;
	const latest_release = latest_release_and_top_songs?.pinnedLeadingItem?.item ?? (featured_release === undefined
		? undefined
		: { ...featured_release, title: featured_release.detailText?.title, headline: featured_release.detailText?.headline, showExplicitBadge: featured_release.detailText?.showExplicitBadge });

	if (artwork) {
		SQLArtists.insert_sql_artists({
			artwork_url: artwork,
			name: artist_info.name,
			uri: create_uri('applemusic', id)
		}).catch(catch_log);
	}

	const parsed_similar_artists = similar_artists?.items.map(parse_apple_music_artist_similar_artist) ?? [];
	IllusiIngest.similar_artists('applemusic', artist_info, parsed_similar_artists);

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
		latest_release: parse_apple_music_artist_latest_album(latest_release, artist_info),
		similar_artists: parsed_similar_artists,
		tracks: (latest_release_and_top_songs?.items ?? featured?.tracks ?? []).map(item => parse_apple_music_artist_track(item, artist_info)),
		background_artwork_url: undefined,
		profile_artwork_url: artwork,
		is_following: undefined,
		follow: empty_async_call,
		unfollow: empty_async_call
	};
}

export async function soundcloud_get_artist(id: string, opts?: ArtistOpts): Promise<MusicServiceArtist> {
	return soundcloud_artist(await SoundCloud.permalink_to_artist_id({ artist_permalink: id, cookie_jar: get_cookie_jar('soundcloud_cookie_jar'), fetch_opts: { proxy: opts?.proxy } }), opts);
}
async function soundcloud_get_artist_by_user_id(user_id: string): Promise<MusicServiceArtist> {
	return soundcloud_artist(await SoundCloud.user_id_to_artist_id({ user_id, cookie_jar: get_cookie_jar('soundcloud_cookie_jar') }));
}
async function soundcloud_artist(artist_id: Awaited<ReturnType<typeof SoundCloud.permalink_to_artist_id>>, opts?: ArtistOpts): Promise<MusicServiceArtist> {
	if ('error' in artist_id) return default_artist(artist_id);
	const id = artist_id.hydration.data.permalink;

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
	IllusiIngest.similar_artists('spotify', artist_uri, similar_artists);

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
	SQLArtists.remember_illusi_user_avatar(user_id, profile.avatar_id);
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
	if (typeof compact.profile_artwork_url === 'string') {
		SQLArtists.insert_sql_artists({ uri: create_uri('illusi', artist.id), name: artist.name, artwork_url: compact.profile_artwork_url }).catch(catch_log);
	}
	return {
		name: artist.name,
		tracks: Illusi.is_error(tracks) ? [] : IllusiViews.prefer_local(tracks.items.map(IllusiViews.track), GLOBALS.global_var.sql_tracks),
		albums: album_items.map(IllusiViews.album),
		singles_eps: other_items.map(IllusiViews.album),
		playlists: [],
		...(newest === undefined ? {} : { latest_release: IllusiViews.album(newest) }),
		similar_artists: Illusi.is_error(similar) ? [] : similar.items.map(IllusiViews.artist),
		service_uris: artist_service_uris(artist.service_ids),
		...(compact.profile_artwork_url === undefined ? {} : { profile_artwork_url: compact.profile_artwork_url }),
		is_following: undefined,
		follow: empty_async_call,
		unfollow: empty_async_call
	};
}

const ILLUSI_ARTWORK_CONCURRENCY = 4;
const requested_illusi_artwork = new Set<string>();

export async function load_illusi_artist_artwork(artists: NamedUUID[]): Promise<void> {
	if (!IllusiAccount.is_logged_in()) return;
	await SQLArtists.artists_memo_ready;
	const ids = artists
		.map(artist => artist.uri ?? '')
		.filter(uri => uri.startsWith('illusi:') && SQLArtists.artists_artwork_memo[uri] === undefined && !requested_illusi_artwork.has(uri))
		.map(uri => uri.slice('illusi:'.length))
		.filter(id => /^[0-9a-f-]{36}$/i.test(id));
	for (const id of ids) requested_illusi_artwork.add(create_uri('illusi', id));
	const found: SQLArtistInsert[] = [];
	for (let i = 0; i < ids.length; i += ILLUSI_ARTWORK_CONCURRENCY) {
		await Promise.all(ids.slice(i, i + ILLUSI_ARTWORK_CONCURRENCY).map(async (id) => {
			const view = await Illusi.Artists.get(id);
			if (Illusi.is_error(view)) return;
			const artwork = IllusiViews.artist(view).profile_artwork_url;
			if (typeof artwork === 'string') found.push({ uri: create_uri('illusi', id), name: view.name, artwork_url: artwork });
		}));
	}
	await SQLArtists.insert_all_into_sql_artists(found);
}

const SOUNDCLOUD_PERMALINK = 'soundcloud.com/';
const ARTIST_SERVICES: readonly (readonly [keyof ServiceIds, MusicServiceURI, string?])[] = [
	['youtube_id', 'youtubemusic'],
	['youtube_id', 'youtube'],
	['soundcloud_permalink', 'soundcloud', SOUNDCLOUD_PERMALINK],
	['soundcloud_id', 'soundcloud'],
	['spotify_id', 'spotify']
];

const SERVICE_ARTIST_LOADERS: Partial<Record<string, (id: string) => Promise<MusicServiceArtist>>> = {
	youtubemusic: youtube_music_get_artist,
	youtube: youtube_get_artist,
	soundcloud: async id => (id.startsWith(SOUNDCLOUD_PERMALINK) ? soundcloud_get_artist(id) : soundcloud_get_artist_by_user_id(id)),
	spotify: spotify_get_artist
};

export function artist_service_uris(ids: ServiceIds): IllusiveURI[] {
	return ARTIST_SERVICES.flatMap(([column, service, prefix = '']) => {
		const id = ids[column];
		return (typeof id === 'string' && id !== '') || typeof id === 'number' ? [create_uri(service, `${prefix}${id}`)] : [];
	});
}

export async function load_service_artist(artist: MusicServiceArtist, artist_id?: string): Promise<MusicServiceArtist | null> {
	for (const uri of artist.service_uris ?? []) {
		const [service, id] = split_uri(uri);
		const load = SERVICE_ARTIST_LOADERS[service];
		if (load === undefined) continue;
		const found = await load(id).catch((error: unknown) => {
			catch_log(error);
			return null;
		});
		const reason = found === null ? 'threw' : (found.error?.error.message ?? 'empty');
		if (!has_content(found)) {
			breadcrumb('artist', 'service artist skipped', { uri, error: reason });
			continue;
		}
		return merge_service_artist(artist, await load_artist_first_pages(found));
	}
	if (artist.service_uris === undefined) return null;
	const searched = await search_youtube_music_artist(artist);
	if (searched === null) return null;
	const service_ids = artist_service_ids({ uri: searched.uri });
	if (artist_id !== undefined && service_ids !== undefined) Illusi.Artists.set_service_ids([{ artist_id, service_ids }]).catch(catch_log);
	return merge_service_artist(artist, await load_artist_first_pages(searched.found));
}

function has_content(found: MusicServiceArtist | null): found is MusicServiceArtist {
	return found !== null && found.error === undefined && (found.tracks.length > 0 || found.albums.length > 0 || found.singles_eps.length > 0);
}

function merge_service_artist(artist: MusicServiceArtist, full: MusicServiceArtist): MusicServiceArtist {
	const tracks = full.tracks.length > 0 ? full : artist;
	const albums = full.albums.length > 0 ? full : artist;
	const singles_eps = full.singles_eps.length > 0 ? full : artist;
	const playlists = full.playlists.length > 0 ? full : artist;
	const similar_artists = full.similar_artists.length > 0 ? full : artist;
	return {
		...full,
		name: full.name || artist.name,
		tracks: tracks.tracks,
		tracks_continuation: tracks.tracks_continuation,
		albums: albums.albums,
		albums_continuation: albums.albums_continuation,
		singles_eps: singles_eps.singles_eps,
		singles_eps_continuation: singles_eps.singles_eps_continuation,
		playlists: playlists.playlists,
		playlists_continuation: playlists.playlists_continuation,
		similar_artists: similar_artists.similar_artists,
		similar_artists_continuation: similar_artists.similar_artists_continuation,
		latest_release: full.latest_release ?? artist.latest_release,
		profile_artwork_url: full.profile_artwork_url || artist.profile_artwork_url,
		service_uris: undefined
	};
}

const SEARCH_CANDIDATES = 3;
const SEARCH_TITLES = 2;
const comparable = (text: string) => remove_topic(text).toLowerCase().replace(/\(.*?\)|\[.*?\]/gu, '').replace(/[^\p{L}\p{N}]+/gu, '');

function release_titles(artist: MusicServiceArtist): string[] {
	return [...artist.tracks.map(track => track.title), ...[...artist.albums, ...artist.singles_eps].map(album => album.title.name)];
}

async function search_youtube_music(query: string): Promise<MusicSearchResponse | null> {
	const results = await youtube_music_search(query).catch((error: unknown) => {
		catch_log(error);
		return null;
	});
	return results === null || results.error !== undefined ? null : results;
}

// A name alone is too weak for short names, so a candidate must share a song or release title with the catalog artist
async function search_youtube_music_artist(artist: MusicServiceArtist): Promise<{ uri: IllusiveURI; found: MusicServiceArtist } | null> {
	const name = comparable(artist.name);
	if (name === '') return null;
	const titles = [...new Map(release_titles(artist).map(title => [comparable(title), title])).entries()].filter(([key]) => key !== '');
	const ours = new Set(titles.map(([key]) => key));
	const by_name = (named: NamedUUID) => named.uri?.startsWith('youtubemusic:') === true && comparable(named.name) === name;
	const open = async (uris: IllusiveURI[], verify: boolean) => {
		for (const uri of [...new Set(uris)].slice(0, SEARCH_CANDIDATES)) {
			const found = await youtube_music_get_artist(split_uri(uri)[1]).catch(() => null);
			if (!has_content(found)) continue;
			if (!verify || ours.size === 0 || release_titles(found).some(title => ours.has(comparable(title)))) return { uri, found };
		}
		return null;
	};

	for (const [key, title] of titles.slice(0, SEARCH_TITLES)) {
		const results = await search_youtube_music(`${remove_topic(artist.name)} ${title}`);
		if (results === null) continue;
		const releases = [...results.tracks.map(track => ({ title: track.title, artists: track.artists })), ...results.albums.map(album => ({ title: album.title.name, artists: album.artist }))];
		const uris = releases.filter(release => comparable(release.title) === key).flatMap(release => release.artists.filter(by_name).map(named => named.uri!));
		const found = await open(uris, false);
		if (found !== null) return found;
	}

	const results = await search_youtube_music(remove_topic(artist.name));
	const uris = results === null ? [] : [...results.artists.map(result => result.name), ...results.tracks.flatMap(track => track.artists)].filter(by_name).map(named => named.uri!);
	const found = await open(uris, true);
	if (found === null) breadcrumb('artist', 'youtube music search found no match', { name: artist.name, candidates: uris.length });
	return found;
}
