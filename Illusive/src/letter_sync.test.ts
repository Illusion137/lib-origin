import { describe, expect, it } from 'vitest';
import type { LyricsLine, TrackAlignment } from '@origin/illusi/types';
import { LetterSync } from './letter_sync';

const ALPHABET = '-aienoutsrmkldghybpwcvjzf\'qx';
const FRAME_MS = 20;
const LINES = ['Morning rises over silver mountains', 'Rivers carry whispers through the valley', 'Lanterns flicker gently in the harbor', 'Shadows wander quietly past midnight', 'Thunder rolling somewhere far behind us', 'Painted windows glowing amber golden', 'Travelers remember every highway', 'Sparrows gather softly on the rooftops'];
const start = (i: number) => 5_000 + i * 4_000;

function base64(bytes: Uint8Array): string {
	let binary = '';
	for (const b of bytes) binary += String.fromCharCode(b);
	return globalThis.btoa(binary);
}

/**
 * The analysis of a song singing `lines` from `starts`: each letter clearly heard for three frames with a blank after
 * it, loud while a line is sung and silent between lines, and Whisper hearing `heard` (by default, every word).
 */
function alignment_for(lines: readonly string[], starts: readonly number[], heard: readonly string[] = lines): TrackAlignment {
	const duration_ms = starts[starts.length - 1] + 6_000;
	const frames = duration_ms / FRAME_MS;
	const width = ALPHABET.length;
	const letters = new Uint8Array(frames * width).fill(255);
	const loudness = new Uint8Array(frames);
	for (let t = 0; t < frames; t++) letters[t * width] = 3;
	const words: TrackAlignment['words']['words'] = [];
	lines.forEach((line, i) => {
		let f = starts[i] / FRAME_MS;
		const heard_words = heard[i].split(' ');
		line.split(' ').forEach((word, k) => {
			if (heard_words[k] !== undefined) words.push({ text: ` ${heard_words[k]}`, start_ms: f * FRAME_MS, end_ms: f * FRAME_MS + 300, probability: 0.9 });
			for (const c of LetterSync.letters_of(word)) {
				for (let j = 0; j < 3; j++, f++) {
					letters[f * width] = 40;
					letters[f * width + ALPHABET.indexOf(c)] = 3;
					loudness[f] = 200;
				}
				loudness[f++] = 200;
			}
			for (let j = 0; j < 5; j++) loudness[f++] = 200;
		});
	});
	return {
		track_id: 't', resource_id: 'r', model: 'm', duration_ms, frame_ms: FRAME_MS, alphabet: ALPHABET, letter_scale: 4,
		letters: base64(letters), loudness: base64(loudness), words: { model: 'w', words }, beat_grid: { model: 'b', beats_ms: [], downbeats_ms: [] },
		repeats: [], analyzed_at: ''
	};
}

describe('LetterSync', () => {
	it('reduces words to the letters the model aligns', () => {
		expect(LetterSync.letters_of('Don’t,')).toBe('don\'t');
		expect(LetterSync.letters_of('10!')).toBe('ten');
		expect(LetterSync.letters_of('(yeah)')).toBe('yeah');
		expect(LetterSync.letters_of('—')).toBe('');
	});

	it('tells sounds from words', () => {
		for (const sound of ['oh', 'Ooh,', 'la', 'mmmm', 'ahhh', '—']) expect(LetterSync.is_vocable(sound), sound).toBe(true);
		for (const word of ['morning', 'all', 'add', 'ill', 'lalala']) expect(LetterSync.is_vocable(word), word).toBe(false);
	});

	it('places every line where it is sung', () => {
		const placed = LetterSync.place(LINES.join('\n'), alignment_for(LINES, LINES.map((_, i) => start(i))))!;
		expect(placed.confident).toBe(true);
		expect(placed.agreeing).toBe(1);
		expect(placed.lyrics.sync_type).toBe('LINE');
		placed.lyrics.lines.forEach((line, i) => {
			expect(line.text).toBe(LINES[i]);
			expect(Math.abs(line.start_ms! - start(i))).toBeLessThanOrEqual(100);
		});
	});

	it('drops section headers and places a line of sounds between its neighbours', () => {
		const lines = [...LINES.slice(0, 4), 'Oh oh oh', ...LINES.slice(4)];
		const starts = lines.map((_, i) => start(i));
		const placed = LetterSync.place(`[Verse]\n${lines.slice(0, 4).join('\n')}\n\n[Chorus]\n${lines.slice(4).join('\n')}`, alignment_for(lines, starts))!;
		expect(placed.lyrics.lines.map(line => line.text)).toEqual(lines);
		const at = placed.lyrics.lines.map(line => line.start_ms!);
		expect(at[4]).toBeGreaterThan(at[3]);
		expect(at[4]).toBeLessThan(at[5]);
		expect(Math.abs(at[5] - starts[5])).toBeLessThanOrEqual(100);
	});

	it('withholds timings Whisper doesn\'t back up', () => {
		const alignment = alignment_for(LINES, LINES.map((_, i) => start(i)), LINES.map(() => 'nobody knows anything about this'));
		expect(LetterSync.place(LINES.join('\n'), alignment)!.confident).toBe(false);
		expect(LetterSync.line_sync(LINES.join('\n'), alignment)).toBeNull();
	});

	it('word syncs plain lyrics where each word is sung', () => {
		const lines = [...LINES.slice(0, 4), 'Oh oh oh', ...LINES.slice(4)];
		const alignment = alignment_for(lines, lines.map((_, i) => start(i)));
		const onsets = alignment.words.words.filter(w => !LetterSync.is_vocable(w.text)).map(w => w.start_ms);
		const synced = LetterSync.word_sync(lines.join('\n'), alignment)!;
		expect(synced.sync_type).toBe('WORD');
		expect(synced.lines[4].segments).toBeUndefined();
		const segments = synced.lines.flatMap(line => line.segments ?? []);
		expect(segments).toHaveLength(onsets.length);
		segments.forEach((segment, i) => {
			expect(Math.abs(segment.start_ms - onsets[i])).toBeLessThanOrEqual(40);
			expect(segment.end_ms).toBeGreaterThan(segment.start_ms);
		});
		synced.lines.forEach((line) => {
			if (line.segments === undefined) return;
			expect(line.segments.map(segment => segment.text).join('')).toBe(line.text);
			expect(line.segments[0].start_ms).toBe(line.start_ms);
			// Each word lasts until the next one starts
			line.segments.slice(1).forEach((segment, k) => expect(line.segments![k].end_ms).toBe(segment.start_ms));
		});
	});

	it('keeps words without letters with the word before them', () => {
		const lines = ['Morning rises — over silver mountains', ...LINES.slice(1)];
		const synced = LetterSync.word_sync(lines.join('\n'), alignment_for(lines.map(line => line.replace(' —', '')), lines.map((_, i) => start(i))))!;
		expect(synced.lines[0].segments!.map(segment => segment.text)).toEqual(['Morning ', 'rises — ', 'over ', 'silver ', 'mountains']);
	});

	it('withholds word timings it withholds line timings for', () => {
		const alignment = alignment_for(LINES, LINES.map((_, i) => start(i)), LINES.map(() => 'nobody knows anything about this'));
		expect(LetterSync.word_sync(LINES.join('\n'), alignment)).toBeNull();
	});

	it('word syncs line synced lyrics within their own timestamps', () => {
		const alignment = alignment_for(LINES, LINES.map((_, i) => start(i)));
		const onsets = alignment.words.words.map(w => w.start_ms);
		// Timestamps a little off, as sources' are
		const lined = { sync_type: 'LINE' as const, lines: LINES.map((text, i): LyricsLine & { translated: string } => ({ text, start_ms: start(i) + (i % 2 === 0 ? 300 : -300), end_ms: null, translated: 'x' })) };
		const synced = LetterSync.word_sync_lines(lined, alignment)!;
		expect(synced.sync_type).toBe('WORD');
		synced.lines.forEach((line, i) => {
			expect(line.translated).toBe('x');
			expect(line.start_ms).toBe(lined.lines[i].start_ms);
			expect(line.segments!.map(segment => segment.text).join('')).toBe(line.text);
		});
		synced.lines.flatMap(line => line.segments!).forEach((segment, i) => expect(Math.abs(segment.start_ms - onsets[i])).toBeLessThanOrEqual(40));
	});

	it('gives null for line synced lyrics the vocals don\'t sing', () => {
		const alignment = alignment_for(LINES, LINES.map((_, i) => start(i)));
		const other = ['Quick brown foxes jumping', 'Lazy dogs sleeping', 'Zebras munch jicama', 'Vexed wizards quiz judges', 'Black sphinx of quartz', 'Judge my vow', 'Pack my box', 'Five dozen liquor jugs'];
		const lined = { sync_type: 'LINE' as const, lines: other.map((text, i) => ({ text, start_ms: start(i), end_ms: null })) };
		expect(LetterSync.word_sync_lines(lined, alignment)).toBeNull();
		expect(LetterSync.word_sync_lines({ ...lined, sync_type: 'NONE' }, alignment)).toBeNull();
	});

	it('needs two alignable lines and an intact analysis', () => {
		const alignment = alignment_for(LINES, LINES.map((_, i) => start(i)));
		expect(LetterSync.place('Oh oh\nLa la la', alignment)).toBeNull();
		expect(LetterSync.place(LINES.join('\n'), { ...alignment, loudness: base64(new Uint8Array(3)) })).toBeNull();
	});
});
