export type Source = "YouTube" | "GoMovies" | "!Anime";
export type Uri = `${Source}:${string}`;

export interface Thumbnail {
    url: string;
    height: number;
    width: number;
}
export interface CompactVideoContent {
    uri: Uri;
    title: string;
    creator: string;
    thumbnails: Thumbnail[];
    duration?: number;
    quality?: string;
};
export interface VideoContent {

};

export class SosuService {

};