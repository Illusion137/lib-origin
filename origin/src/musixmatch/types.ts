export interface MusixmatchOpts {
	usertoken?: string;
	app_id?: string;
}

export interface MusixmatchHeader {
	status_code: number;
	execute_time?: number;
	hint?: string;
	confidence?: number;
}

export interface MusixmatchEnvelope<T> {
	message: {
		header: MusixmatchHeader;
		body: T | [] | '';
	};
}

export interface MusixmatchTokenBody {
	user_token: string;
}

export interface MusixmatchTrack {
	track_id: number;
	commontrack_id: number;
	track_name: string;
	artist_name: string;
	album_name: string;
	track_length: number;
	instrumental: 0 | 1;
	explicit: 0 | 1;
	has_lyrics: 0 | 1;
	has_subtitles: 0 | 1;
	has_richsync: 0 | 1;
	track_rating: number;
	track_spotify_id?: string;
	track_isrc?: string;
}

export interface MusixmatchTrackSearchBody {
	track_list: { track: MusixmatchTrack }[];
}

export interface MusixmatchTrackBody {
	track: MusixmatchTrack;
}

export interface MusixmatchLyrics {
	lyrics_id: number;
	instrumental: 0 | 1;
	lyrics_body: string;
	lyrics_language: string;
	lyrics_copyright: string;
}

export interface MusixmatchLyricsBody {
	lyrics: MusixmatchLyrics;
}

export interface MusixmatchSubtitle {
	subtitle_id: number;
	subtitle_body: string;
	subtitle_length: number;
	subtitle_language: string;
}

export interface MusixmatchSubtitleBody {
	subtitle: MusixmatchSubtitle;
}

export interface MusixmatchRichsync {
	richsync_id: number;
	richsync_body: string;
	richsync_length: number;
	richsync_language: string;
}

export interface MusixmatchRichsyncBody {
	richsync: MusixmatchRichsync;
}

export interface MusixmatchRichsyncWord {
	c: string;
	o: number;
}

export interface MusixmatchRichsyncLine {
	ts: number;
	te: number;
	x: string;
	l: MusixmatchRichsyncWord[];
}

export interface MusixmatchTrackParams {
	q_track: string;
	q_artist: string;
	q_album?: string;
	q_duration?: number;
}

export interface MusixmatchMacroCall<T> {
	message: {
		header: MusixmatchHeader;
		body: T | [] | '';
	};
}

export interface MusixmatchMacroBody {
	macro_calls: {
		'matcher.track.get'?: MusixmatchMacroCall<MusixmatchTrackBody>;
		'track.lyrics.get'?: MusixmatchMacroCall<MusixmatchLyricsBody>;
		'track.subtitles.get'?: MusixmatchMacroCall<{ subtitle_list: MusixmatchSubtitleBody[] }>;
		'track.richsync.get'?: MusixmatchMacroCall<MusixmatchRichsyncBody>;
	};
}

export interface MusixmatchFoundLyrics {
	track: MusixmatchTrack;
	plain?: string;
	synced?: string;
	richsync?: MusixmatchRichsyncLine[];
}
