import EPub from 'epub2';
import Pdfparser from 'pdf2json';
import Roz, { RozContent } from './types/roz';
import { request } from 'http';
import fs from 'fs';
import uuid from "react-native-uuid";

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

    // function chapter_title_to_roz_content_type(title: string): RozContentType{
    //     switch(title){
    //         case "Cover": return "IMAGE";
    //         default: return "CHAPTER_TITLE";
    //     }
    // }
	function html_inner_text_content(html_line: string) {
		return html_line.trim().replace(/<.+?>/g, '').trim();
	}
	function html_img_src(html_line: string) {
		return (/<img.+?src="(.+?)"/.exec(html_line) as RegExpExecArray)?.[1]?.trim();
	}
    export function parse_html(html_content: string){
        const content: RozContent[] = [];
        const xhtml_lines = html_content
            .replace(/\r\n/g, '\n')
            .replace(/&#160;/g, ' ')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line);

		let line = 0;
        if(xhtml_lines.join('\n').includes("<nav epub:type=\"toc\"")) return [];
		while (!/<\/div>/.test(xhtml_lines[++line]) && !/<\/section>/.test(xhtml_lines[line]) && line < xhtml_lines.length) {
			type HTMLClass = 'img' | 'p' | 'h1' | 'h2';
			const extract_type_regex = /<(.+?)(>|\s)/;
			const type: HTMLClass = (extract_type_regex.exec(xhtml_lines[line]) as RegExpExecArray)[1] as HTMLClass;
            switch (type) {
				case 'img':
					content.push({ type: "IMAGE", content: html_img_src(xhtml_lines[line]) }); break;
				case 'p':
					content.push({ type: "PARAGRAPH", content: html_inner_text_content(xhtml_lines[line]) }); break;
				case 'h1':
					content.push({ type: "CHAPTER_TITLE", content: html_inner_text_content(xhtml_lines[line]) }); break;
				case 'h2':
					content.push({ type: "CHAPTER_SUBTITLE", content: html_inner_text_content(xhtml_lines[line]) }); break;
			}
		}
        return content.filter(c => c.content);
    }
    export async function parse_epub(file_path_or_url: string): Promise<Roz> {
        file_path_or_url = await transform_url_to_path(file_path_or_url, ".epub");
        const epub = await EPub.createAsync(file_path_or_url) as EPub;
        const sections = (await Promise.all(
            epub.flow.map(async(chapter) => chapter.id ? 
                {contents: await epub.getChapterAsync(chapter.id), chapter} 
                : undefined)
        )).filter(section => section !== undefined);
        const parsed_sections = sections.map(section => parse_html(section.contents)).flat();

        return {
            source_file: file_path_or_url,
            source_file_type: "EPUB",
            title: epub.metadata.title ?? "Unknown EPub",
            author: epub.metadata.creator,
            publisher: epub.metadata.publisher,
            date: epub.metadata.date,
            // cover: epub.metadata.cover,
            series: {
                name: "",
                no: 0,
            },
            pages: 0,
            content: parsed_sections
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
