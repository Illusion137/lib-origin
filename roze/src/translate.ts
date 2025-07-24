import type { PromiseResult, ResponseError } from "@common/types";
import { RozeHeaders } from "./headers";
import type languages from './data/language.json';
import { extract_string_from_pattern, generror_fetch, is_empty, json_catch } from "@common/utils/util";
import { replace_html_codes } from "./utils";
type LangCode = keyof typeof languages;

export namespace Translate {
    export async function google_translate_html_get_api_key() {
        const apikey_response = await fetch("https://translate.googleapis.com/_/translate_http/_/js/k=translate_http.tr.en_US._9aUrtDIFPs.O/am=AAAC/d=1/exm=el_conf/ed=1/rs=AN8SPfrCr6bGtQmtDQ15LtxWBBOPM_TtCQ/m=el_main", {
            headers: RozeHeaders.get_translate_apikey_headers()
        });
        if(!apikey_response.ok) return generror_fetch(apikey_response, "Failed to get translation apikey", {}, {});
        return extract_string_from_pattern(await apikey_response.text(), /"X-goog-api-key": ?"(.+?)"/i);
    }
    export async function google_translate_html<LangFrom extends LangCode>(lines: string[], lang_from: LangFrom, lang_to: Omit<LangCode, LangFrom>, clean_html = true): PromiseResult<string[]> {
        const cleaned_lines = lines.filter(line => !is_empty(line)).map(line => line.trim());
        const payload = [[
            cleaned_lines,
            lang_from,
            lang_to,
        ], "te_lib"];
        const apikey = await google_translate_html_get_api_key();
        if(typeof apikey === "object") return apikey;
        const translate_response = await fetch("https://translate-pa.googleapis.com/v1/translateHtml", {
            method: "POST",
            headers: RozeHeaders.post_translate_html_headers(apikey),
            body: JSON.stringify(payload)
        });
        if (!translate_response.ok) return generror_fetch(translate_response, "Failed to translate html", {}, { lang_from, lang_to, apikey });
        const translate_json: ResponseError|string[][] = await translate_response.json().catch(json_catch);
        if("error" in translate_json) return translate_json;
        const first_set = translate_json[0];
        const uncleaned_set: string[] = [];
        for(let i = 0, j = 0; i < lines.length; i++){
            if(is_empty(lines[i])) uncleaned_set.push(lines[i]);
            else uncleaned_set.push(first_set[j++]);
        }
        return clean_html ? uncleaned_set.map(line => replace_html_codes(line)) : uncleaned_set;
    }
}