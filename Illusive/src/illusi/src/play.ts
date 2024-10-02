import * as GLOBALS from "./globals";
import * as Haptics from 'expo-haptics';
import { Track } from "../../types";
import { is_empty } from "../../../../origin/src/utils/util";
import { Prefs } from "../../prefs";
import { Illusive } from "../../illusive";

export function filter_play_tracks(start_track: Track, tracks: Track[], playlist_name: string){
    if(tracks.length === 0) return [];
    if(!GLOBALS.global_var.can_play_again_mutex || !is_empty(start_track.imported_id) || !is_empty(start_track.media_uri)){
        GLOBALS.global_var.can_play_again_mutex = true;
        if(Prefs.get_pref('only_play_downloaded') && !playlist_name.includes("Mix")){
            tracks = tracks.filter((item) => !is_empty(item.media_uri));
        }
        if(tracks.length > 0)
            tracks = Illusive.shuffle_tracks(Prefs.get_pref('always_shuffle') ? "SHUFFLE" : "ORDER", tracks, start_track);
        GLOBALS.global_var.can_play_again_mutex = false;
        return tracks;
    } else{
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return [];
    }
}