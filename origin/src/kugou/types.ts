export interface KuGouSong {
	hash: string;
	songname: string;
	/** Several singers are joined with `、`. */
	singername: string;
	album_name: string;
	/** Seconds. */
	duration: number;
	album_audio_id?: number;
}

export interface KuGouSongSearchResponse {
	status: number;
	errcode?: number;
	data?: { info?: KuGouSong[] };
}

export interface KuGouLyricsCandidate {
	id: string;
	accesskey: string;
	song: string;
	singer: string;
	/** Milliseconds. */
	duration: number;
	/** 1 = synced. */
	krctype: number;
	score: number;
	product_from?: string;
}

export interface KuGouLyricsSearchResponse {
	status: number;
	errmsg?: string;
	candidates?: KuGouLyricsCandidate[];
}

export interface KuGouDownloadResponse {
	status: number;
	info?: string;
	fmt?: string;
	/** 0 = encrypted KRC, 1 = LRC, 2 = base64 plain text. */
	contenttype?: number;
	content?: string;
}

export interface KuGouLyrics {
	/** `KRC`: the decrypted word-synced text (`[start,duration]<offset,duration,0>word…`); `LRC`; `PLAIN`. */
	format: 'KRC' | 'LRC' | 'PLAIN';
	text: string;
}

export interface KuGouLyricsSearchParams {
	/** `<artist> - <title>` works best. */
	keyword: string;
	duration_ms?: number;
	/** A song hash from `search_songs`; KuGou returns no candidates without one. */
	hash?: string;
}
