import { GLOBALS } from "@illusive/globals";
import type { Track } from "@illusive/types";

export namespace SQLGlobal {
    const global_sql_tracks_update_callbacks = new Map<string, () => any>();

    function run_global_sql_tracks_callbacks(){
        for(const callback of global_sql_tracks_update_callbacks.values()){
            callback();
        }
    }

    export function push_global_sql_tracks_update_callback(key: string, callback: () => any){
        global_sql_tracks_update_callbacks.set(key, callback);
    }
    export function pop_global_sql_tracks_update_callback(key: string){
        global_sql_tracks_update_callbacks.delete(key);
    }
    export function update_global_track_property<T extends keyof Track>(track_uid: Track['uid'], prop: T, value: Track[T]){
        const idx = GLOBALS.global_var.sql_tracks.findIndex(item => item.uid === track_uid);
        if(idx !== -1) GLOBALS.global_var.sql_tracks[idx][prop] = value;
        run_global_sql_tracks_callbacks();
    }
    export function update_global_track_all_property<T extends keyof Track>(prop: T, value: Track[T]){
        for(const track of GLOBALS.global_var.sql_tracks){
            track[prop] = value;
        }
        run_global_sql_tracks_callbacks();
    }
    export function update_global_track_item(track_uid: Track['uid'], new_track: Track){
        const idx = GLOBALS.global_var.sql_tracks.findIndex(item => item.uid === track_uid);
        if(idx !== -1) GLOBALS.global_var.sql_tracks[idx] = new_track;
        run_global_sql_tracks_callbacks();
    }
    export function delete_global_track_item(track_uid: Track['uid']){
        const idx = GLOBALS.global_var.sql_tracks.findIndex(track => track.uid === track_uid);
        GLOBALS.global_var.sql_tracks.splice(idx, 1);
        run_global_sql_tracks_callbacks();
    }
    export function add_global_track_item(track: Track){
        GLOBALS.global_var.sql_tracks.push(track);
        run_global_sql_tracks_callbacks();
    }
}