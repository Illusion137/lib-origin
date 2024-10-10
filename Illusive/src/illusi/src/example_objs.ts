import { Playlist, PlaylistsTracks, Track } from "../../types";

export namespace ExampleObj {
    export const track_example0: Track =
    {
        "uid": "",
        "title": "",
        "artists": [],
        "duration": 0,
        "prods": [],
        "genre": "",
        "tags": [],
        "explicit": "NONE",
        "unreleased": false,
        "album": {"name": "", "uri": null},
        "plays": 0,
        "imported_id": "",
        "illusi_id": "",
        "youtube_id": "",
        "youtubemusic_id": "",
        "soundcloud_id": 0,
        "soundcloud_permalink": "",
        "spotify_id": "",
        "amazonmusic_id": "",
        "applemusic_id": "",
        "artwork_url": "",
        "thumbnail_uri": "",
        "media_uri": "",
        "lyrics_uri": "",
        "meta": <never>{},
        "playback": undefined,
        "downloading_data": undefined,
    }

    export const playlist_example0: Playlist = 
    {
        "uuid": "",
        "title": "",
        "description": "",
        "pinned": false,
        "thumbnail_uri": "",
        "public": false,
        "public_uuid": "",
        "sort": "NEWEST",
        "inherited_playlists": [],
        "linked_playlists": [],
        "visual_data": <never>undefined,
        "date": new Date(),
    }
    export const playlists_tracks_example0: PlaylistsTracks = {
        "uuid": "",
        "track_uid": ""
    }
}