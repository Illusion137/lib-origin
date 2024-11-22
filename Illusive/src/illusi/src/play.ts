import * as Haptics from 'expo-haptics';
import TrackPlayer from "react-native-track-player";
import { is_empty } from "../../../../origin/src/utils/util";
import { Constants } from "../../constants";
import { Illusive } from "../../illusive";
import { Prefs } from "../../prefs";
import { Track } from "../../types";
import { alert_error } from "./alert";
import * as GLOBALS from "./globals";
import * as SQLTracks from "./sql/sql_tracks";

export function filter_play_tracks(start_track: Track, tracks: Track[], playlist_name: string) {
    if(tracks.length === 0) return [];
    if(!GLOBALS.global_var.can_play_again_mutex || !is_empty(start_track.imported_id) || !is_empty(start_track.media_uri)) {
        GLOBALS.global_var.can_play_again_mutex = true;
        if(Prefs.get_pref('only_play_downloaded') && !playlist_name.includes("Mix")) {
            tracks = tracks.filter((item) => !is_empty(item.media_uri));
        }
        if(tracks.length > 0)
            tracks = Illusive.shuffle_tracks(Prefs.get_pref('always_shuffle') ? "SHUFFLE" : "ORDER", tracks, start_track);
        GLOBALS.global_var.can_play_again_mutex = false;
        return tracks;
    } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(e => e);
        return [];
    }
}
export async function play_shuffle(tracks: Track[], from: string) {
    await SQLTracks.fetch_track_data();
    const shuffled_tracks = Illusive.shuffle_tracks("SHUFFLE", [...tracks]);
    if (shuffled_tracks.length == 0) { return; }
    GLOBALS.global_var.play_tracks(shuffled_tracks[0], shuffled_tracks, from);
}
export async function push_track_to_playing_queue(track_data: Track) {
    if(GLOBALS.global_var.is_playing) {
        const track_index = await TrackPlayer.getActiveTrackIndex();
        if(track_index === null || track_index === undefined) return;
        const track: Track = {...track_data}; // TODO: Investigate DeepCopy with JSON.parse(JSON.stringify(track_data))
        GLOBALS.global_var.playing_tracks.splice(track_index + 1 + GLOBALS.global_var.playing_queue.length, 0, track);
        GLOBALS.global_var.playing_queue.enqueue(track);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
}
export async function play_mix(track_data: Track, from: string) {
    if(is_empty(from)) {
        alert_error({error: new Error("Play Mix: from is empty")});
        return;
    }
    GLOBALS.global_var.play_tracks(track_data, [track_data], from);
    const track_mix = await Illusive.get_track_mix(track_data);
    if("error" in track_mix) {
        alert_error(track_mix);
        return;
    }
    track_mix.tracks = await SQLTracks.add_playback_saved_data_to_tracks(track_mix.tracks);
    GLOBALS.global_var.playing_tracks.push(...track_mix.tracks.slice(1));
}
export async function play(track_data: Track, from: string, track_callback: () => Track[]) {
    if(from === Constants.illusi_mix_from) await play_mix(track_data, from);
    else GLOBALS.global_var.play_tracks(track_data, track_callback(), from);
}