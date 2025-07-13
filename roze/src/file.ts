import EPub from 'epub2';
import Pdfparser from 'pdf2json';
import type { RozChapterContents, RozChapterContentsPromise } from './types/roz';
import type Roz from './types/roz';
import { request } from 'http';
import fs from 'fs';
import uuid from "react-native-uuid";
import { html_to_roz_content } from './utils';
import { gen_uuid } from '../../origin/src/utils/util';

export namespace FileParser {
    function is_url(test_url: string): boolean {
        const test =
            /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$/;
        return test.test(test_url);
    }

    const temp_path = 'temp/downloads/';

    async function transform_url_to_path(file_path_or_url: string, file_extension: string): Promise<string>{
        if(!is_url(file_path_or_url)) return file_path_or_url;
        const to_download_path = temp_path + uuid.v4() + file_extension;
        const file = fs.createWriteStream(to_download_path);
        const request_promise = new Promise((resolve) => {
            request(file_path_or_url).pipe(file).on('close', () => {
                resolve(0);
            });
        });
        await request_promise;
        return to_download_path;
    }

    async function epub_get_image_base64(epub: EPub, html_image_path: string) {
        const paths = html_image_path.split('/');
        const image_id = paths[paths.length - 1];
        const image: [Buffer, string] = await epub.getImageAsync(image_id);
        return `data:${image[1]};base64,${image[0].toString('base64')}`;
    }
    export async function parse_epub(file_path_or_url: string): Promise<Roz> {
        file_path_or_url = await transform_url_to_path(file_path_or_url, ".epub");
        const epub = await EPub.createAsync(file_path_or_url) as EPub;
        const sections = (await Promise.all(
            epub.flow.map(async(chapter) => chapter.id ? 
                {contents: await epub.getChapterAsync(chapter.id), chapter} 
                : undefined)
        )).filter(section => section !== undefined);
        const promised_roz_sections: RozChapterContentsPromise[] = sections.map(section => ({
                contents: html_to_roz_content(section.contents)
                    .map(async(parsed): Promise<ReturnType<typeof html_to_roz_content>[0]> => 
                        parsed.type === "IMAGE" ? 
                            {type: parsed.type, content: (await epub_get_image_base64(epub, parsed.content)), uuid: parsed.uuid} 
                            : parsed), 
                chapter: {
                    id: section.chapter.id,
                    title: section.chapter.title
                }
            })
        )
        const roz_sections: RozChapterContents[] = [];
        for(const promised_roz_section of promised_roz_sections){
            roz_sections.push({
                chapter: promised_roz_section.chapter,
                contents: await Promise.all(promised_roz_section.contents)
            });
        }

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

    export async function parse_txt(file_path_or_url: string){
        file_path_or_url = await transform_url_to_path(file_path_or_url, ".txt");
    }
}
