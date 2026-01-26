import type { PromiseResult } from "@common/types";
import type { ISOString } from "@illusive/types";
import type { RozChapterContents } from "./types/roz";
import type { RoZFetchRequestInit } from "@common/rozfetch";
import type Roz from "./types/roz";
import { gen_uuid } from "@common/utils/util";
import { generror } from "@common/utils/error_util";
import { image_url_to_base_64 } from "./utils";
import { jsdom_document } from "@common/jsdom";
import { reinterpret_cast } from "@common/cast";
import rozfetch from "@common/rozfetch";

export namespace WitchcultTranslations {
    export interface Opts {
        fetch_opts?: RoZFetchRequestInit;
    }
    export interface ArcNoToRozOpts {
        arc_chapter_list_fetch_opts?: RoZFetchRequestInit;
        chapter_fetch_opts?: RoZFetchRequestInit;
        on_chapter_fetch?: (chapter: Chapter) => any
    }

    export interface HomeArc {
        artwork_url: string;
        title: string;
        href: string;
        description: string;
    }
    export interface ArcChapterlistSectionChapter {
        no: number;
        title: string;
        href: string;
        note?: string;
    }
    export interface ArcChapterlistSection {
        title: string;
        chapters: ArcChapterlistSectionChapter[];
        ebook_href?: string;
    }
    export interface ArcChapterlist {
        arc_title: string;
        description: string;
        sections: ArcChapterlistSection[];
        artwork_url?: string;
    }
    export interface TranslationProgress {
        arc: number;
        chapter: number;
        chapter_title: string;
        date: ISOString;
    }
    export interface ChapterMetadata {
        date: ISOString;
        arc: number;
        chapter: number;
        chapter_title: string;
        by: string;
        previous_post_href?: string;
        next_post_href?: string;
    }
    export interface Chapter {
        metadata: ChapterMetadata;
        chapter: RozChapterContents;
    }

    export async function get_arcs_list(opts: Opts): PromiseResult<HomeArc[]>{
        const response = await rozfetch("https://witchculttranslation.com/", {...opts.fetch_opts});
        if("error" in response) return response;
        const html = await response.text();
        const document = jsdom_document(html);
        // TODO this is a pain in the ass due to damn near nothing being put into divs or shit
        // TODO also look into them dumbass <hr> tags
        return [];
    }

    export async function get_arc_chapter_list_data(arc_href_or_no: string|number, opts: Opts): PromiseResult<ArcChapterlist>{
        const href = typeof arc_href_or_no === "string" ? arc_href_or_no : 
            arc_href_or_no <= 3 ? "https://witchculttranslation.com/table-of-content/" : `https://witchculttranslation.com/arc-${arc_href_or_no}/`;
        const chapter_list_response = await rozfetch(href, {...opts.fetch_opts});
        if("error" in chapter_list_response) return chapter_list_response;
        const chapter_list_html = await chapter_list_response.text();
        return {
            arc_title: "",
            description: "",
            sections: [],
            artwork_url: ""
        };
    }

    export async function parse_chapter(href: string, opts: Opts): PromiseResult<Chapter>{
        const chapter_response = await rozfetch(href, {...opts.fetch_opts});
        if("error" in chapter_response) return chapter_response;
        const chapter_html = await chapter_response.text();
        const chapter_dom = jsdom_document(chapter_html);
        const entry_content = chapter_dom.querySelector(".entry-content");
        const entry_cat_link = document.querySelector<HTMLParagraphElement>('.cat-links');
        const entry_author = document.querySelector<HTMLParagraphElement>('.author');
        const entry_date = chapter_dom.querySelector<HTMLParagraphElement>(".entry-date");

        const cat_links_words = entry_cat_link?.textContent.split(' ');

        return {
            chapter: {chapter: {title: "", uuid: gen_uuid()}, contents: []},
            metadata: {
                chapter: 0,
                chapter_title: "",
                arc: cat_links_words?.[cat_links_words.length - 1] ? Number(cat_links_words?.[cat_links_words.length - 1]) : 0,
                by: entry_author?.textContent ?? "",
                date: reinterpret_cast<ISOString>(new Date(entry_date?.textContent ?? 0).toISOString()),
                previous_post_href: undefined,
                next_post_href: undefined
            }
        };
    }

    export async function arcno_to_roz(no: number, opts: ArcNoToRozOpts): PromiseResult<Roz>{
        const chapter_list_data = await get_arc_chapter_list_data(no, {fetch_opts: opts.chapter_fetch_opts});
        if("error" in chapter_list_data) return chapter_list_data;
        let first_found_chapter_metadata_c: ChapterMetadata|undefined = undefined; 
        const promised_chapters =  chapter_list_data.sections.map(section => section.chapters.map(async(section_chapter) => {
            const chapter = await parse_chapter(section_chapter.href, {fetch_opts: opts.chapter_fetch_opts});
            if("error" in chapter) return chapter;
            if(!first_found_chapter_metadata_c) first_found_chapter_metadata_c = chapter.metadata; 
            opts.on_chapter_fetch?.(chapter);
            return chapter;
        })).flat();
        if(first_found_chapter_metadata_c === undefined) return generror("Found no chapters", {no, opts});
        const first_found_chapter_metadata = first_found_chapter_metadata_c as ChapterMetadata;
        const resolved_chapters = await Promise.all(promised_chapters);
        for(const resolved_chapter of resolved_chapters){
            if("error" in resolved_chapter) return resolved_chapter;
        }
        const filtered_resolved_chapters: Chapter[] = resolved_chapters.filter(chapter_err => !("error" in chapter_err)) as Chapter[];
        const chapters = filtered_resolved_chapters.map(({chapter}) => chapter);
        if(chapters.length === 0) return generror("Arc has no chapters", {no, opts});
        
        const cover = chapter_list_data.artwork_url ? await image_url_to_base_64(chapter_list_data.artwork_url) : null;
        if(cover !== null && typeof cover === "object") return cover;

        return {
            version: 1,
            uuid: gen_uuid(),
            source_file: String(no),
            source_file_type: "WITCHCULT",
            title: `ReZero Arc ${no} Webnovel`,
            cover: cover,
            author: "Tappei Nagatsuki",
            publisher: "Withcult Translations",
            date: first_found_chapter_metadata.date,
            series_name: "ReZero",
            series_no: no,
            chapters: chapters
        };
    }
}