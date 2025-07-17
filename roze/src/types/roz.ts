// Roz standard format
export type RozContentType = 'TITLE'|'CHAPTER_TITLE'|'SECTION_TITLE'|'CHAPTER_SUBTITLE'|'HEADING'|'PARAGRAPH'|'IMAGE'|"LINE_BREAK"|"THEME_BREAK";
export interface RozContent {
    uuid: string;
    type: RozContentType;
    content: string;
    duration: number;
}
export interface RozChapterContents {
    contents: RozContent[];
    chapter: {
        id?: string;
        title?: string;
        audio_path?: string;
    };
}

export type RozSourceFileType = 'TXT'|'PDF'|'JNOVEL'|'WITCHCULT'|'SYOSETU'|'EPUB'|'DOCX'|'FILEBASE';
export const RozSourceFileTypeArray = ['TXT','PDF','JNOVEL','WITCHCULT','SYOSETU','EPUB','DOCX','FILEBASE'] as const;
export default interface Roz {
    uuid: string;
    source_file: string;
    source_file_type: RozSourceFileType;
    title: string;
    cover: string|null;
    author: string|null;
    publisher: string|null;
    date: string|null;
    series_name: string|null;
    series_no: number|null;
    content: RozChapterContents[];
};
export type RozTextStructureType = "NONE"|"em"|"b";
export interface RozTextStructure {
    content: string;
    type: RozTextStructureType;
};
export type RozTextStructures = RozTextStructure[];
export type RozTableOfContents = {
    chapter_title: string;
    start_content_index: number;
    end_content_index: number;
    inner_chapters: RozTableOfContents[];
}[];
export interface SQLRoz extends Roz {
    id: number;
    //meta
}