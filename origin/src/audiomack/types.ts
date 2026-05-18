export interface Track {
	id: number;
	url_slug: string;
	title: string;
	artist: string;
	artist_slug: string;
	genre: string;
	image_small: string;
	image: string;
	image_large: string;
	duration: number;
	plays: number;
	favorites_count: number;
	reposts_count: number;
	comment_count: number;
	uploader_id: number;
	release_date: string;
	description: string;
	explicit: boolean;
	is_downloadable: boolean;
	is_hq: boolean;
	stream_url: string;
	download_url: string | null;
}

export interface Album {
	id: number;
	url_slug: string;
	title: string;
	artist: string;
	artist_slug: string;
	genre: string;
	image: string;
	image_large: string;
	release_date: string;
	description: string;
	explicit: boolean;
	track_count: number;
	plays: number;
	favorites_count: number;
	tracks?: Track[];
}

export interface Artist {
	id: number;
	url_slug: string;
	name: string;
	image: string;
	image_large: string;
	verified: boolean;
	followers: number;
	following: number;
	track_count: number;
	playlist_count: number;
	bio: string;
}

export interface Playlist {
	id: number;
	url_slug: string;
	title: string;
	artist: string;
	artist_slug: string;
	image: string;
	description: string;
	track_count: number;
	plays: number;
	tracks?: Track[];
}

export interface ApiList<T> {
	results: T[];
	next_page_url: string | null;
	page: number;
	total_count: number;
}
