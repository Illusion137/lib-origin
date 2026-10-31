export type TtmlTimingType = 'word' | 'line' | 'syllable';

export interface TtmlWord {
	begin: number;
	end: number;
	text: string;
}

export interface TtmlLine {
	begin: number;
	end: number;
	text: string;
	agent?: string;
	words: TtmlWord[];
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

export function parse_ttml(ttml: string): TtmlLyrics | undefined {
	const timing_attribute = /\w+:timing=["'](\w+)["']/.exec(ttml)?.[1]?.toLowerCase();
	const songwriters = [...ttml.matchAll(/<songwriter>(.*?)<\/songwriter>/gs)].map(match => strip_tags(match[1]));
	const lines: TtmlLine[] = [];
	for (const paragraph of ttml.matchAll(/<p\s[^>]*>(.*?)<\/p>/gs)) {
		const open_tag = paragraph[0].slice(0, paragraph[0].indexOf('>') + 1);
		const begin = attribute(open_tag, 'begin');
		if (begin === undefined) continue;
		const words: TtmlWord[] = [];
		for (const span of paragraph[1].matchAll(/<span\s[^>]*>(.*?)<\/span>(\s*)/gs)) {
			const span_tag = span[0].slice(0, span[0].indexOf('>') + 1);
			const span_begin = attribute(span_tag, 'begin');
			if (span_begin === undefined) continue;
			const span_end = attribute(span_tag, 'end');
			words.push({
				begin: parse_clock(span_begin),
				end: parse_clock(span_end ?? span_begin),
				text: strip_tags(span[1]) + (span[2].length > 0 ? ' ' : '')
			});
		}
		const line_begin = parse_clock(begin);
		const line_end = attribute(open_tag, 'end');
		lines.push({
			begin: line_begin,
			end: line_end === undefined ? (words.at(-1)?.end ?? line_begin) : parse_clock(line_end),
			text: (words.length > 0 ? words.map(word => word.text).join('') : strip_tags(paragraph[1])).trim(),
			agent: attribute(open_tag, 'ttm:agent'),
			words
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
