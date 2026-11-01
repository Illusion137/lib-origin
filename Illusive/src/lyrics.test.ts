import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Illusi } from '@origin/illusi/illusi';
import type { ParsedLyrics, TrackVocals } from '@origin/illusi/types';
import type { Track } from './types';
import { Translate } from '@roze/translate';
import { Lyrics } from './lyrics';
import { LyricsAlign } from './lyrics_align';

// Native and app-side modules the lookup doesn't use here
vi.mock('@native/fs/fs', () => ({ fs: () => ({}) }));
vi.mock('./sql/sql_fs', () => ({ SQLfs: {} }));
vi.mock('@roze/translate', () => ({ Translate: { google_translate_html: vi.fn() } }));
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
	vi.spyOn(Illusi.Tracks, 'vocals').mockResolvedValue({ error: new Error('no vocals detected for this track'), status: 404 } as never);
});
afterEach(() => {
	vi.restoreAllMocks();
});

describe('Lyrics.get_track_lyrics', () => {
	it('asks the server for a track it knows', async () => {
		const lyrics = vi.spyOn(Illusi.Tracks, 'lyrics').mockResolvedValue(found('ill1'));
		const resolve = vi.spyOn(Illusi, 'resolve');
		expect(await Lyrics.get_track_lyrics(track({ illusi_id: 'ill1' }))).toEqual({ sync_status: 'LINE', lyrics: parsed });
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
		expect(await Lyrics.get_track_lyrics(track())).toEqual({ sync_status: 'NONE', plain: '' });
		expect(contribute.mock.calls[0][0].tracks?.[0]).toMatchObject({ ref: 'local1', title: 'Knots' });
		expect(lyrics).toHaveBeenCalledWith('ill3');
	});

	it('keeps unsynced lyrics plain, leaving any sync to the device', async () => {
		const unsynced = { sync_type: 'NONE', lines: [{ text: 'first', start_ms: null, end_ms: null }, { text: 'second', start_ms: null, end_ms: null }] };
		vi.spyOn(Illusi.Tracks, 'lyrics').mockResolvedValue({ track_id: 'ill1', lyrics: unsynced, service: 'GENIUS', sync_type: 'NONE' } as never);
		expect(await Lyrics.get_track_lyrics(track({ illusi_id: 'ill1' }))).toEqual({ sync_status: 'NONE', plain: 'first\nsecond' });
		expect(Illusi.Tracks.vocals).not.toHaveBeenCalled();
	});

	it('needs an Illusi account', async () => {
		vi.mocked(Illusi.get_session).mockReturnValue(null);
		const result = await Lyrics.get_track_lyrics(track({ illusi_id: 'ill1' }));
		expect('error' in result).toBe(true);
	});
});

describe('Lyrics.with_vocal_sync', () => {
	const LINES = ['Morning rises over silver mountains', 'Rivers carry whispers through the valley', 'Lanterns flicker gently in the harbor', 'Shadows wander quietly past midnight', 'Thunder rolling somewhere far behind us', 'Painted windows glowing amber golden', 'Travelers remember every highway', 'Sparrows gather softly on the rooftops'];
	const unsynced: ParsedLyrics = { sync_type: 'NONE', lines: LINES.map(text => ({ text, start_ms: null, end_ms: null })) };
	const start = (i: number) => 5_000 + i * 4_000;
	// Each line sung for three seconds from its start, every word heard
	function vocals(heard: string[] = LINES): TrackVocals {
		const duration_ms = start(LINES.length) + 5_000;
		const voice: number[] = [];
		for (let at = 0; at + 2_048 <= duration_ms; at += 256) {
			const sung = LINES.reduce((sum, _, i) => sum + Math.max(0, Math.min(start(i) + 3_000, at + 2_048) - Math.max(start(i), at)), 0);
			voice.push(Math.min(1, sung / 2_048 * 1.6));
		}
		const words = heard.flatMap((line, i) => line.split(' ').map((text, k) => ({ text: ` ${text}`, start_ms: start(i) + k * 500, end_ms: start(i) + k * 500 + 400, probability: 0.9 })));
		return {
			track_id: 'ill1', resource_id: 'r', model: 'm', hop_ms: 256, window_ms: 2_048, duration_ms, voice, segments: LINES.map((_, i) => ({ start_ms: start(i), end_ms: start(i) + 3_000 })),
			rhythm: null, words: { model: 'w', words }, speech: null, beat_grid: null, analyzed_at: ''
		};
	}

	it('syncs plain lyrics from the words Whisper heard', async () => {
		vi.mocked(Illusi.Tracks.vocals).mockResolvedValue(vocals());
		const synced = await Lyrics.with_vocal_sync('ill1', unsynced);
		expect(synced.sync_type).not.toBe('NONE');
		synced.lines.forEach((line, i) => expect(Math.abs(line.start_ms! - start(i))).toBeLessThanOrEqual(500));
	});

	it('leaves them unsynced when the words heard are not these lyrics', async () => {
		vi.mocked(Illusi.Tracks.vocals).mockResolvedValue(vocals(LINES.map(() => 'nobody knows anything about this')));
		expect(await Lyrics.with_vocal_sync('ill1', unsynced)).toBe(unsynced);
	});

	it('syncs a track\'s plain lyrics on the device, or gives null when it can\'t', async () => {
		vi.mocked(Illusi.Tracks.vocals).mockResolvedValue(vocals());
		const synced = await Lyrics.experimental_sync(track({ illusi_id: 'ill1', duration: 0 }), LINES.join('\n'));
		expect(synced && !('error' in synced) ? synced.sync_type : null).not.toBe('NONE');
		expect(synced).not.toBeNull();
		vi.mocked(Illusi.Tracks.vocals).mockResolvedValue(vocals(LINES.map(() => 'nobody knows anything about this')));
		expect(await Lyrics.experimental_sync(track({ illusi_id: 'ill1', duration: 0 }), LINES.join('\n'))).toBeNull();
		vi.mocked(Illusi.Tracks.vocals).mockResolvedValue({ error: new Error('no vocals detected for this track'), status: 404 } as never);
		expect(await Lyrics.experimental_sync(track({ illusi_id: 'ill1', duration: 0 }), LINES.join('\n'))).toBeNull();
	});

	it('uses the vocal curve alone for files analyzed before transcription', async () => {
		vi.mocked(Illusi.Tracks.vocals).mockResolvedValue({ ...vocals(), words: null });
		const line_sync = vi.spyOn(LyricsAlign, 'line_sync');
		await Lyrics.with_vocal_sync('ill1', unsynced);
		expect(line_sync).toHaveBeenCalled();
	});
});

const worded: ParsedLyrics = {
	sync_type: 'WORD',
	lines: [
		{ text: '[Chorus]', start_ms: null, end_ms: null },
		{ text: 'hello there', start_ms: 1000, end_ms: 2000, segments: [{ text: 'hello ', start_ms: 1000, end_ms: 1500 }, { text: 'there', start_ms: 1500, end_ms: 2000 }] }
	]
};

describe('Lyrics LRC', () => {
	it('reads centiseconds and skips metadata', () => {
		const parsed = Lyrics.lrclib_synced_lyrics_to_json('[ar:Someone]\n[00:12.50] first\n[01:02.5][00:20.00] again');
		expect('error' in parsed).toBe(false);
		const lyrics = (parsed as Lyrics.LRCLibSyncedLyrics).lyrics;
		expect(lyrics.map(l => [l.text, l.interval.from])).toEqual([['first', 12.5], ['again', 20], ['again', 62.5]]);
		expect(lyrics[0].interval.to).toBe(20);
	});

	it('writes and reads word timings', () => {
		const lrc = Lyrics.to_lrc(worded);
		expect(lrc).toBe('[00:01.00] <00:01.00>hello <00:01.50>there<00:02.00>');
		const [line] = (Lyrics.lrclib_synced_lyrics_to_json(lrc) as Lyrics.LRCLibSyncedLyrics).lyrics;
		expect(line.text).toBe('hello there');
		expect(line.segments).toEqual([{ text: 'hello ', interval: { from: 1, to: 1.5 } }, { text: 'there', interval: { from: 1.5, to: 2 } }]);
		expect(line.interval).toEqual({ from: 1, to: 2 });
		// The synced views get the same lines straight from the stored lyrics
		expect(Lyrics.to_synced_lyrics(worded)).toEqual([line]);
	});
});

describe('Lyrics files', () => {
	it('stores timed lyrics as they are and the rest as plain text', () => {
		expect(Lyrics.to_track_lyrics({ ...worded })).toEqual({ sync_status: 'WORD', lyrics: worded });
		const plain = Lyrics.from_plain('[Verse]\nfirst line\nsecond line');
		expect(plain.lines[1]).toEqual({ text: 'first line', start_ms: null, end_ms: null });
		expect(Lyrics.to_track_lyrics(plain)).toEqual({ sync_status: 'NONE', plain: '[Verse]\nfirst line\nsecond line' });
		// LINE in name only, with no line timed
		expect(Lyrics.to_track_lyrics({ ...plain, sync_type: 'LINE' })).toEqual({ sync_status: 'NONE', plain: '[Verse]\nfirst line\nsecond line' });
	});
});

describe('Lyrics translation', () => {
	it('returns each line with its translation, leaving headers and blank lines alone', async () => {
		const translate = vi.mocked(Translate.google_translate_html).mockResolvedValue(['Night sky', 'Morning']);
		const result = await Lyrics.translate_plain_lyrics('[Chorus]\n夜空\n\n朝');
		expect(translate.mock.calls[0][0]).toEqual(['夜空', '朝']);
		expect(result).toEqual([{ text: '[Chorus]' }, { text: '夜空', translated: 'Night sky' }, { text: '' }, { text: '朝', translated: 'Morning' }]);
	});

	it('keeps the timings of synced lines', async () => {
		vi.mocked(Translate.google_translate_html).mockResolvedValue(['Night sky']);
		const line = { text: '夜空', interval: { from: 1, to: 2 }, segments: [{ text: '夜', interval: { from: 1 } }, { text: '空', interval: { from: 1.5 } }] };
		expect(await Lyrics.translate_synced_lyrics([line])).toEqual([{ ...line, translated: 'Night sky' }]);
	});
});
