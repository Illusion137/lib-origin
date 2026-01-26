import type { PromiseResult } from "@common/types";
import { extract_string_from_pattern } from "@common/utils/util";
import type { Children, LyricsPreloadedState } from "@origin/genius/types/Lyrics";
import type { Result, Search } from "@origin/genius/types/Search";
import { generror, generror_catch } from "@common/utils/error_util";
import { base_get_headers } from "@common/headers_base";
import rozfetch, { type RoZFetchRequestInit } from "@common/rozfetch";
import { try_json_eval, try_json_parse } from "@common/utils/parse_util";

export namespace Genius {
    interface Opts { fetch_opts?: RoZFetchRequestInit }
    export async function search(query: string, opts: Opts){
        const search_response = await rozfetch<Search>(`https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(query).split("%20").join("+")}`, {
            headers: {
                ...base_get_headers({}),
                "accept": "application/json, text/plain, */*",
                "x-requested-with": "XMLHttpRequest",
                "cookie": "_genius_ab_test_cohort=57; _ab_tests_identifier=a6c83eb7-958b-409a-b099-6c60682babfc; _genius_ab_test_tonefuse_cohort=22; _genius_ab_test_tonefuse_interstitial_cohort=53; genius_outbrain_rollout_percentage=89; genius_first_impression=1723098160164; _csrf_token=%2FI%2Fiyte2gVlcsEED%2Fqd9VB8IukE3mGXBaZYaQjdVwL4%3D; _rapgenius_session=BAh7BzoPc2Vzc2lvbl9pZEkiJWQ1YmIwMDUyMzQ1ODkwODg3ZDc1MmNlYzc2M2JkYjc1BjoGRUY6EF9jc3JmX3Rva2VuSSIxL0kvaXl0ZTJnVmxjc0VFRC9xZDlWQjhJdWtFM21HWEJhWllhUWpkVndMND0GOwZG--fc4bc2e16237964102e5daa10c841ab0e40342d1; mp_77967c52dc38186cc1aadebdd19e2a82_mixpanel=%7B%22%24search_engine%22%3A%20%22google%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fwww.google.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22www.google.com%22%2C%22AMP%22%3A%20false%2C%22genius_platform%22%3A%20%22web%22%2C%22Logged%20In%22%3A%20false%2C%22Mobile%20Site%22%3A%20false%2C%22Tag%22%3A%20%22rap%22%2C%22user_agent%22%3A%20%22Mozilla%2F5.0%20(Windows%20NT%2010.0%3B%20Win64%3B%20x64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F127.0.0.0%20Safari%2F537.36%22%2C%22assembly_uid%22%3A%20%22d81ac3d8-a309-42b2-939e-a5232ff3e9a9%22%7D; mp_mixpanel__c=3",
            },
            body: null,
            method: "GET",
            ...opts.fetch_opts
        });
        if("error" in search_response) return search_response;
        const search_result = await search_response.json();
        return search_result;
    }
    export async function search_songs(query: string, opts: Opts) {
        const search_result = await search(query, opts);
        if("error" in search_result) return search_result;

        const top_result_hits = search_result.response.sections.find(item => item.type === "top_hit")?.hits;
        const song_top_result_hits = top_result_hits?.filter(hit => hit.index === "song");
        
        const all_songs = song_top_result_hits ?? [];
        const song_hits = search_result.response.sections.find(item => item.type === "song")?.hits;
        return all_songs.concat(song_hits ?? []);
    }
    const lyrics_fail_message = "Failed to fetch lyrics for song";
    export const lyrics_no_continue_fail_message = "Failed to fetch lyrics for song + no continues";
    export async function get_lyrics_preloaded_state(search_result: Result, opts: Opts) {
        try {
            const lyric_response = await rozfetch(`https://genius.com${search_result.path}`, {
                headers: {
                    ...base_get_headers({}),
                    "cookie": "_genius_ab_test_cohort=57; _ab_tests_identifier=a6c83eb7-958b-409a-b099-6c60682babfc; _genius_ab_test_tonefuse_cohort=22; _genius_ab_test_tonefuse_interstitial_cohort=53; genius_outbrain_rollout_percentage=89; genius_first_impression=1723098160164; _csrf_token=%2FI%2Fiyte2gVlcsEED%2Fqd9VB8IukE3mGXBaZYaQjdVwL4%3D; _rapgenius_session=BAh7BzoPc2Vzc2lvbl9pZEkiJWQ1YmIwMDUyMzQ1ODkwODg3ZDc1MmNlYzc2M2JkYjc1BjoGRUY6EF9jc3JmX3Rva2VuSSIxL0kvaXl0ZTJnVmxjc0VFRC9xZDlWQjhJdWtFM21HWEJhWllhUWpkVndMND0GOwZG--fc4bc2e16237964102e5daa10c841ab0e40342d1; mp_77967c52dc38186cc1aadebdd19e2a82_mixpanel=%7B%22%24search_engine%22%3A%20%22google%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fwww.google.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22www.google.com%22%2C%22AMP%22%3A%20false%2C%22genius_platform%22%3A%20%22web%22%2C%22Logged%20In%22%3A%20false%2C%22Mobile%20Site%22%3A%20false%2C%22Tag%22%3A%20%22rap%22%2C%22user_agent%22%3A%20%22Mozilla%2F5.0%20(Windows%20NT%2010.0%3B%20Win64%3B%20x64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F127.0.0.0%20Safari%2F537.36%22%2C%22assembly_uid%22%3A%20%22d81ac3d8-a309-42b2-939e-a5232ff3e9a9%22%7D; mp_mixpanel__c=1"
                },
                referrerPolicy: "strict-origin-when-cross-origin",
                body: null,
                method: "GET",
                ...opts.fetch_opts
            });
            if("error" in lyric_response) return lyric_response;
            const html: string = await lyric_response.text();
            const extract_preloaded_state = /window\.__PRELOADED_STATE__ ?= ?JSON.parse\(('.+?')\);/gis;
            const preloaded_state_string = extract_string_from_pattern(html, extract_preloaded_state);
            if(typeof preloaded_state_string === 'object') return generror(lyrics_fail_message, {path: search_result.path});
            const eval_preloaded_state_string = try_json_eval<string>(preloaded_state_string);
            if(typeof eval_preloaded_state_string === "object") return eval_preloaded_state_string;
            const preloaded_state = try_json_parse<LyricsPreloadedState>(eval_preloaded_state_string);
            if("error" in preloaded_state) return generror(lyrics_fail_message, {path: search_result.path});
            return preloaded_state;
        }
        catch(e){
            return generror_catch(e, lyrics_no_continue_fail_message, {});
        }
    }
    export async function get_lyrics(search_result: Result, opts: Opts): PromiseResult<string> {
        try {
            const preloaded_state = await get_lyrics_preloaded_state(search_result, opts);
            if("error" in preloaded_state) return preloaded_state;
            const all_strings: string[][] = [];
            const initial_children: Children[] = preloaded_state.songPage.lyricsData.body.children as unknown as Children[];
            function recursive_parse(child: Children|string, collected: string[]): string[]{
                if(typeof child === "string") return collected.concat([child]);
                if(typeof child === "object" && "children" in child){
                    return collected.concat(child.children.map(c => recursive_parse(c, [])).flat());
                }
                if(typeof child === "object" && "tag" in child && !("children" in child)){
                    if((child as {tag: string}).tag === "br") return collected.concat(['\n']);
                    return collected.concat([""]);
                }
                return collected.concat([""]);
            }
            all_strings.push(...initial_children.map(c => recursive_parse(c, [])));
            return all_strings.flat().join('');
        }
        catch(_){
            return generror(lyrics_no_continue_fail_message);
        }
    }
}