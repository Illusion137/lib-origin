export interface OptionalSearchParams {
    artist_name?: string;
    album_name?: string;
}
export type SearchParams = OptionalSearchParams & ({q: string} | {track_name: string})

export interface GetParams {
    track_name: string;
    artist_name: string;
    album_name: string;
    duration: number;
}

export interface SearchResult {
    id: number;
    name: string;
    trackName: string;
    artistName: string;
    albumName: string;
    duration: number;
    instrumental: boolean;
    plainLyrics: string;
    syncedLyrics?: string;
}

export interface RequestChallengeResult {
    prefix: string;
    target: string;
}