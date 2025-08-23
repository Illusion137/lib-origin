import type { PromiseResult } from "@common/types";
import type { ISOString } from "@illusive/types";
import type { RozChapterContents } from "./types/roz";
import type { RoZFetchRequestInit } from "@common/rozfetch";
import type Roz from "./types/roz";
import { gen_uuid } from "@common/utils/util";
import { generror } from "@common/utils/error_util";
import { image_url_to_base_64 } from "./utils";

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

    async function get_translation_progress(dom: Document): PromiseResult<TranslationProgress[]>{
        return [];
    }

    export async function get_arcs_list(opts: Opts): PromiseResult<HomeArc[]>{
        return [];
    }

    export async function get_arc_chapter_list_data(arc_href_or_no: string|number, opts: Opts): PromiseResult<ArcChapterlist>{
        return {};
    }

    export async function parse_chapter(href: string, opts: Opts): PromiseResult<Chapter>{
        return {};
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