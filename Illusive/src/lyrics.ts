import fuzzysort from 'fuzzysort';
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
import type { Action, LyricsLine, LyricsResponse, LyricsSyncType, ParsedLyrics } from '@origin/illusi/types';
import { LetterSync } from './letter_sync';
import { LyricsAlign } from './lyrics_align';
import { IllusiActions } from './db/sync/illusi_actions';
import { RequestQueue } from './db/sync/request_queue';
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

	async function letter_sync(track_id: string, lyrics: ParsedLyrics, duration_s?: number): Promise<ParsedLyrics | null | undefined> {
		const alignment = await Illusi.Tracks.alignment(track_id);
		if (Illusi.is_error(alignment)) return undefined;
		if (duration_s !== undefined && duration_s > 0 && Math.abs(alignment.duration_ms - duration_s * 1000) > VOCALS_DURATION_TOLERANCE_MS) return undefined;
		return LetterSync.line_sync(to_plain(lyrics), alignment);
	}

	export async function with_vocal_sync(track_id: string, lyrics: ParsedLyrics, duration_s?: number): Promise<ParsedLyrics> {
		if (lyrics.sync_type === 'WORD' || lyrics.sync_type === 'SYLLABLE') return lyrics;
		if (lyrics.sync_type === 'NONE') {
			const aligned = await letter_sync(track_id, lyrics, duration_s);
			if (aligned !== undefined) return aligned ?? lyrics;
		}
		const vocals = await Illusi.Tracks.vocals(track_id);
		if (Illusi.is_error(vocals)) return lyrics;
		if (duration_s !== undefined && duration_s > 0 && Math.abs(vocals.duration_ms - duration_s * 1000) > VOCALS_DURATION_TOLERANCE_MS) return lyrics;
		let lined: ParsedLyrics | null = lyrics;
		if (lyrics.sync_type === 'NONE') {
			const plain = lyrics.lines.map(line => line.text).join('\n');
			lined = LyricsAlign.can_hear(plain, vocals) ? LyricsAlign.heard_line_sync(plain, vocals)?.lyrics ?? null : LyricsAlign.line_sync(plain, vocals);
		}
		if (lined === null) return lyrics;
		return LyricsAlign.word_sync(lined, vocals) ?? lined;
	}
	/** The track's illusi_id: its own, else the server's match for it, contributing the track when there is none */
	async function server_track_id(track: Track): PromiseResult<string> {
		if (track.illusi_id) return track.illusi_id;
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

	async function genius_lyrics(track: Track): PromiseResult<{ lyrics: TrackLyrics; preloaded_state: LyricsPreloadedState }> {
		const artist = track.artists[0]?.name;
		const hits = await Genius.search_songs(`${artist === undefined ? '' : remove_topic(artist)} ${track.title}`.trim(), {});
		if ('error' in hits) return hits;
		const hit = hits.find(h => IllusiActions.title_artist_match(h.result.title, h.result.artist_names, track));
		if (hit === undefined) return generror('No lyrics found on Genius', 'INFO', { track: small_track(track) });
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

	export async function get_track_lyrics(track: Track): PromiseResult<TrackLyrics> {
		const lyrics = await server_track_lyrics(track);
		if (!('error' in lyrics)) return lyrics;
		const genius = await genius_lyrics(track);
		if ('error' in genius) return lyrics;
		contribute_genius(track, genius.preloaded_state).catch(catch_log);
		return genius.lyrics;
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

	interface LyricsFileEntry {
		filename: string;
		path: string;
		content: string;
	}

	let loaded_fuzzy_lyrics: LyricsFileEntry[] = [];
	export async function load_lyrics_into_fuzzy_memory(tracks: Track[]) {
		loaded_fuzzy_lyrics = await Promise.all<LyricsFileEntry>(
			tracks.filter(track => !is_empty(track.lyrics_uri))
				.map(async (track) => {
					const path = SQLfs.lyrics_directory(track.lyrics_uri!);
					const content = await fs().read_as_string(path, { encoding: 'utf8' });
					const text = typeof content === 'object' ? '' : content;
					return {
						filename: path.split('/').pop() ?? path,
						path,
						content: (track.sync_status ?? 'NONE') === 'NONE' ? text : plain_of_file(text)
					};
				})
		);
	}
	export async function fuzzy_search_lyrics(query: string) {
		const prepared = loaded_fuzzy_lyrics.map(f => ({
			...f,
			_filename: fuzzysort.prepare(f.filename),
			_content: fuzzysort.prepare(f.content)
		}));

		const results = fuzzysort.go(query, prepared, {
			keys: ['_filename', '_content'],
			limit: 50,
			threshold: -10000
		});

		return results;
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
	export async function translate_parsed_lyrics(lyrics: ParsedLyrics): PromiseResult<Omit<ParsedLyrics, 'lines'> & { lines: TranslatedLine<LyricsLine>[] }> {
		const lines = await with_translations(lyrics.lines);
		if ('error' in lines) return lines;
		return { ...lyrics, lines };
	}
}
