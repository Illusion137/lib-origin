import type { TtmlLyrics } from '@common/utils/ttml_util';

export interface GoLyricsOpts {
	api_key?: string;
}

export interface GoLyricsParams {
	song: string;
	artist: string;
	album: string;
	duration: number;
}

export interface GoLyricsError {
	error: string;
	message?: string;
}

export interface GoLyricsResponse {
	ttml: string;
}

export interface GoLyricsResult {
	ttml: string;
	lyrics: TtmlLyrics;
}
