import { Result, Search } from "./types/Search";

export namespace Genius {
    export async function search(query: string) {
        const search_response = await fetch(`https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(query).split("%20").join("+")}`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
                "cookie": "_genius_ab_test_cohort=57; _ab_tests_identifier=a6c83eb7-958b-409a-b099-6c60682babfc; _genius_ab_test_tonefuse_cohort=22; _genius_ab_test_tonefuse_interstitial_cohort=53; genius_outbrain_rollout_percentage=89; genius_first_impression=1723098160164; _csrf_token=%2FI%2Fiyte2gVlcsEED%2Fqd9VB8IukE3mGXBaZYaQjdVwL4%3D; _rapgenius_session=BAh7BzoPc2Vzc2lvbl9pZEkiJWQ1YmIwMDUyMzQ1ODkwODg3ZDc1MmNlYzc2M2JkYjc1BjoGRUY6EF9jc3JmX3Rva2VuSSIxL0kvaXl0ZTJnVmxjc0VFRC9xZDlWQjhJdWtFM21HWEJhWllhUWpkVndMND0GOwZG--fc4bc2e16237964102e5daa10c841ab0e40342d1; mp_77967c52dc38186cc1aadebdd19e2a82_mixpanel=%7B%22%24search_engine%22%3A%20%22google%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fwww.google.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22www.google.com%22%2C%22AMP%22%3A%20false%2C%22genius_platform%22%3A%20%22web%22%2C%22Logged%20In%22%3A%20false%2C%22Mobile%20Site%22%3A%20false%2C%22Tag%22%3A%20%22rap%22%2C%22user_agent%22%3A%20%22Mozilla%2F5.0%20(Windows%20NT%2010.0%3B%20Win64%3B%20x64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F127.0.0.0%20Safari%2F537.36%22%2C%22assembly_uid%22%3A%20%22d81ac3d8-a309-42b2-939e-a5232ff3e9a9%22%7D; mp_mixpanel__c=3",
                "Referer": "https://genius.com/search?q=babytron%20tutorial",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
        });
        if (!search_response.ok) return { "error": search_response.status };
        const search_result: Search = await search_response.json();
        const top_hit = search_result.response.sections.find(item => item.type === "top_hit");
        if (top_hit === undefined) return { "error": "top_hit doesn't exist" };
        return top_hit.hits[0].result;
    }
    export async function get_lyrics(search_result: Result): Promise<string> {
        const lyric_response = await fetch(`https://genius.com${search_result.path}`, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "priority": "u=0, i",
                "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "cookie": "_genius_ab_test_cohort=57; _ab_tests_identifier=a6c83eb7-958b-409a-b099-6c60682babfc; _genius_ab_test_tonefuse_cohort=22; _genius_ab_test_tonefuse_interstitial_cohort=53; genius_outbrain_rollout_percentage=89; genius_first_impression=1723098160164; _csrf_token=%2FI%2Fiyte2gVlcsEED%2Fqd9VB8IukE3mGXBaZYaQjdVwL4%3D; _rapgenius_session=BAh7BzoPc2Vzc2lvbl9pZEkiJWQ1YmIwMDUyMzQ1ODkwODg3ZDc1MmNlYzc2M2JkYjc1BjoGRUY6EF9jc3JmX3Rva2VuSSIxL0kvaXl0ZTJnVmxjc0VFRC9xZDlWQjhJdWtFM21HWEJhWllhUWpkVndMND0GOwZG--fc4bc2e16237964102e5daa10c841ab0e40342d1; mp_77967c52dc38186cc1aadebdd19e2a82_mixpanel=%7B%22%24search_engine%22%3A%20%22google%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fwww.google.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22www.google.com%22%2C%22AMP%22%3A%20false%2C%22genius_platform%22%3A%20%22web%22%2C%22Logged%20In%22%3A%20false%2C%22Mobile%20Site%22%3A%20false%2C%22Tag%22%3A%20%22rap%22%2C%22user_agent%22%3A%20%22Mozilla%2F5.0%20(Windows%20NT%2010.0%3B%20Win64%3B%20x64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F127.0.0.0%20Safari%2F537.36%22%2C%22assembly_uid%22%3A%20%22d81ac3d8-a309-42b2-939e-a5232ff3e9a9%22%7D; mp_mixpanel__c=1"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET"
        });
        if(!lyric_response.ok) return "";
        const html: string = await lyric_response.text();
        const extract_lyrics_containers_regex = /<div data-lyrics-container="true".+?>(.+?)<\/div>/gs;
        const lyrics_containers_matches = [...html.matchAll(extract_lyrics_containers_regex)];
        const lyrics_containers_string = lyrics_containers_matches.map(match => match[1]).join('');

        const extracted_lyrics = lyrics_containers_string.replace(/<br\/>/g, '\n').replace(/<span>/g, '').replace(/<span.+?>/g, '').replace(/<\/span>/g, '').replace(/<a.+?>/g, '').replace(/<\/a>/g, '').replace(/ ?&#x27;/g, "'").replace(/ +/g, ' ').replace(/\(<i>(.+?)<\/i>\n? ?\)/g, '$1').replace(/(\n ?)+/g, '\n').replace(/\n,/g, ',');
        return extracted_lyrics;
    }
}