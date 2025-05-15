import { jsdom_document, map_html_collection } from "../../origin/src/utils/jsdom";

export namespace Syosetu {
    function chapter_parse_fail_msg(msg: string, webnovel_id: string, chapter: number){
        return `Chapter Parse Fail: ${msg} :: Chapter ${chapter} :: Webnovel ID ${webnovel_id}`
    }
    export async function webnovel_chapter_contents(webnovel_id: string, chapter: number){
        const response_html = await (await fetch(`https://ncode.syosetu.com/${webnovel_id}/${chapter}/`)).text();
        const dom = jsdom_document(response_html);
        const chapter_title_jp = dom.querySelector(".novel_subtitle")?.textContent;
        if(chapter_title_jp === undefined) return {"error": new Error(webnovel_chapter_contents("Failed to find chapter_title", webnovel_id, chapter))};
        const lines_of_text = dom.querySelector("#novel_honbun")?.children;
        if(lines_of_text === undefined) return {"error": new Error(webnovel_chapter_contents("Failed to find lines_of_text", webnovel_id, chapter))};

        return {
            chapter_title: chapter_title_jp,
            contents: map_html_collection(lines_of_text, (el) => el.textContent ?? "")
        }
    }
    async function webnovel_chapter_contents_range(webnovel_id: string, range_start?: number, range_end?: number, on_chapter_parse?: () => void){
        if (is_empty(webnovel_id)) return [];
        if (Number.isNaN(range_start)) range_start = 1;
        if (Number.isNaN(range_end)) range_end = range_start;

        const chapters = [];
    	for (let i = range_start; i <= range_end; i++) {
	        chapters.push(await parse_webnovel_chapter(webnovel_id, i));
	        on_chapter_parse();
	    }
        return chapters;
    }
    async function webnovel_chapter_list(webnovel_id: string, page?: number){
        const response_html = await (await fetch(`https://ncode.syosetu.com/${webnovel_id}/?p=${page ?? 1}`)).text();
        const dom = jsdom_document(response_html);
        const title = dom.querySelector(".p-novel__title")?.textContent;
        const author_element = dom.querySelector(".p-novel__author a");
        const author = author_element?.textContent;
        const author_href = author_element.href;
        const chapter_elements = dom.querySelectorAll("div.p-eplist__sublist");
        const chapters = map_html_collection(chapter_elements, (el) => ({
            title: el.querySelector("a")?.textContent ?? "",
            timestamp: p-eplist__update.querySelector(".p-eplist__update").textContent,
            revised: p-eplist__update.querySelector(".p-eplist__update").querySelector("span") !== undefined,
            chapter_no: el.querySelector("a").href.replace('','')
        }));
        const last_page = dom.querySelector("a.c-pager__item--last").href;
        return {
            title: title,
            author: {
                name: author,
                href: author_href
            },
            chapters: chapters,
            page: page ?? 1
            last_page: last_page
        }
    }
};