import { beforeAll, describe, expect, it } from 'vitest';
import { Genius } from '@origin/genius/genius';
import type { HeardWord, ParsedLyrics } from '@origin/illusi/types';
import { LyricsAlign } from './lyrics_align';

const HOP_MS = 256;
const WINDOW_MS = 2048;

/** Vocals as the analyzer reports them for singing over `spans`: each window's voiced share */
function vocals_for(spans: [number, number][], duration_ms: number): LyricsAlign.VocalActivity {
	const voice: number[] = [];
	for (let start = 0; start + WINDOW_MS <= duration_ms; start += HOP_MS) {
		let sung = 0;
		for (const [from, to] of spans) sung += Math.max(0, Math.min(to, start + WINDOW_MS) - Math.max(from, start));
		voice.push(Math.min(1, sung / WINDOW_MS * 1.6));
	}
	const segments = spans.map(([start_ms, end_ms]) => ({ start_ms, end_ms }));
	return { hop_ms: HOP_MS, window_ms: WINDOW_MS, duration_ms, voice, segments };
}

let SONG = '';

// Lelo - Groundhog Day, fetched from Genius rather than kept in the repo
beforeAll(async () => {
	const songs = await Genius.search_songs('Lelo Groundhog Day', {});
	if ('error' in songs) throw songs.error;
	const hit = songs.find(song => song.result.path === '/Lelo-groundhog-day-lyrics') ?? songs[0];
	const result = await Genius.get_lyrics(hit.result, {});
	if ('error' in result) throw result.error;
	if (typeof result.lyrics !== 'string') throw result.lyrics.error;
	SONG = result.lyrics;
}, 30_000);

/** Sings each line at 230 ms a syllable, with short pauses between lines and long ones between sections */
function sing(plain: string, ms_per_syllable = 230) {
	const truth: number[] = [];
	const spans: [number, number][] = [];
	let at = 6_000;
	for (const line of LyricsAlign.sung_lines(plain)) {
		if (line.section_start && truth.length > 0) at += 4_000;
		const length = LyricsAlign.line_syllables(line.text) * ms_per_syllable;
		truth.push(at);
		spans.push([at, at + length]);
		at += length + 600;
	}
	return { truth, vocals: vocals_for(spans, at + 8_000) };
}

describe('LyricsAlign text', () => {
	it('drops Genius headers', () => {
		const raw = SONG.split('\n').map(line => line.trim());
		const lines = LyricsAlign.sung_lines(SONG);
		expect(raw.filter(line => line.startsWith('[')).length).toBeGreaterThan(5);
		expect(lines.map(line => line.text)).toEqual(raw.filter(line => line !== '' && !line.startsWith('[')));
		// After [Part I] and [Verse], and after [Chorus]
		expect(lines[0]).toEqual({ text: 'Ayy', section_start: true });
		expect(lines.find(line => line.text === 'I\'m like a groundhog, get on there and groundhog')?.section_start).toBe(true);
		expect(lines[1].section_start).toBe(false);
	});

	it('counts syllables', () => {
		expect(LyricsAlign.word_syllables('little')).toBe(2);
		expect(LyricsAlign.word_syllables('makes')).toBe(1);
		expect(LyricsAlign.word_syllables('running')).toBe(2);
		expect(LyricsAlign.word_syllables('夜空')).toBe(2);
		expect(LyricsAlign.line_syllables('Hold on (hold on)')).toBe(3);
	});

	it('splits CJK lines into characters', () => {
		expect(LyricsAlign.line_words('Hello world')).toEqual(['Hello ', 'world']);
		expect(LyricsAlign.line_words('夜空 に')).toEqual(['夜', '空 ', 'に']);
	});
});

describe('LyricsAlign.line_sync', () => {
	it('places lines where they are sung', () => {
		const { truth, vocals } = sing(SONG);
		const synced = LyricsAlign.line_sync(SONG, vocals);
		expect(synced?.sync_type).toBe('LINE');
		expect(synced!.lines).toHaveLength(truth.length);
		synced!.lines.forEach((line, i) => expect(Math.abs(line.start_ms! - truth[i])).toBeLessThanOrEqual(1_000));
	});

	it('gives up when the vocals don\'t match the lyrics', () => {
		// Only a few seconds of singing for the whole song
		expect(LyricsAlign.line_sync(SONG, vocals_for([[10_000, 14_000]], 180_000))).toBeNull();
		// No singing at all
		expect(LyricsAlign.line_sync(SONG, vocals_for([], 180_000))).toBeNull();
		// Voice heard through every pause, as the vocal model does on dense mixes
		const { vocals } = sing(SONG);
		expect(LyricsAlign.line_sync(SONG, { ...vocals, voice: vocals.voice.map(p => Math.max(p, 0.75)) })).toBeNull();
	});
});

describe('LyricsAlign.word_sync', () => {
	it('times the words of each line inside it', () => {
		const { vocals } = sing(SONG);
		const lined = LyricsAlign.line_sync(SONG, vocals)!;
		const worded = LyricsAlign.word_sync(lined, vocals);
		expect(worded?.sync_type).toBe('WORD');
		for (const line of worded!.lines) {
			expect(line.segments!.map(segment => segment.text).join('')).toBe(line.text);
			const starts = line.segments!.map(segment => segment.start_ms);
			expect(starts[0]).toBe(line.start_ms);
			expect(starts).toEqual([...starts].sort((a, b) => a - b));
		}
	});

	it('keeps line sync when the vocals don\'t fit', () => {
		const lyrics: ParsedLyrics = {
			sync_type: 'LINE',
			lines: LyricsAlign.sung_lines(SONG).map((line, i) => ({ text: line.text, start_ms: 5_000 + i * 4_000, end_ms: null }))
		};
		expect(LyricsAlign.word_sync(lyrics, vocals_for([[100_000, 120_000]], 180_000))).toBeNull();
	});
});

/** What Whisper might hear of `sing(plain)`: every third word missed, some misheard, and chatter before the song starts */
function hear(plain: string, truth: number[], ms_per_syllable = 230): HeardWord[] {
	const words: HeardWord[] = [{ text: 'yeah', start_ms: 1_000, end_ms: 1_200, probability: 0.4 }, { text: 'okay', start_ms: 2_000, end_ms: 2_300, probability: 0.5 }];
	let k = 0;
	LyricsAlign.sung_lines(plain).forEach((line, i) => {
		let before = 0;
		for (const raw of line.text.split(/\s+/).filter(Boolean)) {
			const start_ms = Math.round(truth[i] + before * ms_per_syllable);
			before += LyricsAlign.word_syllables(raw);
			if (k++ % 3 === 2) continue;
			const text = k % 7 === 0 && raw.length > 4 ? raw.slice(0, -1) + 'x' : raw;
			words.push({ text: ` ${text}`, start_ms, end_ms: start_ms + 200, probability: 0.8 });
		}
	});
	return words;
}

function heard_vocals(plain: string, ms_per_syllable = 230): { truth: number[]; vocals: LyricsAlign.HeardVocals } {
	const { truth, vocals } = sing(plain, ms_per_syllable);
	const beats = Array.from({ length: Math.floor(vocals.duration_ms / 500) }, (_, i) => i * 500);
	return {
		truth,
		vocals: {
			...vocals,
			rhythm: { model: 'test', bpm: 120, confidence: 3, beats_ms: beats, bpm_estimates: [120] },
			words: { model: 'test', words: hear(plain, truth, ms_per_syllable) },
			speech: { model: 'test', hop_ms: 32, voice: Array.from({ length: Math.floor(vocals.duration_ms / 32) }, () => 0) },
			beat_grid: { model: 'test', beats_ms: beats, downbeats_ms: beats.filter((_, i) => i % 4 === 0) }
		}
	};
}

describe('LyricsAlign anchors', () => {
	it('matches heard words to lyric words in order, misheard ones too', () => {
		const lines = LyricsAlign.sung_lines('Running through the city lights\nNothing ever came to pass');
		const heard: HeardWord[] = [
			{ text: ' Okay', start_ms: 500, end_ms: 700, probability: 0.9 },
			{ text: ' Runnin\'', start_ms: 1_000, end_ms: 1_300, probability: 0.9 },
			{ text: ' city', start_ms: 1_800, end_ms: 2_000, probability: 0.6 },
			{ text: ' lights', start_ms: 2_100, end_ms: 2_400, probability: 0.9 },
			{ text: ' nothin', start_ms: 3_000, end_ms: 3_300, probability: 0.8 },
			{ text: ' to', start_ms: 3_900, end_ms: 4_000, probability: 0.9 },
			{ text: ' pass', start_ms: 4_100, end_ms: 4_400, probability: 0.9 }
		];
		// Words under three letters, like "to", never anchor a line
		expect(LyricsAlign.anchors(lines, heard)).toEqual([
			{ line: 0, word: 0, ms: 1_000 }, { line: 0, word: 3, ms: 1_800 }, { line: 0, word: 4, ms: 2_100 },
			{ line: 1, word: 0, ms: 3_000 }, { line: 1, word: 4, ms: 4_100 }
		]);
	});

	it('estimates line starts from the words heard in them, then fills in the rest', () => {
		const { truth, vocals } = heard_vocals(SONG);
		const lines = LyricsAlign.sung_lines(SONG);
		const found = LyricsAlign.anchors(lines, vocals.words!.words);
		for (const how of ['first', 'median'] as const) {
			const starts = LyricsAlign.line_estimates(lines, found, how);
			expect(starts.size).toBeGreaterThan(lines.length * 0.8);
			expect([...starts].filter(([line, ms]) => Math.abs(ms - truth[line]) <= 600).length).toBeGreaterThan(starts.size * 0.9);
			const spread = LyricsAlign.interpolate(lines, starts)!;
			expect(spread.lines).toHaveLength(lines.length);
			expect(spread.lines.filter((line, i) => Math.abs(line.start_ms! - truth[i]) <= 1_000).length).toBeGreaterThan(lines.length * 0.9);
		}
	});
});

describe('LyricsAlign.beat_line_sync', () => {
	it('puts a line on every bar', () => {
		// Two-second bars at 120 BPM, each line rapped from the downbeat
		const plain = Array.from({ length: 24 }, (_, i) => `line number ${i} goes right here`).join('\n');
		const spans: [number, number][] = Array.from({ length: 24 }, (_, i) => [8_000 + i * 2_000, 9_700 + i * 2_000]);
		const beats = Array.from({ length: 140 }, (_, i) => i * 500);
		const fit = LyricsAlign.beat_line_sync(plain, vocals_for(spans, 70_000), beats);
		expect(fit?.beats_per_line).toBe(4);
		fit!.lyrics.lines.forEach((line, i) => expect(Math.abs(line.start_ms! - spans[i][0])).toBeLessThanOrEqual(500));
	});

	it('follows a pull toward known starts', () => {
		const plain = 'one two three four\nfive six seven eight';
		const beats = Array.from({ length: 40 }, (_, i) => i * 500);
		const vocals = vocals_for([[2_000, 18_000]], 20_000);
		const pulled = LyricsAlign.beat_line_sync(plain, vocals, beats, (line, ms) => line === 1 && ms === 10_000 ? 50 : 0);
		expect(pulled?.lyrics.lines[1].start_ms).toBe(10_000);
	});
});

describe('LyricsAlign.heard_line_sync', () => {
	it('syncs lines from the words Whisper heard', () => {
		const { truth, vocals } = heard_vocals(SONG);
		const synced = LyricsAlign.heard_line_sync(SONG, vocals);
		expect(synced?.lyrics.sync_type).toBe('LINE');
		expect(synced!.candidates.length).toBeGreaterThan(5);
		const close = synced!.lyrics.lines.filter((line, i) => Math.abs(line.start_ms! - truth[i]) <= 1_000).length;
		expect(close).toBeGreaterThan(truth.length * 0.9);
	});

	it('leaves lyrics unsynced when Whisper heard other words', () => {
		const { vocals } = heard_vocals(SONG);
		const other = heard_vocals('Strangers in the morning light\nWalking slowly down the avenue\nEverybody wonders why').vocals.words!;
		expect(LyricsAlign.heard_line_sync(SONG, { ...vocals, words: other })).toBeNull();
		expect(LyricsAlign.heard_line_sync(SONG, { ...vocals, words: { model: 'test', words: [] } })).toBeNull();
	});

	it('leaves lyrics unsynced when most of what Whisper heard is not in them', () => {
		const { vocals } = heard_vocals(SONG);
		const words = vocals.words!.words;
		const end = words[words.length - 1].end_ms;
		const chatter = 'strangers walking slowly morning avenue wonders'.split(' ');
		// Every line still matches, but the song goes on with twice as many words that aren't in these lyrics
		const extra: HeardWord[] = Array.from({ length: 2 * words.length }, (_, i) => ({ text: ` ${chatter[i % chatter.length]}`, start_ms: end + 300 * (i + 1), end_ms: end + 300 * (i + 1) + 200, probability: 0.9 }));
		const lines = LyricsAlign.sung_lines(SONG);
		expect(LyricsAlign.line_estimates(lines, LyricsAlign.anchors(lines, [...words, ...extra]), 'first').size).toBeGreaterThan(lines.length * 0.8);
		expect(LyricsAlign.heard_line_sync(SONG, { ...vocals, words: { model: 'test', words: [...words, ...extra] } })).toBeNull();
	});

	it('only judges lyrics Whisper can match', () => {
		const { vocals } = heard_vocals(SONG);
		expect(LyricsAlign.can_hear(SONG, vocals)).toBe(true);
		expect(LyricsAlign.can_hear(SONG, { ...vocals, words: null })).toBe(false);
		expect(LyricsAlign.can_hear('夜空 に 星 が\n光る 夜 に', vocals)).toBe(false);
	});
});
