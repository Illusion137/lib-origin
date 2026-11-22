import type { HeardWord, LyricsLine, LyricsSegment, ParsedLyrics, TrackVocals } from '@origin/illusi/types';

export namespace LyricsAlign {
	export type VocalActivity = Pick<TrackVocals, 'hop_ms' | 'window_ms' | 'duration_ms' | 'voice' | 'segments'>;
	export type HeardVocals = VocalActivity & Pick<TrackVocals, 'rhythm' | 'words' | 'speech' | 'beat_grid'>;
	/** Parsed lyrics whose lines may carry more than a LyricsLine, such as a translation */
	export type Lined<L extends LyricsLine = LyricsLine> = Omit<ParsedLyrics, 'lines'> & { lines: L[] };

	const STEP_MS = 250;
	const VOICE_LOW = 0.3;
	const VOICE_HIGH = 0.7;
	const MIN_MS_PER_SYLLABLE = 90;
	const MIN_SONG_MS_PER_SYLLABLE = 100;
	const MAX_SONG_MS_PER_SYLLABLE = 900;
	const MAX_LINE_VOICED_MS = 14_000;
	const MAX_LINE_CELLS = 480;
	const SECTION_GAP_MS = 3_000;
	const INNER_GAP_MS = 2_500;
	const RATE_PASSES = 3;
	const RATE_PRIOR_SYLLABLES = 12;

	const W_RATE = 1;
	const W_ONSET = 0.6;
	const W_SILENT_START = 2;
	const W_SECTION = 0.8;
	const W_INNER_GAP = 0.5;

	const LINE_RATE_TOLERANCE = Math.log(2.2);
	const MIN_FITTING_LINES = 0.75;
	const MIN_VOICED_STARTS = 0.8;
	const MAX_MEAN_LINE_COST = 1.2;
	const MAX_VOICED_SHARE = 0.875;
	const MIN_WORD_SYNCED_LINES = 0.75;
	/** Lines often run on into a pause before the next one, so the singing rate is read from the quicker lines */
	const SYLLABLE_RATE_QUANTILE = 0.25;
	const MIN_ESTIMATED_MS_PER_SYLLABLE = 150;
	const MAX_ESTIMATED_MS_PER_SYLLABLE = 450;

	const HEADER = /^\s*\[[^\]]*\]\s*$/;
	const CJK_CHAR = /[぀-ヿ㐀-䶿一-鿿가-힯豈-﫿]/;
	const CJK_CHARS = new RegExp(CJK_CHAR.source, 'g');

	export interface SungLine {
		text: string;
		section_start: boolean;
	}

	export function is_header(line: string): boolean {
		return HEADER.test(line);
	}

	export function sung_lines(plain: string): SungLine[] {
		const lines: SungLine[] = [];
		let section_start = true;
		for (const line of plain.split(/\r?\n/)) {
			const text = line.trim();
			if (text === '' || is_header(text)) {
				section_start = true;
				continue;
			}
			lines.push({ text, section_start });
			section_start = false;
		}
		return lines;
	}

	/** Lowercase letters and digits only, accents removed */
	function bare_word(word: string): string {
		return word.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
	}

	export function word_syllables(word: string): number {
		const cjk = word.match(CJK_CHARS)?.length ?? 0;
		const w = bare_word(word);
		if (w === '') return cjk;
		if (/^\d+$/.test(w)) return cjk + w.length;
		let count = w.match(/[aeiouy]+/g)?.length ?? 1;
		if (count > 1) {
			if (w.length > 2 && w.endsWith('e') && !w.endsWith('le') && !/[aeiouy]e$/.test(w)) count--;
			else if (/[^aeiouytd]ed$/.test(w)) count--;
			else if (/[^aeiouysxzgc]es$/.test(w) && !/(ch|sh)es$/.test(w)) count--;
		}
		return cjk + Math.max(1, count);
	}

	export function line_syllables(text: string): number {
		let total = 0;
		let depth = 0;
		for (const token of text.split(/(\(|\)|\s+)/)) {
			if (token === '(') depth++;
			else if (token === ')') depth = Math.max(0, depth - 1);
			else total += word_syllables(token) * (depth > 0 ? 0.5 : 1);
		}
		return Math.max(1, total);
	}

	export function line_words(text: string): string[] {
		const words: string[] = [];
		for (const token of text.match(/\S+\s*/g) ?? []) {
			if (!CJK_CHAR.test(token)) {
				words.push(token);
				continue;
			}
			for (const char of token) {
				if (CJK_CHAR.test(char) || words.length === 0) words.push(char);
				else words[words.length - 1] += char;
			}
		}
		return words;
	}

	interface Grid {
		length: number;
		/** How voiced each STEP_MS cell is, 0-1 */
		voiced: Float64Array;
		/** Voiced milliseconds before each cell; length + 1 entries */
		cum: Float64Array;
		/** How much each cell looks like the start of singing, 0-1 */
		onset: Float64Array;
		/** Silent milliseconds right before each cell */
		silence_before: Float64Array;
	}

	/** Voice probabilities with lone spikes and dips removed (median of five windows) */
	function smoothed_voice(voice: readonly number[]): number[] {
		return voice.map((_, i) => voice.slice(Math.max(0, i - 2), i + 3).sort((a, b) => a - b)[Math.min(2, Math.floor((Math.min(voice.length, i + 3) - Math.max(0, i - 2)) / 2))]);
	}

	function voice_at(vocals: VocalActivity, voice: readonly number[], ms: number): number {
		const { hop_ms, window_ms } = vocals;
		if (voice.length === 0) return 0;
		// Window i is best read at its centre
		const position = (ms - window_ms / 2) / hop_ms;
		if (position <= 0) return voice[0];
		if (position >= voice.length - 1) return voice[voice.length - 1];
		const i = Math.floor(position);
		return voice[i] + (voice[i + 1] - voice[i]) * (position - i);
	}

	function grid_of(vocals: VocalActivity): Grid {
		const length = Math.max(1, Math.ceil(vocals.duration_ms / STEP_MS));
		const voiced = new Float64Array(length);
		const cum = new Float64Array(length + 1);
		const onset = new Float64Array(length);
		const silence_before = new Float64Array(length);
		const voice = smoothed_voice(vocals.voice);
		for (let g = 0; g < length; g++) {
			const p = voice_at(vocals, voice, g * STEP_MS + STEP_MS / 2);
			voiced[g] = Math.min(1, Math.max(0, (p - VOICE_LOW) / (VOICE_HIGH - VOICE_LOW)));
			cum[g + 1] = cum[g] + voiced[g] * STEP_MS;
		}
		for (let g = 0; g < length; g++) {
			let before = 1;
			for (let k = Math.max(0, g - 4); k < g; k++) before = Math.min(before, voiced[k]);
			onset[g] = g === 0 ? voiced[0] : Math.max(0, voiced[g] - before);
			silence_before[g] = g === 0 ? 0 : voiced[g - 1] < 0.5 ? silence_before[g - 1] + STEP_MS : 0;
		}
		for (const segment of vocals.segments) {
			const g = Math.round(segment.start_ms / STEP_MS);
			for (let k = g - 1; k <= g + 1; k++) {
				if (k >= 0 && k < length) onset[k] = Math.max(onset[k], k === g ? 1 : 0.5);
			}
		}
		return { length, voiced, cum, onset, silence_before };
	}

	/** Voiced share of the second after `g` */
	function voiced_ahead(grid: Grid, g: number): number {
		const end = Math.min(grid.length, g + 4);
		return end > g ? (grid.cum[end] - grid.cum[g]) / ((end - g) * STEP_MS) : 0;
	}

	function last_voiced_cell(grid: Grid, from: number, to: number): number {
		for (let g = Math.min(to, grid.length) - 1; g >= from; g--) if (grid.voiced[g] >= 0.5) return g;
		return -1;
	}

	/** Share of cells voiced from the first voiced cell until `end`; near 1 when the vocal model hears singing through every pause */
	function voiced_share(grid: Grid, end: number): number {
		let first = 0;
		while (first < end && grid.voiced[first] < 0.5) first++;
		let voiced = 0;
		for (let g = first; g < end; g++) if (grid.voiced[g] >= 0.5) voiced++;
		return end > first ? voiced / (end - first) : 0;
	}

	/**
	 * Line timings for plain lyrics, or null when the vocals don't fit them well. Lines are placed by dynamic programming:
	 * each line should take voiced time in proportion to its syllables, start where singing starts, and new sections
	 * should follow a pause.
	 */
	export function line_sync(plain: string, vocals: VocalActivity): ParsedLyrics | null {
		const lines = sung_lines(plain);
		if (lines.length < 2 || vocals.voice.length === 0) return null;
		const grid = grid_of(vocals);
		const syllables = lines.map(line => line_syllables(line.text));
		const total_syllables = syllables.reduce((a, b) => a + b, 0);
		const ms_per_syllable = grid.cum[grid.length] / total_syllables;
		if (ms_per_syllable < MIN_SONG_MS_PER_SYLLABLE || ms_per_syllable > MAX_SONG_MS_PER_SYLLABLE) return null;

		const end = last_voiced_cell(grid, 0, grid.length) + 1;
		if (end <= 0) return null;
		if (voiced_share(grid, end) > MAX_VOICED_SHARE) return null;
		const n = lines.length;
		const size = grid.length;

		// Voiced milliseconds each line should take; starts at the song's average rate, then each section's own
		const expected = Float64Array.from(syllables, count => count * ms_per_syllable);
		const rate_cost = (line: number, from: number, to: number) => {
			const ratio = Math.log((grid.cum[to] - grid.cum[from] + 200) / (expected[line] + 200));
			return W_RATE * ratio * ratio;
		};
		const start_cost = (line: number, g: number) => {
			let cost = W_ONSET * (1 - grid.onset[g]) + W_SILENT_START * (1 - voiced_ahead(grid, g));
			const gap = grid.silence_before[g];
			if (lines[line].section_start) cost -= W_SECTION * Math.min(gap, SECTION_GAP_MS) / SECTION_GAP_MS;
			else if (gap > INNER_GAP_MS) cost += W_INNER_GAP * Math.min(gap - INNER_GAP_MS, 5_000) / 5_000;
			return cost;
		};
		const min_cells = (line: number) => Math.max(1, Math.ceil(syllables[line] * MIN_MS_PER_SYLLABLE / STEP_MS));

		const dp = new Float64Array(n * size);
		const back = new Int32Array(n * size);
		const place = (): { starts: number[]; total: number } | null => {
			dp.fill(Infinity);
			back.fill(-1);
			for (let g = 0; g < end; g++) dp[g] = start_cost(0, g);
			for (let i = 1; i < n; i++) {
				const shortest = min_cells(i - 1);
				for (let g = shortest; g < end; g++) {
					let best = Infinity;
					let best_h = -1;
					for (let h = g - shortest; h >= 0 && g - h <= MAX_LINE_CELLS; h--) {
						const previous = dp[(i - 1) * size + h];
						if (previous !== Infinity) {
							const cost = previous + rate_cost(i - 1, h, g);
							if (cost < best) {
								best = cost;
								best_h = h;
							}
						}
						if (grid.cum[g] - grid.cum[h] > MAX_LINE_VOICED_MS) break;
					}
					if (best_h === -1) continue;
					dp[i * size + g] = best + start_cost(i, g);
					back[i * size + g] = best_h;
				}
			}
			let total = Infinity;
			let last = -1;
			for (let g = 0; g < end; g++) {
				const cost = dp[(n - 1) * size + g] + rate_cost(n - 1, g, end);
				if (cost < total) {
					total = cost;
					last = g;
				}
			}
			if (last === -1) return null;
			const starts = new Array<number>(n);
			starts[n - 1] = last;
			for (let i = n - 1; i > 0; i--) starts[i - 1] = back[i * size + starts[i]];
			return { starts, total };
		};

		// Verses and choruses are often sung at different speeds, so each pass re-estimates every section's rate from
		// where the previous pass put its lines (pulled toward the song's average when the section is short)
		const sections: number[][] = [];
		for (let i = 0; i < n; i++) {
			if (lines[i].section_start || sections.length === 0) sections.push([]);
			sections[sections.length - 1].push(i);
		}
		let placed = place();
		for (let pass = 1; pass < RATE_PASSES && placed !== null; pass++) {
			const { starts } = placed;
			for (const section of sections) {
				const first = section[0];
				const after = section[section.length - 1] + 1;
				const voiced = grid.cum[after < n ? starts[after] : end] - grid.cum[starts[first]];
				const count = section.reduce((sum, i) => sum + syllables[i], 0);
				const rate = (voiced + RATE_PRIOR_SYLLABLES * ms_per_syllable) / (count + RATE_PRIOR_SYLLABLES);
				const clamped = Math.min(ms_per_syllable * 2, Math.max(ms_per_syllable / 2, rate));
				for (const i of section) expected[i] = syllables[i] * clamped;
			}
			placed = place();
		}
		if (placed === null) return null;
		const { starts, total } = placed;

		let fitting = 0;
		let voiced_starts = 0;
		for (let i = 0; i < n; i++) {
			const to = i + 1 < n ? starts[i + 1] : end;
			if (Math.abs(Math.log((grid.cum[to] - grid.cum[starts[i]] + 200) / (expected[i] + 200))) <= LINE_RATE_TOLERANCE) fitting++;
			if (voiced_ahead(grid, starts[i]) >= 0.5) voiced_starts++;
		}
		if (fitting / n < MIN_FITTING_LINES || voiced_starts / n < MIN_VOICED_STARTS || total / n > MAX_MEAN_LINE_COST) return null;

		return {
			sync_type: 'LINE',
			lines: lines.map((line, i): LyricsLine => {
				const to = i + 1 < n ? starts[i + 1] : end;
				const sung_until = last_voiced_cell(grid, starts[i], to);
				return { text: line.text, start_ms: starts[i] * STEP_MS, end_ms: (sung_until === -1 ? to : sung_until + 1) * STEP_MS };
			})
		};
	}

	/** Word timings spread over the voiced time from `start_ms`, skipping pauses longer than 750 ms */
	function spread_words(grid: Grid, words: string[], start_ms: number, end_ms: number): LyricsSegment[] {
		const weights = words.map(word => Math.max(0.5, word_syllables(word)));
		const total = weights.reduce((a, b) => a + b, 0);
		const first = Math.floor(start_ms / STEP_MS);
		const last = Math.max(first + 1, Math.ceil(end_ms / STEP_MS));
		const voiced = Array.from({ length: last - first }, (_, c) => first + c < grid.length ? grid.voiced[first + c] : 0);
		// Each silent cell's run length, so long pauses get almost no time while short dips still do
		const silent_run = new Array<number>(voiced.length).fill(0);
		for (let c = 0; c < voiced.length;) {
			let run_end = c;
			while (run_end < voiced.length && voiced[run_end] < 0.5) run_end++;
			for (let k = c; k < run_end; k++) silent_run[k] = run_end - c;
			c = Math.max(run_end, c + 1);
		}
		const cell_weight = voiced.map((v, c) => v >= 0.5 ? v : silent_run[c] > 3 ? 0.02 : Math.max(0.15, v));
		const weight_total = cell_weight.reduce((a, b) => a + b, 0);
		const time_at = (share: number) => {
			let remaining = share * weight_total;
			for (let c = 0; c < cell_weight.length; c++) {
				if (remaining <= cell_weight[c]) {
					const cell_start = Math.max(start_ms, (first + c) * STEP_MS);
					const cell_end = Math.min(end_ms, (first + c + 1) * STEP_MS);
					return cell_start + (cell_end - cell_start) * (cell_weight[c] === 0 ? 0 : remaining / cell_weight[c]);
				}
				remaining -= cell_weight[c];
			}
			return end_ms;
		};
		const segments: LyricsSegment[] = [];
		let before = 0;
		for (let i = 0; i < words.length; i++) {
			segments.push({ text: words[i], start_ms: Math.round(time_at(before / total)), end_ms: null });
			before += weights[i];
		}
		for (let i = 0; i < segments.length; i++) segments[i].end_ms = i + 1 < segments.length ? segments[i + 1].start_ms : Math.round(end_ms);
		return segments;
	}

	/**
	 * Word timings for line synced lyrics, or null when too few lines fit the vocals. A line's words share the voiced
	 * time between its start and where its singing stops, in proportion to their syllables.
	 */
	export function word_sync<L extends LyricsLine>(lyrics: Lined<L>, vocals: VocalActivity): Lined<L> | null {
		if (vocals.voice.length === 0) return null;
		const timed = lyrics.lines.map((line, index) => ({ line, index })).filter(({ line }) => line.start_ms !== null && !is_header(line.text) && line.text.trim() !== '');
		if (timed.length === 0) return null;
		const grid = grid_of(vocals);
		// Until the next line starts, or the line's own end when the source has one
		const span_end = (k: number) => {
			const { start_ms, end_ms } = timed[k].line;
			const next = Math.min(timed[k + 1]?.line.start_ms ?? vocals.duration_ms, vocals.duration_ms);
			return end_ms !== null && end_ms > start_ms! ? Math.min(end_ms, next) : next;
		};

		let voiced_total = 0;
		let syllable_total = 0;
		for (let k = 0; k < timed.length; k++) {
			const from = Math.floor(timed[k].line.start_ms! / STEP_MS);
			const to = Math.min(grid.length, Math.ceil(span_end(k) / STEP_MS));
			if (to > from) voiced_total += grid.cum[to] - grid.cum[from];
			syllable_total += line_syllables(timed[k].line.text);
		}
		const ms_per_syllable = voiced_total / syllable_total;
		if (ms_per_syllable < MIN_SONG_MS_PER_SYLLABLE || ms_per_syllable > MAX_SONG_MS_PER_SYLLABLE) return null;

		const lines = lyrics.lines.map(line => ({ ...line }));
		let fitting = 0;
		for (let k = 0; k < timed.length; k++) {
			const { line, index } = timed[k];
			const start = line.start_ms!;
			const limit = span_end(k);
			const syllables = line_syllables(line.text);
			const expected = syllables * ms_per_syllable;
			const from = Math.floor(start / STEP_MS);
			const sung_until = last_voiced_cell(grid, from, Math.ceil(limit / STEP_MS));
			const voiced = sung_until === -1 ? 0 : grid.cum[sung_until + 1] - grid.cum[from];
			const sung_ms = sung_until === -1 ? 0 : (sung_until + 1) * STEP_MS - start;
			const fits = voiced >= expected * 0.35 && sung_ms / syllables >= MIN_MS_PER_SYLLABLE && Math.abs(Math.log((voiced + 200) / (expected + 200))) <= LINE_RATE_TOLERANCE;
			if (fits) fitting++;
			// A line that doesn't fit gets its words over the time its syllables predict
			const end = Math.min(limit, start + Math.max(syllables * MIN_MS_PER_SYLLABLE, fits ? Math.min(sung_ms, expected * 2.5) : expected));
			lines[index].segments = spread_words(grid, line_words(line.text), start, Math.max(end, start + STEP_MS));
			lines[index].end_ms ??= Math.round(end);
		}
		if (fitting / timed.length < MIN_WORD_SYNCED_LINES) return null;
		return { ...lyrics, sync_type: 'WORD', lines };
	}

	/** Word timings that split `start_ms`-`end_ms` between the words by their syllables */
	function even_words(words: string[], start_ms: number, end_ms: number): LyricsSegment[] {
		const weights = words.map(word => Math.max(0.5, word_syllables(word)));
		const total = weights.reduce((a, b) => a + b, 0);
		const segments: LyricsSegment[] = [];
		let before = 0;
		for (let i = 0; i < words.length; i++) {
			const start = Math.round(start_ms + (end_ms - start_ms) * before / total);
			before += weights[i];
			segments.push({ text: words[i], start_ms: start, end_ms: Math.round(start_ms + (end_ms - start_ms) * before / total) });
		}
		return segments;
	}

	/**
	 * Word timings for line synced lyrics from their syllables alone, for when there are no vocals to go by. A line
	 * is sung at the song's rate from its start, or over its own span when the source gives its end.
	 */
	export function syllable_word_sync<L extends LyricsLine>(lyrics: Lined<L>): Lined<L> | null {
		const timed = lyrics.lines.map((line, index) => ({ line, index })).filter(({ line }) => line.start_ms !== null && !is_header(line.text) && line.text.trim() !== '');
		if (timed.length === 0) return null;
		const own_end = (k: number) => {
			const { start_ms, end_ms } = timed[k].line;
			const next = timed[k + 1]?.line.start_ms ?? Infinity;
			return end_ms !== null && end_ms > start_ms! && end_ms <= next ? end_ms : null;
		};
		const span_end = (k: number) => own_end(k) ?? timed[k + 1]?.line.start_ms ?? Infinity;

		const rates = timed.map(({ line }, k) => (span_end(k) - line.start_ms!) / line_syllables(line.text)).filter(rate => Number.isFinite(rate) && rate > 0).sort((a, b) => a - b);
		const quantile = rates[Math.floor(SYLLABLE_RATE_QUANTILE * (rates.length - 1))] ?? DEFAULT_MS_PER_SYLLABLE;
		const ms_per_syllable = Math.min(MAX_ESTIMATED_MS_PER_SYLLABLE, Math.max(MIN_ESTIMATED_MS_PER_SYLLABLE, quantile));

		const lines = lyrics.lines.map(line => ({ ...line }));
		for (let k = 0; k < timed.length; k++) {
			const { line, index } = timed[k];
			const start = line.start_ms!;
			const syllables = line_syllables(line.text);
			const end = own_end(k) ?? Math.min(span_end(k), start + syllables * Math.max(ms_per_syllable, MIN_MS_PER_SYLLABLE));
			lines[index].segments = even_words(line_words(line.text), start, Math.max(end, start + STEP_MS));
			lines[index].end_ms ??= Math.round(end);
		}
		return { ...lyrics, sync_type: 'WORD', lines };
	}

	const BAR_OPTIONS: readonly [bars: number, penalty: number][] = [[1, 0], [0.5, 0.6], [1.5, 0.8], [2, 0.6]];
	const LINE_BEATS = [2, 4, 8];
	const W_BAR = 8;
	const W_GAP_SECTION = 0.3;
	const W_GAP_INNER = 1.5;
	const W_GAP_VOICED = 1;
	const MAX_LINE_BARS = 18;

	export interface BeatFit { lyrics: ParsedLyrics; cost: number; beats_per_line: number }

	/**
	 * Line timings for rap and other music where lines land on the beat: each line starts on a beat or half beat and
	 * usually lasts one bar (2, 4 or 8 beats, whichever fits best). `pull` lowers the cost of starting a line at a time,
	 * for lines whose start is roughly known.
	 */
	export function beat_line_sync(plain: string, vocals: VocalActivity, beats: readonly number[], pull?: (line: number, ms: number) => number): BeatFit | null {
		const lines = sung_lines(plain);
		if (lines.length < 2 || beats.length < 8 || vocals.voice.length === 0) return null;
		const grid = grid_of(vocals);
		const end_cell = last_voiced_cell(grid, 0, grid.length) + 1;
		if (end_cell <= 0) return null;
		let first_cell = 0;
		while (first_cell < end_cell && grid.voiced[first_cell] < 0.5) first_cell++;
		const half_beats: number[] = [];
		for (let i = 0; i + 1 < beats.length; i++) half_beats.push(beats[i], (beats[i] + beats[i + 1]) / 2);
		half_beats.push(beats[beats.length - 1]);
		const from_ms = first_cell * STEP_MS - 2000;
		const to_ms = end_cell * STEP_MS;
		const at = half_beats.filter(t => t >= from_ms && t <= to_ms);
		if (at.length < lines.length + 1) return null;
		const beat_ms = (beats[beats.length - 1] - beats[0]) / (beats.length - 1);
		const syllables = lines.map(line => line_syllables(line.text));
		const typical = [...syllables].sort((a, b) => a - b)[syllables.length >> 1];
		const cell_of = (ms: number) => Math.min(grid.length - 1, Math.max(0, Math.round(ms / STEP_MS)));
		const voiced_ms = (from: number, to: number) => {
			const f = Math.max(0, Math.floor(from / STEP_MS));
			const t = Math.min(grid.length, Math.ceil(to / STEP_MS));
			return t > f ? grid.cum[t] - grid.cum[f] : 0;
		};
		const n = lines.length;
		const m = at.length;
		const start_costs = new Float64Array(n * m);
		for (let i = 0; i < n; i++) {
			for (let p = 0; p < m; p++) {
				const g = cell_of(at[p]);
				let cost = W_ONSET * (1 - grid.onset[g]) + W_SILENT_START * (1 - voiced_ahead(grid, g));
				if (lines[i].section_start) cost -= W_SECTION * Math.min(grid.silence_before[g], SECTION_GAP_MS) / SECTION_GAP_MS;
				if (pull) cost -= pull(i, at[p]);
				start_costs[i * m + p] = cost;
			}
		}

		// What a line's cost depends on besides its span: whether its syllables suggest a short or long line, and whether a
		// new section follows
		const kinds = lines.map((_, i) => {
			const ratio = syllables[i] / typical;
			return (ratio < 0.6 ? 2 : ratio > 1.4 ? 4 : 0) + (lines[i + 1]?.section_start ? 1 : 0);
		});
		const cum_from = (ms: number) => grid.cum[Math.min(grid.length, Math.max(0, Math.floor(ms / STEP_MS)))];
		const cum_to = (ms: number) => grid.cum[Math.min(grid.length, Math.max(0, Math.ceil(ms / STEP_MS)))];

		const fit = (beats_per_line: number) => {
			const bar = beats_per_line * beat_ms;
			const half_beat = beat_ms / 2;
			const max_span = MAX_LINE_BARS * bar;
			const hint = (kind: number, bars: number) => (bars < 1 && (kind & 2) !== 0) || (bars > 1 && (kind & 4) !== 0) ? -0.4 : 0;
			const gap_cost = (kind: number) => (kind & 1) !== 0 ? W_GAP_SECTION : W_GAP_INNER;
			// A line usually takes a bar; shorter or longer ones are allowed at a cost, cheaper when its syllables suggest it
			const line_cost = (kind: number, from: number, to: number) => {
				const duration = to - from;
				let best = Infinity;
				for (const [bars, penalty] of BAR_OPTIONS) {
					const want = bars * bar;
					if (duration < want - 1.5 * half_beat) continue;
					const r = Math.log(Math.min(duration, want) / want);
					let cost = W_BAR * r * r + penalty + hint(kind, bars);
					// Time left over is a pause, which should be quiet and is cheaper before a new section
					if (duration - want > half_beat) cost += gap_cost(kind) + W_GAP_VOICED * voiced_ms(from + want, to) / bar;
					best = Math.min(best, cost);
				}
				return best;
			};
			// Past `near_span` every option fits with a pause after it, so a line's cost is a part from where it starts
			// (`far_from`) plus a part from where the next line starts; the best earlier start is then a sliding minimum
			const near_span = 2 * bar + half_beat;
			const near_start = new Int32Array(m);
			const near_offset = new Int32Array(m + 1);
			for (let p = 0, q = 0; p < m; p++) {
				while (at[p] - at[q] > near_span) q++;
				near_start[p] = q;
				near_offset[p + 1] = near_offset[p] + p - q;
			}
			const near_costs = new Map<number, Float64Array>();
			const far_costs = new Map<number, Float64Array>();
			const near_of = (kind: number) => {
				let table = near_costs.get(kind);
				if (!table) {
					table = new Float64Array(near_offset[m]);
					for (let p = 0; p < m; p++) for (let q = near_start[p]; q < p; q++) table[near_offset[p] + p - 1 - q] = line_cost(kind, at[q], at[p]);
					near_costs.set(kind, table);
				}
				return table;
			};
			const far_of = (kind: number) => {
				let table = far_costs.get(kind);
				if (!table) {
					table = new Float64Array(m);
					for (let q = 0; q < m; q++) {
						let best = Infinity;
						for (const [bars, penalty] of BAR_OPTIONS) best = Math.min(best, penalty + hint(kind, bars) - W_GAP_VOICED * cum_from(at[q] + bars * bar) / bar);
						table[q] = best;
					}
					far_costs.set(kind, table);
				}
				return table;
			};

			const dp = new Float64Array(n * m).fill(Infinity);
			const back = new Int32Array(n * m).fill(-1);
			const queue = new Int32Array(m);
			const queued = new Float64Array(m);
			for (let p = 0; p < m; p++) dp[p] = start_costs[p] + W_GAP_VOICED * voiced_ms(from_ms, at[p]) / bar;
			for (let i = 1; i < n; i++) {
				const previous = (i - 1) * m;
				const kind = kinds[i - 1];
				const near = near_of(kind);
				const far = far_of(kind);
				const gap = gap_cost(kind);
				let head = 0;
				let tail = 0;
				let added = 0;
				for (let p = 1; p < m; p++) {
					// Ties go to the latest start, near before far, like a scan from p - 1 down
					for (; added < near_start[p]; added++) {
						if (dp[previous + added] === Infinity) continue;
						const value = dp[previous + added] + far[added];
						while (tail > head && queued[queue[tail - 1]] >= value) tail--;
						queued[added] = value;
						queue[tail++] = added;
					}
					while (tail > head && at[p] - at[queue[head]] > max_span) head++;
					let best = Infinity;
					let best_q = -1;
					for (let q = p - 1; q >= near_start[p]; q--) {
						const before = dp[previous + q];
						if (before === Infinity) continue;
						const cost = before + near[near_offset[p] + p - 1 - q];
						if (cost < best) {
							best = cost;
							best_q = q;
						}
					}
					if (tail > head) {
						const cost = queued[queue[head]] + gap + W_GAP_VOICED * cum_to(at[p]) / bar;
						if (cost < best) {
							best = cost;
							best_q = queue[head];
						}
					}
					if (best_q < 0) continue;
					dp[i * m + p] = best + start_costs[i * m + p];
					back[i * m + p] = best_q;
				}
			}
			let total = Infinity;
			let last = -1;
			for (let p = 0; p < m; p++) {
				const v = dp[(n - 1) * m + p];
				if (v === Infinity) continue;
				const cost = v + W_GAP_VOICED * voiced_ms(at[p] + bar, to_ms) / bar;
				if (cost < total) {
					total = cost;
					last = p;
				}
			}
			if (last < 0) return null;
			const index = new Array<number>(n);
			index[n - 1] = last;
			for (let i = n - 1; i > 0; i--) index[i - 1] = back[i * m + index[i]];
			return { starts: index.map(p => at[p]), cost: total / n, beats_per_line };
		};

		let best: ReturnType<typeof fit> = null;
		for (const beats_per_line of LINE_BEATS) {
			const r = fit(beats_per_line);
			if (r && (!best || r.cost < best.cost)) best = r;
		}
		if (!best) return null;
		const { starts, beats_per_line } = best;
		return {
			cost: best.cost,
			beats_per_line,
			lyrics: {
				sync_type: 'LINE',
				lines: lines.map((line, i): LyricsLine => ({
					text: line.text,
					start_ms: Math.round(starts[i]),
					end_ms: Math.round(i + 1 < n ? starts[i + 1] : Math.min(to_ms, starts[i] + 2 * beats_per_line * beat_ms))
				}))
			}
		};
	}

	const MIN_WORD_SIMILARITY = 0.6;
	const SKIP_COST = 0.05;
	const MIN_ANCHOR_LETTERS = 3;
	const DEFAULT_MS_PER_SYLLABLE = 220;
	const PULL_WEIGHT = 2;
	const PULL_SIGMA_MS = 700;
	const MAX_ERROR_MS = 10_000;
	const MIN_ANCHORED_LINES = 0.5;
	/** Share of heard words (3+ letters) that must match the lyrics; another song's lyrics still match common words */
	const MIN_HEARD_MATCHED = 0.4;
	const MAX_HELD_OUT_ERROR_MS = 3_000;
	const MIN_LATIN_WORDS = 0.5;

	/** A lyric word heard by Whisper at `ms` */
	export interface Anchor { line: number; word: number; ms: number }

	interface LyricWord { line: number; word: number; text: string; syllables_before: number }

	/** The words of each sung line, without parenthesized ad-libs */
	function lyric_words(lines: readonly SungLine[]): LyricWord[] {
		const out: LyricWord[] = [];
		lines.forEach((line, l) => {
			let before = 0;
			let word = 0;
			for (const raw of line.text.replace(/\([^)]*\)/g, ' ').split(/\s+/)) {
				const text = bare_word(raw);
				if (!text) continue;
				out.push({ line: l, word: word++, text, syllables_before: before });
				before += word_syllables(raw);
			}
		});
		return out;
	}

	/** Every word Whisper might hear, in order: the lyric words, and the parenthesized ad-libs between them (`word` -1) */
	function heard_candidates(lines: readonly SungLine[]): LyricWord[] {
		const main = lyric_words(lines);
		const out: LyricWord[] = [];
		let k = 0;
		lines.forEach((line, l) => {
			for (const group of line.text.matchAll(/\(([^)]*)\)/g)) {
				const before = line.text.slice(0, group.index).replace(/\([^)]*\)/g, ' ').split(/\s+/).filter(raw => bare_word(raw)).length;
				while (k < main.length && main[k].line === l && main[k].word < before) out.push(main[k++]);
				for (const raw of group[1].split(/\s+/)) {
					const text = bare_word(raw);
					if (text) out.push({ line: l, word: -1, text, syllables_before: 0 });
				}
			}
			while (k < main.length && main[k].line === l) out.push(main[k++]);
		});
		return out;
	}

	/** 1 minus the edit distance over the longer length */
	function similarity(a: string, b: string): number {
		if (a === b) return 1;
		if (a.length === 0 || b.length === 0) return 0;
		let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
		for (let i = 1; i <= a.length; i++) {
			const current = [i];
			for (let j = 1; j <= b.length; j++) current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
			previous = current;
		}
		return 1 - previous[b.length] / Math.max(a.length, b.length);
	}

	/**
	 * Lyric words matched in order to the words Whisper heard (fuzzy, so mishearings still match), keeping only words of
	 * three letters or more. Long, confidently heard words weigh most.
	 */
	export function anchors(lines: readonly SungLine[], heard: readonly HeardWord[]): Anchor[] {
		const lyric = heard_candidates(lines);
		const words = heard.map(w => ({ ms: w.start_ms, p: w.probability, text: bare_word(w.text) })).filter(w => w.text);
		const n = lyric.length;
		const m = words.length;
		const match = (i: number, j: number) => {
			const a = lyric[i].text;
			const b = words[j].text;
			if (Math.abs(a.length - b.length) > Math.max(a.length, b.length) / 2) return 0;
			const r = similarity(a, b);
			return r >= MIN_WORD_SIMILARITY ? r : 0;
		};
		const score = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
		// 1: skip a lyric word, 2: skip a heard word, 3: match
		const back = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1));
		// Ad-libs are often left out of the singing (or the transcript), so skipping one is free
		const skip = (i: number) => lyric[i - 1].word < 0 ? 0 : SKIP_COST;
		for (let i = 1; i <= n; i++) {
			score[i][0] = score[i - 1][0] - skip(i);
			back[i][0] = 1;
		}
		for (let j = 1; j <= m; j++) back[0][j] = 2;
		for (let i = 1; i <= n; i++) {
			for (let j = 1; j <= m; j++) {
				let best = score[i - 1][j] - skip(i);
				let from = 1;
				// Whatever Whisper hears after the last lyric is free
				const skip_heard = score[i][j - 1] - (i === n ? 0 : SKIP_COST);
				if (skip_heard > best) {
					best = skip_heard;
					from = 2;
				}
				const r = match(i - 1, j - 1);
				if (r > 0) {
					const take = score[i - 1][j - 1] + r * Math.min(1, lyric[i - 1].text.length / 4) * (0.5 + words[j - 1].p);
					if (take > best) {
						best = take;
						from = 3;
					}
				}
				score[i][j] = best;
				back[i][j] = from;
			}
		}
		const out: Anchor[] = [];
		for (let i = n, j = m; i > 0 && j > 0;) {
			const from = back[i][j];
			if (from === 3) {
				const w = lyric[i - 1];
				if (w.word >= 0 && w.text.length >= MIN_ANCHOR_LETTERS) out.push({ line: w.line, word: w.word, ms: words[j - 1].ms });
				i--;
				j--;
			} else if (from === 1) i--;
			else j--;
		}
		return out.reverse();
	}

	/** The song's pace, from anchored words in the same line */
	function anchored_ms_per_syllable(before: ReadonlyMap<string, number>, found: readonly Anchor[]): number {
		const rates: number[] = [];
		for (let k = 1; k < found.length; k++) {
			const a = found[k - 1];
			const b = found[k];
			if (a.line !== b.line) continue;
			const syllables = before.get(`${b.line}:${b.word}`)! - before.get(`${a.line}:${a.word}`)!;
			if (syllables > 0) rates.push((b.ms - a.ms) / syllables);
		}
		const sorted = rates.filter(r => r > 60 && r < 1500).sort((x, y) => x - y);
		return sorted.length >= 5 ? sorted[sorted.length >> 1] : DEFAULT_MS_PER_SYLLABLE;
	}

	export type Estimator = 'first' | 'median';

	/**
	 * Where each anchored line starts: each anchored word implies a start, back by the syllables before it at the
	 * song's pace. 'first' trusts the first anchored word, 'median' takes the median of the first four. Lines that
	 * disagree with their neighbours (implying under 0.3 or over 15 seconds a line) are dropped.
	 */
	export function line_estimates(lines: readonly SungLine[], found: readonly Anchor[], how: Estimator): Map<number, number> {
		const before = new Map(lyric_words(lines).map(w => [`${w.line}:${w.word}`, w.syllables_before]));
		const ms_per_syllable = anchored_ms_per_syllable(before, found);
		const by_line = new Map<number, number[]>();
		for (const a of found) {
			const list = by_line.get(a.line) ?? [];
			if (how === 'first' && list.length > 0) continue;
			list.push(a.ms - before.get(`${a.line}:${a.word}`)! * ms_per_syllable);
			by_line.set(a.line, list);
		}
		const estimate = new Map<number, number>();
		for (const [line, list] of by_line) {
			const sorted = list.slice(0, 4).sort((x, y) => x - y);
			estimate.set(line, sorted[sorted.length >> 1]);
		}
		const anchored = [...estimate.keys()].sort((a, b) => a - b);
		const kept = new Map<number, number>();
		anchored.forEach((line, k) => {
			const near = anchored.slice(Math.max(0, k - 3), k + 4).filter(x => x !== line);
			if (near.length < 2) {
				kept.set(line, estimate.get(line)!);
				return;
			}
			const rates = near.map(x => (estimate.get(x)! - estimate.get(line)!) / (x - line)).sort((a, b) => a - b);
			const rate = rates[rates.length >> 1];
			if (rate > 300 && rate < 15_000) kept.set(line, estimate.get(line)!);
		});
		return kept;
	}

	/** Every line from the anchored ones, the rest spread between them by syllables */
	export function interpolate(lines: readonly SungLine[], starts: ReadonlyMap<number, number>): ParsedLyrics | null {
		const known = [...starts.entries()].sort((a, b) => a[0] - b[0]);
		if (known.length < 2) return null;
		const syllables = lines.map(line => line_syllables(line.text));
		const sum = (from: number, to: number) => syllables.slice(from, to).reduce((a, b) => a + b, 0);
		const at = lines.map((_, l) => {
			const next = known.findIndex(([x]) => x >= l);
			if (next >= 0 && known[next][0] === l) return known[next][1];
			if (next <= 0) {
				const [x, t] = next < 0 ? known[known.length - 1] : known[0];
				return l < x ? t - sum(l, x) * DEFAULT_MS_PER_SYLLABLE : t + sum(x, l) * DEFAULT_MS_PER_SYLLABLE;
			}
			const [x0, t0] = known[next - 1];
			const [x1, t1] = known[next];
			return t0 + (t1 - t0) * sum(x0, l) / sum(x0, x1);
		});
		return { sync_type: 'LINE', lines: lines.map((line, k) => ({ text: line.text, start_ms: Math.round(Math.max(0, at[k])), end_ms: null })) };
	}

	/** The beat aligner with each anchored line drawn toward its estimated start */
	function pulled_beat_sync(plain: string, starts: ReadonlyMap<number, number>, vocals: VocalActivity, beats: readonly number[]): ParsedLyrics | null {
		return beat_line_sync(plain, vocals, beats, (line, ms) => {
			const t = starts.get(line);
			return t === undefined ? 0 : PULL_WEIGHT * Math.exp(-((ms - t) ** 2) / (2 * PULL_SIGMA_MS ** 2));
		})?.lyrics ?? null;
	}

	/** Each line's median start over the candidates */
	function median_lines(lines: readonly SungLine[], candidates: readonly (ParsedLyrics | null)[]): ParsedLyrics | null {
		const usable = candidates.filter((c): c is ParsedLyrics => c !== null && c.lines.length === lines.length);
		if (usable.length === 0) return null;
		return {
			sync_type: 'LINE',
			lines: lines.map((line, k) => {
				const starts = usable.map(c => c.lines[k].start_ms!).sort((a, b) => a - b);
				return { text: line.text, start_ms: starts[starts.length >> 1], end_ms: null };
			})
		};
	}

	/** Mean distance from each estimated line start, each capped at 10 s */
	function estimate_error(lyrics: ParsedLyrics | null, estimates: ReadonlyMap<number, number>): number {
		if (lyrics === null) return Infinity;
		const errors = [...estimates].filter(([line]) => line < lyrics.lines.length).map(([line, ms]) => Math.min(MAX_ERROR_MS, Math.abs(lyrics.lines[line].start_ms! - ms)));
		return errors.length === 0 ? Infinity : errors.reduce((a, b) => a + b, 0) / errors.length;
	}

	/** Share of the lyrics' words written in a script Whisper's English model can match */
	function latin_share(lines: readonly SungLine[]): number {
		const total = lines.reduce((sum, line) => sum + line.text.split(/\s+/).filter(Boolean).length, 0);
		return total === 0 ? 0 : lyric_words(lines).length / total;
	}

	/** Whether `heard_line_sync` can judge these lyrics, so its null means plain lyrics rather than "try something else" */
	export function can_hear(plain: string, vocals: HeardVocals): boolean {
		return vocals.words !== null && latin_share(sung_lines(plain)) >= MIN_LATIN_WORDS;
	}

	export interface HeardCandidate { name: string; lyrics: ParsedLyrics | null; error_ms: number }

	/**
	 * Line timings for plain lyrics from the words Whisper heard, or null when too few lines could be anchored, too few
	 * heard words are in the lyrics (likely another song or version), or no candidate fits (show the lyrics unsynced). Several ways of placing the lines are built from the anchors: spread by
	 * syllables between anchored lines, or the beat aligner pulled toward them (with either voice curve), and the
	 * per-line median of those. Each is rebuilt from the anchors on even lines and scored on the odd lines' estimated
	 * starts, then the other way round; the one with the smallest error wins. Aligners that don't use the anchors are
	 * scored against every anchored line's estimate.
	 */
	export function heard_line_sync(plain: string, vocals: HeardVocals): { lyrics: ParsedLyrics; picked: string; candidates: HeardCandidate[] } | null {
		const lines = sung_lines(plain);
		if (lines.length < 2 || vocals.words === null) return null;
		const found = anchors(lines, vocals.words.words);
		if (line_estimates(lines, found, 'first').size < MIN_ANCHORED_LINES * lines.length) return null;
		const heard = vocals.words.words.filter(w => bare_word(w.text).length >= MIN_ANCHOR_LETTERS).length;
		if (found.length < MIN_HEARD_MATCHED * heard) return null;
		const beats = vocals.beat_grid?.beats_ms ?? vocals.rhythm?.beats_ms ?? [];
		const speech: VocalActivity | null = vocals.speech === null
			? null
			: { hop_ms: vocals.speech.hop_ms, window_ms: vocals.speech.hop_ms, duration_ms: vocals.duration_ms, voice: vocals.speech.voice, segments: [] };

		const build = (subset: readonly Anchor[]) => {
			const out: Record<string, ParsedLyrics | null> = {};
			for (const how of ['first', 'median'] as const) {
				const starts = line_estimates(lines, subset, how);
				out[`spread (${how})`] = interpolate(lines, starts);
				out[`beats, EffNet (${how})`] = pulled_beat_sync(plain, starts, vocals, beats);
				out[`beats, Silero (${how})`] = speech === null ? null : pulled_beat_sync(plain, starts, speech, beats);
			}
			out.median = median_lines(lines, [out['spread (median)'], out['beats, EffNet (median)'], out['beats, Silero (median)']]);
			return out;
		};
		const halves = [0, 1].map(parity => found.filter(a => a.line % 2 === parity));
		const held_out = halves.map(half => line_estimates(lines, half, 'median'));
		const from_half = halves.map(build);
		const all = build(found);
		const candidates: HeardCandidate[] = Object.entries(all).map(([name, lyrics]) => ({
			name,
			lyrics,
			error_ms: (estimate_error(from_half[0][name], held_out[1]) + estimate_error(from_half[1][name], held_out[0])) / 2
		}));
		const estimates = line_estimates(lines, found, 'median');
		const unanchored: [string, ParsedLyrics | null][] = [
			['voice', line_sync(plain, vocals)],
			['beats, EffNet', vocals.rhythm === null ? null : beat_line_sync(plain, vocals, vocals.rhythm.beats_ms)?.lyrics ?? null],
			['beats, Silero', speech === null ? null : beat_line_sync(plain, speech, beats)?.lyrics ?? null]
		];
		for (const [name, lyrics] of unanchored) candidates.push({ name, lyrics, error_ms: estimate_error(lyrics, estimates) });
		const best = candidates.reduce((a, b) => (b.error_ms < a.error_ms ? b : a));
		if (best.lyrics === null || best.error_ms > MAX_HELD_OUT_ERROR_MS) return null;
		return { lyrics: best.lyrics, picked: best.name, candidates };
	}
}
