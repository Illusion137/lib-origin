import * as GLOBALS from "../globals";
import * as SQLActions from "../sql_actions";
import { Prefs } from "../../../prefs";
import { is_empty } from "../../../../../origin/src/utils/util";
import { Track } from "../../../types";
import { alert_error } from "../alert";
import { Constants } from "../../../constants";

type SetState<T> = (value: React.SetStateAction<T>) => void;

export function check_download_status(track_data: Track, set_is_downloading: SetState<boolean>, set_is_downloaded: SetState<boolean>, set_downloading_progress: SetState<number>, interval_loop_ms: number): React.EffectCallback {
	let interval: number|NodeJS.Timeout;
    const depth = Prefs.get_pref('download_queue_max_length');
    const index = GLOBALS.downloading.slice(0, depth).findIndex(item => item?.uid === track_data.uid);
    const is_currently_downloading = index !== -1;
    if(is_currently_downloading){
        set_is_downloading(true);
        set_downloading_progress(GLOBALS.downloading[index]?.progress);
        interval = setInterval(() => {
            const inner_depth = Prefs.get_pref('download_queue_max_length');
            const inner_index = GLOBALS.downloading.slice(0, inner_depth).findIndex(item => item?.uid === track_data.uid);
            if(inner_index === -1){
                set_is_downloading(false);
                clearInterval(interval);
                const idx = GLOBALS.global_var.sql_tracks.findIndex(item => item.uid === track_data.uid);
                if(idx !== -1 && !is_empty(GLOBALS.global_var.sql_tracks[idx].media_uri))
                    set_is_downloaded(true);
                return;
            }
            set_downloading_progress(GLOBALS.downloading[index]?.progress);
        }, interval_loop_ms)
    }
    return () => clearInterval(interval);
}

export async function download_track(track_data: Track, is_downloading: boolean, set_is_downloading: SetState<boolean>, set_is_downloaded: SetState<boolean>, set_downloading_progress: SetState<number>){
    const track = await SQLActions.fetch_track_data_from_uid(track_data.uid);
    set_is_downloading(true);
    if(!is_downloading && is_empty(track.media_uri) && GLOBALS.downloading.findIndex((item) => item.uid == track_data.uid) === -1){
        const result = await GLOBALS.global_var.download_track(track_data, set_downloading_progress, set_is_downloading, set_is_downloaded);
        if(result === "ERROR") set_is_downloaded(false);
    }
}

export async function insert_into_write_playlist(track_data: Track, write_playlist: string|undefined, playlist_saved: boolean, set_playlist_saved: SetState<boolean>) {
    if(write_playlist === undefined) { alert_error({"error": "Track props.write_playlist is undefined"}); return; }
    if(!playlist_saved){
        if(write_playlist === Constants.library_write_playlist) await SQLActions.insert_track(track_data);
        else await SQLActions.insert_track_playlist(track_data.uid, write_playlist);
        set_playlist_saved(true);
    } else if(write_playlist !== Constants.library_write_playlist){
        await SQLActions.delete_track_playlist(write_playlist, track_data.uid);
        set_playlist_saved(false);
    }
}

export async function delete_track(track_data: Track, write_playlist: string|undefined, refresh_data: (() => void)|undefined){
    if(refresh_data === undefined) { alert_error({"error": "Track props.refresh_data is undefined"}); return; }
    if(write_playlist === undefined || write_playlist === Constants.library_write_playlist){
        const playlists = await SQLActions.all_playlists_data();
        for(let i = 0; i < playlists.length; i++){
            await SQLActions.delete_track_playlist(playlists[i].uuid, track_data.uid);
        }
        await SQLActions.delete_track(track_data.uid);
        await SQLActions.fetch_track_data(); 
        await refresh_data();
    } else {
        await SQLActions.delete_track_playlist(write_playlist, track_data.uid);
        await refresh_data();
    }
}
