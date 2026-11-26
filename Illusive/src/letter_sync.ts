import type { HeardWord, LyricsLine, LyricsSegment, ParsedLyrics, TrackAlignment } from '@origin/illusi/types';
import { LyricsAlign } from './lyrics_align';

export namespace LetterSync {
	/** Log-probability of the star token, which stands for audio the lyrics don't cover */
	const STAR_LOG_P = Math.log(0.5);
	const WHOLE_SONG = { star_cost: 0.5, silence_cost: 2 };
	const CHUNKED = { star_cost: 0.2, silence_cost: 2 };
	/** Singing: frame loudness above this share of the song's 90th percentile */
	const VOICED = 0.2;
	/** Near silence: loudness averaged over QUIET_FRAMES below this share */
	const QUIET = 0.05;
	const QUIET_FRAMES = 25;
	const CLOCK_STEP_MS = 100;
	const WHISPER_MARGIN_S = 0.4;
	const REPEAT_MARGIN_S = 0.9;
	const PACE_WEIGHT = 1.5;
	const MIN_RUN = 3;
	const SIMILAR_WORD = 80;
	const SIMILAR_LINE = 85;
	const DISAGREE_S = 1;

	const MIN_AGREEING = 0.75;
	const MIN_HEARD = 0.45;
	const MAX_WEAK = 0.8;
	const WEAK_CONFIDENCE = 0.1;
	/** How far a line-synced line's words may be sung outside its timestamps */
	const LINE_MARGIN_S = 0.5;
	/** Line-synced lyrics whose letters are found in fewer of their lines than this don't match the vocals */
	const MIN_WORDED = 0.5;

	const NUMBERS: Record<string, string> = {
		0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 20: 'twenty', 100: 'hundred'
	};
	const VOCABLES = new Set(['aw', 'ah', 'aah', 'oh', 'ooh', 'ohh', 'oo', 'ooo', 'la', 'na', 'da', 'mm', 'mmm', 'hmm', 'uh', 'ay', 'ayy', 'ayo',
		'hey', 'woah', 'whoa', 'wo', 'ha', 'eh', 'yeah', 'yea', 'ya', 'yah', 'huh', 'ooh-ooh', 'doo', 'ba', 'woo', 'mhm']);

	/** Lowercase letters and apostrophes, small numbers spelled out: what the letter model can align */
	export function letters_of(word: string): string {
		const w = word.toLowerCase().replace(/’/g, '\'');
		const number = NUMBERS[w.replace(/^[.,!?]+|[.,!?]+$/g, '')];
		if (number !== undefined) return number;
		return w.replace(/[^a-z']/g, '').replace(/^'+|'+$/g, '');
	}

	/**
	 * A sound rather than a word (oh, la, mmm): nothing to align, its line is placed where singing starts again. Sung
	 * syllables like "lalala" stay words: their letters align well.
	 */
	export function is_vocable(word: string): boolean {
		const w = letters_of(word);
		return w === '' || VOCABLES.has(w) || (w.length >= 3 && new Set(w).size <= 2 && /^[aeiouhmy]+$/.test(w));
	}

	/** Similarity 0-100: twice the longest common subsequence over the total length */
	function ratio(a: string, b: string): number {
		if (a.length + b.length === 0) return 100;
		let previous = new Uint16Array(b.length + 1);
		let current = new Uint16Array(b.length + 1);
		for (let i = 1; i <= a.length; i++) {
			for (let j = 1; j <= b.length; j++) current[j] = a[i - 1] === b[j - 1] ? previous[j - 1] + 1 : Math.max(previous[j], current[j - 1]);
			[previous, current] = [current, previous];
		}
		return 200 * previous[b.length] / (a.length + b.length);
	}

	interface Lyrics {
		lines: string[];
		/** Each word with its line; words of vocable lines are blank */
		words: { text: string; line: number }[];
		letters: string[];
		vocal_lines: Set<number>;
		/** First word with letters in each line */
		first: Map<number, number>;
		line_letters: string[];
	}

	function lyrics_of(plain: string): Lyrics {
		const lines = LyricsAlign.sung_lines(plain).map(line => line.text);
		const vocal_lines = new Set<number>();
		lines.forEach((line, l) => {
			if (line.split(/\s+/).filter(Boolean).every(is_vocable)) vocal_lines.add(l);
		});
		const words = lines.flatMap((line, l) => line.split(/\s+/).filter(Boolean).map(text => ({ text: vocal_lines.has(l) ? '' : text, line: l })));
		const letters = words.map(w => letters_of(w.text));
		const first = new Map<number, number>();
		words.forEach((w, i) => {
			if (letters[i] && !first.has(w.line)) first.set(w.line, i);
		});
		const line_letters = lines.map(line => line.split(/\s+/).filter(Boolean).map(letters_of).join(' '));
		return { lines, words, letters, vocal_lines, first, line_letters };
	}

	interface Evidence {
		frames: number;
		/** Seconds per frame */
		frame_s: number;
		duration_s: number;
		/** Letter log-probabilities, frame-major, `alphabet.length` per frame */
		log_p: Float32Array;
		alphabet: string;
		column: Map<string, number>;
		voiced: Uint8Array;
		quiet: Uint8Array;
		clock: Clock;
		heard: { letters: string; start_s: number; probability: number }[];
		downbeats_s: number[];
		repeats: { start_s: number; end_s: number; lag_s: number }[];
	}

	function decode_base64(text: string): Uint8Array {
		const binary = globalThis.atob(text);
		const out = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
		return out;
	}

	function percentile_90(values: Float64Array): number {
		if (values.length === 0) return 0;
		const sorted = Float64Array.from(values).sort();
		const position = 0.9 * (sorted.length - 1);
		const i = Math.floor(position);
		return i + 1 < sorted.length ? sorted[i] + (sorted[i + 1] - sorted[i]) * (position - i) : sorted[i];
	}

	function evidence_of(alignment: TrackAlignment): Evidence | null {
		const { alphabet } = alignment;
		const letters = decode_base64(alignment.letters);
		const loudness = decode_base64(alignment.loudness);
		const frames = loudness.length;
		if (frames === 0 || letters.length !== frames * alphabet.length || !alphabet.startsWith('-')) return null;
		const log_p = new Float32Array(letters.length);
		for (let i = 0; i < letters.length; i++) log_p[i] = -letters[i] / alignment.letter_scale;
		const rms = new Float64Array(frames);
		for (let t = 0; t < frames; t++) rms[t] = (loudness[t] / 127.5) ** 2;
		const p90 = percentile_90(rms);
		const voiced = new Uint8Array(frames);
		const quiet = new Uint8Array(frames);
		const half = QUIET_FRAMES >> 1;
		let window = 0;
		for (let t = 0; t < Math.min(frames, half); t++) window += rms[t];
		for (let t = 0; t < frames; t++) {
			if (t + half < frames) window += rms[t + half];
			if (t - half - 1 >= 0) window -= rms[t - half - 1];
			voiced[t] = rms[t] > VOICED * p90 ? 1 : 0;
			quiet[t] = window / QUIET_FRAMES < QUIET * p90 ? 1 : 0;
		}
		const frame_s = alignment.frame_ms / 1000;
		return {
			frames,
			frame_s,
			duration_s: alignment.duration_ms / 1000,
			log_p,
			alphabet,
			column: new Map(alphabet.split('').map((c, i) => [c, i])),
			voiced,
			quiet,
			clock: clock_of(rms, frame_s),
			heard: alignment.words.words.map((w: HeardWord) => ({ letters: letters_of(w.text), start_s: w.start_ms / 1000, probability: w.probability })),
			downbeats_s: alignment.beat_grid.downbeats_ms.map(ms => ms / 1000),
			repeats: alignment.repeats.map(r => ({ start_s: r.start_ms / 1000, end_s: r.end_ms / 1000, lag_s: r.lag_ms / 1000 }))
		};
	}

	/** Seconds of singing up to a time, so instrumental breaks cost nothing when judging pace */
	interface Clock {
		at(t: number): number;
		/** The first time the clock reaches `c` */
		time_of(c: number): number;
		/** Where singing starts after at least 0.3 s of quiet */
		starts: number[];
		/** End of the last sung passage */
		last: number;
	}

	function clock_of(rms: Float64Array, frame_s: number): Clock {
		const group = Math.max(1, Math.round(CLOCK_STEP_MS / 1000 / frame_s));
		const step_s = group * frame_s;
		const n = Math.floor(rms.length / group);
		const level = new Float64Array(n);
		for (let k = 0; k < n; k++) {
			let sum = 0;
			for (let t = k * group; t < (k + 1) * group; t++) sum += rms[t] ** 2;
			level[k] = Math.sqrt(sum / group);
		}
		const p90 = percentile_90(level);
		const on = Array.from(level, x => x > VOICED * p90);
		const cum = new Float64Array(n + 1);
		for (let k = 0; k < n; k++) cum[k + 1] = cum[k] + (on[k] ? step_s : 0);
		const quiet = (k: number) => k >= 2 && !on[k] && !on[k - 1] && !on[k - 2];
		const starts: number[] = [];
		for (let k = 1; k < n; k++) if (on[k] && quiet(k - 1)) starts.push(k * step_s);
		const last_on = on.lastIndexOf(true);
		return {
			at: t => cum[Math.min(n, Math.max(0, Math.floor(t / step_s)))],
			time_of: (c) => {
				let lo = 0;
				let hi = n + 1;
				while (lo < hi) {
					const mid = (lo + hi) >> 1;
					if (cum[mid] < c) lo = mid + 1;
					else hi = mid;
				}
				return lo * step_s;
			},
			starts,
			last: (last_on >= 0 ? last_on + 1 : n) * step_s
		};
	}

	/** Emissions with the star column added: free in quiet, `star_cost` per frame of singing; letters cost `silence_cost` in near silence */
	function emissions(ev: Evidence, cost: { star_cost: number; silence_cost: number }): Float32Array {
		const width = ev.alphabet.length + 1;
		const out = new Float32Array(ev.frames * width);
		for (let t = 0; t < ev.frames; t++) {
			const silent = ev.quiet[t] ? cost.silence_cost : 0;
			out[t * width] = ev.log_p[t * (width - 1)];
			for (let c = 1; c < width - 1; c++) out[t * width + c] = ev.log_p[t * (width - 1) + c] - silent;
			out[t * width + width - 1] = STAR_LOG_P - (ev.voiced[t] ? cost.star_cost : 0);
		}
		return out;
	}

	/**
	 * CTC forced alignment (Viterbi) of `tokens` over frames [from, to) of `emis`; star tokens absorb unmatched audio.
	 * Returns each token's [first frame, last frame] and mean probability, or null when the frames are too few.
	 */
	function force_align(emis: Float32Array, width: number, from: number, to: number, tokens: readonly number[]): { start: number; end: number; score: number }[] | null {
		const frames = to - from;
		const L = tokens.length;
		const S = 2 * L + 1;
		if (L === 0 || 2 * L + 1 > frames) return null;
		const label = new Int32Array(S);
		for (let s = 0; s < S; s++) label[s] = s % 2 === 0 ? 0 : tokens[(s - 1) >> 1];
		const can_skip = new Uint8Array(S);
		for (let s = 3; s < S; s += 2) can_skip[s] = label[s] !== label[s - 2] ? 1 : 0;
		let previous = new Float64Array(S).fill(-Infinity);
		let current = new Float64Array(S);
		// 0 stay, 1 from s - 1, 2 from s - 2
		const back = new Uint8Array(frames * S);
		previous[0] = emis[from * width + label[0]];
		previous[1] = emis[from * width + label[1]];
		for (let t = 1; t < frames; t++) {
			const row = (from + t) * width;
			const lo = Math.max(0, S - 2 * (frames - t));
			const hi = Math.min(S, 2 * t + 2);
			current.fill(-Infinity);
			for (let s = lo; s < hi; s++) {
				let best = previous[s];
				let from_s = 0;
				if (s > 0 && previous[s - 1] > best) {
					best = previous[s - 1];
					from_s = 1;
				}
				if (can_skip[s] && previous[s - 2] > best) {
					best = previous[s - 2];
					from_s = 2;
				}
				if (best === -Infinity) continue;
				current[s] = best + emis[row + label[s]];
				back[t * S + s] = from_s;
			}
			[previous, current] = [current, previous];
		}
		let s = previous[S - 1] >= previous[S - 2] ? S - 1 : S - 2;
		if (previous[s] === -Infinity) return null;
		const spans = Array.from({ length: L }, () => ({ start: -1, end: -1, score: 0, n: 0 }));
		for (let t = frames - 1; t >= 0; t--) {
			if (s % 2 === 1) {
				const span = spans[(s - 1) >> 1];
				if (span.end < 0) span.end = t;
				span.start = t;
				span.score += Math.exp(emis[(from + t) * width + label[s]]);
				span.n++;
			}
			if (t > 0) s -= back[t * S + s];
		}
		return spans.map(span => ({ start: span.start, end: span.end, score: span.n > 0 ? span.score / span.n : 0 }));
	}

	/** Each word's first and last frame (or seconds) and its letters' mean probability; null for words not aligned */
	interface WordTimes { onset: (number | null)[]; end: (number | null)[]; confidence: (number | null)[] }

	/** Aligns words [from, to) of the lyrics over frames [f0, f1), a star between lines */
	function align_words(ev: Evidence, emis: Float32Array, lyrics: Pick<Lyrics, 'words' | 'letters'>, from: number, to: number, f0: number, f1: number): WordTimes {
		const width = ev.alphabet.length + 1;
		const star = width - 1;
		const tokens: number[] = [star];
		const owner: number[] = [-1];
		let previous_line: number | null = null;
		for (let i = from; i < to; i++) {
			const letters = lyrics.letters[i];
			if (!letters) continue;
			const line = lyrics.words[i].line;
			if (previous_line !== null && line !== previous_line) {
				tokens.push(star);
				owner.push(-1);
			}
			previous_line = line;
			for (const c of letters) {
				tokens.push(ev.column.get(c)!);
				owner.push(i);
			}
		}
		if (owner[owner.length - 1] !== -1) {
			tokens.push(star);
			owner.push(-1);
		}
		const onset: (number | null)[] = Array(to - from).fill(null);
		const end: (number | null)[] = Array(to - from).fill(null);
		const confidence: (number | null)[] = Array(to - from).fill(null);
		const spans = owner.some(o => o >= 0) ? force_align(emis, width, f0, f1, tokens) : null;
		if (spans === null) return { onset, end, confidence };
		const scores = new Map<number, number[]>();
		spans.forEach((span, k) => {
			const i = owner[k];
			if (i < 0) return;
			if (onset[i - from] === null) onset[i - from] = f0 + span.start;
			end[i - from] = f0 + span.end + 1;
			const list = scores.get(i) ?? [];
			list.push(span.score);
			scores.set(i, list);
		});
		for (const [i, list] of scores) confidence[i - from] = list.reduce((a, b) => a + b, 0) / list.length;
		return { onset, end, confidence };
	}

	/** (word, seconds, weight, margin in seconds) */
	interface Point { word: number; t: number; weight: number; margin: number }

	/**
	 * Word times in seconds, aligning each chunk between consecutive anchors against its own audio (plus the anchors' margins).
	 * With a clock, the open-ended first and last chunks only get as much singing time as their words need at a slow pace.
	 */
	function chunk_align(ev: Evidence, emis: Float32Array, lyrics: Lyrics, anchors: readonly Point[], bounded: boolean): WordTimes {
		const n = lyrics.words.length;
		const { clock, duration_s, frame_s } = ev;
		let head = 0;
		let tail = duration_s;
		if (bounded && anchors.length > 0) {
			const need = (k: number) => Math.max(12, 2.5 * k * clock.at(duration_s) / Math.max(1, n));
			const lettered = (a: number, b: number) => lyrics.letters.slice(a, b).filter(Boolean).length;
			const [first, last] = [anchors[0], anchors[anchors.length - 1]];
			head = clock.time_of(Math.max(0, clock.at(first.t) - need(lettered(0, first.word))));
			tail = Math.max(last.t, clock.time_of(clock.at(last.t) + need(lettered(last.word, n))) + 1);
			head = Math.min(head, first.t);
		}
		const bounds = [{ word: 0, t: head, margin: 0 }, ...anchors, { word: n, t: Math.min(duration_s, tail), margin: 0 }];
		const onset: (number | null)[] = Array(n).fill(null);
		const end: (number | null)[] = Array(n).fill(null);
		const confidence: (number | null)[] = Array(n).fill(null);
		for (let k = 0; k + 1 < bounds.length; k++) {
			const [a, b] = [bounds[k], bounds[k + 1]];
			if (b.word <= a.word) continue;
			const f0 = Math.max(0, Math.trunc((a.t - a.margin) / frame_s));
			const f1 = Math.min(ev.frames, Math.trunc((b.t + b.margin) / frame_s) + 1);
			if (f1 - f0 > 4) {
				const chunk = align_words(ev, emis, lyrics, a.word, b.word, f0, f1);
				chunk.onset.forEach((frame, j) => {
					if (frame === null) return;
					onset[a.word + j] = frame * frame_s;
					end[a.word + j] = chunk.end[j]! * frame_s;
					confidence[a.word + j] = chunk.confidence[j];
				});
			}
			// A chunk too short for its words: spread them over it rather than drop them
			const lettered: number[] = [];
			for (let i = a.word; i < b.word; i++) if (lyrics.letters[i]) lettered.push(i);
			if (lettered.length > 0 && lettered.every(i => onset[i] === null)) {
				lettered.forEach((i, j) => {
					onset[i] = a.t + (b.t - a.t) * j / lettered.length;
					end[i] = a.t + (b.t - a.t) * (j + 1) / lettered.length;
					confidence[i] = 0;
				});
			}
		}
		return { onset, end, confidence };
	}

	function line_starts(lyrics: Lyrics, onset: readonly (number | null)[], confidence: readonly (number | null)[]): { starts: (number | null)[]; confidence: number[] } {
		const starts: (number | null)[] = [];
		const line_confidence: number[] = [];
		lyrics.lines.forEach((_, l) => {
			const idx = lyrics.words.map((_w, i) => i).filter(i => lyrics.words[i].line === l && onset[i] !== null);
			starts.push(idx.length > 0 ? onset[idx[0]] : null);
			const c = idx.map(i => confidence[i]).filter((x): x is number => x !== null);
			line_confidence.push(c.length > 0 ? c.reduce((a, b) => a + b, 0) / c.length : 0);
		});
		return { starts, confidence: line_confidence };
	}

	/**
	 * Runs of MIN_RUN or more heard words matching consecutive lyric words. A run that fits several places in the lyrics
	 * (a repeated chorus) is offered at each, its weight split between them.
	 */
	function whisper_points(ev: Evidence, lyrics: Lyrics): Point[] {
		const h = ev.heard.map(w => w.letters);
		const L = lyrics.letters;
		const memo = new Map<string, boolean>();
		const match = (a: string, b: string) => {
			if (!a || !b) return false;
			if (a === b) return true;
			if (a.length <= 3) return false;
			const key = `${a}|${b}`;
			let r = memo.get(key);
			if (r === undefined) memo.set(key, r = ratio(a, b) >= SIMILAR_WORD);
			return r;
		};
		const by_heard = new Map<number, [number, number][]>();
		for (let i = 0; i < h.length; i++) {
			for (let p = 0; p < L.length; p++) {
				if (!match(h[i], L[p]) || (i > 0 && p > 0 && match(h[i - 1], L[p - 1]))) continue;
				let k = 0;
				while (i + k < h.length && p + k < L.length && match(h[i + k], L[p + k])) k++;
				if (k >= MIN_RUN) {
					const places = by_heard.get(i) ?? [];
					places.push([p, k]);
					by_heard.set(i, places);
				}
			}
		}
		const points: Point[] = [];
		for (const [i, places] of by_heard) {
			for (const [p, k] of places) {
				let w = 0;
				for (let j = 0; j < k; j++) w += ev.heard[i + j].probability;
				w /= places.length;
				for (let j = 0; j < k; j++) points.push({ word: p + j, t: ev.heard[i + j].start_s, weight: w / k * (1 + 0.2 * k), margin: WHISPER_MARGIN_S });
			}
		}
		return points;
	}

	/** Lines a..a+n-1 sung again as b..b+n-1 (fuzzy line match), runs of two lines or more */
	function text_repeats(lyrics: Lyrics): [number, number, number][] {
		const n = lyrics.lines.length;
		const same = Array.from({ length: n }, () => new Uint8Array(n));
		for (let a = 0; a < n; a++) {
			for (let b = a + 1; b < n; b++) {
				const [x, y] = [lyrics.line_letters[a], lyrics.line_letters[b]];
				same[a][b] = x && y && ratio(x, y) >= SIMILAR_LINE ? 1 : 0;
			}
		}
		const out: [number, number, number][] = [];
		for (let a = 0; a < n; a++) {
			for (let b = a + 1; b < n; b++) {
				if (!same[a][b] || (a > 0 && same[a - 1][b - 1])) continue;
				let k = 0;
				while (a + k < b && b + k < n && same[a + k][b + k]) k++;
				if (k >= 2) out.push([a, b, k]);
			}
		}
		return out;
	}

	/**
	 * Whisper anchors copied across repeats: an anchor in one occurrence of a repeated lyric block lands at the same
	 * place in the other, shifted by the lag of a repeated vocal passage that covers it.
	 */
	function repeat_points(ev: Evidence, lyrics: Lyrics, points: readonly Point[]): Point[] {
		const out: Point[] = [];
		for (const [a, b, n] of text_repeats(lyrics)) {
			for (const point of points) {
				const line = lyrics.words[point.word].line;
				for (const [from, to, sign] of [[a, b, 1], [b, a, -1]] as const) {
					if (line < from || line >= from + n) continue;
					const target_line = to + (line - from);
					const offset = point.word - (lyrics.first.get(line) ?? point.word);
					const q = lyrics.first.get(target_line);
					if (q === undefined || q + offset >= lyrics.words.length || lyrics.words[q + offset].line !== target_line) continue;
					for (const r of ev.repeats) {
						const [lo, hi] = sign > 0 ? [r.start_s - 1, r.end_s + 1] : [r.start_s + r.lag_s - 1, r.end_s + r.lag_s + 1];
						if (lo <= point.t && point.t <= hi) out.push({ word: q + offset, t: point.t + sign * r.lag_s, weight: 0.6 * point.weight, margin: REPEAT_MARGIN_S });
					}
				}
			}
		}
		return out;
	}

	/**
	 * The heaviest chain of points increasing in word and time at a plausible rate. Each step pays for how far its pace
	 * (seconds of singing per word) is from the song's average, so a chorus heard once attaches to the occurrence that
	 * keeps the pace even.
	 */
	function chain(ev: Evidence, raw: readonly Point[], n_words: number): Point[] {
		const seen = new Set<string>();
		const points = raw.filter((p) => {
			const key = `${p.word}:${p.t}:${p.weight}:${p.margin}`;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		}).sort((x, y) => x.t - y.t || x.word - y.word || y.weight - x.weight);
		if (points.length === 0) return [];
		const { clock, duration_s } = ev;
		const rate = clock.at(duration_s) / Math.max(1, n_words);
		const pace = (pa: number, ta: number, pb: number, tb: number) => PACE_WEIGHT * Math.abs(Math.log((clock.at(tb) - clock.at(ta) + 2) / ((pb - pa) * rate + 2)));
		const best = new Float64Array(points.length);
		const previous = new Int32Array(points.length).fill(-1);
		for (let j = 0; j < points.length; j++) {
			const pj = points[j];
			best[j] = pj.weight - pace(0, 0, pj.word, pj.t);
			for (let i = 0; i < j; i++) {
				const pi = points[i];
				const dp = pj.word - pi.word;
				const dt = pj.t - pi.t;
				if (dp <= 0 || dt <= 0.08 * dp || dt > 3 * dp + 45) continue;
				const c = best[i] + pj.weight - pace(pi.word, pi.t, pj.word, pj.t);
				if (c > best[j]) {
					best[j] = c;
					previous[j] = i;
				}
			}
		}
		let j = 0;
		let top = -Infinity;
		points.forEach((p, k) => {
			const final = best[k] - pace(p.word, p.t, n_words, duration_s);
			if (final > top) {
				top = final;
				j = k;
			}
		});
		const out: Point[] = [];
		for (; j >= 0; j = previous[j]) out.push(points[j]);
		const words = new Set<number>();
		return out.reverse().filter((p) => {
			if (words.has(p.word)) return false;
			words.add(p.word);
			return true;
		});
	}

	/**
	 * Vocable-only lines go where singing starts again between the lines around them (snapped to a near downbeat),
	 * else on downbeats spread evenly between those lines.
	 */
	function place_vocal_lines(ev: Evidence, lyrics: Lyrics, starts: readonly (number | null)[]): (number | null)[] {
		const out = [...starts];
		const db = ev.downbeats_s;
		const on_downbeat = (t: number, a: number, b: number) => {
			if (db.length === 0) return t;
			let d = db[0];
			for (const x of db) if (Math.abs(x - t) < Math.abs(d - t)) d = x;
			return a < d && d < b && Math.abs(d - t) < 0.6 ? d : t;
		};
		const n = out.length;
		for (let l = 0; l < n;) {
			if (!lyrics.vocal_lines.has(l) || out[l] !== null) {
				l++;
				continue;
			}
			let j = l;
			while (j < n && lyrics.vocal_lines.has(j)) j++;
			const k = j - l;
			let before: number | null = null;
			for (let q = l - 1; q >= 0 && before === null; q--) before = out[q];
			let after: number | null = null;
			for (let q = j; q < n && after === null; q++) after = out[q];
			const end = ev.clock.last;
			const a = before ?? Math.max(0, (after || end) - 4 * (k + 1));
			const b = after ?? end;
			let targets = Array.from({ length: k }, (_, q) => a + (b - a) * (q + 1) / (k + 1));
			const candidates = ev.clock.starts.filter(t => a + 1 < t && t < b - 0.5);
			if (candidates.length >= k) {
				// The k singing starts closest to the even spread, in order
				const picked: number[] = [];
				let lo = 0;
				targets.forEach((t, q) => {
					const hi = candidates.length - (k - q - 1);
					let c = lo;
					for (let x = lo; x < hi; x++) if (Math.abs(candidates[x] - t) < Math.abs(candidates[c] - t)) c = x;
					picked.push(candidates[c]);
					lo = c + 1;
				});
				targets = picked;
			}
			for (let q = 0; q < k; q++) out[l + q] = on_downbeat(targets[q], a, b);
			l = j;
		}
		return out;
	}

	/** Share of line l's words (`line_letters`) Whisper heard while that line was (per these starts) being sung */
	function heard_share(ev: Evidence, line_letters: readonly string[], starts: readonly (number | null)[], l: number): number {
		const s = starts[l];
		if (s === null) return 0;
		let next = s + 6;
		for (let q = l + 1; q < starts.length; q++) {
			const x = starts[q];
			if (x !== null && x > s) {
				next = x;
				break;
			}
		}
		const until = Math.min(next, s + 12) + 1;
		const window = ev.heard.filter(w => s - 1 <= w.start_s && w.start_s < until).map(w => w.letters);
		const words = line_letters[l].split(' ').filter(Boolean);
		if (words.length === 0 || window.length === 0) return 0;
		const hit = words.filter(x => window.some(w => x === w || (x.length > 3 && ratio(x, w) >= SIMILAR_WORD))).length;
		return hit / words.length;
	}

	/**
	 * `whole`'s line starts, except blocks of lines where `chunked` disagrees by more than DISAGREE_S and Whisper heard
	 * those lines' words better at `chunked`'s times.
	 */
	function arbitrate(ev: Evidence, lyrics: Lyrics, whole: readonly (number | null)[], chunked: readonly (number | null)[]): (number | null)[] {
		const out = [...whole];
		const n = whole.length;
		const apart = (l: number) => whole[l] !== null && chunked[l] !== null && Math.abs(whole[l] - chunked[l]) > DISAGREE_S;
		for (let l = 0; l < n;) {
			if (!apart(l)) {
				l++;
				continue;
			}
			let j = l;
			while (j < n && apart(j)) j++;
			let whole_heard = 0;
			let chunked_heard = 0;
			for (let q = l; q < j; q++) {
				whole_heard += heard_share(ev, lyrics.line_letters, whole, q);
				chunked_heard += heard_share(ev, lyrics.line_letters, chunked, q);
			}
			if (chunked_heard > whole_heard) for (let q = l; q < j; q++) out[q] = chunked[q];
			l = j;
		}
		return out;
	}

	export interface Placement {
		lyrics: ParsedLyrics;
		/** Share of sung lines where the whole-song and chunked placements agree */
		agreeing: number;
		/** Mean share of each sung line's words Whisper heard where the line landed */
		heard: number;
		/** Share of sung lines whose letters the whole-song alignment barely found */
		weak: number;
		/** Whether the timings are trustworthy enough to show */
		confident: boolean;
	}

	interface Solved {
		placement: Placement;
		lyrics: Lyrics;
		/** Word times from the pass each line's start was taken from */
		words: WordTimes;
	}

	function solve(plain: string, alignment: TrackAlignment): Solved | null {
		const ev = evidence_of(alignment);
		if (ev === null) return null;
		const lyrics = lyrics_of(plain);
		const sung = lyrics.lines.map((_, l) => l).filter(l => !lyrics.vocal_lines.has(l));
		if (sung.length < 2) return null;

		const whole_words = chunk_align(ev, emissions(ev, WHOLE_SONG), lyrics, [], false);
		const whole_lines = line_starts(lyrics, whole_words.onset, whole_words.confidence);
		const whole = place_vocal_lines(ev, lyrics, whole_lines.starts);

		const heard = whisper_points(ev, lyrics);
		const anchors = chain(ev, [...heard, ...repeat_points(ev, lyrics, heard)], lyrics.words.length);
		const chunked_words = chunk_align(ev, emissions(ev, CHUNKED), lyrics, anchors, true);
		const chunked = place_vocal_lines(ev, lyrics, line_starts(lyrics, chunked_words.onset, chunked_words.confidence).starts);

		const starts = arbitrate(ev, lyrics, whole, chunked);
		const compared = sung.filter(l => whole[l] !== null && chunked[l] !== null);
		const agreeing = compared.length === 0 ? 0 : compared.filter(l => Math.abs(whole[l]! - chunked[l]!) <= DISAGREE_S).length / compared.length;
		const heard_mean = sung.reduce((sum, l) => sum + heard_share(ev, lyrics.line_letters, starts, l), 0) / sung.length;
		const weak = sung.filter(l => whole_lines.confidence[l] < WEAK_CONFIDENCE).length / sung.length;

		// Lines without a start take the one before (else after) them, and no line starts before the one above it
		const filled = starts.map((s, l) => s ?? starts.slice(0, l).reverse().find(x => x !== null) ?? starts.slice(l).find(x => x !== null) ?? 0);
		for (let l = 1; l < filled.length; l++) filled[l] = Math.max(filled[l], filled[l - 1]);
		const pick = (k: keyof WordTimes) => lyrics.words.map((w, i) => (starts[w.line] !== whole[w.line] ? chunked_words : whole_words)[k][i]);
		return {
			placement: {
				lyrics: { sync_type: 'LINE', lines: lyrics.lines.map((text, l) => ({ text, start_ms: Math.round(Math.max(0, filled[l]) * 1000), end_ms: null })) },
				agreeing,
				heard: heard_mean,
				weak,
				confident: agreeing >= MIN_AGREEING && heard_mean >= MIN_HEARD && weak <= MAX_WEAK
			},
			lyrics,
			words: { onset: pick('onset'), end: pick('end'), confidence: pick('confidence') }
		};
	}

	/** Every line placed, with the evidence for trusting it; null when the lyrics have too few alignable lines */
	export function place(plain: string, alignment: TrackAlignment): Placement | null {
		return solve(plain, alignment)?.placement ?? null;
	}

	/** Line timings for plain lyrics, or null when they can't be trusted (show the lyrics unsynced) */
	export function line_sync(plain: string, alignment: TrackAlignment): ParsedLyrics | null {
		const placement = place(plain, alignment);
		return placement?.confident ? placement.lyrics : null;
	}

	/**
	 * A line's words as segments (text keeps its trailing space), from each word's times in seconds; words without
	 * letters join the word before them. Each word lasts until the next starts: the letters themselves are short
	 * spikes, the singing between them isn't. Null when the line's letters were barely found.
	 */
	function segments_of(text: string, times: readonly { start: number | null; end: number | null; confidence: number | null }[]): LyricsSegment[] | null {
		const tokens = text.trim().match(/\S+\s*/g) ?? [];
		const found = times.filter(t => t.start !== null && t.end !== null);
		if (tokens.length !== times.length || found.length === 0) return null;
		if (found.reduce((sum, t) => sum + (t.confidence ?? 0), 0) / found.length < WEAK_CONFIDENCE) return null;
		const words: { text: string; start: number; end: number }[] = [];
		let pending = '';
		tokens.forEach((token, i) => {
			const { start, end } = times[i];
			if (start === null || end === null) {
				if (words.length > 0) words[words.length - 1].text += token;
				else pending += token;
				return;
			}
			const previous = words.at(-1)?.start ?? -Infinity;
			words.push({ text: pending + token, start: Math.max(start, previous), end });
			pending = '';
		});
		return words.map((w, i) => {
			const start_ms = Math.round(w.start * 1000);
			const end_ms = i + 1 < words.length ? Math.round(words[i + 1].start * 1000) : Math.round(Math.max(w.end, w.start) * 1000);
			return { text: w.text, start_ms, end_ms: Math.max(start_ms, end_ms) };
		});
	}

	/**
	 * Word timings for plain lyrics from the letters' alignment, or null when the line timings can't be trusted. Lines
	 * whose letters were barely found (and lines of sounds) keep only their line timing.
	 */
	export function word_sync(plain: string, alignment: TrackAlignment): ParsedLyrics | null {
		const solved = solve(plain, alignment);
		if (!solved?.placement.confident) return null;
		const { placement, lyrics, words } = solved;
		const lines: LyricsLine[] = placement.lyrics.lines.map((line, l) => {
			if (lyrics.vocal_lines.has(l)) return line;
			const idx = lyrics.words.flatMap((w, i) => (w.line === l ? [i] : []));
			const segments = segments_of(line.text, idx.map(i => ({ start: lyrics.letters[i] ? words.onset[i] : null, end: words.end[i], confidence: words.confidence[i] })));
			// Pushed later than its words by the line above it: the words can't be trusted either
			if (segments === null || segments[0].start_ms < line.start_ms!) return line;
			return { ...line, segments };
		});
		return { sync_type: lines.some(line => line.segments !== undefined) ? 'WORD' : 'LINE', lines };
	}

	/**
	 * Word timings for line-synced lyrics: each line's letters aligned within its own timestamps (plus a margin), so
	 * the source's line timing anchors them. Lines whose letters were barely found keep only their line timing; null
	 * when that's most of them, when Whisper didn't hear the lines where they're timed (letters common to any lyrics
	 * line up somewhere), or when the analysis isn't intact.
	 */
	export function word_sync_lines<L extends LyricsLine>(lyrics: LyricsAlign.Lined<L>, alignment: TrackAlignment): LyricsAlign.Lined<L> | null {
		if (lyrics.sync_type !== 'LINE') return null;
		const ev = evidence_of(alignment);
		if (ev === null) return null;
		const timed = lyrics.lines.flatMap((line, index) => (line.start_ms !== null && !LyricsAlign.is_header(line.text) && line.text.trim() !== '' ? [index] : []));
		const line_letters = timed.map(index => lyrics.lines[index].text.trim().split(/\s+/).map(letters_of).join(' '));
		const starts = timed.map(index => lyrics.lines[index].start_ms! / 1000);
		const sung_k = timed.flatMap((index, k) => (lyrics.lines[index].text.trim().split(/\s+/).every(is_vocable) ? [] : [k]));
		if (sung_k.length === 0 || sung_k.reduce((sum, k) => sum + heard_share(ev, line_letters, starts, k), 0) / sung_k.length < MIN_HEARD) return null;
		const emis = emissions(ev, CHUNKED);
		let sung = 0;
		let worded = 0;
		const lines = lyrics.lines.map(line => ({ ...line }));
		timed.forEach((index, k) => {
			const line = lyrics.lines[index];
			const tokens = line.text.trim().split(/\s+/);
			if (tokens.every(is_vocable)) return;
			sung++;
			const start_s = line.start_ms! / 1000;
			const next = timed[k + 1] === undefined ? null : lyrics.lines[timed[k + 1]].start_ms! / 1000;
			const until = next !== null && next > start_s ? next : Math.min(ev.duration_s, start_s + 10);
			const f0 = Math.max(0, Math.trunc((start_s - LINE_MARGIN_S) / ev.frame_s));
			const f1 = Math.min(ev.frames, Math.trunc((until + LINE_MARGIN_S) / ev.frame_s) + 1);
			const letters = tokens.map(letters_of);
			const times = align_words(ev, emis, { words: tokens.map(text => ({ text, line: 0 })), letters }, 0, tokens.length, f0, f1);
			const segments = segments_of(line.text, tokens.map((_, i) => ({
				start: times.onset[i] === null ? null : times.onset[i] * ev.frame_s,
				end: times.end[i] === null ? null : times.end[i] * ev.frame_s,
				confidence: times.confidence[i]
			})));
			if (segments === null) return;
			worded++;
			lines[index] = { ...lines[index], segments };
		});
		if (sung === 0 || worded / sung < MIN_WORDED) return null;
		return { ...lyrics, sync_type: 'WORD', lines };
	}
}
