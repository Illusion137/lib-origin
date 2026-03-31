/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
type SpotifyUri = `spotify:${"artist" | "album" | "track" | "playlist" | "search" | "user"}:${string}`;

type ContentRatingLabel = "EXPLICIT" | "CLEAN";
type PlayabilityReason = "PLAYABLE" | string;
type TrackMediaType = "AUDIO" | "VIDEO";
type AlbumType = "SINGLE" | "ALBUM" | "COMPILATION";
type PlaylistFormat = "" | string;

interface RGBA {
    alpha: number;
    red: number;
    green: number;
    blue: number;
}

interface ColorContrastSet {
    backgroundBase: RGBA;
    backgroundTintedBase: RGBA;
    textBase: RGBA;
    textBrightAccent: RGBA;
    textSubdued: RGBA;
}

interface ExtractedColorSet {
    encoreBaseSetTextColor: RGBA;
    highContrast: ColorContrastSet;
    higherContrast: ColorContrastSet;
    minContrast: ColorContrastSet;
}

interface ColorDark {
    hex: string;
    isFallback: boolean;
}

interface ImageSource {
    height: number;
    width: number;
    url: string;
}

interface ImageSourceWithMax {
    maxHeight: number;
    maxWidth: number;
    url: string;
}

interface CoverArt {
    extractedColors: {
        colorDark: ColorDark;
    };
    sources: ImageSource[];
}

interface SquareCoverImage {
    __typename: "VisualIdentityImage";
    extractedColorSet: ExtractedColorSet;
}

interface VisualIdentityWithSquare {
    squareCoverImage: SquareCoverImage;
}

interface SixteenByNineImageData {
    __typename: "ImageV2";
    sources: ImageSourceWithMax[];
}

interface SixteenByNineCoverImage {
    image: {
        data: SixteenByNineImageData;
    };
}

interface ArtistProfile {
    name: string;
}

interface ArtistStub {
    profile: ArtistProfile;
    uri: SpotifyUri;
}

interface ArtistVisuals {
    avatarImage: {
        extractedColors: { colorDark: ColorDark };
        sources: ImageSource[];
    };
}

export interface SpotifyArtist {
    __typename: "Artist";
    profile: ArtistProfile;
    uri: SpotifyUri;
    visualIdentity: VisualIdentityWithSquare;
    visuals: ArtistVisuals;
}

// ---- Album ----

interface AlbumStub {
    coverArt: CoverArt;
    id: string;
    name: string;
    uri: SpotifyUri;
    visualIdentity: VisualIdentityWithSquare;
}

interface Album {
    __typename: "Album";
    artists: { items: ArtistStub[] };
    coverArt: CoverArt;
    date: { year: number };
    name: string;
    playability: Playability;
    type: AlbumType;
    uri: SpotifyUri;
    visualIdentity: VisualIdentityWithSquare;
}

interface Playability {
    playable: boolean;
    reason: PlayabilityReason;
}

interface Associations {
    audioAssociations: { totalCount: number };
    videoAssociations: { totalCount: number };
}

interface Track {
    __typename: "Track";
    albumOfTrack: AlbumStub;
    artists: { items: ArtistStub[] };
    associationsV3: Associations;
    contentRating: { label: ContentRatingLabel };
    duration: { totalMilliseconds: number };
    id: string;
    trackMediaType: TrackMediaType;
    name: string;
    playability: Playability;
    uri: SpotifyUri;
    visualIdentity: {
        sixteenByNineCoverImage: SixteenByNineCoverImage | null;
    };
}

interface PlaylistOwner {
    __typename: "User";
    avatar: { sources: ImageSource[] } | null;
    name: string;
    uri: SpotifyUri;
    username: string;
}

interface PlaylistImage {
    extractedColors: { colorDark: ColorDark };
    sources: ImageSource[];
}

interface Playlist {
    __typename: "Playlist";
    attributes: unknown[];
    description: string;
    format: PlaylistFormat;
    images: { items: PlaylistImage[] };
    name: string;
    ownerV2: {
        __typename: "UserResponseWrapper";
        data: PlaylistOwner;
    };
    uri: SpotifyUri;
    visualIdentity: VisualIdentityWithSquare;
}

interface SearchAutoCompleteEntity {
    text: string;
    uri: SpotifyUri;
}

interface TopResultHitAutoComplete {
    __typename: "TopResultHit";
    item: {
        __typename: "SearchAutoCompleteEntity";
        data: SearchAutoCompleteEntity;
    };
}

interface TopResultHitTrack {
    __typename: "TopResultHit";
    item: {
        __typename: "TrackResponseWrapper";
        data: Track;
    };
}

interface TopResultHitArtist {
    __typename: "TopResultHit";
    item: {
        __typename: "ArtistResponseWrapper";
        data: SpotifyArtist;
    };
}

interface TopResultHitAlbum {
    __typename: "TopResultHit";
    item: {
        __typename: "AlbumResponseWrapper";
        data: Album;
    };
}

interface TopResultHitPlaylist {
    __typename: "TopResultHit";
    item: {
        __typename: "PlaylistResponseWrapper";
        data: Playlist;
    };
}

type TopResultHit =
    | TopResultHitAutoComplete
    | TopResultHitTrack
    | TopResultHitArtist
    | TopResultHitAlbum
    | TopResultHitPlaylist;

interface SearchV2Result {
    __typename: "SearchResultV2";
    query: string;
    topResultsV2: {
        itemsV2: TopResultHit[];
    };
}

export interface Query {
    data: {
        searchV2: SearchV2Result;
    };
    extensions: {
        requestIds: Record<string, { "search-api": string; }>;
    };
}