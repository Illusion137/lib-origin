import rozfetch from "@common/rozfetch";
import type { PromiseResult } from "@common/types";
import { google_query } from "@common/utils/fetch_util";
import { milliseconds_of } from "@common/utils/util";

export namespace LRCLib { 
    export interface SearchResult {
        id: number;
        name: string;
        trackName: string;
        artistName: string;
        albumName: string;
        duration: number;
        instrumental: boolean;
        plainLyrics: string;
        syncedLyrics?: string;
    }

    export async function search(query: string): PromiseResult<SearchResult[]>{
        query = google_query(query);
        const search_response = await rozfetch<SearchResult[]>(`https://lrclib.net/api/search?q=${query}`, {cache_opts: {
            cache_mode: 'file',
            cache_ms: milliseconds_of({days: 1})
        }});
        if("error" in search_response) return search_response;
        const search_results = await search_response.json();
        return search_results;
    }
};