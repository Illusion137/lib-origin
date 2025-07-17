import type { RozChapterContents } from './types/roz';
import type { TocElement } from 'epub2/lib/epub/const';
import type Roz from './types/roz';
import EPub from 'epub2';
import Pdfparser from 'pdf2json';
import { html_to_roz_content as html_to_roz_contents } from './utils';
import { gen_uuid, try_json_parse } from '../../origin/src/utils/util';
import { fs, get_temp_file_path } from '../native/fs/fs';
import type { FileExtension, PromiseResult } from '../../origin/src/utils/types';
// import * as docx from "docx";
// import mammoth from "mammoth";

export namespace FileParser {
    function is_url(test_url: string): boolean {
        const test = /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$/;
        return test.test(test_url);
    }

    async function transform_url_to_path(file_path_or_url: string, file_extension: FileExtension): Promise<string>{
        if(!is_url(file_path_or_url)) return file_path_or_url;
        const to_download_path = get_temp_file_path(file_extension);
        return await fs.download_to_file(file_path_or_url, to_download_path);
    }

    export async function parse_roz(file_path_or_url: string): PromiseResult<Roz> {
        file_path_or_url = await transform_url_to_path(file_path_or_url, ".roz");
        const strerr = await fs.read_as_string(file_path_or_url, {encoding: 'utf8'});
        if(typeof strerr === "string") return try_json_parse<Roz>(strerr);
        return strerr;
    }

    async function epub_get_image_base64(epub: EPub, html_image_path: string) {
        const paths = html_image_path.split('/');
        const image_id = paths[paths.length - 1];
        const image: [Buffer, string] = await epub.getImageAsync(image_id); 
        return `data:${image[1]};base64,${image[0].toString('base64')}`;
    }
    async function parse_epub_flow(epub: EPub){
        const sections: { contents: string; chapter: TocElement; }[] = [];
        for(const chapter of epub.flow){
            if(!chapter.id) continue;
            sections.push({contents: await epub.getChapterAsync(chapter.id), chapter});
        }
        return sections;
    }
    async function parse_epub_sections_to_roz_content(epub: EPub, sections: Awaited<ReturnType<typeof parse_epub_flow>>){
        const roz_sections: RozChapterContents[] = [];
        for(const section of sections){
            const roz_contents = html_to_roz_contents(section.contents);
            for(let i = 0; i < roz_contents.length; i++){
                if(roz_contents[i].type !== "IMAGE") continue;
                roz_contents[i] = {...roz_contents[i], content: await epub_get_image_base64(epub, roz_contents[i].content)}
            }
            if(section.chapter.title){
                roz_sections.push({
                    ...section, 
                    contents: roz_contents 
                });
            }
            else {
                roz_sections[roz_sections.length - 1].contents.push(...roz_contents);
            }
        }
        return roz_sections;
    }
    export async function parse_epub(file_path_or_url: string): Promise<Roz> {
        file_path_or_url = await transform_url_to_path(file_path_or_url, ".epub");
        const epub = await EPub.createAsync(file_path_or_url) as EPub;
        const sections = await parse_epub_flow(epub);

        const roz_sections = await parse_epub_sections_to_roz_content(epub, sections);

        return {
            uuid: gen_uuid(),
            source_file: file_path_or_url,
            source_file_type: "EPUB",
            title: epub.metadata.title ?? "Unknown EPub",
            author: epub.metadata.creator ?? null,
            publisher: epub.metadata.publisher ?? null,
            date: epub.metadata.date ?? null,
            cover: roz_sections.map(item => item.contents).flat().find(item => item.type === "IMAGE")?.content ?? null,
            series_name: null,
            series_no: null,
            content: roz_sections
        }
    }

    export async function parse_pdf(file_path_or_url: string, opts: {
        pdf_start_page: number;
        pdf_end_page?: number;
        pdf_margin_inches: [number, number];
    }): Promise<string> {
        file_path_or_url = await transform_url_to_path(file_path_or_url, ".pdf");
        let rtxt_content = "";
        const parser = new Pdfparser();
        const promise = new Promise((resolve) => {parser.on("pdfParser_dataReady", (data) => {
            for(const page of data.Pages.slice(opts.pdf_start_page, opts.pdf_end_page)){
                console.log(JSON.stringify(page));
                for (const t of page.Texts) {
                    for (const r of t.R) {
                        if (t.y > opts.pdf_margin_inches[0] && t.y < opts.pdf_margin_inches[1]) {
                            const txt = decodeURIComponent(r.T)
                            // rtxt
                            if(txt === null){
                                rtxt_content += '\n';
                            }
                            rtxt_content += txt + '\r\n';
                        }
                    }
                }
            }
            resolve(0);
            });
        });
        await parser.loadPDF(file_path_or_url);
        await promise;
        return rtxt_content;
    }
    // async function docx_buffer(document: docx.Document) {
    //     return await docx.Packer.toBuffer(document);
    // }
    export async function parse_txt(file_path_or_url: string, title: string): PromiseResult<Roz> {
        file_path_or_url = await transform_url_to_path(file_path_or_url, ".txt");
        const text_contents = await fs.read_as_string(file_path_or_url, {});
        if(typeof text_contents === "object") return text_contents;
        const line_normalized_text_contents = text_contents.replace(/\r\n/g, '\n');
        return {
            uuid: gen_uuid(),
            source_file: file_path_or_url,
            source_file_type: "TXT",
            title: title,
            author: null,
            publisher: null,
            date: new Date().toISOString(),
            cover: null,
            series_name: null,
            series_no: null,
            content: [{
                chapter: {title},
                contents: line_normalized_text_contents
                    .split('\n')
                    .map(content => ({content, type: 'PARAGRAPH', uuid: gen_uuid(), duration: 0}))
            }]
        }
    }
}
