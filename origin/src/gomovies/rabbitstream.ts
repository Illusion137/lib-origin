import { PromiseResult } from "../utils/types";
import { try_json_parse } from "../utils/util";

// const rabbitstream_embed = (await axios.get(ajax_sources_json.link, {"headers": RABBITSTREAM_DEFAULT_HEADERS})).data;
export namespace RabbitStream {
    export interface SourceTrack {
        file : string,
        label : string,
        kind : string,
        default? : boolean
    }
    export interface Source { 
        sources : string, // Encoded in Base64
        tracks : SourceTrack[],
        encrypted : boolean,
        server : number
    }
    // function default_headers(){
    //     return {
    //         "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    //         "accept-language": "en-US,en;q=0.9",
    //         "sec-ch-ua": "\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
    //         "sec-ch-ua-mobile": "?0",
    //         "sec-ch-ua-platform": "\"Windows\"",
    //         "sec-fetch-dest": "iframe",
    //         "sec-fetch-mode": "navigate",
    //         "sec-fetch-site": "cross-site",
    //         "sec-fetch-user": "?1",
    //         "upgrade-insecure-requests": "1",
    //         "Referer": "https://gomovies.sx/",
    //         "Referrer-Policy": "strict-origin-when-cross-origin"
    //     };
    // }
    function source_headers(){
        return {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "sec-ch-ua": "\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "Referer": "https://rabbitstream.net/embed-4/XQ7fooNKWE2G?z=",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        };
    }
    export async function dataid_to_source(vidcloud_data_id : string) : PromiseResult<Source> {
        const source_response = await fetch(`https://rabbitstream.net/ajax/embed-4/getSources?id=${vidcloud_data_id}`, {headers: source_headers()});
        const rabbitstream_source = try_json_parse<Source>(await source_response.json());
        return rabbitstream_source;
    }
}