import type { PromiseResult } from "@common/types";
import { RozeHeaders } from "@roze/headers";
import type languages from '@roze/data/language.json';
import { extract_string_from_pattern, is_empty, milliseconds_of } from "@common/utils/util";
import { replace_html_codes } from "@roze/utils";
import rozfetch, { type RoZFetchRequestInit } from "@common/rozfetch";
type LangCode = keyof typeof languages;

export namespace Translate {
    export async function google_translate_html_get_api_key(otps: {
        fetch_opts?: RoZFetchRequestInit;
    }) {
        const apikey_response = await rozfetch("https://translate.googleapis.com/_/translate_http/_/js/k=translate_http.tr.en_US._9aUrtDIFPs.O/am=AAAC/d=1/exm=el_conf/ed=1/rs=AN8SPfrCr6bGtQmtDQ15LtxWBBOPM_TtCQ/m=el_main", {
            cache_opts: {
                cache_ms: milliseconds_of({ seconds: 30 }),
                cache_ms_fail: milliseconds_of({ seconds: 1 }),
                cache_mode: "file"
            },
            ...otps.fetch_opts,
            headers: RozeHeaders.get_translate_apikey_headers(),
        });
        if ("error" in apikey_response) return apikey_response;
        return extract_string_from_pattern(await apikey_response.text(), /"X-goog-api-key": ?"(.+?)"/i, "MEDIUM");
    }
    export async function google_translate_html<LangFrom extends LangCode>(lines: string[], opts: {
        lang_from: LangFrom;
        lang_to: Omit<LangCode, LangFrom>;
        clean_html?: boolean;
        fetch_opts?: RoZFetchRequestInit;
        apikey_fetch_opts?: RoZFetchRequestInit;
    },): PromiseResult<string[]> {
        opts.clean_html ??= true;
        const cleaned_lines = lines.filter(line => !is_empty(line)).map(line => line.trim());
        const payload = [[
            cleaned_lines,
            opts.lang_from,
            opts.lang_to,
        ], "te_lib"];
        const apikey = await google_translate_html_get_api_key({ fetch_opts: opts.apikey_fetch_opts });
        if (typeof apikey === "object") return apikey;
        const translate_response = await rozfetch<string[][]>("https://translate-pa.googleapis.com/v1/translateHtml", {
            cache_opts: {
                cache_ms: milliseconds_of({ years: 1 }),
                cache_ms_fail: milliseconds_of({ seconds: 5 }),
                cache_mode: "file"
            },
            ...opts.fetch_opts,
            method: "POST",
            headers: RozeHeaders.post_translate_html_headers(apikey),
            body: JSON.stringify(payload),
        });
        if ("error" in translate_response) return translate_response;
        const translate_json = await translate_response.json();
        if ("error" in translate_json) return translate_json;
        const first_set = translate_json[0];
        const uncleaned_set: string[] = [];
        for (let i = 0, j = 0; i < lines.length; i++) {
            if (is_empty(lines[i])) uncleaned_set.push(lines[i]);
            else uncleaned_set.push(first_set[j++]);
        }
        return opts.clean_html ? uncleaned_set.map(line => replace_html_codes(line)) : uncleaned_set;
    }
}