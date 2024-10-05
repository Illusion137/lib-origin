import { JNovel_Home } from "./types/jnovel-home";
import { JNovel_User } from "./types/jnovel-user";
import { JNovel_Series } from "./types/jnovel-series";
import { JNovel_Part, JNovel_Serie, JNovel_Toc } from "./types/jnovel-reader";
import { ReaderContent } from "./types/types";
import { CookieJar } from "../../origin/src/utils/cookie_util";
import { PromiseResult, ResponseError } from "../../origin/src/utils/types";
import { extract_string_from_pattern } from "../../origin/src/utils/util";
import { JNovel_Series_Page } from "./types/jnovel-series-page";
import { JNovel_Calender } from "./types/jnovel-calender";

export namespace JNovel {
    export type Opts = { cookie_jar?: CookieJar };

    interface JNovel_Reader {
        title: string,
        volume_img_uri: string,
        part: JNovel_Part
        serie: JNovel_Serie
        toc: JNovel_Toc
        content: ReaderContent
    };

    async function get_response(url: string, opts: Opts) {
        return await fetch(url, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "priority": "u=0, i",
                "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "cookie": opts.cookie_jar?.toString() as string
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET"
        });
    }
    async function get_response_text(url: string, opts: Opts) {
        const response = await get_response(url, opts);
        if (!response.ok) return { "error": `user_response is not ok: Status Code: ${response.status}` };
        return await response.text();
    }
    function try_json_parse<T>(json_string: string): T|ResponseError {
        try { return <T>JSON.parse(json_string); }
        catch (error) { return { "error": String(error) }; }
    }
    function clean_html_text(text: string) {
        return text.replace(/&#34;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\n/g, '');
    }
    function html_inner_text_content(html_line: string){
        return html_line.trim().replace(/<.+?>/g, '');
    }
    function html_img_src(html_line: string){
        return (/<img src="(.+?)"/.exec(html_line) as RegExpExecArray)[1];
    }
    export function __next_data__(html: string | ResponseError) {
        if (typeof html === "object") return html;
        const next_data_string = extract_string_from_pattern(html, /<script id=\".+?\" type=\"application\/json\">.+?({.+?})<\/script>/igs);
        if (typeof next_data_string === "object") return next_data_string;
        return try_json_parse(next_data_string);
    }
    export async function home(opts: Opts): PromiseResult<JNovel_Home>                        { return <JNovel_Home | ResponseError>__next_data__(await get_response_text("https://j-novel.club/", opts)); }
    export async function series_page(opts: Opts): PromiseResult<JNovel_Series_Page>          { return <JNovel_Series_Page | ResponseError>__next_data__(await get_response_text("https://j-novel.club/series", opts)); }
    export async function series(opts: Opts & { path: string }): PromiseResult<JNovel_Series> { return <JNovel_Series | ResponseError>__next_data__(await get_response_text(`https://j-novel.club/series/${opts.path}`, opts)); }
    export async function calender(opts: Opts): PromiseResult<JNovel_Calender>                { return <JNovel_Calender | ResponseError>__next_data__(await get_response_text("https://j-novel.club/calendar", opts)); }
    export async function user(opts: Opts): PromiseResult<JNovel_User> {
        const access_token_expired = opts.cookie_jar?.getCookie("access_token")?.hasExpired() ?? true;
        if (access_token_expired) return { "error": "access token is expired or doesn't exist" };
        return <JNovel_User | ResponseError>__next_data__(await get_response_text("https://j-novel.club/user", opts));
    }
    export async function reader_initial(opts: Opts & {legacy_id: string}) {
        const reader_text = await get_response_text(`https://labs.j-novel.club/embed/${opts.legacy_id}`, opts);
        if(typeof reader_text === "object") return reader_text;

        const title = extract_string_from_pattern(reader_text, /<title>(.+?)<\/title>/gis);
        const volume_img_uri = extract_string_from_pattern(reader_text, /<meta property="og:image" content="(.+?)">/gis);
        if(typeof title === "object") return title;
        if(typeof volume_img_uri === "object") return volume_img_uri;

        const data_toc_strerr = extract_string_from_pattern(reader_text, /data-toc="(.+?)"/gis);
        const data_serie_strerr = extract_string_from_pattern(reader_text, /data-serie="(.+?)"/gis);
        const data_part_strerr = extract_string_from_pattern(reader_text, /data-part="(.+?)"/gis);
        if(typeof data_toc_strerr === "object") return data_toc_strerr;
        if(typeof data_serie_strerr === "object") return data_serie_strerr;
        if(typeof data_part_strerr === "object") return data_part_strerr;

        const data_toc_string = data_toc_strerr.replace(/&#34;/g, '"');
        const data_serie_string = data_serie_strerr.replace(/&#34;/g, '"');
        const data_part_string = data_part_strerr.replace(/&#34;/g, '"');

        const data_toc   = try_json_parse<JNovel_Toc>(clean_html_text(data_toc_string));
        const data_serie = try_json_parse<JNovel_Serie>(clean_html_text(data_serie_string));
        const data_part  = try_json_parse<JNovel_Part>(clean_html_text(data_part_string));
        if("error" in data_toc) return data_toc;
        if("error" in data_serie) return data_serie;
        if("error" in data_part) return data_part;

        return {
            title: title,
            volume_img_uri: volume_img_uri,
            part: data_part,
            serie: data_serie,
            toc: data_toc,
        }
    }
    export async function reader_contents(opts: Opts & {legacy_id: string}): PromiseResult<ReaderContent>{
        const xhtml = await get_response_text(`https://labs.j-novel.club/embed/${opts.legacy_id}/data.xhtml`, opts);
        if(typeof xhtml === "object") return xhtml;
        const content = <ReaderContent>[];

        const xhtml_lines = xhtml.split('\n');
        let line = 0;
        while(!/<div class="main"?/.test(xhtml_lines[line])) line++;
        while(!/<\/div>/.test(xhtml_lines[++line])) {
            type HTMLClass = 'img'|'p'|'h1'|'h2';
            const extract_type_regex = /<(.+?)(>|\s)/;
            const type: HTMLClass = (extract_type_regex.exec(xhtml_lines[line]) as RegExpExecArray)[1] as HTMLClass;
            switch (type) {
                case 'img':
                    content.push({type: "image", src: html_img_src(xhtml_lines[line])}); break;
                case 'p':
                    content.push({type: "text", text: html_inner_text_content(xhtml_lines[line]) + '\r\n' }); break;
                case 'h1':
                    content.push({type: "chapter", title: html_inner_text_content(xhtml_lines[line]) + '\r\n' }); break;
                case 'h2':
                    content.push({type: "sub_chapter", title: html_inner_text_content(xhtml_lines[line]) + '\r\n' }); break;
                default: return {"error": `Parse Error: unknown JNovel html_class of '${type}'`};
            }
        }
        return content;
    }
    export async function reader(opts: Opts & {legacy_id: string}): PromiseResult<JNovel_Reader>{
        const [reader_init, contents] = await Promise.all([reader_initial(opts), reader_contents(opts)]);
        if("error" in reader_init) return reader_init;
        if("error" in contents) return contents;
        return {
            "title": reader_init.title,
            "volume_img_uri": reader_init.volume_img_uri,
            "content": contents,
            "part": reader_init.part,
            "serie": reader_init.serie,
            "toc": reader_init.toc
        }
    }
    export async function reader_volume(opts: Opts & {legacy_id: string}): PromiseResult<JNovel_Reader[]>{
        const reader_result = await reader(opts);
        if("error" in reader_result) return reader_result;
        const parts = [reader_result];
        const uuids: string[] = [opts.legacy_id];
        const index = reader_result.toc.findIndex(volume => volume.chapters.findIndex(chapter => chapter.uuid === opts.legacy_id) !== -1);
        const volume_parts = reader_result.toc[index].chapters;
        for (const volume_part of volume_parts)
            if (volume_part.selected != true)
                uuids.push(volume_part.uuid);
        for(const uuid of uuids){
            const temp_reader = await reader({...opts, legacy_id: uuid});
            if("error" in temp_reader) return temp_reader;
            parts.push(temp_reader);
        }
        return parts;
    }
}