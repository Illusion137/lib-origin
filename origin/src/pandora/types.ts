export type PandoraType = "TR" | "AR" | "AL" | "PL" | "SF" | "PC" | "PE";

export interface PandoraArtwork {
	url: string;
	size: number;
	width: number;
	height: number;
}

export interface PandoraTrack {
	pandoraId: string;
	type: "TR";
	name: string;
	sortableName: string;
	duration: number;
	trackNumber: number;
	volumeNumber: number;
	icon: { artId: string, dominantColor: string, artUrl: string };
	hasRadio: boolean;
	isExplicit: boolean;
	artistId: string;
	artistName: string;
	albumId: string;
	albumName: string;
	albumReleaseDate: string;
}

export interface PandoraArtist {
	pandoraId: string;
	type: "AR";
	name: string;
	sortableName: string;
	icon: { artId: string, dominantColor: string, artUrl: string };
	trackCount: number;
	albumCount: number;
	hasRadio: boolean;
	webname: string;
	shortDescription: string;
}

export interface PandoraAlbum {
	pandoraId: string;
	type: "AL";
	name: string;
	sortableName: string;
	releaseDate: string;
	duration: number;
	trackCount: number;
	icon: { artId: string, dominantColor: string, artUrl: string };
	isExplicit: boolean;
	artistId: string;
	artistName: string;
	label: string;
}

export interface PandoraPlaylist {
	pandoraId: string;
	type: "PL";
	name: string;
	description: string;
	duration: number;
	trackCount: number;
	icon: { artId: string, dominantColor: string, artUrl: string };
	listenerCount: number;
	isPublic: boolean;
	linkedType: string;
	curatorId: string;
}

export interface PandoraStation {
	pandoraId: string;
	type: "SF";
	name: string;
	icon: { artId: string, dominantColor: string, artUrl: string };
	genre: string[];
	initialSeed: { seedId: string, seedType: number };
}

export type PandoraAnnotation = Record<string, PandoraTrack | PandoraArtist | PandoraAlbum | PandoraPlaylist | PandoraStation>;

export interface PandoraSearchResult {
	annotations: PandoraAnnotation;
	results: {
		tracks?: { pandoraIds: string[], nextPageToken?: string };
		artists?: { pandoraIds: string[], nextPageToken?: string };
		albums?: { pandoraIds: string[], nextPageToken?: string };
		playlists?: { pandoraIds: string[], nextPageToken?: string };
		stations?: { pandoraIds: string[], nextPageToken?: string };
	};
}

export interface PandoraPlaylistTracks {
	tracks: (PandoraTrack & { trackToken?: string })[];
	annotations: PandoraAnnotation;
	totalTracks?: number;
	nextPageToken?: string;
}
