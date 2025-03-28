import { try_json_parse, is_empty } from '../../../../../origin/src/utils/util';
import { Prefs } from "../../../prefs";
import { CompactPlaylist, IllusiveThumbnail, NamedUUID, SQLCompactPlaylist, SQLTimestampedCompactPlaylist, TimestampedCompactPlaylist, Track } from "../../../types";
import { ExampleObj } from "../example_objs";
import { db_exec_async, db_get_all_async, db_run_async, sql_delete_from, sql_insert_values, sql_select } from "./sql_utils";

export function compact_playlist_to_sqllite_insertion(compact_playlist: CompactPlaylist){
    return [
        JSON.stringify(compact_playlist.title),
        JSON.stringify(compact_playlist.artist),
        compact_playlist.artwork_url ?? "",
        compact_playlist.artwork_thumbnails ? JSON.stringify(compact_playlist.artwork_thumbnails) : "[]",
        compact_playlist.explicit ?? "NONE",
        compact_playlist.album_type ?? "SINGLE",
        compact_playlist.type ?? "ALBUM",
        compact_playlist.date ?? new Date(0).toISOString(),
        compact_playlist.song_track ? JSON.stringify(compact_playlist.song_track) : null
    ];
}

export function sql_compact_playlist_to_compact_playlist(playlist: SQLCompactPlaylist): CompactPlaylist{
    const title = try_json_parse<NamedUUID>(playlist.title);
    const artist = try_json_parse<NamedUUID[]>(playlist.artist);
    const artwork_thumbnails = is_empty(playlist.artwork_thumbnails) ? undefined : try_json_parse<IllusiveThumbnail[]>(playlist.artwork_thumbnails!);
    const song_track = is_empty(playlist.song_track) ? undefined : try_json_parse<Track>(playlist.song_track!);
    return {
        ...playlist,
        title: "error" in title ? {name: "UNKNOWN", uri: null} : title,
        artist: "error" in artist ? [] : artist,
        artwork_thumbnails: artwork_thumbnails === undefined || "error" in artwork_thumbnails ? undefined : artwork_thumbnails,
        song_track: song_track === undefined || song_track === null || "error" in song_track ? undefined : song_track
    }
}

export async function get_all_new_releases(){
    return (await db_get_all_async<SQLCompactPlaylist>(sql_select<SQLCompactPlaylist>("new_releases", "*"))).map(sql_compact_playlist_to_compact_playlist);
}
export async function get_all_seen_new_releases(){
    return (await db_get_all_async<SQLTimestampedCompactPlaylist>(sql_select<SQLTimestampedCompactPlaylist>("seen_new_releases", "*"))).map(sql_compact_playlist_to_compact_playlist) as TimestampedCompactPlaylist[];
}

export async function get_not_seen_new_releases(expiration_ms: number): Promise<CompactPlaylist[]>{
    const seen_new_releases = await get_all_seen_new_releases();
    const seen_map = new Map<string, Date>(seen_new_releases.map(seen => ([seen.title.uri ?? "UNKNOWN", new Date(seen.Timestamp)]) ) );
    const all = await get_all_new_releases();

    return all.filter(album => {
        if(!seen_map.has(album.title.uri ?? "")) return true;
        return seen_map.get(album.title.uri ?? "")!.getTime() + expiration_ms > new Date().getTime();
    });
}

export async function delete_all_from_new_releases(){
    await db_exec_async(sql_delete_from("new_releases"));
}
export async function insert_all_into_new_releases(new_releases: CompactPlaylist[]){
    // await delete_all_from_new_releases();
    for(const new_release of new_releases){
        await db_run_async(sql_insert_values("new_releases", ExampleObj.new_releases_example0), compact_playlist_to_sqllite_insertion(new_release));
        await db_run_async(sql_insert_values("seen_new_releases", ExampleObj.new_releases_example0), compact_playlist_to_sqllite_insertion(new_release));
    }
}

export async function refresh_new_releases(new_releases: CompactPlaylist[]){
    await Promise.all([
        insert_all_into_new_releases(new_releases),
        Prefs.save_pref('new_releases_last_refreshed', new Date())
    ]);
}