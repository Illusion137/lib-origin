import * as uuid from "react-native-uuid";
import { all_promises, array_exclude, array_include, array_mask, track_query_filter } from "../../../illusive_utilts";
import { InheritedPlaylist, InheritedSearch, Playlist, PlaylistsTracks, Promises, SortType, SQLPlaylist, SQLPlaylistArray, SQLTrack, Track } from "../../../types";
import { ExampleObj } from "../example_objs";
import * as GLOBALS from "../globals";
import { sql_tracks_to_tracks } from "./sql_tracks";
import { db_exec_async, db_get_all_async, db_get_all_sync, db_run_async, obj_to_update_sql, sql_delete_from, sql_insert_values, sql_select, sql_set, sql_update_table, sql_where } from "./sql_utils";
import { sort_playlist_tracks } from "../playlist";

function playlist_to_sqllite_insertion(playlist: Playlist) {
    const to_array: SQLPlaylistArray = [
        playlist.uuid ?? "", 
        playlist.title ?? "", 
        playlist.description ?? "", 
        playlist.pinned ?? false, 
        playlist.thumbnail_uri ?? "", 
        playlist.sort ?? "OLDEST", 
        playlist.public ?? false, 
        playlist.public_uuid ?? uuid.default.v4(), 
        JSON.stringify(playlist.inherited_playlists ?? []), 
        JSON.stringify(playlist.inherited_searchs ?? []), 
        JSON.stringify(playlist.linked_playlists ?? []), 
        playlist.date ?? new Date().toISOString()
    ]
    return to_array;
}

export async function add_saved_data_to_write_playlist_tracks(playlist_uuid: string, tracks: Track[]): Promise<void> {
    const promises: Promises = [];
    for(let i = 0; i < tracks.length; i++) {
        promises.push(((async() => {
            tracks[i].downloading_data = {saved: true, progress: 0, playlist_saved: await track_exists_in_playlist(playlist_uuid, tracks[i].uid)};
        })()));
    }
    await Promise.all(promises);
}

export async function sql_playlist_to_playlist(sql_playlist: SQLPlaylist, ignore_tracks = false): Promise<Playlist> {
    const tracks = ignore_tracks ? [] : await playlist_tracks(sql_playlist.uuid, new Set<string>(), true);
    return Object.assign(sql_playlist, {
        inherited_playlists: JSON.parse(sql_playlist.inherited_playlists ?? "[]"),
        linked_playlists: JSON.parse(sql_playlist.linked_playlists ?? "[]"),
        inherited_searchs: JSON.parse(sql_playlist.inherited_searchs ?? "[]"),
        visual_data: ignore_tracks ? {four_track: [], track_count: 0} : {four_track: sort_playlist_tracks(sql_playlist.sort!, tracks).slice(0,4), track_count: tracks.length},
        date: new Date(sql_playlist.date!).toISOString()
    });
}
export async function raw_playlist_tracks(){
    return await db_get_all_async<PlaylistsTracks>(sql_select<PlaylistsTracks>("playlists_tracks", "*"));
}
export async function unique_playlist_uuids_from_playlist_tracks(){
    const unique_uuids = new Set((await raw_playlist_tracks()).map(p => p.uuid));
    return [...unique_uuids.values()];
}
export async function playlist_tracks(playlist_uuid: string, seen_playlist_uuids = new Set<string>(), skip_inheritance = false) {
    const playlist = await db_get_all_async<SQLTrack>(`${sql_select<Track>("tracks", "*")} AS t JOIN playlists_tracks AS p ON p.track_uid = t.uid AND p.uuid = '${playlist_uuid}' ORDER BY p.id`);
    let tracks: Track[] = sql_tracks_to_tracks(playlist); 
    if(skip_inheritance) return tracks;
    seen_playlist_uuids.add(playlist_uuid);
    const cplaylist_data = await playlist_data(playlist_uuid, true);
    tracks = sort_playlist_tracks(cplaylist_data.sort!, tracks);
    for(const inherited_playlist of cplaylist_data.inherited_playlists!) {
        if(!seen_playlist_uuids.has(inherited_playlist.uuid)) {
            const inherited_tracks = await playlist_tracks(inherited_playlist.uuid, seen_playlist_uuids);
            switch (inherited_playlist.mode) {
                case "INCLUDE": tracks = array_include<Track>(tracks, inherited_tracks, (a: Track,b: Track) => a.uid === b.uid); break;
                case "EXCLUDE": tracks = array_exclude<Track>(tracks, inherited_tracks, (a: Track,b: Track) => a.uid === b.uid); break;
                case "MASK"   : tracks = array_mask<Track>(tracks, inherited_tracks, (a: Track,b: Track) => a.uid === b.uid);
            }
        }
    }
    if(cplaylist_data.inherited_searchs!.length === 0) return tracks;
    for(const inherited_search of cplaylist_data.inherited_searchs!) {
        const inherited_tracks = track_query_filter(GLOBALS.global_var.sql_tracks, inherited_search.query);
        switch (inherited_search.mode) {
            case "INCLUDE": tracks = array_include<Track>(tracks, inherited_tracks, (a: Track,b: Track) => a.uid === b.uid); break;
            case "EXCLUDE": tracks = array_exclude<Track>(tracks, inherited_tracks, (a: Track,b: Track) => a.uid === b.uid); break;
            case "MASK"   : tracks = array_mask<Track>(tracks, inherited_tracks, (a: Track,b: Track) => a.uid === b.uid);
        }
    }
    return tracks;
}

export async function track_exists_in_playlist(playlist_uuid: string, track_uid: string) {
    const count = await db_get_all_async<PlaylistsTracks>(`${sql_select<PlaylistsTracks>("playlists_tracks", "*")} ${sql_where<PlaylistsTracks>(["uuid", playlist_uuid], ["track_uid", track_uid])}`);
    return count.length !== 0;
}

export async function insert_all_tracks_playlist(playlist_uuid: string, track_uids: string[]) {
    await Promise.all( track_uids.map( async(track_uid) => insert_track_playlist(playlist_uuid, track_uid) ) );
}
export async function insert_track_playlist(playlist_uuid: string, track_uid: string) {
    if(await track_exists_in_playlist(playlist_uuid, track_uid)) return;
    await db_run_async(sql_insert_values("playlists_tracks", ExampleObj.playlists_tracks_example0), [playlist_uuid, track_uid]);
}

export async function delete_track_playlist(playlist_uuid: string, track_uid: string) {
    await db_run_async(`${sql_delete_from("playlists_tracks")} ${sql_where<PlaylistsTracks>(["uuid", playlist_uuid], ["track_uid", track_uid])}`);
}
export async function delete_track_from_all_playlists(track_uid: string) {
    await db_run_async(`${sql_delete_from("playlists_tracks")} ${sql_where<PlaylistsTracks>(["track_uid", track_uid])}`);
}

export async function all_playlists_data() {
    const playlists = await db_get_all_async<SQLPlaylist>(sql_select<Playlist>("playlists", "*"));
    return Promise.all( playlists.map(async(playlist) => sql_playlist_to_playlist(playlist)) );
}
export async function all_playlists_names(): Promise<{"title": string}[]> {
    return await db_get_all_async<{"title": string}>(sql_select<Playlist>("playlists", "title"));
}
const playlist_name_sync_memo: Record<string, string> = {};
export function playlist_name_sync(playlist_uuid: string) {
    const title = db_get_all_sync<{"title": string}>(`${sql_select<Playlist>("playlists", "title")} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
    if(title.length === 0) return null;
    playlist_name_sync_memo[playlist_uuid] = title[0].title;
    return title[0].title;
}
export async function playlist_data(playlist_uuid: string, ignore_tracks = false) {
    const playlists = await db_get_all_async<SQLPlaylist>(`${sql_select<Playlist>("playlists", "*")} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
    return await sql_playlist_to_playlist(playlists[0], ignore_tracks);
}
export async function update_playlist(playlist_uuid: string, new_playlist: Playlist) {
    await db_run_async(`${sql_update_table("playlists")} SET ${obj_to_update_sql(new_playlist, ExampleObj.playlist_example0)} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
}
export async function create_playlist(title: string, cuuid?: string): Promise<string> {
    const playlist_names = await all_playlists_names();
    let count = 2;
    if(playlist_names.findIndex((item) => item.title == title) != -1) {
        while(playlist_names.findIndex((item) => item.title == `${title} ${count}`) != -1 && count <= 100)
            count++;
        if(count > 0)
            title = `${title} ${count}`;
    }
    const playlist_uuid = cuuid ?? uuid.default.v4();
    await db_run_async(sql_insert_values("playlists", ExampleObj.playlist_example0), playlist_to_sqllite_insertion({ uuid: playlist_uuid, title }));
    return playlist_uuid;
}
export async function delete_playlist(playlist_uuid: string) {
    await all_promises([
        db_exec_async(`${sql_delete_from("playlists")} ${sql_where<Playlist>(["uuid", playlist_uuid])}`),
        db_exec_async(`${sql_delete_from("playlists_tracks")} ${sql_where<PlaylistsTracks>(["uuid", playlist_uuid])}`)
    ]);
}
export async function delete_all_playlists() {
    const playlists = await all_playlists_data();
    await all_promises( playlists.map(async(playlist) => delete_playlist(playlist.uuid)) );
}
export async function pin_unpin_playlist(playlist_uuid: string, pin: boolean) {
    if(pin)
        await db_run_async(`${sql_update_table("playlists")} ${sql_set<Playlist>(["pinned", true])} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
    else
        await db_exec_async(`${sql_update_table("playlists")} ${sql_set<Playlist>(["pinned", false])} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
}
export async function is_playlist_pinned(playlist_uuid: string): Promise<boolean> {
    const playlists = await db_get_all_async<{pinned: boolean}>(`${sql_select<Playlist>("playlists", "pinned")} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
    return Boolean(playlists[0].pinned);
}
export async function update_playlist_title(playlist_uuid: string, title: string) {
    await db_run_async(`${sql_update_table("playlists")} ${sql_set<Playlist>(["title", title])} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
}
export async function update_playlist_description(playlist_uuid: string, description: string) {
    await db_run_async(`${sql_update_table("playlists")} ${sql_set<Playlist>(["description", description])} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
}
export async function update_playlist_sort_mode(playlist_uuid: string, sort_mode: SortType) {
    await db_run_async(`${sql_update_table("playlists")} ${sql_set<Playlist>(["sort", sort_mode])} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
}
export async function update_playlist_inherited_playlists(playlist_uuid: string, inherited_playlists: InheritedPlaylist[]) {
    await db_run_async(`${sql_update_table("playlists")} ${sql_set<Playlist>(["inherited_playlists", JSON.stringify(inherited_playlists)])} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
}
export async function update_playlist_inherited_searchs(playlist_uuid: string, inherited_searchs: InheritedSearch[]) {
    await db_run_async(`${sql_update_table("playlists")} ${sql_set<Playlist>(["inherited_searchs", JSON.stringify(inherited_searchs)])} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
}
export function inherited_playlists_action(inherited_playlists: InheritedPlaylist[], new_iplaylist: InheritedPlaylist, action: "ADD"|"REMOVE"): InheritedPlaylist[] {
    if(action === "ADD") return inherited_playlists.concat(new_iplaylist);
    else return inherited_playlists.filter(item => !(item.uuid === new_iplaylist.uuid && item.mode === new_iplaylist.mode));
}
export function inherited_searches_action(inherited_searches: InheritedSearch[], new_isearch: InheritedSearch, action: "ADD"|"REMOVE"): InheritedSearch[] {
    if(action === "ADD") return inherited_searches.concat(new_isearch);
    else return inherited_searches.filter(item => !(item.query === new_isearch.query && item.mode === new_isearch.mode));
}