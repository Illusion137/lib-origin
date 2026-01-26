import { google_query } from "@common/utils/fetch_util";
import { is_empty, milliseconds_of } from "@common/utils/util";
import rozfetch from "@common/rozfetch";

export namespace Google {
    type SuggestionsResponse = [string, string[], any[], {"google:suggestsubtypes": number[][]}]
    export async function get_suggestions(search_query: string) {
        if(is_empty(search_query)) return [];
        const suggestions_response = await rozfetch<SuggestionsResponse>(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${google_query(search_query)}`, {cache_opts: {
            cache_ms: milliseconds_of({minutes: 1}),
            cache_mode: "memory"
        }});
        if("error" in suggestions_response) return [];
        const suggestions = await suggestions_response.json();
        if("error" in suggestions) return [];
        return suggestions[1];
    }
}