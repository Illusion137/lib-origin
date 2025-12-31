import type { CompactPlaylist, ISOString, Playlist, PlaylistsTracks, SQLArtist, Track } from "@illusive/types";

export namespace ExampleObj {
    export const track_example0: Track = {
        id: 0,
        uid: "",
        title: "",
        alt_title: "",
        artists: [],
        duration: 0,
        prods: "",
        genre: "",
        tags: [],
        explicit: "NONE",
        unreleased: false,
        album: {name: "", uri: null},
        plays: 0,
        imported_id: "",
        illusi_id: "",
        youtube_id: "",
        youtubemusic_id: "",
        soundcloud_id: 0,
        soundcloud_permalink: "",
        spotify_id: "",
        amazonmusic_id: "",
        applemusic_id: "",
        bandlab_id: "",
        artwork_url: "",
        thumbnail_uri: "",
        media_uri: "",
        lyrics_uri: "",
        meta: {} as never,
        playback: undefined as never,
        downloading_data: undefined as never,
    } satisfies Required<Track>;

    export const playlist_example0: Playlist = {
        uuid: "",
        title: "",
        description: "",
        pinned: false,
        archived: false,
        thumbnail_uri: "",
        sort: "NEWEST",
        public: false,
        public_uuid: "",
        inherited_playlists: [],
        inherited_searchs: [],
        linked_playlists: [],
        visual_data: undefined as never,
        date: "",
    } satisfies Required<Playlist>;
    export const playlists_tracks_example0: PlaylistsTracks = {
        uuid: "",
        track_uid: ""
    } satisfies Required<PlaylistsTracks>;
    export const new_releases_example0: CompactPlaylist = {
        title: {name: "", uri: null},
        artist: [],
        artwork_url: "",
        artwork_thumbnails: [],
        explicit: "NONE",
        album_type: "ALBUM",
        type: "ALBUM",
        date: "" as ISOString,
        song_track: {} as never
    } satisfies Required<CompactPlaylist>;
    export const seen_new_releases_example0: CompactPlaylist & {Timestamp: string} = {
        title: {name: "", uri: null},
        artist: [],
        artwork_url: "",
        artwork_thumbnails: [],
        explicit: "NONE",
        album_type: "ALBUM",
        type: "ALBUM",
        date: "" as ISOString,
        Timestamp: "",
        song_track: {} as never
    } satisfies Required<CompactPlaylist & {Timestamp: string}>;
    export const artist_example0: SQLArtist = {
        name: "",
        uri: "",
        artwork_url: ""
    } satisfies Required<SQLArtist>;
}