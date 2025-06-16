import { jsdom_document, map_html_collection } from "../../origin/src/utils/jsdom";
import { PromiseResult } from "../../origin/src/utils/types";
import { extract_string_from_pattern, is_empty } from "../../origin/src/utils/util";

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
    function chapter_parse_fail_msg(msg: string, webnovel_id: string, chapter: number){
        return `Chapter Parse Fail: ${msg} :: Chapter ${chapter} :: Webnovel ID ${webnovel_id}`
    }
    export async function webnovel_chapter_contents(webnovel_id: string, chapter: number): PromiseResult<WebnovelContents>{
        const response_html = await (await fetch(`https://ncode.syosetu.com/${webnovel_id}/${chapter}/`)).text();
        const dom = jsdom_document(response_html);
        const chapter_title_jp = dom.querySelector(".p-novel__title")?.textContent;
        if(typeof chapter_title_jp !== "string") return {"error": new Error(chapter_parse_fail_msg("Failed to find chapter_title", webnovel_id, chapter))};
        const sections_of_lines_of_text = dom.querySelectorAll(".js-novel-text");
        if(sections_of_lines_of_text === undefined) return {"error": new Error(chapter_parse_fail_msg("Failed to find lines_of_text", webnovel_id, chapter))};
        const lines_of_text = map_html_collection(sections_of_lines_of_text, (el) => el.children)
            .map(node_list => map_html_collection(node_list, (el) => el.textContent ?? ""))
            .flat();

        return {
            chapter_title: chapter_title_jp,
            contents: lines_of_text
        }
    }
    export async function webnovel_chapter_contents_range(webnovel_id: string, range_start?: number, range_end?: number, on_chapter_parse?: () => void){
        if (is_empty(webnovel_id)) return [];
        if (Number.isNaN(range_start)) range_start = 1;
        if (Number.isNaN(range_end)) range_end = range_start;

        const chapters: Awaited<ReturnType<typeof webnovel_chapter_contents>>[] = [];
    	for (let i = range_start!; i <= range_end!; i++) {
	        chapters.push(await webnovel_chapter_contents(webnovel_id, i));
	        on_chapter_parse?.();
	    }
        return chapters;
    }
    export async function webnovel_chapter_list(webnovel_id: string, page?: number){
        page = page ?? 1;
        const response_html = await (await fetch(`https://ncode.syosetu.com/${webnovel_id}/?p=${page}`)).text();
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