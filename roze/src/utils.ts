import type { TranslationMap } from "@roze/types/types";
import type { RozChapterContents, RozContent, RozContentType, RozTextStructures, RozTextStructureType } from "@roze/types/roz";
import { gen_uuid, is_number } from "@common/utils/util";
import type Roz from "@roze/types/roz";
import { fs } from "@native/fs/fs";
import { get_temp_file_path, type RegisterAsTemp } from "@native/fs/fs_utils";
import { reinterpret_cast } from "@common/cast";
import type { FileExtension } from "@common/types";
import { jsdom_document, map_html_collection } from "@common/jsdom";

export function html_inner_text_content(html_line: string) {
    return html_line.trim().replace(/<(p|\/p|h1|\/h1|h2|\/h2|h3|\/h3|h4|\/h4)>/g, '').trim();
}
export function html_img_src(html_line: string) {
    return (/<img.+?src="(.+?)"/.exec(html_line) as RegExpExecArray)?.[1]?.trim();
}

export function replace_html_codes(text: string){
    return text.replace(/&#34;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&#160;/g, ' ');
}

export function clean_html_text(text: string) {
    return replace_html_codes(text.replace(/\n/g, ''));
}

export function remove_tags(text: string){
    return text.replace(/<.+?>/g, '').trim();
}

export function prepare_text_for_tts(text: string): string{
    return fix_punctuation(remove_tags(text));
}

export function fix_punctuation(text: string){
    return text.replace(/(”|“)/g, "\"")
                .replace(/’/g, '\'')
                .replace(/``/g, '"')
                .replace(/ ?… ?/g, '...')
                .replace(/ ?\.\.\. ?/g, '...')
                .replace(/''/g, '"');
}

type ElementTagName = "IMG"|"P"|"H1"|"H2"|"BR"|"HR"|"A";
function html_tag_to_roz_content(el: Element): RozContent|undefined{
    const element_tag_name = reinterpret_cast<ElementTagName>(el.tagName);
    switch(element_tag_name){
        case "IMG": return { type: "IMAGE", content: reinterpret_cast<HTMLImageElement>(el).src, uuid: gen_uuid(), duration: 0};
        case "P": return { type: "PARAGRAPH", content: reinterpret_cast<HTMLParagraphElement>(el).innerHTML, uuid: gen_uuid(), duration: 0};
        case "H1": return { type: "CHAPTER_TITLE", content: reinterpret_cast<HTMLHeadingElement>(el).innerHTML, uuid: gen_uuid(), duration: 0};
        case "H2": return { type: "CHAPTER_SUBTITLE", content: reinterpret_cast<HTMLHeadingElement>(el).innerHTML, uuid: gen_uuid(), duration: 0};
        case "BR": return { type: "LINE_BREAK", content: '-', uuid: gen_uuid(), duration: 0};
        case "HR": return { type: "THEME_BREAK", content: '-', uuid: gen_uuid(), duration: 0};
        case "A": return undefined;
        default: console.error("Unaccounted Tag: ", element_tag_name); break;
    }
    return undefined;
}
export function html_to_roz_contents(html_content: string|Document, container?: Element ){
    const contents: RozContent[] = [];
    const document: Document = typeof html_content === "string" ? jsdom_document(html_content) : html_content;
    
    const body = container ?? document.querySelector("body") ?? document.children[0];
    if(body === null || body === undefined) return contents;

    const ignore_tag_names: ElementTagName[] = ['P','H1','H2'];
    const extracted_contents = map_html_collection(body.children, (el) => {
        const element_tag_name = reinterpret_cast<ElementTagName>(el.tagName);
        if(el.children.length > 0 && !ignore_tag_names.includes(element_tag_name)) return html_to_roz_contents(document, el);
        return html_tag_to_roz_content(el);
    });

    for(const extracted_content of extracted_contents){
        if(extracted_content === undefined) continue;
        if(Array.isArray(extracted_content)) contents.push(...extracted_content);
        else contents.push(extracted_content);
    }

    return contents.filter(c => c.content);
}

export function generate_text_structure(text: string): RozTextStructures{
    const tag_regex = /<(.+?)>(.+?)<\/.+?>/gi;
    const tag_matches = [...text.matchAll(tag_regex)];
    if(tag_matches.length === 0) return [{content: text, type: "NONE"}];
    const text_structure: RozTextStructures = [];
    for(const tag_match of tag_matches){
        const [fullstr, tagstr, contentstr] = [tag_match[0], tag_match[1], tag_match[2]];
        const prestring = text.substring(0, tag_match.index);
        if(prestring.length !== 0) text_structure.push({content: prestring, type: "NONE"});
        if(tagstr === undefined || contentstr === undefined) continue;
        text_structure.push({content: contentstr, type: tagstr as RozTextStructureType});
        text = text.substring(tag_match.index + fullstr.length);
    }
    if(text.length !== 0) text_structure.push({content: text, type: "NONE"});
    
    return text_structure;
}

export function generate_translation_map(file_buffer: string): TranslationMap {
    const punctuation_regex_presufix = "((\.|\s|,|-|&|!|\(|\)|\?|~|`|\[|\]|\{|\}|\"|\'|:|;|<|>|^|“|”|‛|’|‘|«|»||$|「|」|『|』)+)";
    file_buffer = file_buffer.replace(/\r\n/g, '\n');
    const lines = file_buffer.split('\n');
    const translation_map: TranslationMap = [];
    for(const line of lines){
        const [phrase_from, phrase_to, match_case] = line.split('[::]').map(str => str.trim());
        translation_map.push({
            from: new RegExp(`${punctuation_regex_presufix}(${phrase_from})${punctuation_regex_presufix}`, 'gi'),
            to: phrase_to,
            match_case: match_case.toLowerCase().startsWith('y')
        });
    }
    return translation_map;
}
export function run_translation_map_string(text: string, translation_map: TranslationMap){
    // TODO: Add ablility to match case
    for(const translation_line of translation_map){
        text = text.replace(translation_line.from, `$1${translation_line.to}$4`);
    }
    return text;
}
export function run_translation_map_roz(roz: Roz, translation_map: TranslationMap){
    roz.chapters.forEach(chapter => {
        chapter.chapter.title = run_translation_map_string(chapter.chapter.title ?? "", translation_map);
        chapter.contents.forEach(content => {
            if(content.type !== "IMAGE")
                content.content = run_translation_map_string(content.content, translation_map);
        })
    });
    return roz;
}

export function timestamp_to_timecode(t_seconds: number) {
    if(!is_number(t_seconds)) return '00:00:00';
    if(t_seconds < 0) return '00:00:00';
    const hours = Math.floor(t_seconds / 3600);
    const minutes = Math.floor((t_seconds - hours * 3600) / 60);
    const seconds = t_seconds - hours * 3600 - minutes * 60;
    return (
        String(Math.floor(hours)).padStart(2, "0") +
        ":" +
        String(Math.floor(minutes)).padStart(2, "0") +
        ":" +
        String(Math.floor(seconds)).padStart(2, "0")
    );
}
export function timestamp_to_srt_timecode(t_seconds: number) {
    if(!is_number(t_seconds)) return '00:00:00,000';
    if(t_seconds < 0) return '00:00:00,000';
    const milliseconds = (t_seconds - Math.floor(t_seconds)) * 1000;
    t_seconds = Math.floor(t_seconds);
    const hours = Math.floor(t_seconds / 3600);
    const minutes = Math.floor((t_seconds - hours * 3600) / 60);
    const seconds = t_seconds - hours * 3600 - minutes * 60;
    return (
        String(Math.floor(hours)).padStart(2, "0") +
        ":" +
        String(Math.floor(minutes)).padStart(2, "0") +
        ":" +
        String(Math.floor(seconds)).padStart(2, "0") + 
        ',' +
        String(Math.floor(milliseconds)).padStart(3, "0")
    );
}

export async function save_base64_image_to_file(base64: string, file_path: string|undefined, register_as_temp?: RegisterAsTemp){
    const ext = base64.split(';')[0].replace('data:', '').replace('image/', '');
    const ufile_path = file_path ?? await get_temp_file_path( reinterpret_cast<FileExtension>(`.${ext}`), register_as_temp ?? "NO_REGISTER");
    const write_result = await fs().write_file_as_string(ufile_path, base64.replace(/data:.+?;base64,/, ''), {encoding: 'base64'});
    return {path: ufile_path, write_result};
}

export function generate_youtube_chapters(chapters: RozChapterContents[]): string{
    let total_duration = 0;
    return chapters.map(({chapter}) => {
        total_duration += chapter.duration ?? 0;
        return `${timestamp_to_timecode(total_duration)} ${chapter.title}`;
    }).join('\n');
}
export function generate_srt_subtitles_contents(chapters: RozChapterContents[]): string{
    const accepted_content_types: RozContentType[] = ["PARAGRAPH", "CHAPTER_TITLE", "CHAPTER_SUBTITLE", "HEADING", "TITLE"];
    let sequence_number = 1;
    let total_duration = 0;
    const flat_contents = chapters.map(({contents}) => contents).flat();
    return flat_contents.filter(content => accepted_content_types.includes(content.type)).map(content => {
        const before_duration = total_duration;
        total_duration += content.duration;
        return [
            String(sequence_number++),
            `${timestamp_to_srt_timecode(before_duration)} --> ${timestamp_to_srt_timecode(total_duration)}`,
            content.content
        ].join('\n');
    }).join('\n\n');
}