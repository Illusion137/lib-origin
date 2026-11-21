import type { TtmlLyrics, TtmlTimingType } from '@common/utils/ttml_util';

export type BiniTimingType = TtmlTimingType;

export interface BiniSearchParams {
	track?: string;
	artist?: string;
	album?: string;
	duration?: number;
	isrc?: string;
}

export interface BiniSearchHit {
	id: string;
	isrc: string;
	track_name: string;
	artist_name: string;
	album_name: string;
	duration: number;
	lyricsUrl: string;
	timing_type: BiniTimingType;
}

export interface BiniSearchResponse {
	results: BiniSearchHit[];
	source: string;
	total: number;
}

export interface BiniLyricsResult {
	hit: BiniSearchHit;
	ttml: string;
	lyrics: TtmlLyrics;
}
