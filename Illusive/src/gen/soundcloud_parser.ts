import { Track, User, Playlist } from "../../../origin/src/soundcloud/types/Search";
import { generate_new_uid, make_topic, remove_prod } from "../../../origin/src/utils/util";
import { create_uri } from "../illusive_utilts";

export function soundcloud_parse_track(track: Track){
    return {
        "uid": generate_new_uid(track.title),
        "title": remove_prod(track.title),
        "artists": [{"name": make_topic(track.user.username), "uri": create_uri("soundcloud", track.user.permalink)}],
        "plays": track.playback_count,
        "duration": Math.floor(track.duration / 1000),
        "soundcloud_id": track.id,
        "soundcloud_permalink": track.permalink_url,
        "artwork_url": track.artwork_url?.replace("t200x200.jpg", "t500x500.jpg")
    }
}
export function soundcloud_parse_user(user: User){
    return {
        "name": {"name": make_topic(user.username), "uri": create_uri("soundcloud", user.permalink_url)},
        "profile_artwork_url": user.avatar_url,
        "is_official_artist_channel": true
    }
}
export function soundcloud_parse_playlist(playlist: Playlist){
    return {
        "title": {"name": playlist.title, "uri": create_uri("soundcloud", playlist.permalink_url)},
        "artist": Array.isArray(playlist.user) ? playlist.user.map(user => { 
            return {
                "name": make_topic(user.username),
                "uri": create_uri("soundcloud", String(user.id))
            } 
        }) : [{"name": make_topic(playlist.user.username), "uri": create_uri("soundcloud", playlist.user.permalink)}],
        "year": new Date(playlist.created_at).getFullYear(),
        "artwork_url": playlist.artwork_url
    }
}