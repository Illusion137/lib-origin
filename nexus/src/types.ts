import type { ExplicitMode } from "../../Illusive/src/types";

export interface Track {
    uuid: string;
    title: string;
    alt_title: string;
    artist_uuids: string[];
    duration: number;
    prods: string;
    genre: string;
    tags: string[];
    explicit: ExplicitMode;
    unreleased: boolean;
    music_video: boolean;
    album_uuid: string;
};