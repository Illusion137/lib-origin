export interface LRCLibOpts {
	api_key?: string;
	app_id?: string;
	user_agent?: string;
}

export type LRCLibErrorName = 'ValidationError' | 'IncorrectPublishTokenError' | 'InvalidAppIdError' | 'MissingApiKeyError' | 'InvalidApiKeyError' | 'TrackNotFound' | 'RateLimitExceeded' | 'UnknownError' | 'ServerOverloaded';

export interface LRCLibApiError {
	message: string;
	name: LRCLibErrorName;
	statusCode: number;
	scope?: string;
}

export interface OptionalSearchParams {
	artist_name?: string;
	album_name?: string;
}
export type SearchParams = OptionalSearchParams & ({ q: string } | { track_name: string });

export interface GetParams {
	track_name: string;
	artist_name: string;
	album_name?: string;
	duration?: number;
}

export interface SearchResult {
	id: number;
	name: string;
	trackName: string;
	artistName: string;
	albumName: string;
	duration: number;
	instrumental: boolean;
	hasWordSync: boolean;
	plainLyrics: string | null;
	syncedLyrics: string | null;
	lyricsfile: string;
}

export interface PublishParams {
	trackName: string;
	artistName: string;
	albumName: string;
	duration: number;
	plainLyrics?: string;
	syncedLyrics?: string;
	lyricsfile?: string;
}

export interface FlagParams {
	trackId: number;
	content?: string;
}

export interface RequestChallengeResult {
	prefix: string;
	target: string;
}
