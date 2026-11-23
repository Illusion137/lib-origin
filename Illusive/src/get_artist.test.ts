import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ArtistView, Page, PlaylistView, TrackView, UserProfile } from '@origin/illusi/types';
import { artist_service_uris, illusi_get_artist, load_artist_first_pages, load_illusi_artist_artwork, load_service_artist } from './get_artist';
import { IllusiViews } from './illusi_views';

const api = vi.hoisted(() => ({
	get: vi.fn(),
	imports: vi.fn(),
	of_user: vi.fn(),
	artist: vi.fn(),
	ytm_artist: vi.fn(),
	sc_user: vi.fn()
}));
const artists = vi.hoisted(() => ({
	artists_memo_ready: Promise.resolve(),
	artists_artwork_memo: {} as Record<string, string | number | undefined>,
	insert_all_into_sql_artists: vi.fn(async () => undefined)
}));

vi.mock('@origin/index', () => ({ YouTubeMusic: { get_artist: api.ytm_artist }, SoundCloud: { user_id_to_artist_id: api.sc_user } }));
vi.mock('./parsers/apple_music_parser', () => ({}));
vi.mock('./parsers/soundcloud_parser', () => ({}));
vi.mock('./parsers/youtube_music_parser', () => ({}));
vi.mock('./parsers/youtube_parser', () => ({}));
vi.mock('./parsers/spotify_parser', () => ({}));
vi.mock('./prefs', () => ({ Prefs: { get_pref: () => '' } }));
vi.mock('@common/sentry_error_handler', () => ({ breadcrumb: vi.fn() }));
vi.mock('./sql/sql_artists', () => ({ SQLArtists: artists }));
vi.mock('./globals', () => ({ GLOBALS: { global_var: { sql_tracks: [] } } }));
vi.mock('./db/sync/illusi_account', () => ({ IllusiAccount: { is_logged_in: () => true } }));
vi.mock('@origin/illusi/illusi', () => ({
	Illusi: {
		is_error: (result: unknown) => typeof result === 'object' && result !== null && 'error' in result,
		Users: { get: api.get, imports: api.imports },
		Artists: { get: api.artist },
		Playlists: { of_user: api.of_user, artwork_url: (id: string) => `https://api/artwork/${id}` },
		Account: { avatar_url: (id: string) => `https://api/avatars/${id}` }
	}
}));

const USER = '11111111-1111-4111-8111-111111111111';
const T = '2026-01-01T00:00:00.000Z';

function profile(overrides: Partial<UserProfile> = {}): UserProfile {
	return { id: USER, username: 'sumi', avatar_id: null, public_imports: true, is_self: false, playlist_count: 1, import_count: 2, ...overrides };
}
function track_view(id: string): TrackView {
	return {
		id, title: `Track ${id}`, album_id: null, duration_ms: 1000, explicit: null, imported: true, artwork_id: null, artwork_edited_at: null, backpacked: false, backpacked_at: null, created_at: T, modified_at: T,
		artists: [{ id: USER, name: 'sumi' }], album: null, track_number: null, service_ids: {}, thumbnails: [], itunes: null, sample_data: null, producers: [],
		has_media: true, resource_id: null, has_lyrics: false, user: null
	};
}
function playlist_view(id: string): PlaylistView {
	return {
		id, user_id: USER, title: id, description: null, pinned: false, archived: false, public: true, sort_mode: 'OLDEST', deleted: false, edited_at: null,
		artwork_id: null, artwork_edited_at: null, created_at: T, modified_at: T, owner: { id: USER, username: 'sumi', avatar_id: null }, is_owner: false, track_count: 0, thumbnails: []
	};
}
const page = <V>(items: V[], next_cursor: string | null = null): Page<V> => ({ items, next_cursor });

beforeEach(() => {
	vi.clearAllMocks();
	api.of_user.mockResolvedValue(page([playlist_view('p1')]));
});

describe('illusi_get_artist for users', () => {
	it('opens a user by the uri their playlists link to', async () => {
		const uri = IllusiViews.playlist(playlist_view('p1')).artist[0].uri!;
		expect(uri).toBe(`illusi:user.${USER}`);
		api.get.mockResolvedValue(profile({ avatar_id: 'me.webp' }));
		api.imports.mockResolvedValue(page([track_view('a'), track_view('b')]));

		const artist = await illusi_get_artist(uri.slice('illusi:'.length));
		expect(api.get).toHaveBeenCalledWith(USER);
		expect(artist).toMatchObject({ name: 'sumi', profile_artwork_url: 'https://api/avatars/me.webp', albums: [], similar_artists: [] });
		expect(artist.tracks.map(track => track.illusi_id)).toEqual(['a', 'b']);
		expect(artist.playlists.map(playlist => playlist.title.name)).toEqual(['p1']);
		expect(artist.tracks_continuation).toBeUndefined();
	});

	it('leaves out imports the user keeps private', async () => {
		api.get.mockResolvedValue(profile({ public_imports: false, import_count: null }));
		const artist = await illusi_get_artist(`user.${USER}`);
		expect(api.imports).not.toHaveBeenCalled();
		expect(artist.tracks).toEqual([]);
		expect(artist.playlists).toHaveLength(1);
	});

	it('pages imports and playlists through their cursors', async () => {
		api.get.mockResolvedValue(profile());
		api.imports.mockImplementation(async (_: string, query: { cursor?: string }) => (query.cursor === undefined ? page([track_view('a')], 'c1') : page([track_view('b')])));
		api.of_user.mockImplementation(async (_: string, query: { cursor?: string }) => (query.cursor === undefined ? page([playlist_view('p1')], 'c1') : page([playlist_view('p2')])));

		const full = await load_artist_first_pages(await illusi_get_artist(`user.${USER}`));
		expect(full.tracks.map(track => track.illusi_id)).toEqual(['a', 'b']);
		expect(full.playlists.map(playlist => playlist.title.name)).toEqual(['p1', 'p2']);
		expect(api.imports).toHaveBeenLastCalledWith(USER, { cursor: 'c1', limit: 50 });
	});

	it('reports a user it can\'t find', async () => {
		api.get.mockResolvedValue({ error: new Error('user not found') });
		const artist = await illusi_get_artist(`user.${USER}`);
		expect(artist.error).toBeDefined();
		expect(artist.tracks).toEqual([]);
	});
});

describe('load_illusi_artist_artwork', () => {
	const id = (n: number) => `2222222${n}-2222-4222-8222-222222222222`;
	function artist_view(artist_id: string, artwork: string | null): ArtistView {
		return {
			id: artist_id, name: `Artist ${artist_id}`, description: null, primary_genre_name: null, created_at: T, modified_at: T,
			service_ids: {}, thumbnails: artwork === null ? [] : [{ url: artwork, width: 100, height: 100 }], itunes: null, album_count: 0, track_count: 0, in_library: true
		};
	}

	it('fetches each catalog-only artist once and caches its picture under the uri the library uses', async () => {
		artists.artists_artwork_memo[`illusi:${id(3)}`] = 'https://cached';
		api.artist.mockImplementation(async (artist_id: string) => (artist_id === id(1)
			? artist_view('merged-id', 'https://img/1')
			: artist_id === id(2) ? artist_view(artist_id, null) : { error: new Error('gone') }));

		const named = [id(1), id(2), id(3), id(4)].map(artist_id => ({ name: artist_id, uri: `illusi:${artist_id}` as const }));
		await load_illusi_artist_artwork([...named, { name: 'yt', uri: 'youtube:channel.x' as const }, { name: 'user', uri: `illusi:user.${USER}` as const }]);
		expect(api.artist.mock.calls.map(([artist_id]) => artist_id as string).sort()).toEqual([id(1), id(2), id(4)]);
		expect(artists.insert_all_into_sql_artists).toHaveBeenCalledWith([{ uri: `illusi:${id(1)}`, name: 'Artist merged-id', artwork_url: 'https://img/1' }]);

		await load_illusi_artist_artwork(named);
		expect(api.artist).toHaveBeenCalledTimes(3);
	});
});

describe('service artists', () => {
	it('lists the services an artist can be opened on, best first', () => {
		expect(artist_service_uris({ applemusic_id: '1479424', spotify_id: '3TVXtAsR1Inumwj472S9r4', youtube_id: 'UCabc', soundcloud_id: 42, soundcloud_permalink: 'ryc', deezer_id: null }))
			.toEqual(['youtubemusic:UCabc', 'youtube:UCabc', 'soundcloud:soundcloud.com/ryc', 'soundcloud:42', 'spotify:3TVXtAsR1Inumwj472S9r4', 'applemusic:1479424']);
		expect(artist_service_uris({})).toEqual([]);
	});

	it('keeps the catalog artist when no service loads', async () => {
		api.ytm_artist.mockResolvedValue({ error: new Error('blocked') });
		api.sc_user.mockResolvedValue({ error: new Error('gone') });
		const artist = { name: 'A', tracks: [], albums: [], singles_eps: [], playlists: [], similar_artists: [], service_uris: ['youtubemusic:UCabc' as const, 'soundcloud:42' as const], follow: vi.fn(), unfollow: vi.fn() };
		expect(await load_service_artist(artist)).toBeNull();
		expect(api.ytm_artist).toHaveBeenCalledTimes(1);
		expect(api.sc_user).toHaveBeenCalledWith(expect.objectContaining({ user_id: '42' }));
	});
});
