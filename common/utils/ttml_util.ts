export type TtmlTimingType = 'word' | 'line' | 'syllable';

export interface TtmlWord {
	begin: number;
	end: number;
	text: string;
}

export interface TtmlVocals {
	begin: number;
	end: number;
	text: string;
	words: TtmlWord[];
}

export interface TtmlLine extends TtmlVocals {
	agent?: string;
	/** Background vocals (`ttm:role="x-bg"`) sung over the line */
	background?: TtmlVocals;
}

export interface TtmlLyrics {
	timing: TtmlTimingType;
	songwriters: string[];
	lines: TtmlLine[];
}

function parse_clock(value: string): number {
	const parts = value.trim().replace(/s$/, '').split(':').map(Number);
	return parts.reduce((total, part) => total * 60 + part, 0);
}
function decode_entities(text: string): string {
	return text
		.replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
		.replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, '\'')
		.replace(/&amp;/g, '&');
}
function strip_tags(text: string): string {
	return decode_entities(text.replace(/<[^>]+>/g, ''));
}
function attribute(tag: string, name: string): string | undefined {
	return new RegExp(`\\s${name}=["']([^"']*)["']`).exec(tag)?.[1];
}

const SKIPPED_ROLES = new Set(['x-translation', 'x-roman', 'x-romanization']);

interface OpenSpan {
	begin?: string;
	end?: string;
	text: string;
	timed_child: boolean;
	background: boolean;
	skipped: boolean;
}

function nearest_timed(stack: OpenSpan[]): OpenSpan | undefined {
	for (let i = stack.length - 1; i >= 0; i--) if (stack[i].begin !== undefined) return stack[i];
	return undefined;
}
function append_space(words: TtmlWord[]) {
	const last = words.at(-1);
	if (last !== undefined && !last.text.endsWith(' ')) last.text += ' ';
}
/** Timed leaf spans of a paragraph, split into main and background vocals; nested spans (x-bg wrappers) are walked rather than matched */
function parse_spans(inner: string): { words: TtmlWord[]; background: TtmlWord[] } {
	const words: TtmlWord[] = [];
	const background: TtmlWord[] = [];
	const stack: OpenSpan[] = [];
	for (const token of inner.matchAll(/<(\/?)span\b([^>]*)>|<[^>]*>|[^<]+/g)) {
		if (token[0].startsWith('<')) {
			if (token[2] === undefined || token[2].endsWith('/')) continue;
			if (token[1] === '/') {
				const span = stack.pop();
				if (span === undefined || span.skipped || span.begin === undefined || span.timed_child) continue;
				const target = span.background ? background : words;
				const text = span.text.replace(/\s+/g, ' ');
				if (text.trim() === '') continue;
				if (text.startsWith(' ')) append_space(target);
				target.push({ begin: parse_clock(span.begin), end: parse_clock(span.end ?? span.begin), text: text.trimStart() });
				continue;
			}
			const parent = stack.at(-1);
			const role = attribute(token[0], 'ttm:role');
			const begin = attribute(token[0], 'begin');
			if (begin !== undefined) {
				const owner = nearest_timed(stack);
				if (owner !== undefined) owner.timed_child = true;
			}
			stack.push({
				begin,
				end: attribute(token[0], 'end'),
				text: '',
				timed_child: false,
				background: (parent?.background ?? false) || role === 'x-bg',
				skipped: (parent?.skipped ?? false) || (role !== undefined && SKIPPED_ROLES.has(role))
			});
			continue;
		}
		const top = stack.at(-1);
		if (top?.skipped === true) continue;
		const owner = nearest_timed(stack);
		if (owner !== undefined && !owner.timed_child) owner.text += decode_entities(token[0]);
		else if (token[0].trim() === '') append_space(top?.background === true ? background : words);
	}
	return { words, background };
}
function vocals(words: TtmlWord[]): TtmlVocals | undefined {
	if (words.length === 0) return undefined;
	return { begin: words[0].begin, end: Math.max(...words.map(word => word.end)), text: words.map(word => word.text).join('').trim(), words };
}

export function parse_ttml(ttml: string): TtmlLyrics | undefined {
	const timing_attribute = /\w+:timing=["'](\w+)["']/.exec(ttml)?.[1]?.toLowerCase();
	const songwriters = [...ttml.matchAll(/<songwriter>(.*?)<\/songwriter>/gs)].map(match => strip_tags(match[1]));
	const lines: TtmlLine[] = [];
	for (const paragraph of ttml.matchAll(/<p\s[^>]*>(.*?)<\/p>/gs)) {
		const open_tag = paragraph[0].slice(0, paragraph[0].indexOf('>') + 1);
		const begin = attribute(open_tag, 'begin');
		if (begin === undefined) continue;
		const { words, background } = parse_spans(paragraph[1]);
		const background_vocals = vocals(background);
		const line_begin = parse_clock(begin);
		const line_end = attribute(open_tag, 'end');
		lines.push({
			begin: line_begin,
			end: line_end === undefined ? (words.at(-1)?.end ?? line_begin) : parse_clock(line_end),
			text: (words.length > 0 ? words.map(word => word.text).join('') : strip_tags(paragraph[1])).trim(),
			agent: attribute(open_tag, 'ttm:agent'),
			words,
			...(background_vocals === undefined ? {} : { background: background_vocals })
		});
	}
	if (lines.length === 0) return undefined;
	const timing: TtmlTimingType = timing_attribute === 'word' || timing_attribute === 'syllable' ? timing_attribute : lines.some(line => line.words.length > 0) ? 'word' : 'line';
	return { timing, songwriters, lines };
}

function lrc_timestamp(seconds: number, brackets: '[]' | '<>'): string {
	const total_centiseconds = Math.round(Math.max(seconds, 0) * 100);
	const minutes = Math.floor(total_centiseconds / 6000);
	const remainder = total_centiseconds % 6000;
	const stamp = `${String(minutes).padStart(2, '0')}:${String(Math.floor(remainder / 100)).padStart(2, '0')}.${String(remainder % 100).padStart(2, '0')}`;
	return `${brackets[0]}${stamp}${brackets[1]}`;
}

export function to_lrc(lyrics: TtmlLyrics, opts: { word_sync?: boolean } = {}): string {
	return lyrics.lines
		.map((line) => {
			if (!opts.word_sync || line.words.length === 0) return `${lrc_timestamp(line.begin, '[]')}${line.text}`;
			return `${lrc_timestamp(line.begin, '[]')}${line.words.map(word => `${lrc_timestamp(word.begin, '<>')}${word.text}`).join('')}`;
		})
		.join('\n');
}
