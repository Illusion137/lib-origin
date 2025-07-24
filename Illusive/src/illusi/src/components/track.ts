import { is_empty } from "../../../../../common/utils/util";
import { Constants } from "../../../constants";
import type { Track } from "../../../types";
import { alert_error } from "../alert";
import * as GLOBALS from "../globals";
import * as SQLPlaylists from "../sql/sql_playlists";
import * as SQLTracks from "../sql/sql_tracks";

type SetState<T> = (value: React.SetStateAction<T>) => void;

export async function download_track(track_data: Track, redownload: boolean , is_downloading: boolean, set_is_downloading: SetState<boolean>, set_is_downloaded: SetState<boolean>, set_downloading_progress: SetState<number>) {
    const track = await SQLTracks.fetch_track_data_from_uid(track_data.uid);
    set_is_downloading(true);
    if(!is_downloading && ((is_empty(track.media_uri) && GLOBALS.downloading.findIndex((item) => item.uid == track_data.uid) === -1))) {
        const result = await GLOBALS.global_var.download_track(track_data, redownload, set_downloading_progress, set_is_downloading, set_is_downloaded);
        if(result === "ERROR") set_is_downloaded(false);
    }
}

export async function insert_into_write_playlist(track_data: Track, write_playlist_uuid: string|undefined, playlist_saved: boolean, set_playlist_saved: SetState<boolean>, refresh_data?: () => any) {
    if(write_playlist_uuid === undefined) { alert_error({error: new Error("Track props.write_playlist is undefined")}); return; }
    if(!playlist_saved) {
        if(write_playlist_uuid === Constants.library_write_playlist) await SQLTracks.insert_track(track_data);
        else await SQLPlaylists.insert_track_playlist(write_playlist_uuid, track_data.uid);
        set_playlist_saved(true);
    } else if(write_playlist_uuid !== Constants.library_write_playlist) {
        await SQLPlaylists.delete_track_playlist(write_playlist_uuid, track_data.uid);
        set_playlist_saved(false);
    }
    if(refresh_data !== undefined) refresh_data();
}

export async function delete_track(track_data: Track, write_playlist_uuid: string|undefined, refresh_data?: (() => Promise<void>)) {
    if(refresh_data === undefined) { alert_error({error: new Error("Track props.refresh_data is undefined")}); return; }
    if(write_playlist_uuid === undefined || write_playlist_uuid === Constants.library_write_playlist) {
        await SQLPlaylists.delete_track_from_all_playlists(track_data.uid);
        await SQLTracks.delete_track(track_data.uid);
        const idx = GLOBALS.global_var.sql_tracks.findIndex(item => item.uid === track_data.uid);
        if(idx !== -1) GLOBALS.global_var.sql_tracks.splice(idx, 1);
        await refresh_data();
    } else {
        await SQLPlaylists.delete_track_playlist(write_playlist_uuid, track_data.uid);
        await refresh_data();
    }
}
