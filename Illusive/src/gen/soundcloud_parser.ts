import { Track, User, Playlist } from "../../../origin/src/soundcloud/types/Search";
import { generate_new_uid, make_topic, remove_prod } from "../../../origin/src/utils/util";
import { create_uri } from "../illusive_utilts";
import { ISOString } from "../types";

function highest_artwork(artwork_url: string){
    return artwork_url?.replace("t200x200", "t500x500")?.replace("large", "t500x500");
}

export function soundcloud_parse_track(track: Track){
    return {
        "uid": generate_new_uid(track.title),
        "title": remove_prod(track.title),
        "artists": [{"name": make_topic(track.user.username), "uri": create_uri("soundcloud", track.user.permalink)}],
        "plays": track.playback_count,
        "duration": Math.floor(track.duration / 1000),
        "soundcloud_id": track.id,
        "soundcloud_permalink": track.permalink_url,
        "artwork_url": highest_artwork(track.artwork_url)
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
        "date": <ISOString>playlist.created_at,
        "artwork_url": highest_artwork(playlist.artwork_url)
    }
}