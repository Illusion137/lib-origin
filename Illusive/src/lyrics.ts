import fuzzysort from "fuzzysort";
import { artist_string, clean_track_info, number_epsilon_distance, small_track } from "./illusive_utils";
import * as Origin from '@origin/index';
import { generror } from "@common/utils/error_util";
import type { Track } from "./types";
import type { PromiseResult, ResponseError } from "@common/types";
import { remove_topic } from "@common/utils/clean_util";
import { extract_strings_from_pattern, is_empty, seconds_of } from "@common/utils/util";
import { reinterpret_cast } from '../../common/cast';
import { fs } from "@native/fs/fs";
import { SQLfs } from "./sql/sql_fs";

export namespace Lyrics {
    export interface LyricsResult {
        plain: string;
        synced: string|undefined;
    }
    export interface LyricsInterval {
        from: number;
    }
    export interface SyncedLyric {
        text: string;
        interval: LyricsInterval;
    }
    export interface LRCLibSyncedLyrics {
        type: "LRCLIB";
        lyrics: SyncedLyric[];
    } 
    const LRCLIB_HIT_DURATION_EPSILON = 7;
    async function lrclib_lyrics_try_good_result(track: Track, search_query: string): PromiseResult<LyricsResult> {
        const search_response = await Origin.LRCLib.search(search_query);
        if ("error" in search_response) return search_response;
        const best_result = search_response.find(hit => {
            const title_result = fuzzysort.single(
                clean_track_info(hit.trackName).trim(),
                clean_track_info(track.title).trim(),
            );
            const artist_result = fuzzysort.single(
                clean_track_info(hit.artistName).trim(),
                clean_track_info(artist_string(track)).trim(),
            );
            return (title_result?.score ?? 0) >= 0.6 && (artist_result?.score ?? 0.5) >= 0.5 && number_epsilon_distance(hit.duration, track.duration, LRCLIB_HIT_DURATION_EPSILON);
        });
        if (best_result === undefined) return generror("Unable to find a good lyrics result", "INFO", { track: small_track(track), search_query });
        return {plain: best_result.plainLyrics, synced: typeof best_result.syncedLyrics !== "string" ? undefined : best_result.syncedLyrics};
    }
    async function genius_lyrics_try_good_result(track: Track, search_query: string): PromiseResult<LyricsResult> {
        const search_response = await Origin.Genius.search_songs(search_query, {});
        if ("error" in search_response) return search_response;
        const best_result = search_response.find(hit => {
            const title_result = fuzzysort.single(
                clean_track_info(hit.result.title).trim(),
                clean_track_info(track.title).trim(),
            );
            const artist_result = fuzzysort.single(
                clean_track_info(hit.result.artist_names).trim(),
                clean_track_info(artist_string(track)).trim(),
            );
            return (title_result?.score ?? 0) >= 0.6 && (artist_result?.score ?? 0.5) >= 0.5
        });
        if (best_result === undefined) return generror("Unable to find a good lyrics result", "INFO", { track: small_track(track), search_query });
        const lyrics_response = await Origin.Genius.get_lyrics(best_result.result, {});
        if(typeof lyrics_response === "object") return lyrics_response;
        return {plain: lyrics_response, synced: undefined};
    }
    async function lyrics_get_first_good_result(track: Track, search_queries: string[]) {
        // LRCLib pass
        for (const search_query of search_queries) {
            const result = await lrclib_lyrics_try_good_result(track, search_query);
            if ("error" in result) continue;
            return result;
        }
        // Genius pass
        for (const search_query of search_queries) {
            const result = await genius_lyrics_try_good_result(track, search_query);
            if ("error" in result) continue;
            return result;
        }
        return generror("Unable to find a good lyrics result", "INFO", { track: small_track(track), search_queries });
    }
    export async function get_track_lyrics(track: Track): PromiseResult<LyricsResult> {
        const artist_name = track.artists[0].name === "Various Artists" || track.artists[0].name.includes("Release") ? "" : track.artists[0].name;

        const base_query = `${remove_topic(artist_name)} ${track.title.replace(`${artist_name} - `, '')}`;
        const base_query_clean = `${remove_topic(artist_name)} ${clean_track_info(track.title.replace(`${artist_name} - `, ''))}`;

        const track_title_split = track.title.split(' - ');
        const best_result = await lyrics_get_first_good_result(track, [
            track_title_split.length === 2 ? `${clean_track_info(track_title_split[0])} ${clean_track_info(track_title_split[1])}` : undefined,
            track_title_split.length === 2 ? `${clean_track_info(track_title_split[1])} ${remove_topic(artist_name)}` : undefined,
            base_query,
            base_query_clean !== base_query ? base_query_clean : undefined
        ].filter(s => s !== undefined));
        if ("error" in best_result) return best_result;
        return best_result;
    }
    function parse_lrclib_synced_line(line: string): SyncedLyric | ResponseError {
        const pattern = /\[(\d+):(\d+)\.(\d+)\] (.*?)$/g;
        const extracted = extract_strings_from_pattern(line, pattern);
        if (extracted.length < 4) return generror("Couldn't extract the lyrics pattern", "LOW", { line });
        const [minute, second, millisecond, text] = extracted;
        const seconds = seconds_of({
            milliseconds: parseFloat(millisecond),
            seconds: parseFloat(second),
            minutes: parseFloat(minute)
        })
        return { text: text, interval: { from: seconds } };
    }
    export function lrclib_synced_lyrics_to_json(synced_lyrics_text: string): LRCLibSyncedLyrics|ResponseError {
        const synced_lyrics = synced_lyrics_text.split('\n').filter(line => !is_empty(line)).map(parse_lrclib_synced_line);
        const first_error = synced_lyrics.find(item => "error" in item);
        if(first_error !== undefined) return first_error;
        return {
            type: "LRCLIB",
            lyrics: reinterpret_cast<SyncedLyric[]>(synced_lyrics)
        }
    }

    interface LyricsFileEntry {
        filename: string;
        path: string;
        content: string;
    };

    let loaded_fuzzy_lyrics: LyricsFileEntry[] = [];
    export async function load_lyrics_into_fuzzy_memory(tracks: Track[]){
        loaded_fuzzy_lyrics = await Promise.all<LyricsFileEntry>(
            tracks.filter(track => !is_empty(track.lyrics_uri))
                .map(async (track) => {
                    const path = SQLfs.lyrics_directory(track.lyrics_uri!);
                    const content = await fs().read_as_string(path, {encoding: "utf8"});
                    return {
                        filename: path.split('/').pop() ?? path,
                        path,
                        content: typeof content === "object" ? "" : content,
                    };
                })
        );
    }
    export async function fuzzy_search_lyrics(query: string){
        const prepared = loaded_fuzzy_lyrics.map(f => ({
            ...f,
            _filename: fuzzysort.prepare(f.filename),
            _content: fuzzysort.prepare(f.content),
        }));

        const results = fuzzysort.go(query, prepared, {
            keys: ['_filename', '_content'],
            limit: 50,
            threshold: -10000,
        });

        return results;
    }
}