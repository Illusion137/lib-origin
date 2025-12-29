import type { StaticAssert } from './types';
// Roz standard format
export type RozContentType = 'TITLE'|'CHAPTER_TITLE'|'SECTION_TITLE'|'CHAPTER_SUBTITLE'|'HEADING'|'PARAGRAPH'|'IMAGE'|"LINE_BREAK"|"THEME_BREAK"|"TABLE_OF_CONTENTS_CHAPTER";
export interface RozContent {
    uuid: string;
    type: RozContentType;
    content: string;
    duration: number;
}
export interface RozChapter {
    uuid: string;
    id?: string;
    title: string;
    audio_path?: string;
    duration?: number;
}
export interface RozChapterContents {
    contents: RozContent[];
    chapter: RozChapter
}

export type RozSourceFileType = 'TXT'|'PDF'|'JNOVEL'|'WITCHCULT'|'SYOSETU'|'EPUB'|'DOCX'|'FILEBASE'|"FOLDER";
export const RozSourceFileTypeArray = ['TXT','PDF','JNOVEL','WITCHCULT','SYOSETU','EPUB','DOCX','FILEBASE'] as const;
export type RozFileVersions = 1;

export interface RozHeader {
    version: 1;
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
};


// eslint-disable-next-line @typescript-eslint/no-unused-vars
type HeaderVersionAssertion = StaticAssert<RozHeader['version'] extends RozFileVersions ? true : false>;

export default interface Roz extends RozHeader { // TODO add versions to format
    chapters: RozChapterContents[];
};
export type RozTextStructureType = "NONE"|"em"|"b";
export interface RozTextStructure {
    content: string;
    type: RozTextStructureType;
};
export type RozTextStructures = RozTextStructure[];

export interface SQLRoz extends Roz {
    id: number;
    //meta
}