import type { RozChapterContents, RozContent } from '@roze/types/roz';
import type { TocElement } from 'epub2/lib/epub/const';
import type Roz from '@roze/types/roz';
import EPub from 'epub2';
import pathlib from 'path-browserify';
import { gen_uuid } from '@common/utils/util';
import { fs } from '@native/fs/fs';
import { Counter, type FileExtension, type PromiseResult } from '@common/types';
import { force_json_parse, parse_pdf_date, try_json_parse } from '@common/utils/parse_util';
import { generror, generror_catch } from '@common/utils/error_util';
import { gen_temp_file_name, get_temp_file_path } from '@native/fs/fs_utils';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import pdfjs_lib, { type PDFDocumentProxy } from "pdfjs-dist/legacy/build/pdf.mjs";
import sharp, { type Channels } from 'sharp';
import { reinterpret_cast } from '@common/cast';
import { base_64_image, filepath_to_bufer as filepath_to_bytes, html_to_roz_contents, roz_contents_to_roz_chapters_contents } from './utils';
import mammoth from "mammoth";
import { imageSize } from 'image-size';

export namespace FileParser {
    interface ParseFileOpts {
        download_to_directory?: string;
        file_name_no_ext?: string;
    };

    function is_url(test_url: string): boolean {
          try {
            const url = new URL(test_url);
            return (url.protocol === 'http:' || url.protocol === 'https:');
        } catch (_) {
            return false;  
        }
    }

    async function transform_url_to_path(file_path_or_url: string, file_extension: FileExtension, opts: ParseFileOpts): PromiseResult<string>{
        if(!is_url(file_path_or_url)) return file_path_or_url;
        const file_name = opts.file_name_no_ext ? opts.file_name_no_ext + file_extension : await gen_temp_file_name(file_extension);
        const to_download_path = opts.download_to_directory ? 
            pathlib.join(opts.download_to_directory, file_name)
            : await get_temp_file_path(file_extension, "NO_REGISTER");
        return await fs().download_to_file(file_path_or_url, to_download_path);
    }

    export async function parse_roz(file_path_or_url: string, opts: ParseFileOpts): PromiseResult<Roz> {
        const file_path_err = await transform_url_to_path(file_path_or_url, ".roz", opts);
        if(typeof file_path_err === "object") return file_path_err;
        const strerr = await fs().read_as_string(file_path_err, {encoding: 'utf8'});
        if(typeof strerr === "string") return try_json_parse<Roz>(strerr);
        return strerr;
    }
    async function epub_get_image_base64(epub: EPub, html_image_path: string) {
        const image_id = epub.listImage().find(image => image.href && html_image_path.replace(epub.imageroot, '') === image.href)?.id ?? epub.listImage().find(image => image.href?.includes(html_image_path.replaceAll("../",  "").replace(epub.imageroot, '')))?.id;
        const image: [Buffer, string] = await epub.getImageAsync(image_id!); 
        return base_64_image(image[0].toString('base64'), image[1]);
    }
    const bad_chapter_ids = ["JLN.xhtml", "Just_Light_Novels.xhtml"];
    async function parse_epub_flow(epub: EPub){
        const sections: { contents: string; chapter: TocElement; }[] = [];
        for(const chapter of epub.flow) {
            if(!chapter.id) continue;
            let do_continue = false;
            for(const bad_chapter_id of bad_chapter_ids){
                if(chapter.id.toLowerCase().includes(bad_chapter_id.toLowerCase())) {
                    do_continue = true;
                    break;
                }
            }
            if(do_continue) continue;
            sections.push({contents: await epub.getChapterAsync(chapter.id), chapter});
        }
        return sections;
    }
    async function parse_epub_sections_to_roz_content(epub: EPub, sections: Awaited<ReturnType<typeof parse_epub_flow>>){
        const IMAGE_HEIGHT_MIN = 100;
        const IMAGE_WIDTH_MIN = 100;
        const IMAGE_RATIO_MIN = 0.7;
        const IMAGE_RATIO_MAX = 1.6;
        const IMAGE_RATIO_SQUARE_MIN = 0.95;
        const IMAGE_RATIO_SQUARE_MAX = 1.05;
        
        const roz_sections: RozChapterContents[] = [];
        for(const section of sections){
            let roz_contents = html_to_roz_contents(section.contents);
            for(let i = 0; i < roz_contents.length; i++){
                if(roz_contents[i].type !== "IMAGE") continue;
                roz_contents[i] = {...roz_contents[i], content: await epub_get_image_base64(epub, roz_contents[i].content)}
            }
            roz_contents = roz_contents.filter(content => {
                if(content.type !== "IMAGE") return true;
                const base64_data = content.content.split(';base64,').pop() ?? "";
                const buffer = Buffer.from(base64_data, 'base64');
                const size = imageSize(buffer);
                const ratio = size.height / size.width;
                if(size.height < IMAGE_HEIGHT_MIN) return false;
                if(size.width < IMAGE_WIDTH_MIN) return false;
                if(ratio > IMAGE_RATIO_MAX) return false;
                if(ratio < IMAGE_RATIO_MIN) return false;
                if(ratio >= IMAGE_RATIO_SQUARE_MIN && ratio <= IMAGE_RATIO_SQUARE_MAX) return false;
                return true;
            });
            if(section.chapter.title || section.chapter.id?.toLowerCase() === "cover" || section.chapter.id?.toLowerCase() === "titlepage"){
                roz_sections.push({
                    ...section,
                    chapter: {
                        ...section.chapter,
                        uuid: gen_uuid(),
                        title: section.chapter.title ?? ""
                    },
                    contents: roz_contents 
                });
            }
            else if(roz_sections.length == 0) {
                roz_sections.push({
                    ...section,
                    chapter: {
                        ...section.chapter,
                        title: section.chapter.title ?? "",
                        uuid: gen_uuid()
                    },
                    contents: roz_contents
                });
            }
            else {
                roz_sections[roz_sections.length - 1].contents.push(...roz_contents);
            }
        }
        return roz_sections;
    }
    export async function parse_epub(file_path_or_url: string, opts: ParseFileOpts): PromiseResult<Roz> {
        const file_path_err = await transform_url_to_path(file_path_or_url, ".epub", opts);
        if(typeof file_path_err === "object") return file_path_err;
        try {
            const epub = await EPub.createAsync(file_path_err) as EPub;
            const sections = await parse_epub_flow(epub);
            
            const roz_sections = await parse_epub_sections_to_roz_content(epub, sections);
            return {
                version: 1,
                uuid: gen_uuid(),
                source_file: pathlib.resolve(file_path_or_url),
                source_file_type: "EPUB",
                title: epub.metadata.title ?? "Unknown EPub",
                author: epub.metadata.creator ?? null,
                publisher: epub.metadata.publisher ?? null,
                date: epub.metadata.date ?? null,
                cover: roz_sections.map(item => item.contents).flat().find(item => item.type === "IMAGE")?.content ?? null,
                series_name: null,
                series_no: null,
                chapters: roz_sections
            }
        }
        catch(e) {
            return generror_catch(e, "Failed to parse epub", {file_path_or_url, file_path_err, opts});
        }
    }
    interface PDFOptions {
        margin_cutoff_header?: number|"autodetect";
        margin_cutoff_footer?: number|"autodetect";
    }
    function pdf_is_cutoff(text_item: TextItem, opts: PDFOptions){
        return (opts.margin_cutoff_footer && typeof opts.margin_cutoff_footer === "number" && text_item.transform[5] <= opts.margin_cutoff_footer) ||
        (opts.margin_cutoff_header && typeof opts.margin_cutoff_header === "number" && text_item.transform[5] >= opts.margin_cutoff_header)
    }
    async function detect_pdf_spacing(pdf: PDFDocumentProxy, opts: PDFOptions){
        interface YText {y: number, text: string};
        const text_y_differences_counter = new Counter<number>();
        const header_text_height_counter = new Counter<YText>();
        const footer_text_height_counter = new Counter<YText>();
        const most_pages_count = pdf.numPages * 0.75;
        for (let page_num = 1; page_num <= pdf.numPages; page_num++) {
            const page = await pdf.getPage(page_num);
            const viewport = page.getViewport({ scale: 1 });
            const operator_list = await page.getOperatorList();

            const top_threshold = viewport.height * 0.9;
            const bottom_threshold = viewport.height * 0.1;

            const text_content = await page.getTextContent();
            let text_index = 0;
            let last_y = 0;

            for (const fn_id of operator_list.fnArray) {
                if (fn_id === pdfjs_lib.OPS.showText || fn_id === pdfjs_lib.OPS.showSpacedText) {
                    while (text_index < text_content.items.length) {
                        const text_item = text_content.items[text_index++] as TextItem;
                        if(pdf_is_cutoff(text_item, opts)) continue;
                        const this_y = text_item.transform[5];
                        if(this_y > top_threshold && text_item.str.trim()){
                            header_text_height_counter.add({y: this_y, text: text_item.str});
                        }
                        if(this_y < bottom_threshold){
                            footer_text_height_counter.add({y: this_y, text: text_item.str});
                        }

                        const y_difference = Math.abs(this_y - last_y);
                        text_y_differences_counter.add(y_difference);

                        last_y = this_y;
                    }
                }
            }
        }
        const maybe_margin_cutoff_header = header_text_height_counter.all().find((value) => value[1] >= most_pages_count)?.[0];
        const maybe_margin_cutoff_footer = footer_text_height_counter.all().find((value) => value[1] >= most_pages_count)?.[0];
        return {
            paragraph_gap: (text_y_differences_counter.first_non_zero()?.[0] ?? 0) + 2,
            margin_cutoff_header: maybe_margin_cutoff_header ? force_json_parse<YText>(maybe_margin_cutoff_header).y : Infinity,
            margin_cutoff_footer: maybe_margin_cutoff_footer ? force_json_parse<YText>(maybe_margin_cutoff_footer).y : 0,
        };
    }
    type RozPDFContent = RozContent & {pdf_text_height?: number};
    function roz_pdf_contents_to_roz_chapter_contents(contents: RozPDFContent[], text_height_counter: Counter<number>){
        const roz_chapter_contents: RozChapterContents[] = [];
        let chapter_contents: RozContent[] = [];
        let prev_chapter_title = "Cover";
        for(let i = 0; i < contents.length; i++){
            const content = contents[i];
            if(content.type === "IMAGE"){
                delete content.pdf_text_height;
                chapter_contents.push(content);
            }
            else if(content.type === "PARAGRAPH"){
                if(content.pdf_text_height === text_height_counter.non_zero(0)[0]){
                    delete content.pdf_text_height;
                    chapter_contents.push(content);
                }
                else if(content.pdf_text_height === text_height_counter.non_zero(1)[0]){
                    let lookahead_index = 1;
                    let lookahead_content = contents[i + lookahead_index];
                    while(lookahead_content.pdf_text_height === content.pdf_text_height){
                        delete lookahead_content.pdf_text_height;
                        lookahead_content = contents[i + ++lookahead_index];
                    }

                    delete content.pdf_text_height;
                    roz_chapter_contents.push({
                        chapter: {
                            uuid: gen_uuid(),
                            title: prev_chapter_title
                        },
                        contents: chapter_contents
                    });
                    prev_chapter_title = contents.slice(i, i + lookahead_index).map(c => c.content).join(' ');
                    chapter_contents = [];
                    chapter_contents.push({...content, content: prev_chapter_title, type: "CHAPTER_TITLE"});
                }
            }
        }
        return roz_chapter_contents;
    }
    export async function parse_pdf(file_path_or_url: string, opts: {
        paragraph_gap: number|"autodetect";
        cover_look_slice?: number;
        password?: string;
        on_pdf_load_progress?: (progress: {loaded: number, total: number}) => void;
    } & PDFOptions & ParseFileOpts): PromiseResult<Roz> {
        const file_path_err = await transform_url_to_path(file_path_or_url, ".pdf", opts);
        if(typeof file_path_err === "object") return file_path_err;
        const pdf_document_bytes = await filepath_to_bytes(file_path_err);
        if("error" in pdf_document_bytes) return pdf_document_bytes;
        try {
            const loading_task = pdfjs_lib.getDocument({ data: pdf_document_bytes, password: opts.password, verbosity: 0});
            loading_task.onProgress = opts.on_pdf_load_progress ?? (() => { return });

            const pdf = await loading_task.promise;
            const detected_spacing = await detect_pdf_spacing(pdf, opts);
            const paragraph_gap = opts.paragraph_gap === "autodetect" ? detected_spacing.paragraph_gap : opts.paragraph_gap;
            opts.margin_cutoff_header = opts.margin_cutoff_header === "autodetect" ? detected_spacing.margin_cutoff_header : opts.margin_cutoff_header; 
            opts.margin_cutoff_footer = opts.margin_cutoff_footer === "autodetect" ? detected_spacing.margin_cutoff_footer : opts.margin_cutoff_footer; 

            const contents: RozPDFContent[] = [];
            const text_height_counter = new Counter<number>();
            const paragraph_text_heights_counter = new Counter<number>();
    
            for (let page_num = 1; page_num <= pdf.numPages; page_num++) {
                const page = await pdf.getPage(page_num);
                const operator_list = await page.getOperatorList();
    
                const text_content = await page.getTextContent();
                let text_index = 0;
                let current_paragraph = "";
                let last_y: number|null = null;
                let last_x: number|null = null;
    
                const push_paragraph_if_needed = () => {
                    if (current_paragraph.trim().length > 0) {
                        contents.push({ pdf_text_height: paragraph_text_heights_counter.first_non_zero()?.[0], type: "PARAGRAPH", content: current_paragraph.trim(), uuid: gen_uuid(), duration: 0 });
                        current_paragraph = "";
                        paragraph_text_heights_counter.reset();
                    }
                };
                const append_text_with_layout = (text_item: TextItem) => {
                    text_height_counter.add(text_item.height);
                    paragraph_text_heights_counter.add(text_item.height);
                    const this_x = text_item.transform[4];
                    const this_y = text_item.transform[5];
    
                    const y_tolerance = 1.5;
                    const space_gap = 3;
    
                    if (last_y !== null) {
                        const y_diff = Math.abs(this_y - last_y);
                        if (y_diff <= y_tolerance) {
                            if (last_x !== null && this_x - last_x > space_gap) {
                                current_paragraph += " " + text_item.str;
                            } else {
                                current_paragraph += text_item.str;
                            }
                        } else if (y_diff < paragraph_gap) {
                            current_paragraph += " " + text_item.str;
                        } else {
                            push_paragraph_if_needed();
                            current_paragraph += text_item.str;
                        }
                    } else {
                        current_paragraph += text_item.str;
                    }
    
                    last_y = this_y;
                    last_x = this_x + text_item.width;
                };
                
                for (let i = 0; i < operator_list.fnArray.length; i++) {
                    const fn_id = operator_list.fnArray[i];
                    const args = operator_list.argsArray[i];
    
                    if (fn_id === pdfjs_lib.OPS.showText || fn_id === pdfjs_lib.OPS.showSpacedText) {
                        while (text_index < text_content.items.length) {
                            const text_item = text_content.items[text_index++] as TextItem;
                            if(pdf_is_cutoff(text_item, opts)) continue;
                            append_text_with_layout(text_item);
                        }
                    }
    
                    if (fn_id === pdfjs_lib.OPS.paintImageXObject || fn_id === pdfjs_lib.OPS.paintImageXObjectRepeat) {
                        push_paragraph_if_needed();
    
                        const image_name = args[0];
                        const image_obj = await new Promise<any>((resolve) => {
                            page.objs.get(image_name, (img: any) => resolve(img));
                        });
                
                        if (image_obj?.data) {
                            const channels = image_obj.dataLen / (image_obj.height * image_obj.width);
                            const png_buffer = await sharp(Buffer.from(image_obj.data), {
                                raw: {
                                    width: image_obj.width,
                                    height: image_obj.height,
                                    channels: reinterpret_cast<Channels>(channels)
                                }
                            }).raw().png().toBuffer();
                
                            contents.push({type: "IMAGE", content: base_64_image(png_buffer.toString("base64"), "png"), uuid: gen_uuid(), duration: 0});
                        }
    
                        last_y = null;
                        last_x = null;
                    }
                }
                push_paragraph_if_needed();
            }
            const pdf_info: {
                PDFFormatVersion?: string,
                IsAcroFormPresent?: boolean,
                IsXFAPresent?: boolean,
                Title?: string,
                Author?: string,
                Creator?: string,
                Producer?: string,
                CreationDate?: string,
                ModDate?: string
            } = (await pdf.getMetadata()).info;

            const cover = contents.slice(0, opts.cover_look_slice ?? 3).find(content => content.type === "IMAGE");

            return {
                version: 1,
                uuid: gen_uuid(),
                source_file: pathlib.resolve(file_path_or_url),
                source_file_type: "PDF",
                title: pdf_info.Title ?? pathlib.basename(file_path_or_url),
                author: pdf_info.Author ?? null,
                publisher: pdf_info.Producer ?? null,
                date: pdf_info.CreationDate ? parse_pdf_date(pdf_info.CreationDate)?.toISOString() : new Date().toISOString(),
                cover: cover?.content ?? null,
                series_name: null,
                series_no: null,
                chapters: roz_pdf_contents_to_roz_chapter_contents(contents, text_height_counter)
            };
        }
        catch(e){
            return generror_catch(e, "Failed to parse pdf", {file_path_or_url, file_path_err, opts});
        }
    }
    export async function parse_docx(file_path_or_url: string, opts: ParseFileOpts): PromiseResult<Roz> {
        const file_path_err = await transform_url_to_path(file_path_or_url, ".txt", opts);
        if(typeof file_path_err === "object") return file_path_err;
        try {
            const docx_document_bytes = await filepath_to_bytes(file_path_err);
            if("error" in docx_document_bytes) return docx_document_bytes;
            const docx_result = await mammoth.convertToHtml({arrayBuffer: docx_document_bytes.buffer});
            if(docx_result.messages.some(msg => msg.type === "error")) return generror("Error in docx_result", {file_path_or_url, opts, messages: docx_result.messages});
            const html = docx_result.value;
            return {
                version: 1,
                uuid: gen_uuid(),
                source_file: pathlib.resolve(file_path_or_url),
                source_file_type: "DOCX",
                title: pathlib.basename(file_path_or_url),
                author: null,
                publisher: null,
                date: new Date().toISOString(),
                cover: null,
                series_name: null,
                series_no: null,
                chapters: roz_contents_to_roz_chapters_contents(html_to_roz_contents(html))
            }
        }
        catch(e){
            return generror_catch(e, "Failed to parse txt", {file_path_or_url, file_path_err, opts});
        }
    }
    export async function parse_txt(file_path_or_url: string, title: string, opts: ParseFileOpts): PromiseResult<Roz> {
        const file_path_err = await transform_url_to_path(file_path_or_url, ".txt", opts);
        if(typeof file_path_err === "object") return file_path_err;
        try {
            const text_contents = await fs().read_as_string(file_path_or_url, {});
            if(typeof text_contents === "object") return text_contents;
            const line_normalized_text_contents = text_contents.replace(/\r\n/g, '\n');
            return {
                version: 1,
                uuid: gen_uuid(),
                source_file: pathlib.resolve(file_path_or_url),
                source_file_type: "TXT",
                title: title,
                author: null,
                publisher: null,
                date: new Date().toISOString(),
                cover: null,
                series_name: null,
                series_no: null,
                chapters: [{
                    chapter: {uuid: gen_uuid(), title},
                    contents: line_normalized_text_contents
                        .split('\n')
                        .map(content => ({content, type: 'PARAGRAPH', uuid: gen_uuid(), duration: 0}))
                }]
            }
        }
        catch(e){
            return generror_catch(e, "Failed to parse txt", {file_path_or_url, file_path_err, opts});
        }
    }
}
