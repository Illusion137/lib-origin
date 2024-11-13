export async function mark_track_downloaded(uid: string, media_uri: string) {
    await db.execAsync(`${sql_update_table("tracks")} ${sql_set<Track>(["media_uri", media_uri])} ${sql_where<Track>(["uid", uid])}`);
    await fetch_track_data();
}
export async function mark_track_undownloaded(uid: string) {
    await db.execAsync(`${sql_update_table("tracks")} ${sql_set<Track>(["media_uri", ""])} ${sql_where<Track>(["uid", uid])}`);
    await fetch_track_data();
    await clean_directories();
}
export async function track_exists(track: Track){
    await fetch_track_data();
    for(const t of GLOBALS.global_var.sql_tracks){
        if(!is_empty(t.illusi_id) && !is_empty(track.illusi_id) && t.illusi_id === track.illusi_id) return true;
        if(!is_empty(t.youtube_id) && !is_empty(track.youtube_id) && t.youtube_id === track.youtube_id) return true;
        if(!is_empty(t.youtubemusic_id) && !is_empty(track.youtubemusic_id) && t.youtubemusic_id === track.youtubemusic_id) return true;
        if(!is_empty(t.spotify_id) && !is_empty(track.spotify_id) && t.spotify_id === track.spotify_id) return true;
        if(!is_empty(t.amazonmusic_id) && !is_empty(track.amazonmusic_id) && t.amazonmusic_id === track.amazonmusic_id) return true;
        if(!is_empty(t.applemusic_id) && !is_empty(track.applemusic_id) && t.applemusic_id === track.applemusic_id) return true;
        if(!is_empty(t.soundcloud_id) && !is_empty(track.soundcloud_id) && t.soundcloud_id === track.soundcloud_id) return true;
        if(!is_empty(t.imported_id) && !is_empty(track.imported_id) && t.imported_id === track.imported_id) return true;
    }
    return false;
}
export async function track_from_service_id(ftrack: Track){
    const potential_keys: (keyof Track)[] = ["youtube_id", "youtubemusic_id", "spotify_id", "amazonmusic_id", "applemusic_id", "soundcloud_id"];
    let track_id: string;
    let key: keyof Track;
    for(const k of potential_keys){
        if(!is_empty(ftrack[k])){
            track_id = ftrack[k] as string;
            key = k;
            break;
        }
    }
    if(is_empty(key!) || is_empty(track_id!)) return null;
    const track = await db.getAllAsync(`${sql_select<Track>("tracks", "*")} ${sql_where<Track>([key!, track_id!])}`);
    if(track.length === 0) return null;
    return sql_track_to_track(<SQLTrack>track[0]);
}
export async function track_from_uid(uid: string){
    const track = await db.getAllAsync(`${sql_select<Track>("tracks", "*")} ${sql_where<Track>(["uid", uid])}`);
    return sql_track_to_track(<SQLTrack>track[0]);
}
export async function track_uid_exists(track: Track){
    const count_sql = await db.getAllAsync(`${sql_select<Track>("tracks", "uid")} ${sql_where<Track>(["uid", track.uid])}`);
    return count_sql.length !== 0;
}

function track_to_sqllite_insertion(track: Track): SQLTrackArray {
    const meta: TrackMetaData = {
        "added_date": <ISOString>new Date().toISOString(),
        "last_played_date": <ISOString>new Date().toISOString(),
        "plays": 0,
    };
    const to_array: SQLTrackArray = [        
        track.uid ?? "",
        track.title ?? "",
        JSON.stringify(track.artists ?? []),
        track.duration ?? 0,
        JSON.stringify(track.prods ?? []),
        track.genre ?? "",
        JSON.stringify(track.tags ?? []),
        track.explicit ?? "NONE",
        track.unreleased ?? false,
        JSON.stringify(track.album ?? {"name": "", "uri": ""}),
        track.plays ?? 0,
        track.imported_id ?? "",
        track.illusi_id ?? "",
        track.youtube_id ?? "",
        track.youtubemusic_id ?? "",
        track.soundcloud_id ?? 0,
        track.soundcloud_permalink ?? "",
        track.spotify_id ?? "",
        track.amazonmusic_id ?? "",
        track.applemusic_id ?? "",
        track.artwork_url ?? "",
        track.thumbnail_uri ?? "",
        track.media_uri ?? "",
        track.lyrics_uri ?? "",
        is_empty(track.meta) ? JSON.stringify(meta) : JSON.stringify(track.meta),
    ];
    return to_array;
}