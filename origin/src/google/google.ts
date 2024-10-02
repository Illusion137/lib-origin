import { google_query, is_empty } from "../utils/util";

export namespace Google {
    type SuggestionsResponse = [string, string[], any[], {"google:suggestsubtypes": number[][]}]
    export async function get_suggestions(search_query: string){
        try {
            if(is_empty(search_query)) return [];
            const suggestions_response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${google_query(search_query)}`);
            if(!suggestions_response.ok) return [];
            const suggestions = (await suggestions_response.json() as SuggestionsResponse)[1];
            return suggestions;
        } catch (error) { return []; }
    }
}