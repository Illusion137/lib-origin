import { jsdom_document, map_html_collection } from "../utils/jsdom";
import type { PromiseResult } from "../utils/types";
import { encode_params, google_query, base_response_fail_msg } from "../utils/util";
import { decode_image_base64 } from "./img_decoder";
import type { MangaGenres } from "./types/MangaGenres";
import type { MangaTypes } from "./types/MangaTypes";
import type { AjaxResult, ChapterImageItem, ChapterItem, MangaList, MangaReadHozPageSize, MangaReadMode, MangaReadQuality, ReadingBy, SearchManga } from "./types/types";

export namespace MangaReader {
    const base_url = "https://mangareader.to";

    function gen_response_error_msg(response: Response): string{
        return `MangaReader: ${gen_response_error_msg.caller} ${base_response_fail_msg(response)}`
    }

    function parse_chapter_item(el: Element): ChapterItem {
        return {
            no: parseInt(el.getAttribute("data-number")!),
            id: el.getAttribute("data-id")!,
            href: el.querySelector("a")!.href,
            title: el.querySelector("a")!.title
        };
    }
    function parse_chapter_image_list(el: Element): ChapterImageItem {
        return {
            artwork_url: el.getAttribute("data-url")!
        };
    }
    function parse_search_manga(el: Element): SearchManga {
        const parse_latest_item = (el: Element) => {
            const inner_text = el.querySelector('a')!.textContent!;
            return {
                no: parseInt(inner_text.replace(/\D/gs, '')),
                href: el.querySelector('a')!.href,
                language: inner_text.replace(/.+?\[/gs, '').replace(/\].*/gs, '')
            }
        };
        return {
            title: {
                name: el.querySelector(".manga-name")!.querySelector("a")!.textContent!,
                href: el.querySelector(".manga-poster")!.getAttribute("href")!
            },
            genres: map_html_collection(el.querySelector(".fdi-item.fdi-cate")?.children, (el: Element) => {
                return {
                    content: el.textContent!,
                    href: el.getAttribute("href")!
                }
            }),
            available_languages: el.querySelector(".tick.tick-item.tick-lang")!.textContent!.split("/"),
            artwork_url: el.querySelector(".manga-poster-img")!.getAttribute("src")!,
            latest_chapters: map_html_collection(el.querySelectorAll('.fd-list')?.[0]?.children, parse_latest_item),
            latest_volumes: map_html_collection(el.querySelectorAll('.fd-list')?.[1]?.children, parse_latest_item)
        }
    }
    function href_manga_id(href: string) {
        const last_index = href.lastIndexOf("-");
        return last_index === -1 ? href : href.slice(href.lastIndexOf("-") + 1);
    }
    export async function ajax(path: string) {
        const response = await fetch(`${base_url}/ajax/${path}`);
        if(!response.ok) return {error: new Error(gen_response_error_msg(response))};
        const result: AjaxResult = await response.json();
        if(!result.status) return {error: new Error(`MangaReader: Ajax status failed with: ${result.html}`)};
        return result;
    }
    export async function manga_list(opts: {page?: number} & ({query: string}|{genre: MangaGenres}|{type: MangaTypes})): PromiseResult<MangaList> {
        const params: Record<string, any> = { page: opts.page ?? 1 };
        const path = "query" in opts ? "/search" : "genre" in opts ? opts.genre : opts.type;
        const response = await fetch(`${base_url}${path}?${encode_params(params, "query" in opts ? ["keyword", google_query(opts.query)] : undefined)}`);
        if(!response.ok) return {error: new Error(gen_response_error_msg(response))};
        const document = jsdom_document(await response.text());
        const manga_elements = document.querySelectorAll(".item.item-spc");
        const mangas = map_html_collection(manga_elements, parse_search_manga);
        return {
            title: document.querySelectorAll(".cat-heading")[0].textContent!,
            mangas: mangas
        }
    }
    export async function manga_chapter_volume_list(manga_id: string, opts: {reading_by?: ReadingBy}): PromiseResult<ChapterItem[]> {
        const readingBy: ReadingBy = opts.reading_by ?? "chap";
        const params = { readingBy };
        const reading_list_result = await ajax(`manga/reading-list/${href_manga_id(manga_id)}?${encode_params(params)}`);
        if("error" in reading_list_result) return reading_list_result;
        const document = jsdom_document(reading_list_result.html);
        const chapter_items = document.querySelectorAll(".chapter-item");
        return map_html_collection(chapter_items, parse_chapter_item);
    }
    export async function manga_chapter_volume_image_list(manga_chap_id: string, opts: {mode?: MangaReadMode, quality?: MangaReadQuality, hoz_page_size: MangaReadHozPageSize}): PromiseResult<ChapterImageItem[]> {
        const mode: MangaReadMode = opts.mode ?? "vertical";
        const quality: MangaReadQuality = opts.quality ?? "medium";
        const hozPageSize: MangaReadHozPageSize = opts.hoz_page_size ?? 1;
        const params = { mode, quality, hozPageSize };
        const reading_list_result = await ajax(`image/list/chap/${manga_chap_id}?${encode_params(params)}`);
        if("error" in reading_list_result) return reading_list_result;
        const document = jsdom_document(reading_list_result.html);
        const chapter_items = document.querySelectorAll(".iv-card");
        return map_html_collection(chapter_items, parse_chapter_image_list);
    }
    export async function decode_image(url: string) {
        return await decode_image_base64(url);
    }
}