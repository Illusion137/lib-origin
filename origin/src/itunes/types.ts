export type ITunesExplicitness = "explicit" | "cleaned" | "notExplicit";
export type ITunesWrapperType = "track" | "collection" | "artist" | "audiobook";
export type ITunesKind =
    | "book" | "album" | "coached-audio" | "feature-movie" | "interactive-booklet"
    | "music-video" | "pdf" | "podcast" | "podcast-episode" | "software-package"
    | "song" | "tv-episode" | "artist" | "short-film";

export interface ITunesResponse<T> {
    resultCount: number;
    results: T[];
}

export interface ITunesResultBase {
    wrapperType: ITunesWrapperType;
    kind?: ITunesKind;
    artistId?: number;
    artistName?: string;
    artistViewUrl?: string;
    artworkUrl30?: string;
    artworkUrl60?: string;
    artworkUrl100?: string;
    artworkUrl600?: string;
    country?: string;
    currency?: string;
    primaryGenreName?: string;
    primaryGenreId?: number;
    genreIds?: string[];
    genres?: string[];
    releaseDate?: string;
}

export interface ITunesArtist extends ITunesResultBase {
    wrapperType: "artist";
    artistType?: string;
    artistLinkUrl?: string;
    amgArtistId?: number;
}

export interface ITunesCollection extends ITunesResultBase {
    wrapperType: "collection";
    collectionId?: number;
    collectionName?: string;
    collectionCensoredName?: string;
    collectionViewUrl?: string;
    collectionPrice?: number;
    collectionExplicitness?: ITunesExplicitness;
    trackCount?: number;
    copyright?: string;
    contentAdvisoryRating?: string;
}

export interface ITunesTrack extends ITunesResultBase {
    wrapperType: "track";
    collectionId?: number;
    collectionName?: string;
    collectionCensoredName?: string;
    collectionViewUrl?: string;
    trackId?: number;
    trackName?: string;
    trackCensoredName?: string;
    trackViewUrl?: string;
    previewUrl?: string;
    collectionPrice?: number;
    trackPrice?: number;
    trackExplicitness?: ITunesExplicitness;
    collectionExplicitness?: ITunesExplicitness;
    discCount?: number;
    discNumber?: number;
    trackCount?: number;
    trackNumber?: number;
    trackTimeMillis?: number;
    isStreamable?: boolean;
}

export interface ITunesMovie extends ITunesResultBase {
    wrapperType: "track";
    kind: "feature-movie" | "short-film";
    trackId?: number;
    trackName?: string;
    trackCensoredName?: string;
    trackViewUrl?: string;
    previewUrl?: string;
    trackPrice?: number;
    trackRentalPrice?: number;
    trackHdPrice?: number;
    trackHdRentalPrice?: number;
    collectionPrice?: number;
    collectionHdPrice?: number;
    trackTimeMillis?: number;
    contentAdvisoryRating?: string;
    longDescription?: string;
    hasITunesExtras?: boolean;
}

export interface ITunesPodcast extends ITunesResultBase {
    wrapperType: "track";
    kind: "podcast";
    collectionId?: number;
    collectionName?: string;
    collectionCensoredName?: string;
    collectionViewUrl?: string;
    feedUrl?: string;
    trackId?: number;
    trackName?: string;
    trackCensoredName?: string;
    trackViewUrl?: string;
    trackCount?: number;
    trackExplicitness?: ITunesExplicitness;
    collectionExplicitness?: ITunesExplicitness;
    contentAdvisoryRating?: string;
}

export interface ITunesAudiobook extends ITunesResultBase {
    wrapperType: "audiobook";
    collectionId?: number;
    collectionName?: string;
    collectionCensoredName?: string;
    collectionViewUrl?: string;
    collectionPrice?: number;
    collectionExplicitness?: ITunesExplicitness;
    description?: string;
    contentAdvisoryRating?: string;
}

export interface ITunesEbook extends ITunesResultBase {
    trackId?: number;
    trackName?: string;
    trackCensoredName?: string;
    trackViewUrl?: string;
    price?: number;
    formattedPrice?: string;
    description?: string;
    fileSizeBytes?: number;
    averageUserRating?: number;
    userRatingCount?: number;
}

export interface ITunesSoftware extends ITunesResultBase {
    trackId?: number;
    trackName?: string;
    trackCensoredName?: string;
    trackViewUrl?: string;
    bundleId?: string;
    version?: string;
    price?: number;
    formattedPrice?: string;
    description?: string;
    sellerName?: string;
    sellerUrl?: string;
    fileSizeBytes?: string;
    averageUserRating?: number;
    userRatingCount?: number;
    minimumOsVersion?: string;
    screenshotUrls?: string[];
    ipadScreenshotUrls?: string[];
    languageCodesISO2A?: string[];
    contentAdvisoryRating?: string;
}

export type ITunesResult =
    | ITunesArtist | ITunesCollection | ITunesTrack | ITunesMovie
    | ITunesPodcast | ITunesAudiobook | ITunesEbook | ITunesSoftware;

export interface ITunesEntityResultMap {
    movieArtist: ITunesArtist;
    movie: ITunesMovie;
    podcastAuthor: ITunesArtist;
    podcast: ITunesPodcast;
    musicArtist: ITunesArtist;
    musicTrack: ITunesTrack;
    album: ITunesCollection;
    musicVideo: ITunesTrack;
    mix: ITunesCollection;
    song: ITunesTrack;
    audiobookAuthor: ITunesArtist;
    audiobook: ITunesAudiobook;
    shortFilmArtist: ITunesArtist;
    shortFilm: ITunesMovie;
    tvEpisode: ITunesTrack;
    tvSeason: ITunesCollection;
    software: ITunesSoftware;
    iPadSoftware: ITunesSoftware;
    macSoftware: ITunesSoftware;
    ebook: ITunesEbook;
    allArtist: ITunesArtist;
    allTrack: ITunesTrack;
}
export type ITunesEntity = keyof ITunesEntityResultMap;

export interface ITunesMediaEntityMap {
    movie: "movieArtist" | "movie";
    podcast: "podcastAuthor" | "podcast";
    music: "musicArtist" | "musicTrack" | "album" | "musicVideo" | "mix" | "song";
    musicVideo: "musicArtist" | "musicVideo";
    audiobook: "audiobookAuthor" | "audiobook";
    shortFilm: "shortFilmArtist" | "shortFilm";
    tvShow: "tvEpisode" | "tvSeason";
    software: "software" | "iPadSoftware" | "macSoftware";
    ebook: "ebook";
    all: "movie" | "album" | "allArtist" | "podcast" | "musicVideo" | "mix" | "audiobook" | "tvSeason" | "allTrack";
}
export type ITunesMedia = keyof ITunesMediaEntityMap;

export interface ITunesMediaDefaultResultMap {
    movie: ITunesMovie;
    podcast: ITunesPodcast;
    music: ITunesTrack;
    musicVideo: ITunesTrack;
    audiobook: ITunesAudiobook;
    shortFilm: ITunesMovie;
    tvShow: ITunesTrack;
    software: ITunesSoftware;
    ebook: ITunesEbook;
    all: ITunesResult;
}

export type ITunesResultOf<M extends ITunesMedia, E> =
    [E] extends [never]
        ? ITunesMediaDefaultResultMap[M]
        : (E extends ITunesEntity ? ITunesEntityResultMap[E] : ITunesResult);

export type ITunesLookupResult<E> =
    [E] extends [never]
        ? ITunesResult
        : (E extends ITunesEntity ? ITunesEntityResultMap[E] : ITunesResult);

export interface ITunesSearchOpts<M extends ITunesMedia, E extends ITunesMediaEntityMap[M]> {
    term: string;
    country?: string;
    media?: M;
    entity?: E;
    attribute?: string;
    limit?: number;
    lang?: "en_us" | "ja_jp";
    version?: 1 | 2;
    explicit?: "Yes" | "No";
}

export interface ITunesLookupOpts<E extends ITunesEntity> {
    id?: number | string | (number | string)[];
    amgArtistId?: number | string | (number | string)[];
    amgAlbumId?: number | string | (number | string)[];
    amgVideoId?: number | string | (number | string)[];
    upc?: number | string;
    isbn?: number | string;
    bundleId?: string;
    entity?: E;
    limit?: number;
    sort?: "recent";
    country?: string;
}
