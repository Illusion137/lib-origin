export interface QQMusicSinger {
	name: string;
	mid: string;
}

export interface QQMusicSong {
	mid: string;
	id: number;
	title: string;
	singer: QQMusicSinger[];
	album: { name: string; mid: string };
	/** Seconds. */
	interval: number;
}

export interface QQMusicSearchBody {
	/** `is_filter: -11` with nothing listed: QQ Music is throttling this IP. */
	meta?: { is_filter?: number; estimate_sum?: number };
	body?: {
		item_song?: QQMusicSong[];
		song?: { list?: QQMusicSong[] };
	};
}

export interface QQMusicLyricBody {
	/** Hex-encoded encrypted QRC when `crypt: 1` (or plain LRC starting with `[`); empty when there are none. */
	lyric?: string;
	trans?: string;
	roma?: string;
}

export interface QQMusicLyrics {
	/** `QRC`: the decrypted `<QrcInfos>` XML with word timings; `LRC`: line-synced text. */
	format: 'QRC' | 'LRC';
	text: string;
}
