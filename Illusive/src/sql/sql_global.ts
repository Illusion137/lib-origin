import { GLOBALS } from "@illusive/globals";
import type { Track } from "@illusive/types";

export namespace SQLGlobal {
    let global_sql_tracks_update_callback: () => any = () => {return};
    export function set_global_sql_tracks_update_callback(callback: () => any){
        global_sql_tracks_update_callback = callback;
    }
    export function update_global_track_property<T extends keyof Track>(track_uid: Track['uid'], prop: T, value: Track[T]){
        const idx = GLOBALS.global_var.sql_tracks.findIndex(item => item.uid === track_uid);
        if(idx !== -1) GLOBALS.global_var.sql_tracks[idx][prop] = value;
        global_sql_tracks_update_callback?.();
    }
    export function update_global_track_all_property<T extends keyof Track>(prop: T, value: Track[T]){
        for(const track of GLOBALS.global_var.sql_tracks){
            track[prop] = value;
        }
        global_sql_tracks_update_callback?.();
    }
    export function update_global_track_item(track_uid: Track['uid'], new_track: Track){
        const idx = GLOBALS.global_var.sql_tracks.findIndex(item => item.uid === track_uid);
        if(idx !== -1) GLOBALS.global_var.sql_tracks[idx] = new_track;
        global_sql_tracks_update_callback?.();
    }
}