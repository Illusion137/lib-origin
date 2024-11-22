import { CookieJar } from "../utils/cookie_util";
import { encode_params } from "../utils/util";
import { AllCollections } from "./types/AllCollections";
import { GraphQLQuery } from "./types/GraphQLQuery";
import { MediaInfo } from "./types/MediaInfo";
import { MediaList } from "./types/MediaList";

export namespace Instagram {
    interface Opts { cookie_jar?: CookieJar }

    export function api_get_headers(opts: Opts) {
        return {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "priority": "u=1, i",
            "sec-ch-prefers-color-scheme": "dark",
            "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
            "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"129.0.6668.90\", \"Not=A?Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"129.0.6668.90\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-model": "\"\"",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-ch-ua-platform-version": "\"15.0.0\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-asbd-id": "129477",
            "x-csrftoken": "yyJwyUUtwBiWvHwLL4ItzPWfgVKBmsCL",
            "x-ig-app-id": "936619743392459",
            "x-ig-www-claim": "hmac.AR0q7aPT8u22eLSdnKmhtAdO_EogRBx4lVdnYgsotrBZrUbR",
            "x-requested-with": "XMLHttpRequest",
            "cookie": opts.cookie_jar?.toString() as string,
            "Referer": "https://www.instagram.com/p/C-xBxSCxnLc/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
    }
    export function api_post_headers(opts: Opts) {
        return {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/x-www-form-urlencoded",
            "priority": "u=1, i",
            "sec-ch-prefers-color-scheme": "dark",
            "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
            "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"129.0.6668.90\", \"Not=A?Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"129.0.6668.90\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-model": "\"\"",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-ch-ua-platform-version": "\"15.0.0\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-asbd-id": "129477",
            "x-csrftoken": "yyJwyUUtwBiWvHwLL4ItzPWfgVKBmsCL",
            "x-ig-app-id": "936619743392459",
            "x-ig-www-claim": "hmac.AR0q7aPT8u22eLSdnKmhtAdO_EogRBx4lVdnYgsotrBZrUbR",
            "x-instagram-ajax": "1017567874",
            "x-requested-with": "XMLHttpRequest",
            "cookie": opts.cookie_jar?.toString() as string,
            "Referer": "https://www.instagram.com/p/C99mNv1v5i2/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
    }
    const base_api_path = "https://www.instagram.com/api/v1/";
    export async function fetch_api_get<T extends { status: "ok" | "fail" }>(opts: Opts & { api_path: string, max_id?: string, params?: object }) {
        const params = { ...opts.params, max_id: opts.max_id ?? "" }
        const response = await fetch(base_api_path + opts.api_path + "?" + encode_params(params), { headers: api_get_headers(opts) });
        if (!response.ok) return { error: `Status Code: ${response.status}` };
        const response_result: T = await response.json();
        if (response_result.status !== "ok") return { error: JSON.stringify(response_result) };
        return response_result;
    }
    export async function fetch_api_post<T extends { status: "ok" | "fail" }>(opts: Opts & { base_path?: string, api_path: string, max_id?: string, params?: object, body?: any, no_params?: boolean}) {
        const params = { ...opts.params, max_id: opts.max_id ?? "" }
        const response = await fetch((opts.base_path ?? base_api_path) + opts.api_path + ((opts.no_params??false) ? "" : "?" + encode_params(params)), { headers: api_post_headers(opts), method: "POST", body: opts.body ? encode_params(opts.body) : null });
        if (!response.ok) return { error: `Status Code: ${response.status}` };
        const response_result: T = await response.json();
        if (response_result.status !== "ok") return { error: JSON.stringify(response_result) };
        return response_result;
    }

    export async function media_info(opts: Opts & { media_id: string }) {
        return fetch_api_get<MediaInfo>({ ...opts, api_path: `media/${opts.media_id}/info/` });
    }
    export async function save_post(opts: Opts & { media_id: string }) {
        return fetch_api_post<any>({ ...opts, api_path: `web/save/${opts.media_id}/save/` });
    }
    export async function edit_collection(opts: Opts & { add_media_ids?: string[], remove_media_ids?: string[], collections_id: string }) {
        const payload = {
            added_media_ids: opts.add_media_ids ?? [],
            removed_media_ids: opts.remove_media_ids ?? []
        }
        return fetch_api_post<any>({ ...opts, api_path: `collections/${opts.collections_id}/edit/`, body: payload });
    }
    export async function all_collections(opts: Opts) {
        const params = {
            collection_types: ["ALL_MEDIA_AUTO_COLLECTION", "MEDIA", "AUDIO_AUTO_COLLECTION"],
            get_cover_media_lists: true,
            include_public_only: 0,
            max_id: "",
        }
        return fetch_api_get<AllCollections>({ ...opts, api_path: `collections/list/`, params });
    }
    export async function media_list(opts: Opts & { api_path: string, max_id?: string }) {
        return fetch_api_get<MediaList>({ ...opts, api_path: opts.api_path, max_id: opts.max_id });
    }
    export async function saved_posts(opts: Opts & { max_id?: string }) {
        return fetch_api_get<MediaList>({ ...opts, api_path: `feed/saved/posts/`, max_id: opts.max_id });
    }
    export async function collection_posts(opts: Opts & { collection_id: string, max_id?: string }) {
        return fetch_api_get<MediaList>({ ...opts, api_path: `feed/collection/${opts.collection_id}/posts/`, max_id: opts.max_id });
    }
    export async function collection_posts_more(opts: Opts & { collection_id: string, max_id?: string }) {
        return fetch_api_get<MediaList>({ ...opts, api_path: `feed/collection/${opts.collection_id}/posts/`, max_id: opts.max_id });
    }
    export async function user_posts(opts: Opts & { username: string, count?: number, max_id?: string }) {
        // "kittyc4fe"
        const payload = {
            av: 17841439570122497n,
            __d: "www",
            __user: 0,
            __a: 1,
            __req: 30,
            __hs: "20018.HYP:instagram_web_pkg.2.1..0.1",
            dpr: 1,
            __ccg: "UNKNOWN",
            __rev: 1017567874,
            __s: "pk43a8:0zil23:l873aq",
            __hsi: 7428753471148009227n,
            __dyn: "7xeUjG1mxu1syUbFp41twpUnwgU7SbzEdF8aUco2qwJxS0k24o1DU2_CwjE1xoswaq0yE462mcw5Mx62G5UswoEcE7O2l0Fwqo31w9O1TwQzXwae4UaEW2G0AEco5G0zK5o4q3y1Sx-0lKq2-azqwt8d-2u2J0bS1LwTwKG1pg2fwxyo6O1FwlEcUed6goK2O4UrAwHxW1oCz8rwHwcOEymUhw",
            __csr: "hs8M8Ij2IrEl8yqlRi_H9fdiR4q9tAVljOGIylkRkRaXAnhbVkpqZ4RlR-9F95y-ujBp4uFaXByeHyucVGg_gDBt2RzkQu6Q75AyECUOE-4QUGQnx3y8PlAKh2Vqld3HCKp6G5qGq4ErQ7Qm00jBR3o5BrG1KCwrE6dw44gK581M819FleFUC0CE4-9yaDwem05eE0RN5DwKw2PAA3u3i3q5bhpQph82Iqx6786O4KullDBiwiQ1excje2a1ew8e8yehAhpQaQAEV0ExeiEcVkq0OoS7qwi8ogci0aS19wc64oeUhkswE7E5a032O01ciw1qG",
            __comet_req: 7,
            fb_dtsg: "NAcN4LZwMryVvkfE52CETw1PJfBrQVDu9uTPws7dkJfFTk7hpOz7reQ:17843671327157124:1724573045",
            jazoest: 26343,
            lsd: "i2tns9iKVSOqG5I0vg6rmS",
            __spin_r: 1017567874,
            __spin_b: "trunk",
            __spin_t: 1729641452,
            __jssesw: 1,
            fb_api_caller_class: "RelayModern",
            fb_api_req_friendly_name: "PolarisProfilePostsQuery",
            server_timestamps: true,
            doc_id: 8294378307327795,
            variables: { data: { count: opts.count ?? 12, include_relationship_info: false, latest_besties_reel_media: false, latest_reel_media: false }, username: opts.username, __relay_internal__pv__PolarisIsLoggedInrelayprovider: true, __relay_internal__pv__PolarisFeedShareMenurelayprovider: true }
        }
        return fetch_api_post<GraphQLQuery>({ ...opts, base_path: "https://www.instagram.com/", api_path: `graphql/query`, body: payload, no_params: true });
    }
}