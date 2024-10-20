import { CookieJar } from "../../origin/src/utils/cookie_util"




export interface RozeJNovelOptions {
    id_or_url: string
    jar: CookieJar
    mode: '' 
    progress_callback?: () => { action: string, current: number, total: number };
};
export interface RozeNcodeSyosetuOptions {
    type: "NcodeSyosetu"

};
export interface RozeEPubOptions {
    type: "EPUB"

};
export interface RozePDFOptions {
    type: "PDF"

};
export interface RozeDocxOptions {
    type: "DOCX"

};
export interface RozeRtfOptions {
    type: "RTF"

};
export interface RozeTxtOptions {
    type: "TXT"

};

export type RozeOptions = RozeJNovelOptions
    | RozeNcodeSyosetuOptions
    | RozeEPubOptions
    | RozePDFOptions
    | RozeDocxOptions
    | RozeRtfOptions
    | RozeTxtOptions;

export interface RozeOptionalMetadata {

};

function getChapterBreak(){ // 48 dashes
    return '[------------------------------------------------]\r\n';
}
function getSubChapterBreak(){ // 48 dashes
    return '[------------------------]\r\n';
}
export class Roze {
    #roz_content: string
    constructor(roz_content: string, _?: RozeOptionalMetadata) {
        this.#roz_content = roz_content;
    }
    /*
    https://labs.j-novel.club/embed/xyz
    */
    // static async fromJNovel(opts: RozeJNovelOptions): Promise<Roze> {
    //     const headers = {
    //         "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    //         "accept-language": "en-US,en;q=0.9",
    //         "cache-control": "max-age=0",
    //         "priority": "u=0, i",
    //         "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
    //         "sec-ch-ua-mobile": "?0",
    //         "sec-ch-ua-platform": "\"Windows\"",
    //         "sec-fetch-dest": "document",
    //         "sec-fetch-mode": "navigate",
    //         "sec-fetch-site": "none",
    //         "sec-fetch-user": "?1",
    //         "upgrade-insecure-requests": "1",
    //         "cookie": opts.jar.toString()
    //     };
    //     const jnovel_id = opts.id_or_url.replace('labs.j-novel.club/embed/', '').replace('https://', '');
    //     const body = await (await fetch(`https://labs.j-novel.club/embed/${jnovel_id}`,
    //         { 'method': "GET", headers })).text();
    //     const title: string = (RegExp('<title>(.+?)</title>', "gis").exec(body) as RegExpExecArray)[1];
    //     const volume_img_uri: string = (RegExp('<meta property="og:image" content="(.+?)">', "gis").exec(body) as RegExpExecArray)[1];

    //     const data_toc_string = (RegExp('data-toc="(.+?)"', "gis").exec(body) as RegExpExecArray)[1].replace(/&#34;/g, '"');
    //     const data_serie_string = (RegExp('data-serie="(.+?)"', "gis").exec(body) as RegExpExecArray)[1].replace(/&#34;/g, '"');
    //     const data_part_string = (RegExp('data-part="(.+?)"', "gis").exec(body) as RegExpExecArray)[1].replace(/&#34;/g, '"');

    //     const data_toc: JNovelToc     = JSON.parse(cleanHTMLText(data_toc_string));
    //     const data_serie: JNovelSerie = JSON.parse(cleanHTMLText(data_serie_string));
    //     const data_part: JNovelPart   = JSON.parse(cleanHTMLText(data_part_string));

    //     let roz_content = "";

    //     const uuids: string[] = [jnovel_id];
    //     const index = data_toc.findIndex(volume => volume.chapters.findIndex(chapter => chapter.uuid === jnovel_id) !== -1);
    //     const volume_parts: JNovelChapter[] = data_toc[index].chapters;
    //     for (const volume_part of volume_parts)
    //         if (volume_part.selected != true)
    //             uuids.push(volume_part.uuid);

    //     const xhtml = await (await fetch(`https://labs.j-novel.club/embed/${jnovel_id}/data.xhtml`,
    //         { 'method': "GET", headers })).text();
    //     const xhtml_lines = xhtml.split('\n');
    //     let line = 0;
    //     while(!/<div class="main"?/.test(xhtml_lines[line])) line++;
    //     while(!/<\/div>/.test(xhtml_lines[++line])) {
    //         type HTMLClass = 'img'|'p'|'h1'|'h2';
    //         const extract_type_regex = /<(.+?)(>|\s)/;
    //         const type: HTMLClass = (extract_type_regex.exec(xhtml_lines[line]) as RegExpExecArray)[1] as HTMLClass;
    //         switch (type) {
    //             case 'img': {
    //                 roz_content += createImgBreak(getHTMLImgSrc(xhtml_lines[line]));
    //                 break;
    //             }
    //             case 'p': {
    //                 roz_content += getHTMLInnerTextContent(xhtml_lines[line]) + '\r\n';
    //                 break;
    //             }
    //             case 'h1': {
    //                 roz_content += getChapterBreak();
    //                 roz_content += getHTMLInnerTextContent(xhtml_lines[line]) + '\r\n';;
    //                 break;
    //             }
    //             case 'h2': {
    //                 roz_content += getSubChapterBreak();
    //                 roz_content += getHTMLInnerTextContent(xhtml_lines[line]) + '\r\n';;
    //                 break;
    //             }
    //             default: {
    //                 throw {"error": `[ERROR] unknown JNovel HTMLClass of '${type}'`};
    //             }
    //         }
    //     }
    //     return new Roze(roz_content, {'type': 'JNovel', 'data': [title, volume_img_uri, data_toc, data_serie, data_part] as [string, string, JNovelToc, JNovelSerie, JNovelPart]});
    // }
    // static async fromNcodeSyosetu(): Roze{
        // async function parse_webnovel_chapter(web_novel_id: string, chapter: number, proxy: Origin.Illusive.Proxy = undefined, progress_bar: SingleBar = undefined) {
        //     let contents_jp = "";
            // const response = await (await fetch(
            //     `https://ncode.syosetu.com/${web_novel_id}/${chapter}/`,
            // )).text();
        //     const dom = new JSDOM(response.data);
        //     const chapter_title_jp =
        //         dom.window.document.querySelector(".novel_subtitle").textContent;
        //     const lines_of_text =
        //         dom.window.document.querySelector("#novel_honbun").children;
        
        //     contents_jp += chapter_title_jp + "\r\n";
        //     for (const line_of_text of lines_of_text)
        //         contents_jp += line_of_text.textContent + "\r\n";
        //     if (progress_bar != undefined) progress_bar.increment();
        //     return contents_jp;
        // }
        // if (web_novel_id == undefined) return undefined;
        // if (Number.isNaN(range_start)) range_start = 1;
        // if (Number.isNaN(range_end)) range_end = range_start;
    
        // let total_contents_jp = "";
    
        // progress_bar.start(range_end - range_start + 1, 0);
    
        // const chapters = [];
        // for (let i = range_start; i <= range_end; i++) {
        //     chapters.push(await parse_webnovel_chapter(web_novel_id, i));
        //     progress_bar.increment();
        // }
        // total_contents_jp = chapters.join(chapter_break());
    
        // return total_contents_jp;
    // }
    // static fromEPub(): Roze{}
    // static fromPDF(): Roze{}
    // static fromDOCX(): Roze{}
    // static fromRTF(): Roze{}
    // static fromTXT(): Roze{}
    getContent(): string { return this.#roz_content; }
    getText(): string {
        return this.#roz_content.replace(new RegExp(getChapterBreak(), 'g'), '')
                                .replace(new RegExp(getSubChapterBreak(), 'g'), '')
                                .replace(new RegExp('[^----(.+?)----^]', 'g'), '')
    }
    translateJapaneseContent(){

    }
    runTranslationMap(){

    }
};