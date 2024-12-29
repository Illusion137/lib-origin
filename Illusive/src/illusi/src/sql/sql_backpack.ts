import { Illusive } from "../../../illusive";
import { all_promises } from "../../../illusive_utilts";
import { SQLTrack, Track } from "../../../types";
import { ExampleObj } from "../example_objs";
import { delete_track, insert_track, sql_track_to_track, track_exists, track_from_uid, track_to_sqllite_insertion } from "./sql_tracks";
import { db_exec_async, db_get_all_async, db_run_async, sql_delete_from, sql_insert_values, sql_select, sql_where } from "./sql_utils";

export async function empty_backpack() {
    await db_exec_async(sql_delete_from("backpack"));
}
export async function delete_from_backpack(uid: string) {
    await db_run_async(`${sql_delete_from("backpack")} ${sql_where<Track>(["uid", uid])}`);
}
export async function toss_from_backpack(replacement_track: Track) {
    await all_promises([
        insert_track(replacement_track),
        delete_from_backpack(replacement_track.uid)
    ])
}

export async function backpack_tracks() {
    const sql_tracks= await db_get_all_async<SQLTrack>(sql_select<Track>("backpack", "*"));
    const tracks: Track[] = sql_tracks.map(sql_track => sql_track_to_track(sql_track));
    for(let i = 0; i < tracks.length; i++) tracks[i].playback!.artwork = Illusive.illusi_dark_icon;
    return tracks;
}
export async function add_to_backpack(uid: string) {
    if(await track_exists({uid, title:"", artists:[], duration:0})) return;
    const track = await track_from_uid(uid);
    await all_promises([
        delete_track(uid),
        db_run_async(sql_insert_values("backpack", ExampleObj.track_example0), track_to_sqllite_insertion(track))
    ]);
}