export type SetState = (value: any) => unknown;
export type BottomAlertType = "GOOD"|"INFO"|"WARN";

export interface RankedManga {
    index: number;
    title: string;
    artwork_url: string;
    languages: string[];
    views: number;
    latest_chapter?: number;
    latest_volume?: number;
};
export interface RankedManga {
    index: number;
    title: string;
    artwork_url: string;
    languages: string[];
    views: number;
    latest_chapter?: number;
    latest_volume?: number;
};
export interface LatestItemProps {
    type: "Vol"|"Chap";
    no: number;
    language?: string;
};