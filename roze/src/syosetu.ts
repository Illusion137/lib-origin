import { jsdom_document, map_html_collection } from "../../origin/src/utils/jsdom";
import type { PromiseResult } from "../../origin/src/utils/types";
import { extract_string_from_pattern, generror, generror_fetch, is_empty, isNumber } from "../../origin/src/utils/util";
import { Translate } from "./translate";

export namespace Syosetu {
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
    async function get_response(url: string) {
        return await fetch(url, {method: "GET"});
    }
    async function get_response_text(url: string) {
        const response = await get_response(url);
        if (!response.ok) return generror_fetch(response, "get_response_text failed", {}, {url});
        return await response.text();
    }
    export async function webnovel_chapter_contents(webnovel_id: string, chapter: number, translate_contents = false): PromiseResult<WebnovelContents>{
        const response_html = await get_response_text(`https://ncode.syosetu.com/${webnovel_id}/${chapter}/`);
        if(typeof response_html === "object") return response_html;
        const dom = jsdom_document(response_html);
        
        const chapter_title_jp = dom.querySelector(".p-novel__title")?.textContent;
        if(typeof chapter_title_jp !== "string") return generror("Failed to find chapter_title", {webnovel_id, chapter});
        
        const sections_of_lines_of_text = dom.querySelectorAll(".js-novel-text");
        if(sections_of_lines_of_text === undefined) return generror("Failed to find lines_of_text", {webnovel_id, chapter});
        
        const lines_of_text = map_html_collection(sections_of_lines_of_text, (el) => el.children)
            .map(node_list => map_html_collection(node_list, (el) => el.textContent ?? ""))
            .flat();
        if(translate_contents){
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
        on_chapter_parse?: (progress: number) => void;
    }
    export async function webnovel_chapter_contents_range(webnovel_id: string, opts: WebnovelChapterContentsRangeOpts){
        if (is_empty(webnovel_id)) return [];
        if (!isNumber(opts.range_start)) opts.range_start = 1;
        if (!isNumber(opts.range_end)) opts.range_end = opts.range_start;
        if(!opts.translate_contents) opts.translate_contents = false;
        if(opts.range_start < 1 || opts.range_end < opts.range_start) return [];

        const chapters: Awaited<ReturnType<typeof webnovel_chapter_contents>>[] = [];
    	for (let i = opts.range_start; i <= opts.range_end; i++) {
	        const chapter_contents = await webnovel_chapter_contents(webnovel_id, i, opts.translate_contents);
            chapters.push(chapter_contents);
	        opts.on_chapter_parse?.( (opts.range_start-1)/(opts.range_end-1) );
	    }
        return chapters;
    }
    export async function webnovel_chapter_list(webnovel_id: string, page = 1){
        const response_html = await get_response_text(`https://ncode.syosetu.com/${webnovel_id}/?p=${page}`);
        if(typeof response_html === "object") return response_html;
        const dom = jsdom_document(response_html);
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
        const last_page_href = (dom.querySelector("a.c-pager__item--last") as HTMLAnchorElement|undefined)?.href;
        const last_page = last_page_href === undefined ? page : href_to_page(last_page_href);
        return {
            title: title,
            author: {
                name: author,
                href: author_href
            },
            chapters: chapters,
            page: page,
            last_page: last_page,
            get_next_chapter_list: page >= last_page ? null : async() => await webnovel_chapter_list(webnovel_id, page + 1),
            get_last_chapter_list: page >= last_page ? null : async() => await webnovel_chapter_list(webnovel_id, last_page)
        }
    }
};