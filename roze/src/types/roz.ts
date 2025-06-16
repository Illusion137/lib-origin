// Roz standard format
export type RozContentType = 'TITLE'|'CHAPTER_TITLE'|'SECTION_TITLE'|'CHAPTER_SUBTITLE'|'HEADING'|'PARAGRAPH'|'IMAGE';
export interface RozContent {
    type: RozContentType;
    content: string;
}
export type RozSourceFileType = 'TXT'|'PDF'|'JNOVEL'|'WITCHCULT'|'SYOSETU'|'EPUB';
export default interface Roz {
    source_file: string;
    source_file_type: RozSourceFileType;
    title: string;
    author?: string;
    publisher?: string;
    date?: string;
    series: {
        name: string;
        no: number;
    };
    pages: number;
    content: RozContent[];
};