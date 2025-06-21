import { is_empty } from "../../../../../origin/src/utils/util";
import { all_promises } from "../../../illusive_utilts";
import { Prefs } from "../../../prefs";
import { SQLTrack, Track } from "../../../types";
import { ExampleObj } from "../example_objs";
import { sql_tracks_to_tracks, track_to_sqllite_insertion } from "./sql_tracks";
import { db_get_all_async, db_run_async, sql_delete_from, sql_insert_values, sql_select, sql_where } from "./sql_utils";
import * as GLOBALS from '../globals';

export async function insert_recently_played_track(track: Track) {
    await db_run_async(`${sql_delete_from("recently_played_tracks")} ${sql_where<Track>(["uid", track.uid])}`);
    await db_run_async(sql_insert_values("recently_played_tracks", ExampleObj.track_example0), track_to_sqllite_insertion(track));
}
export async function delete_recently_played_track(track: Track) {
    await db_run_async(`${sql_delete_from("recently_played_tracks")} ${sql_where<Track>(["uid", track.uid])}`);
}
export async function recently_played_tracks(limit?: number): Promise<Track[]> {
    const recently_played_sql_tracks: SQLTrack[] = await db_get_all_async<SQLTrack>(sql_select<Track>("recently_played_tracks", "*", limit, "DESC"));
    const recently_played_tracks = sql_tracks_to_tracks(recently_played_sql_tracks);
    const global_tracks_uuid_set = new Set<string>(GLOBALS.global_var.sql_tracks.map(({uid}) => uid));
    const global_tracks_uuid_track_map = new Map<string, Track>(GLOBALS.global_var.sql_tracks.map(track => [track.uid, track]));
    for(let i = 0; i < recently_played_tracks.length; i++) {
        if(global_tracks_uuid_set.has(recently_played_tracks[i].uid))
            recently_played_tracks[i] = global_tracks_uuid_track_map.get(recently_played_tracks[i].uid)!;
        else if(!is_empty(recently_played_tracks[i].imported_id)) recently_played_tracks.splice(i, 1);
    }
    return recently_played_tracks;
}
export async function cleanup_recently_played() {
    const recently_played_max_size = Prefs.get_pref('recently_played_max_size');
    const to_delete_recently_played_data = (await recently_played_tracks()).slice(0, -recently_played_max_size);
    
    await all_promises(
        to_delete_recently_played_data.map(track => delete_recently_played_track(track))
    );
}