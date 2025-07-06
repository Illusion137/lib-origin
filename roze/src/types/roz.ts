// Roz standard format
export type RozContentType = 'TITLE'|'CHAPTER_TITLE'|'SECTION_TITLE'|'CHAPTER_SUBTITLE'|'HEADING'|'PARAGRAPH'|'IMAGE'|"LINE_BREAK"|"THEME_BREAK";
export interface RozContent {
    type: RozContentType;
    content: string;
}
type RozChapterContentsBase<T> = {
    contents: T;
    chapter: {
        id?: string;
        title?: string;
    };
};
export type RozChapterContentsPromise = RozChapterContentsBase<Promise<RozContent>[]>;
export type RozChapterContents = RozChapterContentsBase<RozContent[]>;
export type RozSourceFileType = 'TXT'|'PDF'|'JNOVEL'|'WITCHCULT'|'SYOSETU'|'EPUB';
export default interface Roz {
    source_file: string;
    source_file_type: RozSourceFileType;
    title: string;
    cover?: string;
    author?: string;
    publisher?: string;
    date?: string;
    series: {
        name: string|null;
        no: number;
    };
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