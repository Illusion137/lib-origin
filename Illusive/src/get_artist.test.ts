import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Page, PlaylistView, TrackView, UserProfile } from '@origin/illusi/types';
import { illusi_get_artist, load_artist_first_pages } from './get_artist';
import { IllusiViews } from './illusi_views';

const api = vi.hoisted(() => ({
	get: vi.fn(),
	imports: vi.fn(),
	of_user: vi.fn()
}));

vi.mock('@origin/index', () => ({}));
vi.mock('./parsers/apple_music_parser', () => ({}));
vi.mock('./parsers/soundcloud_parser', () => ({}));
vi.mock('./parsers/youtube_music_parser', () => ({}));
vi.mock('./parsers/youtube_parser', () => ({}));
vi.mock('./parsers/spotify_parser', () => ({}));
vi.mock('./prefs', () => ({ Prefs: { get_pref: () => '' } }));
vi.mock('./sql/sql_artists', () => ({ SQLArtists: {} }));
vi.mock('./globals', () => ({ GLOBALS: { global_var: { sql_tracks: [] } } }));
vi.mock('./db/sync/illusi_account', () => ({ IllusiAccount: { is_logged_in: () => true } }));
vi.mock('@origin/illusi/illusi', () => ({
	Illusi: {
		is_error: (result: unknown) => typeof result === 'object' && result !== null && 'error' in result,
		Users: { get: api.get, imports: api.imports },
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
