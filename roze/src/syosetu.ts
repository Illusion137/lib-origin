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
    async function webnovel_chapter_contents_range(webnove_id: string, range_start?: number, range_end?: number, on_chapter_parse?: () => void){
        if (web_novel_id == undefined) return [];
        if (Number.isNaN(range_start)) range_start = 1;
        if (Number.isNaN(range_end)) range_end = range_start;

        const chapters = [];
    	for (let i = range_start; i <= range_end; i++) {
	        chapters.push(await parse_webnovel_chapter(web_novel_id, i));
	        on_chapter_parse();
	    }
        return chapters;
    }
}