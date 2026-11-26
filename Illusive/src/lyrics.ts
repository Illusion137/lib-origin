import { small_track } from './illusive_utils';
import { catch_log, generror } from '@common/utils/error_util';
import type { Track } from './types';
import type { PromiseResult, ResponseError } from '@common/types';
import { remove_topic } from '@common/utils/clean_util';
import { is_empty } from '@common/utils/util';
import { fs } from '@native/fs/fs';
import { SQLfs } from './sql/sql_fs';
import { Translate } from '@roze/translate';
import { Illusi } from '@origin/illusi/illusi';
import { Genius } from '@origin/genius/genius';
import type { LyricsPreloadedState } from '@origin/genius/types/Lyrics';
import type { Action, LyricsLine, LyricsResponse, LyricsSyncType, ParsedLyrics, TrackAlignment, TrackVocals, UserLyricsBody } from '@origin/illusi/types';
import { LetterSync } from './letter_sync';
import { Prefs } from './prefs';
import { LyricsAlign } from './lyrics_align';
import { IllusiActions } from './db/sync/illusi_actions';
import { RequestQueue } from './db/sync/request_queue';
import { TrackMatch } from './track_match';
import { server_service_ids, track_graph } from './db/sync/push';
import { deterministic_uuid } from './db/v2/keys';
import { encode_track } from './db/v2/track_codec';

export namespace Lyrics {
	const VOCALS_DURATION_TOLERANCE_MS = 3_000;

	export type TrackLyrics = { sync_status: 'NONE'; plain: string } | { sync_status: Exclude<LyricsSyncType, 'NONE'>; lyrics: ParsedLyrics };
	/** Seconds */
	export interface LyricsInterval {
		from: number;
		to?: number;
	}
	export interface SyncedSegment {
		text: string;
		interval: LyricsInterval;
	}
	export interface SyncedLyric {
		text: string;
		interval: LyricsInterval;
		segments?: SyncedSegment[];
	}
	export interface LRCLibSyncedLyrics {
		type: 'LRCLIB';
		lyrics: SyncedLyric[];
	}
	function lrc_time(ms: number): string {
		const total_cs = Math.max(0, Math.round(ms / 10));
		const minutes = Math.floor(total_cs / 6000);
		const seconds = Math.floor(total_cs / 100) % 60;
		const centis = total_cs % 100;
		return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
	}
	function lrc_line(line: LyricsLine): string {
		if (line.segments === undefined || line.segments.length === 0) return `[${lrc_time(line.start_ms!)}] ${line.text}`;
		const words = line.segments.map(segment => `<${lrc_time(segment.start_ms)}>${segment.text}`).join('');
		const end = line.segments[line.segments.length - 1].end_ms;
		return `[${lrc_time(line.start_ms!)}] ${words.trimEnd()}${end === null ? '' : `<${lrc_time(end)}>`}`;
	}
	function timed_lines(lyrics: ParsedLyrics): LyricsLine[] {
		return lyrics.sync_type === 'NONE' ? [] : lyrics.lines.filter(line => line.start_ms !== null && !LyricsAlign.is_header(line.text));
	}
	export function to_plain(lyrics: ParsedLyrics): string {
		return lyrics.lines.map(line => line.text).join('\n');
	}
	export function from_plain(plain: string): ParsedLyrics {
		return { sync_type: 'NONE', lines: plain.split('\n').map(text => ({ text, start_ms: null, end_ms: null })) };
	}
	export function to_track_lyrics(lyrics: ParsedLyrics): TrackLyrics {
		if (lyrics.sync_type === 'NONE' || timed_lines(lyrics).length === 0) return { sync_status: 'NONE', plain: to_plain(lyrics) };
		return { sync_status: lyrics.sync_type, lyrics };
	}
	export function to_lrc(lyrics: ParsedLyrics): string {
		return timed_lines(lyrics).map(lrc_line).join('\n');
	}
	export function to_synced_lyrics(lyrics: ParsedLyrics): SyncedLyric[] {
		const lines = timed_lines(lyrics);
		return lines.map((line, i) => {
			const to = line.end_ms ?? line.segments?.at(-1)?.end_ms ?? lines[i + 1]?.start_ms ?? null;
			const segments = line.segments?.map(segment => ({ text: segment.text, interval: { from: segment.start_ms / 1000, ...(segment.end_ms === null ? {} : { to: segment.end_ms / 1000 }) } }));
			return {
				text: line.text,
				interval: { from: line.start_ms! / 1000, ...(to === null ? {} : { to: to / 1000 }) },
				...(segments !== undefined && segments.length > 0 ? { segments } : {})
			};
		});
	}

	function fits_track(analysis: { duration_ms: number }, duration_s?: number) {
		return duration_s === undefined || duration_s <= 0 || Math.abs(analysis.duration_ms - duration_s * 1000) <= VOCALS_DURATION_TOLERANCE_MS;
	}

	/** A track's analysis from Illusi, kept for the next few renders (single-flight); null while Illusi has none */
	function analysis_cache<T>(fetch: (track_id: string) => PromiseResult<T>, max: number) {
		const cached = new Map<string, T>();
		const fetching = new Map<string, Promise<T | null>>();
		return async (track_id: string): Promise<T | null> => {
			const hit = cached.get(track_id);
			if (hit !== undefined) return hit;
			let pending = fetching.get(track_id);
			if (pending === undefined) {
				pending = fetch(track_id).then(result => (Illusi.is_error(result) ? null : result));
				fetching.set(track_id, pending);
			}
			try {
				const value = await pending;
				if (value === null) return null;
				if (cached.size >= max) cached.delete(cached.keys().next().value!);
				cached.set(track_id, value);
				return value;
			} finally {
				fetching.delete(track_id);
			}
		};
	}
	interface Analysis {
		alignment: (track_id: string) => Promise<TrackAlignment | null>;
		vocals: (track_id: string) => Promise<TrackVocals | null>;
	}
	const ok = async <T>(result: PromiseResult<T>): Promise<T | null> => {
		const value = await result;
		return Illusi.is_error(value) ? null : value;
	};
	/** Asked fresh: lyrics are saved once with what Illusi has right now */
	const fetched: Analysis = { alignment: async id => ok(Illusi.Tracks.alignment(id)), vocals: async id => ok(Illusi.Tracks.vocals(id)) };
	/** Kept for the next few renders: shown lyrics are synced again on every display */
	const cached: Analysis = {
		// Hundreds of kilobytes each (letter probabilities per frame)
		alignment: analysis_cache(async (track_id: string) => Illusi.Tracks.alignment(track_id), 2),
		vocals: analysis_cache(async (track_id: string) => Illusi.Tracks.vocals(track_id), 8)
	};

	async function letter_sync(track_id: string, lyrics: ParsedLyrics, duration_s: number | undefined, analysis: Analysis): Promise<ParsedLyrics | null | undefined> {
		const alignment = await analysis.alignment(track_id);
		if (alignment === null || !fits_track(alignment, duration_s)) return undefined;
		return Prefs.get_pref('alignment_word_sync') ? LetterSync.word_sync(to_plain(lyrics), alignment) : LetterSync.line_sync(to_plain(lyrics), alignment);
	}

	/** Line timings (word timings too with `alignment_word_sync`) for plain lyrics from the track's vocals; synced lyrics are kept as they are */
	export async function with_vocal_sync(track_id: string, lyrics: ParsedLyrics, duration_s?: number, analysis: Analysis = fetched): Promise<ParsedLyrics> {
		if (lyrics.sync_type !== 'NONE') return lyrics;
		const aligned = await letter_sync(track_id, lyrics, duration_s, analysis);
		if (aligned !== undefined) return aligned ?? lyrics;
		const vocals = await analysis.vocals(track_id);
		if (vocals === null || !fits_track(vocals, duration_s)) return lyrics;
		const plain = to_plain(lyrics);
		return (LyricsAlign.can_hear(plain, vocals) ? LyricsAlign.heard_line_sync(plain, vocals)?.lyrics : LyricsAlign.line_sync(plain, vocals)) ?? lyrics;
	}

	/**
	 * Plain lyrics with line timings from the track's alignment, else its vocals, or null while Illusi has neither (or
	 * they don't fit). Asked whenever the lyrics are shown, so analysis that lands after the lyrics were saved is used.
	 * Translations stay on the lines they belong to.
	 */
	export async function vocal_line_sync(track: Track, lyrics: TranslatedLyrics): Promise<TranslatedLyrics | null> {
		if (lyrics.sync_type !== 'NONE' || Illusi.get_session() === null) return null;
		const id = await server_track_id(track);
		if (typeof id !== 'string') return null;
		const synced = await with_vocal_sync(id, lyrics, track.duration, cached);
		return synced === lyrics ? null : { ...synced, lines: carry_translations(lyrics.lines, synced.lines) };
	}

	/** Puts each line's translation back on the synced line with the same text; synced lines keep their order */
	function carry_translations(from: readonly TranslatedLine<LyricsLine>[], to: readonly LyricsLine[]): TranslatedLine<LyricsLine>[] {
		let i = 0;
		return to.map((line) => {
			const at = from.findIndex((source, j) => j >= i && source.text.trim() === line.text.trim());
			if (at < 0) return line;
			i = at + 1;
			return from[at].translated === undefined ? line : { ...line, translated: from[at].translated };
		});
	}

	/**
	 * Line synced lyrics with word timings from the track's alignment (with `alignment_word_sync`), else estimated from
	 * its vocals unless `vocals` is false; null when Illusi has neither that fits.
	 */
	export async function vocal_word_sync<L extends LyricsLine>(track: Track, lyrics: LyricsAlign.Lined<L>, vocals_estimate = true): Promise<LyricsAlign.Lined<L> | null> {
		if (lyrics.sync_type !== 'LINE' || Illusi.get_session() === null) return null;
		const id = await server_track_id(track);
		if (typeof id !== 'string') return null;
		if (Prefs.get_pref('alignment_word_sync')) {
			const alignment = await cached.alignment(id);
			const aligned = alignment !== null && fits_track(alignment, track.duration) ? LetterSync.word_sync_lines(lyrics, alignment) : null;
			if (aligned !== null) return aligned;
		}
		if (!vocals_estimate) return null;
		const vocals = await cached.vocals(id);
		return vocals === null || !fits_track(vocals, track.duration) ? null : LyricsAlign.word_sync(lyrics, vocals);
	}

	/** Line synced lyrics with word timings from their syllables, or null when they aren't line synced */
	export function syllable_word_sync<L extends LyricsLine>(lyrics: LyricsAlign.Lined<L>): LyricsAlign.Lined<L> | null {
		return lyrics.sync_type === 'LINE' ? LyricsAlign.syllable_word_sync(lyrics) : null;
	}
	const resolved_ids = new Map<string, string>();
	async function server_track_id(track: Track): PromiseResult<string> {
		if (track.illusi_id) return track.illusi_id;
		const known = resolved_ids.get(track.uid);
		if (known !== undefined) return known;
		const id = await find_server_track_id(track);
		if (typeof id === 'string') resolved_ids.set(track.uid, id);
		return id;
	}

	async function find_server_track_id(track: Track): PromiseResult<string> {
		const row = encode_track(track, { now: Date.now(), title_is_catalog: true });
		const artist = row.track.artists[0]?.name;
		const resolved = await Illusi.resolve([{
			ref: track.uid,
			type: 'track',
			service_ids: server_service_ids(row.track),
			title: row.track.title,
			artist: artist === undefined ? null : remove_topic(artist),
			album: row.track.album?.name ?? null,
			duration_ms: row.track.duration_ms
		}]);
		if (Illusi.is_error(resolved)) return resolved;
		const match = resolved[track.uid];
		if (match) return match;
		// The same id on a retry, so the server applies the contribution once
		const contributed = await Illusi.contribute(track_graph([row]), deterministic_uuid(`lyrics:${track.uid}`));
		if (Illusi.is_error(contributed)) return contributed;
		return contributed.refs[track.uid] ?? generror('The server didn\'t accept the track', 'LOW', { track: small_track(track), rejected: contributed.rejected });
	}

	export async function experimental_sync(track: Track, plain: string): PromiseResult<ParsedLyrics | null> {
		if (Illusi.get_session() === null) return generror('Log in to Illusi to sync lyrics', 'INFO', { track: small_track(track) });
		const id = await server_track_id(track);
		if (typeof id !== 'string') return id;
		const unsynced = from_plain(plain);
		const synced = await with_vocal_sync(id, unsynced, track.duration);
		return synced === unsynced ? null : synced;
	}

	async function genius_hit(track: Track) {
		const artist = track.artists[0]?.name;
		const title = TrackMatch.clean_title(track.title, TrackMatch.artist_names(track.artists.map(a => a.name)));
		const queries = [...new Set([`${artist === undefined ? '' : remove_topic(artist)} ${title}`.trim(), title])];
		let first_error: ResponseError | undefined;
		for (const query of queries) {
			const hits = await Genius.search_songs(query, {});
			if ('error' in hits) {
				first_error ??= hits;
				continue;
			}
			const hit = TrackMatch.best(hits, h => ({ title: h.result.title, artists: h.result.artist_names }), track);
			if (hit !== undefined) return hit;
		}
		return first_error ?? generror('No lyrics found on Genius', 'INFO', { track: small_track(track) });
	}

	async function genius_lyrics(track: Track): PromiseResult<{ lyrics: TrackLyrics; preloaded_state: LyricsPreloadedState }> {
		const hit = await genius_hit(track);
		if ('error' in hit) return hit;
		const result = await Genius.get_lyrics(hit.result, {});
		if ('error' in result) return result;
		if (typeof result.lyrics === 'object') return result.lyrics;
		const plain = result.lyrics.trim();
		if (plain === '') return generror('No lyrics found on Genius', 'INFO', { track: small_track(track) });
		return { lyrics: { sync_status: 'NONE', plain }, preloaded_state: result.preloaded_state };
	}

	async function contribute_genius(track: Track, preloaded_state: LyricsPreloadedState) {
		if (Illusi.get_session() === null) return;
		const id = await server_track_id(track);
		if (typeof id !== 'string') return catch_log(id.error);
		const result = await RequestQueue.send('genius_found', id, preloaded_state);
		if (result !== null && Illusi.is_error(result)) catch_log(result.error);
	}

	export function user_lyrics_body(lyrics: TrackLyrics): UserLyricsBody | null {
		if (lyrics.sync_status === 'NONE') return lyrics.plain.trim() === '' ? null : { format: 'PLAIN', sync_type: 'NONE', raw_content: lyrics.plain };
		const lrc = to_lrc(lyrics.lyrics);
		if (lrc.trim() === '') return null;
		const worded = lyrics.lyrics.lines.some(line => (line.segments?.length ?? 0) > 0);
		return worded ? { format: 'ELRC', sync_type: 'WORD', raw_content: lrc } : { format: 'LRC', sync_type: 'LINE', raw_content: lrc };
	}

	/** The user's edit becomes their one version of the track's lyrics on the server, ranked with the rest */
	export async function contribute_user(track: Track, lyrics: TrackLyrics) {
		if (Illusi.get_session() === null) return;
		const body = user_lyrics_body(lyrics);
		if (body === null) return;
		const id = await server_track_id(track);
		if (typeof id !== 'string') return catch_log(id.error);
		const result = await RequestQueue.send('user_lyrics', id, body);
		if (result !== null && Illusi.is_error(result)) catch_log(result.error);
	}

	async function with_experimental_sync(track: Track, lyrics: TrackLyrics): Promise<TrackLyrics> {
		if (lyrics.sync_status !== 'NONE' || lyrics.plain.trim() === '') return lyrics;
		if (Illusi.get_session() === null) return lyrics;
		const id = await server_track_id(track);
		if (typeof id !== 'string') return lyrics;
		const parsed = from_plain(lyrics.plain);
		const synced = await with_vocal_sync(id, parsed, track.duration);
		return synced === parsed ? lyrics : to_track_lyrics(synced);
	}

	export async function get_track_lyrics(track: Track): PromiseResult<TrackLyrics> {
		const lyrics = await server_track_lyrics(track);
		if (!('error' in lyrics)) return with_experimental_sync(track, lyrics);
		const genius = await genius_lyrics(track);
		if ('error' in genius) return lyrics;
		contribute_genius(track, genius.preloaded_state).catch(catch_log);
		return with_experimental_sync(track, genius.lyrics);
	}

	async function server_track_lyrics(track: Track): PromiseResult<TrackLyrics> {
		if (Illusi.get_session() === null) return generror('Log in to Illusi to get lyrics', 'INFO', { track: small_track(track) });
		const id = await server_track_id(track);
		if (typeof id !== 'string') return id;
		let response: LyricsResponse | ResponseError = await Illusi.Tracks.lyrics(id);
		if (Illusi.is_error(response)) return response;
		const pending: Action[] = [];
		for (const action of response.actions ?? []) {
			if (response.lyrics !== null || response.instrumental === true || (action.type !== 'CHECK_GENIUS' && action.type !== 'CHECK_YOUTUBE_MUSIC')) {
				pending.push(action);
				continue;
			}
			const answered = action.type === 'CHECK_GENIUS' ? await IllusiActions.check_genius(action) : await IllusiActions.check_youtube_music(action);
			if (answered !== null) response = answered;
		}
		IllusiActions.handle(pending);
		if (response.lyrics !== null) return to_track_lyrics(response.lyrics);
		if (response.instrumental === true) return { sync_status: 'NONE', plain: '' };
		return generror('No lyrics found', 'INFO', { track: small_track(track) });
	}
	const LRC_TIME = /(\d+):(\d+(?:\.\d+)?)/;
	const LRC_LINE = /^((?:\[\d+:\d+(?:\.\d+)?\])+) ?(.*)$/;
	const LRC_WORD_TIME = /<(\d+:\d+(?:\.\d+)?)>/g;
	function lrc_seconds(time: string): number {
		const [, minutes, seconds] = LRC_TIME.exec(time)!;
		return parseInt(minutes, 10) * 60 + parseFloat(seconds);
	}
	function parse_lrc_line(line: string): SyncedLyric[] {
		const match = LRC_LINE.exec(line.trim());
		if (match === null) return [];
		const [, stamps, body] = match;
		const parts = body.split(LRC_WORD_TIME);
		const segments: SyncedSegment[] = [];
		for (let i = 1; i + 1 < parts.length; i += 2) {
			const from = lrc_seconds(parts[i]);
			if (parts[i + 1] === '') {
				// A tag with no text after it ends the segment before it
				if (segments.length > 0) segments[segments.length - 1].interval.to = from;
				continue;
			}
			if (segments.length > 0) segments[segments.length - 1].interval.to ??= from;
			segments.push({ text: parts[i + 1], interval: { from } });
		}
		const text = (segments.length > 0 ? parts.filter((_, i) => i % 2 === 0).join('') : body).trim();
		return [...stamps.matchAll(/\[([^\]]+)\]/g)].map(([, stamp]) => ({
			text,
			interval: { from: lrc_seconds(stamp) },
			...(segments.length > 0 ? { segments } : {})
		}));
	}
	export function lrclib_synced_lyrics_to_json(synced_lyrics_text: string): LRCLibSyncedLyrics | ResponseError {
		const lyrics = synced_lyrics_text.split('\n').flatMap(parse_lrc_line).sort((a, b) => a.interval.from - b.interval.from);
		if (lyrics.length === 0 && !is_empty(synced_lyrics_text.trim())) return generror('Couldn\'t extract the lyrics pattern', 'LOW', { synced_lyrics_text });
		for (let i = 0; i < lyrics.length; i++) lyrics[i].interval.to = lyrics[i].segments?.at(-1)?.interval.to ?? lyrics[i + 1]?.interval.from;
		return { type: 'LRCLIB', lyrics };
	}

	/** The text of a ParsedLyrics JSON file, or '' when it doesn't parse */
	function plain_of_file(json: string): string {
		try {
			return to_plain(JSON.parse(json) as ParsedLyrics);
		} catch {
			return '';
		}
	}

	interface IndexedLine {
		text: string;
		words: string[];
		joined: string;
	}
	interface IndexedLyrics {
		track: Track;
		title_words: string[];
		lines: IndexedLine[];
	}
	export interface LyricsSearchResult {
		track: Track;
		line: string;
		score: number;
	}

	const SEARCH_LIMIT = 50;
	const SECTION_HEADER = /^\[[^\]]*\]$/;

	function search_words(text: string): string[] {
		return text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[‘’ʼ`´']/g, '').split(/[^\p{L}\p{N}]+/u).filter(word => word !== '');
	}

	function index_line(text: string): IndexedLine {
		const words = search_words(text);
		return { text, words, joined: words.join(' ') };
	}

	function within_one_edit(a: string, b: string): boolean {
		if (Math.abs(a.length - b.length) > 1) return false;
		let i = 0;
		while (i < a.length && i < b.length && a[i] === b[i]) i++;
		if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1) || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
		return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
	}

	/** 1 for the word itself, less for the start of the word being typed or a one letter typo */
	function word_score(query_word: string, word: string, typing: boolean): number {
		if (word === query_word) return 1;
		if (typing && query_word.length >= 2 && word.startsWith(query_word)) return 0.9;
		if (query_word.length >= 4 && within_one_edit(query_word, word)) return 0.8;
		return 0;
	}

	/** How much of the query a line holds: the whole phrase, every word, or most words */
	function line_score(line: { words: string[]; joined: string }, query_words: string[], query: string): number {
		if (line.words.length === 0) return 0;
		if (` ${line.joined} `.includes(` ${query} `)) return 3;
		let total = 0;
		let matched = 0;
		for (let i = 0; i < query_words.length; i++) {
			const best = Math.max(...line.words.map(word => word_score(query_words[i], word, i === query_words.length - 1)));
			total += best;
			if (best > 0) matched++;
		}
		if (matched === query_words.length) return 2 + total / query_words.length / 2;
		return matched >= 2 && matched / query_words.length >= 0.5 ? total / query_words.length : 0;
	}

	let indexed_lyrics: IndexedLyrics[] = [];
	export async function load_lyrics_into_fuzzy_memory(tracks: Track[]) {
		indexed_lyrics = await Promise.all(
			tracks.filter(track => !is_empty(track.lyrics_uri))
				.map(async (track): Promise<IndexedLyrics> => {
					const content = await fs().read_as_string(SQLfs.lyrics_directory(track.lyrics_uri!), { encoding: 'utf8' });
					const text = typeof content === 'object' ? '' : content;
					const plain = (track.sync_status ?? 'NONE') === 'NONE' ? text : plain_of_file(text);
					const lines = plain.split('\n').map(line => line.trim()).filter(line => line !== '' && !SECTION_HEADER.test(line));
					return { track, title_words: search_words(`${track.title} ${track.artists.map(artist => artist.name).join(' ')}`), lines: [...new Set(lines)].map(index_line) };
				})
		);
	}

	/** The downloaded lyrics best matching the query, each with the line that matched */
	export async function fuzzy_search_lyrics(query: string): Promise<LyricsSearchResult[]> {
		const query_words = search_words(query);
		if (query_words.length === 0) return [];
		const joined_query = query_words.join(' ');
		const results: LyricsSearchResult[] = [];
		for (const lyrics of indexed_lyrics) {
			let best: LyricsSearchResult | undefined;
			for (const line of lyrics.lines) {
				const score = line_score(line, query_words, joined_query);
				if (score > (best?.score ?? 0)) best = { track: lyrics.track, line: line.text, score };
			}
			const title_score = line_score({ words: lyrics.title_words, joined: lyrics.title_words.join(' ') }, query_words, joined_query);
			if (title_score >= 2 && title_score + 0.5 > (best?.score ?? 0)) best = { track: lyrics.track, line: best?.line ?? '', score: title_score + 0.5 };
			if (best !== undefined) results.push(best);
		}
		return results.sort((a, b) => b.score - a.score).slice(0, SEARCH_LIMIT);
	}

	// Illusi in an natively English app; so we'll assume that English is primary language
	type LyricsLanguage = 'ja' | 'ko' | 'zh';
	const LYRICS_LANGUAGE_PATTERNS: [LyricsLanguage, RegExp][] = [
		['ja', /[\u3040-\u30ff]/],
		['ko', /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/],
		['zh', /[\u4e00-\u9fff]/]
	];

	export function detect_lyrics_language(lyrics: string): LyricsLanguage | null {
		return LYRICS_LANGUAGE_PATTERNS.find(([, pattern]) => pattern.test(lyrics))?.[0] ?? null;
	}

	export function should_translate(lyrics: string) {
		return detect_lyrics_language(lyrics) !== null;
	}

	async function translate_lines(lines: string[]): PromiseResult<string[]> {
		const lang_from = detect_lyrics_language(lines.join('\n'));
		if (lang_from === null) return generror('No translatable language detected in lyrics', 'LOW');
		return Translate.google_translate_html(lines, { lang_from, lang_to: 'en' });
	}

	export type TranslatedLine<T extends { text: string } = { text: string }> = T & { translated?: string };
	export type TranslatedLyrics = Omit<ParsedLyrics, 'lines'> & { lines: TranslatedLine<LyricsLine>[] };

	async function with_translations<T extends { text: string }>(lines: readonly T[]): PromiseResult<TranslatedLine<T>[]> {
		const sung = lines.filter(line => line.text.trim() !== '' && !LyricsAlign.is_header(line.text));
		const translation_result = await translate_lines(sung.map(line => line.text));
		if ('error' in translation_result) return translation_result;
		const translations = new Map(sung.map((line, i) => [line, translation_result[i]]));
		return lines.map((line) => {
			const translated = translations.get(line);
			return translated === undefined || translated.trim() === '' ? { ...line } : { ...line, translated };
		});
	}
	export async function translate_plain_lyrics(lyrics: string): PromiseResult<TranslatedLine[]> {
		return with_translations(lyrics.split('\n').map(text => ({ text })));
	}
	export async function translate_synced_lyrics(lyrics: readonly SyncedLyric[]): PromiseResult<TranslatedLine<SyncedLyric>[]> {
		return with_translations(lyrics);
	}
	export async function translate_parsed_lyrics(lyrics: ParsedLyrics): PromiseResult<TranslatedLyrics> {
		const lines = await with_translations(lyrics.lines);
		if ('error' in lines) return lines;
		return { ...lyrics, lines };
	}
}
