import { MangaGenres } from "./MangaGenres";
import { MangaTypes } from "./MangaTypes";

export type MangaReadMode = "vertical"|"horizontal";
export type MangaReadQuality = "low"|"medium"|"high";
export type MangaReadHozPageSize = number;
export type MangaListTypes = MangaTypes | MangaGenres;
export type Language = string;

export interface HrefString {
    content: string;
    href: string;
}
export interface SearchMangaChapterVolume {
    no: number;
    language: Language;
    href: string;
}
export interface SearchManga {
    title: string;
    genres: HrefString[];
    available_languages: Language[];
    artwork_url: string;
    href: string;
    chapters: SearchMangaChapterVolume[];
    volumes: SearchMangaChapterVolume[];
}
export interface MangaList {
    title: string;
    mangas: SearchManga[];
}
export interface ChapterItem {
    no: number;
    id: string;
    title: string;
    href: string;
}
export interface ChapterImageItem {
    artwork_url: string;
}
export type ReadingBy = "chap"|"vol";
export interface AjaxResult {
    html: string;
    status: boolean;
};