interface SpotifyAPIBase<OpName extends string, Var extends Record<string, any>> {
    operation_name: OpName;
    var: Var;
}
export type SpotifyGetPlaylist = SpotifyAPIBase<"fetchPlaylist", {uri: string, offset?: number, limit?: number}>;
export type SpotifyGetAlbum = SpotifyAPIBase<"getAlbum", {uri: string, locale?: string, offset?: number, limit?: number}>;
export type SpotifyGetCollection = SpotifyAPIBase<"fetchLibraryTracks", {offset?: number, limit?: number}>;
export type SpotifyProfileAccountAttributes = SpotifyAPIBase<"profileAndAccountAttributes", {}>;
export type SpotifyArtistOverview = SpotifyAPIBase<"queryArtistOverview", {uri: string, locale?: string, includePrerelease?: boolean}>;
export type SpotifySearch = SpotifyAPIBase<"searchDesktop", {
    searchTerm: string;
    offset?: number;
    limit?: number;
    numberOfTopResults?: number;
    includeAudiobooks?: boolean;
    includeArtistHasConcertsField?: boolean;
    includePreReleases?: boolean;
    includeLocalConcertsField?: boolean;
}>;
export type SpotifySearchTracks = SpotifyAPIBase<"searchTracks", SpotifySearch['var']>;
export type SpotifySearchArtists = SpotifyAPIBase<"searchArtists", SpotifySearch['var']>;
export type SpotifySearchAlbums = SpotifyAPIBase<"searchAlbums", SpotifySearch['var']>;
export type SpotifySearchAudiobooks = SpotifyAPIBase<"searchAudiobooks", SpotifySearch['var']>;
export type SpotifySearchPlaylists = SpotifyAPIBase<"searchPlaylists", SpotifySearch['var']>;
export type SpotifyHome = SpotifyAPIBase<"home", {
    timeZone?: string;
    sp_t: string;
    country?: string;
    facet?: null;
    sectionItemsLimit?: number;
}>;
export type SpotifyAccountLibrary = SpotifyAPIBase<"libraryV3", {
    filters?: ("Playlists")[];
    order?: null;
    textFilter?: "";
    features?: ("LIKED_SONGS"|"YOUR_EPISODES")[];
    limit?: number;
    offset?: number;
    flatten?: boolean;
    expandedFolders?: [];
    folderUri?: null;
    includeFoldersWhenFlattening?: boolean;
    withCuration?: boolean;
}>;
export type SpotifyTracksInLibrary = SpotifyAPIBase<"areEntitiesInLibrary", {uris: string[]}>;
export type SpotifyAddTracksToLibrary = SpotifyAPIBase<"addToLibrary", {uris: string[]}>;
export type SpotifyAddToPlaylist = SpotifyAPIBase<"addToPlaylist", {
    uris: string[];
    playlistUri: string;
    newPosition?: {
        moveType: "BOTTOM_OF_PLAYLIST";
        fromUid: string|null;
    };
}>;

export type SpotifyRemoveFromLibrary = SpotifyAPIBase<"removeFromLibrary", {uris: string[]}>;
export type SpotifyRemoveFromPlaylist = SpotifyAPIBase<"removeFromPlaylist", {
    playlistUri: string;
    uids: string[];
}>;

export type SpotifyQuery = SpotifyAPIBase<"searchSuggestions", {
    query: string;
    limit?: number;
    numberOfTopResults?: number;
    offset?: number;
    includeAuthors?: boolean;
    includeEpisodeContentRatingsV2?: boolean;
}>;

export type SpotifyAPI = SpotifyGetPlaylist 
    | SpotifyGetAlbum 
    | SpotifyGetCollection 
    | SpotifyProfileAccountAttributes
    | SpotifyArtistOverview
    | SpotifySearch
    | SpotifySearchTracks
    | SpotifySearchArtists
    | SpotifySearchAlbums
    | SpotifySearchAudiobooks
    | SpotifySearchPlaylists
    | SpotifyHome
    | SpotifyAccountLibrary
    | SpotifyTracksInLibrary
    | SpotifyAddTracksToLibrary
    | SpotifyAddToPlaylist
    | SpotifyRemoveFromLibrary
    | SpotifyRemoveFromPlaylist
    | SpotifyQuery;
export type SpotifyAPIOperationNames = SpotifyAPI['operation_name'];
export interface SPVar<T extends SpotifyAPI> {var:  T['var']};

export type SpotifyRequiresCredentials = "requires_credentials"|"no_credentials";