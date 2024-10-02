import { Playlist, PlaylistsTracks, Track } from "../../types";

export namespace ExampleObj {
    export const track_example0: Track =
    {
        "uid": "",
        "title": "",
        "artists": [],
        "duration": 0,
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
        "meta": {} as any,
        "playback": undefined as any,
        "downloading_data": undefined as any,
    }
    export const playlist_example0: Playlist = 
    {
        "uuid": "",
        "title": "",
        "description": "",
        "inherited_playlists": [],
        "linked_playlists": [],
        "pinned": false,
        "public": false,
        "public_uuid": "",
        "sort": "NEWEST",
        "thumbnail_uri": "",
        "visual_data": {},
        "date": new Date(),
    }
    export const playlists_tracks_example0: PlaylistsTracks = {
        "uid": "",
        "track_uid": ""
    }
}