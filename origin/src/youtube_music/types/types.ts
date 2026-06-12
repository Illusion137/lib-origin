export interface InitialData {
	contents: any
	trackingParams: string
	responseContext: object
}
export type YouTubeMusicAlbumType = "Single"|"Album"|"EP"|"Song";
export type YouTubeMusicBadges = Partial<['MUSIC_EXPLICIT_BADGE']>;
export interface YouTubeMusicThumbnail {
	url: string;
	width: number;
	height: number;
}
export interface YouTubeMusicNammedBrowseID {
	name: string;
	browse_id: string;
}
export interface YouTubeMusicAlbum {
	thumbnails: YouTubeMusicThumbnail[];
	title: string;
	artists: YouTubeMusicNammedBrowseID[];
	browse_id: string;
	badges: YouTubeMusicBadges;
	album_type: YouTubeMusicAlbumType;
}
export interface YouTubeMusicTrack {
	thumbnails: YouTubeMusicThumbnail[];
	title: string;
	artists: YouTubeMusicNammedBrowseID[];
	video_id: string;
	badges: YouTubeMusicBadges;
	track_type: YouTubeMusicAlbumType;
	album?: YouTubeMusicNammedBrowseID;
	plays?: number;
}
export interface WatchNextQueueTrack {
	title: string;
	artists: YouTubeMusicNammedBrowseID[];
	album?: YouTubeMusicNammedBrowseID;
	thumbnails: YouTubeMusicThumbnail[];
	duration: string;
	video_id: string;
	playlist_set_video_id: string;
	selected: boolean;
}
export interface WatchNextResult {
	queue: WatchNextQueueTrack[];
	lyrics_browse_id?: string;
	related_browse_id?: string;
}
export interface LyricsResult {
	lyrics: string;
	source?: string;
}