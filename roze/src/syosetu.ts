import type { CookieJar } from "tough-cookie";
import { jsdom_document, map_html_collection } from "@common/jsdom";
import type { PromiseResult, ResponseError } from "@common/types";
import { extract_string_from_pattern, gen_uuid, is_empty, is_number, milliseconds_of } from "@common/utils/util";
import { Translate } from "@roze/translate";
import type { RozChapterContents } from "@roze/types/roz";
import rozfetch, { type RoZFetchRequestInit } from "@common/rozfetch";
import { generror, generror_catch } from "@common/utils/error_util";
import { reinterpret_cast } from "@common/cast";
import type Roz from "@roze/types/roz";

export namespace Syosetu {
    export interface Opts { cookie_jar?: CookieJar, fetch_opts?: RoZFetchRequestInit }

    export interface WebnovelContents {
        chapter_title: string;
        contents: string[];
    };

    function href_to_page(href?: string): number{
        if(href === undefined) return 1;
        const page_maybe = extract_string_from_pattern(href, /\/.+?\/\??p?=?(\d+)\/?/i);
        if(typeof page_maybe === "object") return 1;
        const page_no = parseInt(page_maybe);
        if(isNaN(page_no)) return 1;
        return page_no;
    }
    async function get_response(url: string, opts: Opts) {
        return await rozfetch(url, opts.fetch_opts);
    }
    async function get_response_text(url: string, opts: Opts) {
        const response = await get_response(url, opts);
        if("error" in response) return generror_catch(response, "get_response_text failed", {url, opts});
        return {text: await response.text(), response};
    }
    export async function webnovel_chapter_contents(webnovel_id: string, chapter: number, opts: Opts & {translate_contents?: boolean}): PromiseResult<WebnovelContents>{
        opts.translate_contents ??= false;
        const response_html = await get_response_text(`https://ncode.syosetu.com/${webnovel_id}/${chapter}/`, {
            ...opts, 
            fetch_opts: {
                cache_opts: {
                    cache_ms: milliseconds_of({years: 1}),
                    cache_ms_fail: milliseconds_of({}),
                    cache_mode: "file"    
                },
                ...opts.fetch_opts
            }
        });
        if("error" in response_html) return response_html;
        const dom = jsdom_document(response_html.text);
        
        const chapter_title_jp = dom.querySelector(".p-novel__title")?.textContent;
        if(typeof chapter_title_jp !== "string") return generror("Failed to find chapter_title", {webnovel_id, chapter});
        
        const sections_of_lines_of_text = dom.querySelectorAll(".js-novel-text");
        if(sections_of_lines_of_text === undefined) return generror("Failed to find lines_of_text", {webnovel_id, chapter});
        const lines_of_text = map_html_collection(sections_of_lines_of_text, (el) => el.children)
            .map(node_list => map_html_collection(node_list, (el) => el.textContent ?? ""))
            .flat();
        if(opts.translate_contents){
            const translated = await Translate.google_translate_html([chapter_title_jp, ...lines_of_text], "ja", "en");
            if("error" in translated) return translated;
            const [translated_title, ...translated_contents] = translated;
            return {
                chapter_title: translated_title,
                contents: translated_contents
            };
        }
        return {
            chapter_title: chapter_title_jp,
            contents: lines_of_text
        }
    }
    interface WebnovelChapterContentsRangeOpts {
        range_start?: number;
        range_end?: number;
        translate_contents?: boolean;
        on_chapter_parse?: (index: number, progress: number, elapsed_ms: number) => void;
    }
    export async function webnovel_chapter_contents_range(webnovel_id: string, opts: Opts & WebnovelChapterContentsRangeOpts){
        if (is_empty(webnovel_id)) return [];
        if (!is_number(opts.range_start)) opts.range_start = 1;
        if (!is_number(opts.range_end)) opts.range_end = opts.range_start;
        if(opts.range_start < 1 || opts.range_end < opts.range_start) return [];
        opts.translate_contents ??= false;

        const chapters: (WebnovelContents|ResponseError)[] = [];
        let time = new Date().getTime();
    	for (let i = opts.range_start; i <= opts.range_end; i++) {
	        const chapter_contents = await webnovel_chapter_contents(webnovel_id, i, opts);
            chapters.push(chapter_contents);
	        opts.on_chapter_parse?.(i, (opts.range_start-1)/(opts.range_end-1), new Date().getTime() - time);
            time = new Date().getTime();
	    }
        return chapters;
    }
    export async function webnovel_chapter_list(webnovel_id: string, opts: Opts & {page?: number}){
        opts.page ??= 1;
        const response_html = await get_response_text(`https://ncode.syosetu.com/${webnovel_id}/?p=${opts.page}`, {
            ...opts, 
            fetch_opts: {
                cache_opts: {
                    cache_ms: milliseconds_of({minutes: 10}),
                    cache_ms_fail: milliseconds_of({}),
                    cache_mode: "file"    
                },
                ...opts.fetch_opts
            }
        });
        if("error" in response_html) return response_html;
        const dom = jsdom_document(response_html.text);
        const title = dom.querySelector(".p-novel__title")?.textContent;
        const author_element = dom.querySelector(".p-novel__author")?.querySelector("a");
        const author = author_element?.textContent;
        const author_href = author_element?.href;
        const chapter_elements = dom.querySelectorAll("div.p-eplist__sublist");
        const chapters = map_html_collection(chapter_elements, (el) => ({
            title: el.querySelector("a")?.textContent ?? "",
            timestamp: el.querySelector(".p-eplist__update")?.textContent,
            revised: el.querySelector(".p-eplist__update")?.querySelector("span")?.textContent !== undefined,
            chapter_no: href_to_page(el.querySelector("a")?.href)
        }));
        const last_page_href = dom.querySelector<HTMLAnchorElement>("a.c-pager__item--last")?.href;
        const last_page = last_page_href === undefined ? opts.page : href_to_page(last_page_href);
        return {
            title: title,
            author: {
                name: author,
                href: author_href
            },
            chapters: chapters,
            page: opts.page,
            last_page: last_page,
            get_next_chapter_list: opts.page >= last_page ? null : async() => await webnovel_chapter_list(webnovel_id, {...opts, page: opts.page ? opts.page + 1 : 1}),
            get_last_chapter_list: opts.page >= last_page ? null : async() => await webnovel_chapter_list(webnovel_id, {...opts, page: last_page})
        }
    }

    export function webnovel_chapter_contents_to_roz_chapter_contents(webnovel_contents: WebnovelContents): RozChapterContents{
        return {
            chapter: { title: webnovel_contents.chapter_title },
            contents: webnovel_contents.contents.map(line => ({
                content: line,
                type: "PARAGRAPH",
                uuid: gen_uuid(),
                duration: 0,
            }))
        };
    }
    export function webnovel_chapters_contents_to_roz(webnovel_contents: (WebnovelContents|ResponseError)[]): Roz{
        const filtered_contents = reinterpret_cast<WebnovelContents[]>(webnovel_contents.filter(content => !("error" in content)));
        // TODO fetch metadata
        return {
            uuid: gen_uuid(),
            title: "",
            author: null,
            source_file: "", // TODO FIX THIS
            source_file_type: "SYOSETU",
            cover: null,
            publisher: null,
            date: null,
            series_name: null,
            series_no: null,
            content: filtered_contents.map(webnovel_chapter_contents_to_roz_chapter_contents)
        };
    }
};