import EPub from 'epub2';
import Pdfparser from 'pdf2json';
import Roz, { RozChapterContents, RozChapterContentsPromise } from './types/roz';
import { request } from 'http';
import fs from 'fs';
import uuid from "react-native-uuid";
import { html_to_roz_content } from './utils';

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
        const image: [Buffer<ArrayBufferLike>, string] = await epub.getImageAsync(image_id);
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
                            {type: parsed.type, content: (await epub_get_image_base64(epub, parsed.content)) } 
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
            source_file: file_path_or_url,
            source_file_type: "EPUB",
            title: epub.metadata.title ?? "Unknown EPub",
            author: epub.metadata.creator,
            publisher: epub.metadata.publisher,
            date: epub.metadata.date,
            cover: roz_sections.map(item => item.contents).flat().find(item => item.type === "IMAGE")?.content,
            series: {
                name: "",
                no: 0,
            },
            content: roz_sections
        }
    }

    export async function parse_pdf(file_path_or_url: string, opts: {
        pdf_start_page: number;
        pdf_margin: [number, number];
    }): Promise<Roz> {
        file_path_or_url = await transform_url_to_path(file_path_or_url, ".pdf");
        let rtxt_content = "";
        const parser = new Pdfparser();
        const promise = new Promise((resolve) => {parser.on("pdfParser_dataReady", (data) => {
            for(const page of data.Pages.slice(opts.pdf_start_page)){
                for (const t of page.Texts) {
                    for (const r of t.R) {
                        if (t.y > opts.pdf_margin[0] && t.y < opts.pdf_margin[1]) {
                            const txt = decodeURIComponent(r.T)
                            // rtxt
                            if(txt === null){
                                // rtxt_content += chapter_break();
                            }
                            rtxt_content += txt + '\r\n';
                        }
                    }
                }
            }
            fs.writeFileSync("temp/docs/pdf.json", JSON.stringify(data));
            resolve(0);
            });
        });
        await parser.loadPDF(file_path_or_url);
        await promise;
        return undefined as any;
        // return rtxt_content;
    }

    export async function parse_txt(file_path_or_url: string){
        file_path_or_url = await transform_url_to_path(file_path_or_url, ".txt");
    }
}
