import rozfetch from "@common/rozfetch";
import type { BaseOpts } from "@common/types";
import { encode_params } from "@common/utils/fetch_util";

export namespace BandLab {
    type Opts = BaseOpts & {session_bearer: string;};
    
    function api_headers(opts: Opts & {auth_token: string}){
        return {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "authorization": `Bearer ${opts.auth_token}`,
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Google Chrome\";v=\"139\", \"Chromium\";v=\"139\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-client-id": "BandLab-Web",
            "x-client-version": "10.1.342",
            "cookie": opts.cookie_jar?.toString(),
            "Referer": "https://www.bandlab.com/library/projects/recent"
        }
    }

    export async function projects_list(user_uuid: string, opts: Opts){
        const params = {
            limit: 30
        };
        const response = await rozfetch(`https://www.bandlab.com/api/v1.3/users/${user_uuid}/songs?${encode_params(params)}`);
    }
};