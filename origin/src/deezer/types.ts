export interface DeezerArtist {
	id: number;
	name: string;
	link: string;
	picture: string;
	picture_small: string;
	picture_medium: string;
	picture_big: string;
	picture_xl: string;
	nb_album: number;
	nb_fan: number;
	radio: boolean;
	tracklist: string;
}

export interface DeezerAlbum {
	id: number;
	title: string;
	upc: string;
	link: string;
	share: string;
	cover: string;
	cover_small: string;
	cover_medium: string;
	cover_big: string;
	cover_xl: string;
	md5_image: string;
	genre_id: number;
	genres?: { data: { id: number, name: string }[] };
	label: string;
	nb_tracks: number;
	duration: number;
	fans: number;
	release_date: string;
	record_type: string;
	available: boolean;
	tracklist: string;
	explicit_lyrics: boolean;
	explicit_content_lyrics: number;
	explicit_content_cover: number;
	contributors?: DeezerArtist[];
	artist: DeezerArtist;
	tracks?: DeezerList<DeezerTrack>;
}

export interface DeezerTrack {
	id: number;
	readable: boolean;
	title: string;
	title_short: string;
	title_version: string;
	isrc: string;
	link: string;
	share: string;
	duration: number;
	track_position: number;
	disk_number: number;
	rank: number;
	release_date: string;
	explicit_lyrics: boolean;
	explicit_content_lyrics: number;
	explicit_content_cover: number;
	preview: string;
	bpm: number;
	gain: number;
	available_countries: string[];
	alternative?: DeezerTrack;
	contributors: DeezerArtist[];
	md5_image: string;
	artist: DeezerArtist;
	album: Pick<DeezerAlbum, "id" | "title" | "link" | "cover" | "cover_small" | "cover_medium" | "cover_big" | "cover_xl" | "md5_image" | "release_date" | "tracklist">;
}

export interface DeezerPlaylist {
	id: number;
	title: string;
	description: string;
	duration: number;
	public: boolean;
	is_loved_track: boolean;
	collaborative: boolean;
	nb_tracks: number;
	unseen_track_count: number;
	fans: number;
	link: string;
	share: string;
	picture: string;
	picture_small: string;
	picture_medium: string;
	picture_big: string;
	picture_xl: string;
	checksum: string;
	tracklist: string;
	creation_date: string;
	md5_image: string;
	picture_type: string;
	creator: { id: number, name: string };
	tracks?: DeezerList<DeezerTrack>;
}

export interface DeezerList<T> {
	data: T[];
	total: number;
	next?: string;
}

export interface DeezerSearch<T> {
	data: T[];
	total: number;
	next?: string;
	prev?: string;
}
