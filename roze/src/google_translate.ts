import { CookieJar } from "../../origin/src/utils/cookie_util";
import { PromiseResult } from "../../origin/src/utils/types";
import { encode_params, eval_json, extract_string_from_pattern, try_json_parse } from "../../origin/src/utils/util";
import lang from './data/language.json';

export namespace GoogleTranslate {
    type LangCode = (keyof typeof lang) | "auto";
    type Opts = { cookie_jar?: CookieJar, token?: string, server?: string, freq?: string };
    type TokenTime = `${string}:${number}`;

    export function headers(opts: Opts) {
        return {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "priority": "u=0, i",
            "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
            "sec-ch-ua-arch": "\"x86\"",
            "sec-ch-ua-bitness": "\"64\"",
            "sec-ch-ua-form-factors": "\"Desktop\"",
            "sec-ch-ua-full-version": "\"129.0.6668.90\"",
            "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"129.0.6668.90\", \"Not=A?Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"129.0.6668.90\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-model": "\"\"",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-ch-ua-platform-version": "\"15.0.0\"",
            "sec-ch-ua-wow64": "?0",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "x-browser-channel": "stable",
            "x-browser-copyright": "Copyright 2024 Google LLC. All rights reserved.",
            "x-browser-validation": "g+9zsjnuPhmKvFM5e6eaEzcB1JY=",
            "x-browser-year": "2024",
            "x-client-data": "CIa2yQEIpLbJAQipncoBCPvuygEIlqHLAQjlossBCPSYzQEIhaDNAQiqns4BCOW1zgEIwrbOAQjjus4BCKC7zgEI0bzOAQjcvs4BCNrCzgEIk8bOAQi+x84BGJyxzgEYxL3OAQ==",
            "cookie": <string>opts.cookie_jar?.toString()
        }
    }
    export function post_headers(opts: Opts) {
        return {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
            "sec-ch-ua-arch": "\"x86\"",
            "sec-ch-ua-bitness": "\"64\"",
            "sec-ch-ua-form-factors": "\"Desktop\"",
            "sec-ch-ua-full-version": "\"129.0.6668.90\"",
            "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"129.0.6668.90\", \"Not=A?Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"129.0.6668.90\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-model": "\"\"",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-ch-ua-platform-version": "\"15.0.0\"",
            "sec-ch-ua-wow64": "?0",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-client-data": "CIa2yQEIpLbJAQipncoBCPvuygEIlqHLAQjlossBCPSYzQEIhaDNAQiqns4BCOW1zgEIwrbOAQjjus4BCKC7zgEI0bzOAQjcvs4BCNrCzgEIk8bOAQi+x84BGJyxzgEYxL3OAQ==",
            "x-same-domain": "1",
            "Referer": "https://translate.google.com/",
            "Referrer-Policy": "origin",
            "cookie": <string>opts.cookie_jar?.toString(),
        };
    }

    export async function token(opts: Opts): PromiseResult<{ token_time: TokenTime, email?: string, server?: string, freq?: string }> {
        const response = await fetch("https://translate.google.com/?sl=es&tl=en&op=translate", {
            "headers": headers(opts),
            "referrerPolicy": "origin",
            "body": null,
            "method": "GET"
        });
        if (!response.ok) return { "error": `Status Code: ${response.status}` };
        const html = await response.text();

        const window_values_string = extract_string_from_pattern(html, /window\..+?_values ?= ?(.+?);/si);
        if (typeof window_values_string === "object") return window_values_string;
        const windows_values = eval_json<any[]>(window_values_string);

        const global_data_string = extract_string_from_pattern(html, /window.+?global_data ? = ?(.+?)<\/script>/si);
        if (typeof global_data_string === "object") return global_data_string;
        const global_data = eval_json<object>(global_data_string);
        const global_data_cast: Record<string, any> = global_data;

        const token_time: TokenTime | undefined = windows_values.find(item => typeof item === "string" && !item.includes("https://") && /.+?:\d+/.test(item));
        if (!token_time) return { "error": "token_time is undefined" };
        const email: string | undefined = windows_values.find(item => typeof item === "string" && item.includes("@") && /.+?@.+?\./.test(item));
        const server: string | undefined = windows_values.find(item => typeof item === "string" && item.includes("boq_translate"));
        const freq: string | undefined = Object.values(global_data_cast).find(value => typeof value === "string" && /\d{8,}/.test(value));

        return { token_time, email, server, freq };
    }

/*
fetch_reqid = function(date?: Date) {
    (this.Da = date) && _.ts(this, this.Da.zA);
    _.ni();
    this.j = new _.Sr;
    this.H = "POST";
    this.Fg = zma++;
    us || (date = new Date,
    us = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds());
    this.Ra = 1 + us + this.Fg * 1E5;
    this.oa = new _.Ap;
    this.Ua = -1
}

_.wa = function(a) {
    var b = a.length;
    if (b > 0) {
        for (var c = Array(b), d = 0; d < b; d++)
            c[d] = a[d];
        return c
    }
    return []
}

_.cs = function(a, b: "_reqid", req_id: string) {
    a.remove(b);
    req_id.length > 0 && (a.H = null,
    a.j.set(as(a, b), _.wa(req_id)),
    a.v += req_id.length)
}

Es = function(a, b, req_id: number) {
    Array.isArray(req_id) || (req_id = [String(req_id)]);
    _.cs(a.v, b, req_id)
}
Es(this.j, "_reqid", this.Ra);

let zma = 0; // = 0 at start of token handle;
let Fg = zma++;
let us = undefined;

let a = new Date();
us = a.getHours() * 3600 + a.getMinutes() * 60 + a.getSeconds();
let Ra = 1 + us + 24 * 1E5
let Ra = 1 + us + Fg(24) * 1E5


(a = new Date, us = a.getHours() * 3600 + a.getMinutes() * 60 + a.getSeconds())
*/
    let zma = 0;
    let us: any = undefined;
    export function get_reqid(){
        let Fg = zma++;
        let a = undefined;
        us||(a = new Date, us = a.getHours() * 3600 + a.getMinutes() * 60 + a.getSeconds());
        let Ra = 1 + us + Fg * 1E5;
        return Ra;
    }

    const translate_small_input_threshold = 5000;
    export async function translate_small(opts: Opts & { input: string }) {
        if (opts.input.length > translate_small_input_threshold) return { "error": `Input Length exceeds the maximum length of ${translate_small_input_threshold}` };
        const from_lang: LangCode = "es"; from_lang;
        const to_lang: LangCode = "en"; to_lang;

        if (opts.token === undefined) {
            const tok = await token(opts);
            if ("error" in tok) return tok;
            opts.token = tok.token_time;
            opts.server = tok.server;
            opts.freq = tok.freq;
        }

        const rpcids = "MkEWBc";
        const params = {
            "rpcids": rpcids,
            "source-path": "/",
            "f.sid": opts.freq,
            "bl": opts.server, // SERVER
            "hl": "en", // Host LANGUAGE
            "soc-app": 1,
            "soc-platform": 1,
            "soc-device": 1,
            "_reqid": get_reqid(),
            "rt": "c",
        }
        console.log(params);
        type InnerLang = [[string, LangCode, LangCode, number], []];
        type OuterLang = [[[typeof rpcids, string, null, "generic"]]];
        const inner_lang_input: InnerLang = [[opts.input, from_lang, to_lang, 1], []];
        const f_req: OuterLang = [[[
            rpcids,
            JSON.stringify(inner_lang_input),
            null,
            "generic"
        ]]];

        const payload = {
            "f.req": f_req,
            "at": opts.token
        }; payload;
        const translate_response = await fetch(`https://translate.google.com/_/TranslateWebserverUi/data/batchexecute?${encode_params(params)}&`, {
            "headers": post_headers(opts),
            "body": encode_params(payload),
            "method": "POST"
        });
        if (!translate_response.ok) return { "error": `Status Code: ${translate_response.status} - ${translate_response.statusText}` };
        const response_text = await translate_response.text();
        const extracted = extract_string_from_pattern(response_text, /\d+\n(.+?)\d+\n/is);
        if (typeof extracted === "object") return extracted;
        type JSONString = string;
        type UnparsedResult = [["web.fr", typeof rpcids, JSONString, null, null, null, "generic"], ["di", number], ["af.httprm", number, string, number]];
        const result = try_json_parse<UnparsedResult>(extracted);
        if ("error" in result) return result;
        console.log(JSON.stringify(result));
        type ParsedInnerResult = [[], [any[], string, LangCode, LangCode, boolean], LangCode];
        const parsed = try_json_parse<ParsedInnerResult>(result[0][2]);
        if ("error" in parsed) return parsed;
        const translation: string | undefined = 
            parsed[1][0][0].find((item: any) => Array.isArray(item) && item.length !== 0)?.[0]
                .find((inner_item: string | number | null) => typeof inner_item === "string" && inner_item !== opts.input);
        if (translation === undefined) return { "error": "translation is undefined" };
        return translation;
    }
}