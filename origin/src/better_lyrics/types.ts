export interface GetParams {
	track_name: string;
	artist_name: string;
	album_name: string;
	duration: number;
	video_id: string;
	isrc?: string;
	token?: string;
}

export interface LyricPart {
	start_time_ms: number;
	words: string;
	duration_ms: number;
}

export interface Lyric {
	start_time_ms: number;
	words: string;
	duration_ms: number;
	parts?: LyricPart[];
}

export interface LrcLyrics {
	type: "lrc";
	lyrics: Lyric[];
}

export interface TtmlLyrics {
	type: "ttml";
	raw: string;
	score?: number;
}

export interface MetadataResult {
	song: string;
	artist: string;
	album: string;
	duration: number;
}

export interface StreamResult {
	metadata?: MetadataResult;
	musixmatch_richsync?: LrcLyrics;
	musixmatch_synced?: LrcLyrics;
	lrclib_synced?: LrcLyrics;
	lrclib_plain?: LrcLyrics;
	legato_synced?: LrcLyrics;
	portato_richsynced?: LrcLyrics;
	blyrics_richsynced?: TtmlLyrics;
	blyrics_synced?: TtmlLyrics;
	binimum_richsynced?: TtmlLyrics;
	binimum_synced?: TtmlLyrics;
}
