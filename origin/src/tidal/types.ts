export interface TidalArtist {
	id: number;
	name: string;
	url: string;
	picture: string | null;
	popularity: number;
}

export interface TidalAlbum {
	id: number;
	title: string;
	duration: number;
	streamReady: boolean;
	streamStartDate: string;
	allowStreaming: boolean;
	premiumStreamingOnly: boolean;
	numberOfTracks: number;
	numberOfVideos: number;
	numberOfVolumes: number;
	releaseDate: string;
	copyright: string;
	type: string;
	version: string | null;
	url: string;
	cover: string;
	videoCover: string | null;
	explicit: boolean;
	upc: string;
	popularity: number;
	audioQuality: string;
	audioModes: string[];
	artist: TidalArtist;
	artists: TidalArtist[];
}

export interface TidalTrack {
	id: number;
	title: string;
	duration: number;
	replayGain: number;
	peak: number;
	allowStreaming: boolean;
	streamReady: boolean;
	streamStartDate: string;
	premiumStreamingOnly: boolean;
	trackNumber: number;
	volumeNumber: number;
	version: string | null;
	popularity: number;
	copyright: string;
	url: string;
	isrc: string;
	editable: boolean;
	explicit: boolean;
	audioQuality: string;
	audioModes: string[];
	artist: TidalArtist;
	artists: TidalArtist[];
	album: Pick<TidalAlbum, "id" | "title" | "cover" | "videoCover">;
}

export interface TidalPlaylist {
	uuid: string;
	title: string;
	numberOfTracks: number;
	numberOfVideos: number;
	creator: { id: number, name?: string, url?: string, picture?: string };
	description: string;
	duration: number;
	lastUpdated: string;
	created: string;
	type: string;
	publicPlaylist: boolean;
	url: string;
	image: string;
	popularity: number;
	squareImage: string;
}

export interface TidalList<T> {
	limit: number;
	offset: number;
	totalNumberOfItems: number;
	items: T[];
}

export interface TidalSearchResult {
	artists: TidalList<TidalArtist>;
	albums: TidalList<TidalAlbum>;
	playlists: TidalList<TidalPlaylist>;
	tracks: TidalList<TidalTrack>;
	topHit: { value: TidalArtist | TidalAlbum | TidalTrack | TidalPlaylist, type: string } | null;
}
