import fuzzysort from 'fuzzysort';
import { small_track } from './illusive_utils';
import { generror } from '@common/utils/error_util';
import type { Track } from './types';
import type { PromiseResult, ResponseError } from '@common/types';
import { remove_topic } from '@common/utils/clean_util';
import { extract_strings_from_pattern, is_empty, seconds_of } from '@common/utils/util';
import { reinterpret_cast } from '../../common/cast';
import { fs } from '@native/fs/fs';
import { SQLfs } from './sql/sql_fs';
import { Translate } from '@roze/translate';
import { Illusi } from '@origin/illusi/illusi';
import type { Action, LyricsResponse, ParsedLyrics } from '@origin/illusi/types';
import { IllusiActions } from './db/sync/illusi_actions';
import { server_service_ids, track_graph } from './db/sync/push';
import { deterministic_uuid } from './db/v2/keys';
import { encode_track } from './db/v2/track_codec';

export namespace Lyrics {
	export interface LyricsResult {
		plain: string;
		synced: string | undefined;
	}
	export interface LyricsInterval {
		from: number;
	}
	export interface SyncedLyric {
		text: string;
		interval: LyricsInterval;
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
	/** The server's parsed lyrics as plain text plus, when timed, LRC */
	export function from_illusi(lyrics: ParsedLyrics): LyricsResult {
		const plain = lyrics.lines.map(line => line.text).join('\n');
		const timed = lyrics.sync_type !== 'NONE' && lyrics.lines.some(line => line.start_ms !== null);
		const synced = timed
			? lyrics.lines.filter(line => line.start_ms !== null).map(line => `[${lrc_time(line.start_ms!)}] ${line.text}`).join('\n')
			: undefined;
		return { plain, synced };
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

	export async function get_track_lyrics(track: Track): PromiseResult<LyricsResult> {
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
		if (response.lyrics !== null) return from_illusi(response.lyrics);
		if (response.instrumental === true) return { plain: '', synced: undefined };
		return generror('No lyrics found', 'INFO', { track: small_track(track) });
	}
	function parse_lrclib_synced_line(line: string): SyncedLyric | ResponseError {
		const pattern = /\[(\d+):(\d+)\.(\d+)\] ?(.*?)$/g;
		const extracted = extract_strings_from_pattern(line, pattern);
		if (extracted.length < 4) return generror('Couldn\'t extract the lyrics pattern', 'LOW', { line });
		const [minute, second, millisecond, text] = extracted;
		const seconds = seconds_of({
			milliseconds: parseFloat(millisecond),
			seconds: parseFloat(second),
			minutes: parseFloat(minute)
		});
		return { text: text, interval: { from: seconds } };
	}
	export function lrclib_synced_lyrics_to_json(synced_lyrics_text: string): LRCLibSyncedLyrics | ResponseError {
		const synced_lyrics = synced_lyrics_text.split('\n').filter(line => !is_empty(line)).map(parse_lrclib_synced_line);
		const first_error = synced_lyrics.find(item => 'error' in item);
		if (first_error !== undefined) return first_error;
		return {
			type: 'LRCLIB',
			lyrics: reinterpret_cast<SyncedLyric[]>(synced_lyrics)
		};
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
					return {
						filename: path.split('/').pop() ?? path,
						path,
						content: typeof content === 'object' ? '' : content
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
	// TODO maybe add better support with franc but it seems iffy right now so ignore for a bit
	export function should_translate(lyrics: string) {
		// only checking japanese right now
		const jp_regex = /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤]+/gi;
		return jp_regex.test(lyrics);
	}

	export async function translate_plain_lyrics(lyrics: string): PromiseResult<[string, string][]> {
		const lyrics_lines = lyrics.split('\n');
		const translation_result = await Translate.google_translate_html(lyrics_lines, { lang_from: 'ja', lang_to: 'en' });
		if ('error' in translation_result) return translation_result;
		return lyrics_lines.map((line, i) => [line, translation_result[i]]);
	}
	export async function translate_synced_lyrics(lyrics: SyncedLyric[]): PromiseResult<[SyncedLyric, string][]> {
		const lyrics_lines = lyrics.map(lyric => lyric.text);
		const translation_result = await Translate.google_translate_html(lyrics_lines, { lang_from: 'ja', lang_to: 'en' });
		if ('error' in translation_result) return translation_result;
		return lyrics.map((lyric, i) => [lyric, translation_result[i]]);
	}
}
