import { describe, expect, it, vi } from 'vitest';
import type { CompactPlaylist, Track } from './types';
import { Explore } from './explore';

// Native and app-side modules ranking doesn't use
vi.mock('@native/fs/fs', () => ({ fs: () => ({}) }));
vi.mock('./sql/sql_fs', () => ({ SQLfs: {} }));
vi.mock('./sql/sql_tracks', () => ({ SQLTracks: {} }));
vi.mock('./illusive', () => ({ Illusive: {} }));
const prefs = vi.hoisted(() => ({ store: {} as Record<string, unknown> }));
vi.mock('./prefs', () => ({ Prefs: { get_pref: (key: string) => prefs.store[key] } }));
vi.mock('./db/sync/illusi_account', () => ({ IllusiAccount: {} }));
vi.mock('./globals', () => ({ GLOBALS: { global_var: {} } }));
vi.mock('./futsal_shuffle', () => ({ FutsalShuffle: {} }));
vi.mock('@common/fs_cache', () => ({ FSCache: {} }));
vi.mock('@origin/index', () => ({}));
vi.mock('./parsers/soundcloud_parser', () => ({}));
vi.mock('./illusi_views', () => ({ IllusiViews: {} }));

const release = (title: string, artist: string, date: string, extra: Partial<CompactPlaylist> = {}): CompactPlaylist => ({
	title: { name: title, uri: null }, artist: [{ name: artist, uri: null }], date: date as never, explicit: 'NONE', album_type: 'ALBUM', ...extra
});
const track = (artist: string, plays: number): Track => ({ uid: `${artist}${plays}`, title: 't', artists: [{ name: artist, uri: null }], duration: 1, meta: { plays } as never });

describe('Explore.rank_new_releases', () => {
	const library = [track('Fav', 40), track('Fav - Topic', 10), track('Known', 0)];
	const releases = [
		release('Newest', 'Stranger', '2026-10-29'),
		release('Known One', 'Known', '2026-10-20'),
		release('Fav Old', 'fav', '2026-10-01'),
		release('Fav New', 'Fav', '2026-10-25'),
		release('Fav New', 'Fav', '2026-10-25'),
		release('SC', 'Followed', '2026-10-28', { song_track: track('Followed', 0) })
	];

	it('puts the artists the user plays most first, then the newest', () => {
		expect(Explore.rank_new_releases(releases, library, false).map(r => r.title.name)).toEqual(['Fav New', 'Fav Old', 'Known One', 'Newest', 'SC']);
	});

	it('hides artists outside the library but keeps followed SoundCloud tracks', () => {
		expect(Explore.rank_new_releases(releases, library, true).map(r => r.title.name)).toEqual(['Fav New', 'Fav Old', 'Known One', 'SC']);
	});
});

describe('Explore.new_releases_stale', () => {
	const at = (h: number, m: number, day = 25) => new Date(2026, 10, day, h, m);
	const cached = (last_refreshed: Date, releases: CompactPlaylist[] = [release('A', 'B', '2026-11-25')]) => {
		prefs.store = { new_releases: releases, new_releases_last_refreshed: last_refreshed };
	};

	it('is stale once the clock reaches the next hour, since artists drop on the hour', () => {
		cached(at(15, 59));
		expect(Explore.new_releases_stale(at(15, 59))).toBe(false);
		expect(Explore.new_releases_stale(at(16, 0))).toBe(true);
		cached(at(16, 0));
		expect(Explore.new_releases_stale(at(16, 59))).toBe(false);
	});

	it('is stale the same hour on another day, and with nothing cached', () => {
		cached(at(16, 10, 24));
		expect(Explore.new_releases_stale(at(16, 20))).toBe(true);
		cached(at(16, 10), []);
		expect(Explore.new_releases_stale(at(16, 20))).toBe(true);
	});
});
