import { Illusive } from "@illusive/illusive";
import type { Track, TrackPlaybackData } from "@illusive/types";
import { SQLfs } from "./sql_fs";
import { reinterpret_cast } from "@common/cast";
import { track_store } from "@illusive/stores/track_store";

export namespace SQLGlobal {
    const global_sql_tracks_update_subscriptions = new Map<string, () => void>();

    function with_recomputed_artwork(track: Track): Track {
        return {
            ...track,
            playback: {
                ...reinterpret_cast<TrackPlaybackData>(track.playback),
                artwork: Illusive.get_track_artwork(SQLfs.document_directory(""), track),
            }
        };
    }

    export function push_global_sql_tracks_update_callback(key: string, callback: () => any){
        pop_global_sql_tracks_update_callback(key);
        global_sql_tracks_update_subscriptions.set(key, track_store.subscribe(callback));
    }
    export function pop_global_sql_tracks_update_callback(key: string){
        global_sql_tracks_update_subscriptions.get(key)?.();
        global_sql_tracks_update_subscriptions.delete(key);
    }
    export function notify_global_tracks_updated(){
        track_store.getState().bump_revision();
    }
    export function update_global_track_property<T extends keyof Track>(track_uid: Track['uid'], prop: T, value: Track[T]){
        const track = track_store.getState().tracks_by_uid.get(track_uid);
        if(track === undefined) return;
        track_store.getState().update_track(track_uid, with_recomputed_artwork({ ...track, [prop]: value }));
    }
    export function update_global_track_all_property<T extends keyof Track>(prop: T, value: Track[T]){
        track_store.getState().update_all_track_property(prop, value);
    }
    export function update_global_track_item(track_uid: Track['uid'], new_track: Track, notify = true){
        notify;
        track_store.getState().update_track(track_uid, with_recomputed_artwork({ ...new_track }));
    }
    export function delete_global_track_item(track_uid: Track['uid'], notify = true){
        notify;
        track_store.getState().delete_track(track_uid);
    }
    export function add_global_track_item(track: Track, notify = true){
        notify;
        track_store.getState().add_track(track);
    }
    export function add_global_track_items(tracks: Track[]){
        track_store.getState().add_tracks(tracks);
    }
}
