import type { TranslationMap } from "./types/types";
import type { RozContent, RozTextStructures, RozTextStructureType } from "./types/roz";
import { gen_uuid } from "../../origin/src/utils/util";

function html_inner_text_content(html_line: string) {
    return fix_punctuation(html_line.trim().replace(/<(p|\/p|h1|\/h1|h2|\/h2|h3|\/h3|h4|\/h4)>/g, '').trim());
}
function html_img_src(html_line: string) {
    return (/<img.+?src="(.+?)"/.exec(html_line) as RegExpExecArray)?.[1]?.trim();
}

export function replace_html_codes(text: string){
    return text.replace(/&#34;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&#160;/g, ' ');
}

export function html_to_roz_content(html_content: string){
    const content: RozContent[] = [];
    const xhtml_lines = replace_html_codes(html_content)
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line);

    let line = 0;
    if(xhtml_lines.join('\n').includes("<nav epub:type=\"toc\"")) return [];
    while (!xhtml_lines[++line].includes('</div>') && !xhtml_lines[line].includes('</section>') && line < xhtml_lines.length) {
        type HTMLClass = 'img' | 'p' | 'h1' | 'h2' | 'div' | 'hr/' | 'br/';
        const extract_type_regex = /<(.+?)(>|\s)/;
        const type: HTMLClass = (extract_type_regex.exec(xhtml_lines[line]) as RegExpExecArray)[1] as HTMLClass;
        switch (type) {
            case 'img':
                content.push({ type: "IMAGE", content: html_img_src(xhtml_lines[line]), uuid: gen_uuid()}); break;
            case 'p':
                content.push({ type: "PARAGRAPH", content: html_inner_text_content(xhtml_lines[line]), uuid: gen_uuid()}); break;
            case 'h1':
                content.push({ type: "CHAPTER_TITLE", content: html_inner_text_content(xhtml_lines[line]), uuid: gen_uuid()}); break;
            case 'h2':
                content.push({ type: "CHAPTER_SUBTITLE", content: html_inner_text_content(xhtml_lines[line]), uuid: gen_uuid()}); break;
            case 'br/':
                content.push({ type: "LINE_BREAK", content: "-", uuid: gen_uuid()}); break;
            case 'hr/':
                content.push({ type: "THEME_BREAK", content: "-", uuid: gen_uuid()}); break;
            case 'div': break;
            // default: console.error(type, ": ", xhtml_lines[line]);
        }
    }
    return content.filter(c => c.content);
}

export function clean_html_text(text: string) {
    return replace_html_codes(text.replace(/\n/g, ''));
}

export function remove_tags(text: string){
    return text.replace(/<.+?>/g, '').trim();
}

export function fix_punctuation(text: string){
    return text.replace(/(”|“)/g, "\"")
                .replace(/’/g, '\'')
                .replace(/``/g, '"')
                .replace(/ ?… ?/g, '...')
                .replace(/ ?\.\.\. ?/g, '...')
                .replace(/''/g, '"');
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
    const punctuation_regex_presufix = "((\.|\s|,|-|&|!|\(|\)|\?|~|`|\[|\]|\{|\}|\"|\'|:|;|<|>|^|$)+)";
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
export function run_translation_map(text: string, translation_map: TranslationMap){
    // TODO: Add ablility to match case
    for(const translation_line of translation_map){
        text = text.replace(translation_line.from, `$1${translation_line.to}$4`);
    }
    return text;
}

export function timestamp_to_string(t_seconds: number) {
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

// export function generate_table_of_contents(roz: Roz): RozTableOfContents{
//     return [];
// }