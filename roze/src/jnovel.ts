import type { CookieJar } from "@common/utils/cookie_util";
import type { PromiseResult, ResponseError } from "@common/types";
import { extract_string_from_pattern, milliseconds_of } from "@common/utils/util";
import { RozeHeaders } from "./headers";
import type { JNovel_Calender } from "./types/jnovel-calender";
import type { JNovel_Home } from "./types/jnovel-home";
import type { JNovel_Part, JNovel_Serie, JNovel_Toc } from "./types/jnovel-reader";
import type { JNovel_Series } from "./types/jnovel-series";
import type { JNovel_Series_Page } from "./types/jnovel-series-page";
import type { JNovel_User } from "./types/jnovel-user";
import type { RozContent } from "./types/roz";
import { clean_html_text, html_to_roz_content } from "./utils";
import rozfetch, { merge_rozfetch_defaults, type RoZFetchRequestInit } from "../../common/rozfetch";
import { generror, generror_catch } from "@common/utils/error_util";
import { try_json_parse } from "@common/utils/parse_util";

export namespace JNovel {
	export interface Opts { cookie_jar?: CookieJar, fetch_opts?: RoZFetchRequestInit }

	interface JNovel_Reader {
		title: string,
		volume_img_uri: string,
		part: JNovel_Part
		serie: JNovel_Serie
		toc: JNovel_Toc
		content: RozContent[]
	};

	async function get_response(url: string, opts: Opts) {
		return await rozfetch(url, merge_rozfetch_defaults(opts, {
            headers: RozeHeaders.get_document_headers(opts.cookie_jar),
            referrerPolicy: "strict-origin-when-cross-origin",
            cache_opts: {
                cache_ms: milliseconds_of({years: 1}),
                cache_ms_fail: milliseconds_of({}),
                cache_mode: "all"
        }}).fetch_opts);
	}
	async function get_response_text(url: string, opts: Opts) {
		const response = await get_response(url, opts);
        if("error" in response) return generror_catch(response, "get_response_text failed", {url, opts});
		return await response.text();
	}
	export function __next_data__<T>(html: string | ResponseError): T|ResponseError {
		if (typeof html === "object") return html;
		const next_data_string = extract_string_from_pattern(html, /<script id="__NEXT_DATA__" type="application\/json">.*?({.+?})<\/script>/igs);
		if (typeof next_data_string === "object") return next_data_string;
		return try_json_parse<T>(next_data_string);
	}
	export async function next_response<T>(url: string, opts: Opts): PromiseResult<T>{
		return __next_data__<T>(await get_response_text(url, opts));
	}
	export async function home(opts: Opts) { return await next_response<JNovel_Home>("https://j-novel.club/", opts); }
	export async function series_page(opts: Opts) { return await next_response<JNovel_Series_Page>("https://j-novel.club/series", opts); }
	export async function series(opts: Opts & { path: string }) { return await next_response<JNovel_Series>(`https://j-novel.club/series/${opts.path}`, opts); }
	export async function calender(opts: Opts) { return await next_response<JNovel_Calender>("https://j-novel.club/calendar", opts); }
	export async function user(opts: Opts) {
		const access_token_expired = opts.cookie_jar?.getCookie("access_token")?.hasExpired() ?? true;
		if (access_token_expired) return generror("Access token is expired or doesn't exist");
		return await next_response<JNovel_User>("https://j-novel.club/user", opts);
	}

	function extract_from_pattern_cleaned_to_json<T>(text: string, regex: RegExp): T|ResponseError{
		const strerr = extract_string_from_pattern(text, regex);
		if (typeof strerr === "object") return strerr;
		return try_json_parse<T>(clean_html_text(strerr));
	}
	export async function reader_initial(opts: Opts & { legacy_id: string }) {
		const reader_text = await get_response_text(`https://labs.j-novel.club/embed/${opts.legacy_id}`, opts);
		if (typeof reader_text === "object") return reader_text;

		const title = extract_string_from_pattern(reader_text, /<title>(.+?)<\/title>/gis);
		const volume_img_uri = extract_string_from_pattern(reader_text, /<meta property="og:image" content="(.+?)">/gis);
		if (typeof title === "object") return title;
		if (typeof volume_img_uri === "object") return volume_img_uri;
		const data_toc = extract_from_pattern_cleaned_to_json<JNovel_Toc>(reader_text, /data-toc="(.+?)"/gis);
		const data_serie = extract_from_pattern_cleaned_to_json<JNovel_Serie>(reader_text, /data-serie="(.+?)"/gis);
		const data_part = extract_from_pattern_cleaned_to_json<JNovel_Part>(reader_text, /data-part="(.+?)"/gis);
		if ("error" in data_toc) return data_toc;
		if ("error" in data_serie) return data_serie;
		if ("error" in data_part) return data_part;

		return {
			title,
			volume_img_uri,
			part: data_part,
			serie: data_serie,
			toc: data_toc,
		}
	}
	export async function reader_contents(opts: Opts & { legacy_id: string }): PromiseResult<RozContent[]> {
		const xhtml = await get_response_text(`https://labs.j-novel.club/embed/v2/${opts.legacy_id}/data.xhtml`, opts);
		if (typeof xhtml === "object") return xhtml;
		return html_to_roz_content(xhtml);
	}
	export async function reader(opts: Opts & { legacy_id: string }): PromiseResult<JNovel_Reader> {
		const [reader_init, contents] = await Promise.all([reader_initial(opts), reader_contents(opts)]);
		if ("error" in reader_init) return reader_init;
		if ("error" in contents) return contents;
		return {
			title: reader_init.title,
			volume_img_uri: reader_init.volume_img_uri,
			content: contents,
			part: reader_init.part,
			serie: reader_init.serie,
			toc: reader_init.toc
		}
	}
	export async function reader_volume(opts: Opts & { legacy_id: string }): PromiseResult<JNovel_Reader[]> {
		const reader_result = await reader(opts);
		if ("error" in reader_result) return reader_result;
		const parts = [reader_result];
		const uuids: string[] = [opts.legacy_id];
		const index = reader_result.toc.findIndex(volume => volume.chapters.findIndex(chapter => chapter.uuid === opts.legacy_id) !== -1);
		const volume_parts = reader_result.toc[index].chapters;
		for (const volume_part of volume_parts)
			if (volume_part.selected != true)
				uuids.push(volume_part.uuid);
		for (const uuid of uuids) {
			const temp_reader = await reader({ ...opts, legacy_id: uuid });
			if ("error" in temp_reader) return temp_reader;
			parts.push(temp_reader);
		}
		return parts;
	}
}