import { CookieJar } from "../../origin/src/utils/cookie_util";

export namespace RozeHeaders {
    export function with_cookies(headers: Record<string, string>, cookie_jar?: CookieJar) {
        if (cookie_jar === undefined) return headers;
        return {
            ...headers,
            "cookie": cookie_jar.toString()
        };
    }
    export function get_document_headers(cookie_jar?: CookieJar) {
        return with_cookies({
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "priority": "u=0, i",
            "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
        }, cookie_jar);
    }
    export function get_translate_apikey_headers() {
        return {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Google Chrome\";v=\"137\", \"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "x-client-data": "CJG2yQEIpbbJAQipncoBCP7lygEIlaHLAQiRo8sBCIagzQEIpPLOAQiS9s4B",
            "Referer": "https://ncode.syosetu.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        };
    }
    export function post_translate_html_headers(apikey: string) {
        return {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json+protobuf",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Google Chrome\";v=\"137\", \"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "x-client-data": "CJG2yQEIpbbJAQipncoBCP7lygEIlaHLAQiRo8sBCIagzQEIpPLOAQiS9s4B",
            "x-goog-api-key": apikey,
            "Referer": "https://ncode.syosetu.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
    }
};