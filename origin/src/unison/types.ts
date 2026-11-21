/** `v` alone is fastest; without it Unison tries `isrc`, then `song` + `artist` (with `duration` in seconds, ±2 s). */
export interface UnisonLookupParams {
	v?: string;
	isrc?: string;
	song?: string;
	artist?: string;
	album?: string;
	duration?: number;
}

export interface UnisonSubmitter {
	keyId: string;
	displayName?: string;
	avatarUrl?: string;
}

/** Unison's terms require crediting the lyrics (linked to the song page) and the submitter. */
export interface UnisonLyrics {
	id: number;
	videoId: string;
	song: string;
	artist: string;
	album?: string;
	isrc?: string;
	lyrics: string;
	format: 'ttml' | 'lrc' | 'plain';
	syncType: 'richsync' | 'linesync' | 'plain';
	confidence?: 'low' | 'medium' | 'high';
	submitter?: UnisonSubmitter;
	editors?: UnisonSubmitter[];
}

export interface UnisonEnvelope<T> {
	success: boolean;
	data?: T;
	error?: string;
	code?: string;
}
