import type { TranslationMap } from "@roze/types/types";
import type { RozChapterContents, RozContent, RozContentType, RozTextStructures, RozTextStructureType } from "@roze/types/roz";
import { gen_uuid, is_empty, is_number } from "@common/utils/util";
import type Roz from "@roze/types/roz";
import { fs } from "@native/fs/fs";
import { get_temp_file_path, type RegisterAsTemp } from "@native/fs/fs_utils";
import { reinterpret_cast } from "@common/cast";
import type { FileExtension, PromiseResult } from "@common/types";
import { jsdom_document } from "@common/jsdom";
import rozfetch from "@common/rozfetch";

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
    return text.replaceAll(/(”|“)/g, "\"")
                .replaceAll(/’/g, '\'')
                .replaceAll(/``/g, '"')
                .replaceAll(/ ?… ?/g, '...')
                .replaceAll(/ ?\.\.\. ?/g, '...')
                .replaceAll(/''/g, '"')
}

type ElementTagName = "IMAGE"|"IMG"|"SPAN"|"P"|"H1"|"H2"|"BR"|"HR"|"A"|"BLOCKQUOTE";
const tag_name_content_type_map: Record<ElementTagName, RozContentType> = {
    IMAGE: "IMAGE",
    IMG: "IMAGE",
    SPAN: "PARAGRAPH",
    P: "PARAGRAPH",
    H1: "CHAPTER_TITLE",
    H2: "CHAPTER_SUBTITLE",
    BR: "LINE_BREAK",
    HR: "THEME_BREAK",
    A: "PARAGRAPH",
    BLOCKQUOTE: "PARAGRAPH"
};
function html_extract_text(node: Element | ChildNode): string{
    if("innerText" in node) return node.innerText as string;
    let out = "";

    for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === child.TEXT_NODE) {
            out += child.textContent ?? "";
        } else if (child.nodeType === child.ELEMENT_NODE) {
            out += html_extract_text(child);
        }
    }
    return out;
}
function element_to_roz_content(el: Element): RozContent|undefined{ // TODO Account for paragraph inline br/ and hr/ and other balony
    const element_tag_name = reinterpret_cast<ElementTagName>(el.tagName);
    if(tag_name_content_type_map[element_tag_name] === undefined) return undefined;
    if(tag_name_content_type_map[element_tag_name] === "IMAGE")
    {
        const image_src = reinterpret_cast<HTMLImageElement>(el).src ?? reinterpret_cast<HTMLImageElement>(el).getAttribute('xlink:href');
        if(image_src){
            return {
                type: tag_name_content_type_map[element_tag_name],
                content: image_src,
                duration: 0,
                uuid: gen_uuid()
            };
        }
        console.error("Unable to extract image src from the element: ", el);
        return undefined;
    }
    const text = html_extract_text(el).trim();
    if(is_empty(text)) return undefined;
    return {
        type: tag_name_content_type_map[element_tag_name],
        content: text,
        duration: 0,
        uuid: gen_uuid()
    };
}
export function html_to_roz_contents(html_content: string|Document, root_element?: Element){
    try {
        const contents: RozContent[] = [];
        const document: Document|undefined = root_element ? undefined : typeof html_content === "string" ? jsdom_document(html_content) : html_content;

        const root = root_element ?? document!.body ?? document;

        for (const child of Array.from(root.children)) {
            const child_tag = child.tagName as ElementTagName;
            if (child_tag in tag_name_content_type_map) {
                const roz_content = element_to_roz_content(child);
                if (roz_content) contents.push(roz_content);
            }
            else {
                // console.log(`Unknown Tag ${child_tag}`);
                contents.push(...html_to_roz_contents(html_content, child));
            }
        }
        return contents.filter(c => c.content);
    }
    catch(e) {
        console.log(e);
        return [];
    }
}

export function roz_contents_to_roz_chapters_contents(contents: RozContent[]): RozChapterContents[]{
    const roz_chapter_contents: RozChapterContents[] = [];
    let chapter_contents: RozContent[] = [];
    let prev_chapter_title = "Cover";
    for(const content of contents){
        if(content.type === "CHAPTER_TITLE" || content.type === "CHAPTER_SUBTITLE"){
            roz_chapter_contents.push({
                chapter: {
                    uuid: gen_uuid(),
                    title: prev_chapter_title
                },
                contents: chapter_contents
            });
            prev_chapter_title = content.content;
            chapter_contents = [];
        }
        chapter_contents.push(content);
    }
    return roz_chapter_contents;
}

export function generate_text_structure(text: string): RozTextStructures{
    const tag_regex = /<(.+?)>(.+?)<\/.+?>/gi;
    const tag_matches = [...text.matchAll(tag_regex)];
    if (tag_matches.length === 0) return [{ content: text, type: "NONE" }];
    const text_structure: RozTextStructures = [];
    const original_text = text;
    for (const tag_match of tag_matches) {
        const [fullstr, tagstr, contentstr] = [tag_match[0], tag_match[1].trim(), tag_match[2]];
        const prestring = original_text.substring(original_text.length - text.length, tag_match.index);
        if (prestring.length !== 0) text_structure.push({ content: prestring, type: "NONE" });
        if (tagstr === undefined || contentstr === undefined) continue;
        text_structure.push({ content: contentstr, type: tagstr as RozTextStructureType });
        text = original_text.substring(tag_match.index + fullstr.length);
    }
    if (text.length !== 0) text_structure.push({ content: text, type: "NONE" });
    
    text_structure.forEach(struct => struct.content = struct.content.replaceAll('<br/>', '\n').replaceAll('<br />', '\n'));
    return text_structure;
}

export function generate_translation_map(file_buffer: string): TranslationMap {
    const punctuation_regex_presufix = "((\\.|\\s|,|-|&|!|\\(|\\)|\\?|~|`|\\[|\\]|\\{|\\}|\"|\\'|:|;|<|>|^|“|”|‛|’|‘|«|»||$|「|」|『|』)+)";
    file_buffer = file_buffer.replace(/\r\n/g, '\n');
    const lines = file_buffer.split('\n');
    const translation_map: TranslationMap = [];
    for(const line of lines){
        const [phrase_from, phrase_to] = line.split('[::]').map(str => str.trim());
        translation_map.push({
            from: new RegExp(`${punctuation_regex_presufix}(${phrase_from})${punctuation_regex_presufix}`, 'gi'),
            to: phrase_to,
        });
    }
    return translation_map;
}
export function run_translation_map_string(text: string, translation_map: TranslationMap){
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

export async function filepath_to_bufer(file_path: string): PromiseResult<Uint8Array<ArrayBuffer>>{
    const base64_data = await fs().read_as_string(file_path, {encoding: 'base64'});
    if(typeof base64_data === "object") return base64_data;
    const bytes = Uint8Array.from(atob(base64_data.replace(/^data[^,]+,/,'')), v => v.charCodeAt(0));
    return bytes;
}

export function base_64_image(data_base64: string, type: string){
    return `data:${type};base64,${data_base64}`;
}

export async function image_url_to_base_64(url: string){
    const image_response = await rozfetch(url);
    if("error" in image_response) return image_response;
    const buffer = await image_response.arrayBuffer();
    let data = "";
    (new Uint8Array(buffer)).forEach((byte) => data += String.fromCharCode(byte))
    return base_64_image(btoa(data), image_response.headers.get('content-type') ?? "png")
}

export async function save_base64_image_to_file(base64: string, file_path: string|undefined, register_as_temp?: RegisterAsTemp){
    const ext = base64.split(';')[0].replace('data:', '').replace('image/', '');
    const ufile_path = file_path ?? await get_temp_file_path( reinterpret_cast<FileExtension>(`.${ext}`), register_as_temp ?? "NO_REGISTER");
    const write_result = await fs().write_file_as_string(ufile_path, base64.replace(/data:.+?;base64,/, ''), {encoding: 'base64'});
    return {path: ufile_path, write_result};
}

export function generate_youtube_chapters(chapters: RozChapterContents[]): string{
    let total_duration = 0;
    const seen_timestamps = new Set<string>();
    return chapters.map(({chapter}) => {
        const timestamp = timestamp_to_timecode(total_duration);
        const line = `${timestamp} ${chapter.title}`;
        total_duration += chapter.duration ?? 0;
        if(seen_timestamps.has(timestamp)) return undefined;
        seen_timestamps.add(timestamp);
        return line;
    }).filter(line => line).join('\n');
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