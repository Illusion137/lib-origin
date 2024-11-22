import { jsdom_document } from "../utils/jsdom";
import { PromiseResult } from "../utils/types";
import { encode_params, google_query } from "../utils/util";
import { MangaGenres } from "./types/MangaGenres";
import { MangaTypes } from "./types/MangaTypes";
import { AjaxResult, ChapterItem, MangaList, ReadingBy, SearchManga } from "./types/types";

export namespace MangaReader {
    const base_url = "https://mangareader.to";
    function map_html_collection<T>(collection: HTMLCollection|NodeListOf<Element>, callback: (el: Element) => T) {
        const result: T[] = [];
        for(let i = 0; i < collection.length; i++)
            result.push(callback(collection[i]));
        return result;
    }
    function parse_chapter_item(el: Element): ChapterItem {
        return {
            no: parseInt(el.getAttribute("data-number")!),
            id: el.getAttribute("data-id")!,
            href: el.querySelector("a")!.href,
            title: el.querySelector("a")!.title
        };
    }
    function parse_search_manga(el: Element): SearchManga {
        return {
            title: el.querySelector(".manga-name")!.querySelector("a")!.textContent!,
            genres: map_html_collection(el.querySelector(".fdi-item.fdi-cate")!.children, (el: Element) => {
                return {
                    content: el.textContent!,
                    href: el.getAttribute("href")!
                }
            }),
            available_languages: el.querySelector(".tick.tick-item.tick-lang")!.textContent!.split("/"),
            artwork_url: el.querySelector(".manga-poster-img")!.getAttribute("src")!,
            href: el.querySelector(".manga-poster")!.getAttribute("href")!,
            chapters: [],
            volumes: []
        }
    }
    function href_manga_id(href: string) {
        const last_index = href.lastIndexOf("-");
        return last_index === -1 ? href : href.slice(href.lastIndexOf("-") + 1);
    }
    export async function ajax(path: string) {
        const response = await fetch(`${base_url}/ajax/${path}`);
        if(!response.ok) return {error: `Response failed with status code: ${response.status}`};
        const result: AjaxResult = await response.json();
        if(result.status === false) return {error: `Ajax Result failed with: ${result.status}`};
        return result;
    }
    export async function manga_list(opts: {page?: number} & ({query: string}|{genre: MangaGenres}|{type: MangaTypes})): PromiseResult<MangaList> {
        const params: Record<string, any> = { page: opts.page ?? 1 };
        if("query" in opts) params["keyword"] = google_query(opts.query);
        const path = "query" in opts ? "/search" : "genre" in opts ? opts.genre : opts.type;
        const response = await fetch(`${base_url}${path}?${encode_params(params)}`);
        if(!response.ok) return {error: `Response failed with status code: ${response.status}`};
        const document = jsdom_document(await response.text());
        const manga_elements = document.querySelectorAll(".item.item-spc");
        const mangas = map_html_collection(manga_elements, parse_search_manga);
        return {
            title: document.querySelectorAll(".cat-heading")[0].textContent!,
            mangas: mangas
        }
    }
    export async function manga_chapter_volume_list(manga_id: string, opts: {reading_by?: ReadingBy}): PromiseResult<ChapterItem[]> {
        const reading_by: ReadingBy = opts.reading_by ?? "chap";
        const params = { readingBy: reading_by };
        const reading_list_result = await ajax(`manga/reading-list/${href_manga_id(manga_id)}?${encode_params(params)}`);
        if("error" in reading_list_result) return reading_list_result;
        const document = jsdom_document(reading_list_result.html);
        const chapter_items = document.querySelectorAll(".chapter-item");
        return map_html_collection(chapter_items, parse_chapter_item);
    }
}