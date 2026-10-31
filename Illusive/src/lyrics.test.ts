import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Illusi } from '@origin/illusi/illusi';
import type { ParsedLyrics } from '@origin/illusi/types';
import type { Track } from './types';
import { Lyrics } from './lyrics';

// Native and app-side modules the lookup doesn't use here
vi.mock('@native/fs/fs', () => ({ fs: () => ({}) }));
vi.mock('./sql/sql_fs', () => ({ SQLfs: {} }));
vi.mock('@roze/translate', () => ({ Translate: {} }));
vi.mock('./db/sync/illusi_actions', () => ({ IllusiActions: { handle: vi.fn(), check_genius: vi.fn(), check_youtube_music: vi.fn() } }));

const track = (overrides: Partial<Track> = {}): Track => ({
	uid: 'local1',
	title: 'Knots',
	artists: [{ name: 'Some Artist - Topic', uri: null }],
	album: { name: 'Album', uri: null },
	duration: 200,
	youtube_id: 'yt1',
	...overrides
});
const parsed = { sync_type: 'LINE', lines: [{ text: 'first', start_ms: 1000 }, { text: 'second', start_ms: 2500 }] } as unknown as ParsedLyrics;
const found = (track_id: string) => ({ track_id, lyrics: parsed, service: 'LRCLIB', sync_type: 'LINE' }) as never;

beforeEach(() => {
	vi.spyOn(Illusi, 'get_session').mockReturnValue({ access_token: 'a', refresh_token: 'r' } as Illusi.Session);
});
afterEach(() => {
	vi.restoreAllMocks();
});

describe('Lyrics.get_track_lyrics', () => {
	it('asks the server for a track it knows', async () => {
		const lyrics = vi.spyOn(Illusi.Tracks, 'lyrics').mockResolvedValue(found('ill1'));
		const resolve = vi.spyOn(Illusi, 'resolve');
		expect(await Lyrics.get_track_lyrics(track({ illusi_id: 'ill1' }))).toEqual({ plain: 'first\nsecond', synced: '[00:01.00] first\n[00:02.50] second' });
		expect(lyrics).toHaveBeenCalledWith('ill1');
		expect(resolve).not.toHaveBeenCalled();
	});

	it('finds the server\'s match for a track without an id', async () => {
		const resolve = vi.spyOn(Illusi, 'resolve').mockResolvedValue({ local1: 'ill2' });
		const contribute = vi.spyOn(Illusi, 'contribute');
		vi.spyOn(Illusi.Tracks, 'lyrics').mockResolvedValue(found('ill2'));
		await Lyrics.get_track_lyrics(track());
		expect(resolve.mock.calls[0][0][0]).toMatchObject({ ref: 'local1', type: 'track', service_ids: { youtube_id: 'yt1' }, title: 'Knots', artist: 'Some Artist', duration_ms: 200_000 });
		expect(contribute).not.toHaveBeenCalled();
	});

	it('contributes a track the server has never seen', async () => {
		vi.spyOn(Illusi, 'resolve').mockResolvedValue({ local1: null });
		const contribute = vi.spyOn(Illusi, 'contribute').mockResolvedValue({ refs: { local1: 'ill3' }, created: [], matched: [], conflicts: [], rejected: [] });
		const lyrics = vi.spyOn(Illusi.Tracks, 'lyrics').mockResolvedValue({ track_id: 'ill3', lyrics: null, instrumental: true });
		expect(await Lyrics.get_track_lyrics(track())).toEqual({ plain: '', synced: undefined });
		expect(contribute.mock.calls[0][0].tracks?.[0]).toMatchObject({ ref: 'local1', title: 'Knots' });
		expect(lyrics).toHaveBeenCalledWith('ill3');
	});

	it('needs an Illusi account', async () => {
		vi.mocked(Illusi.get_session).mockReturnValue(null);
		const result = await Lyrics.get_track_lyrics(track({ illusi_id: 'ill1' }));
		expect('error' in result).toBe(true);
	});
});
