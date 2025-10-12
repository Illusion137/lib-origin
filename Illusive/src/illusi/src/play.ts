import * as Haptics from 'expo-haptics';
import { is_empty, random_of, shuffle_array } from "@common/utils/util";
import { Constants } from "@illusive/constants";
import { Illusive } from "@illusive/illusive";
import { Prefs } from "@illusive/prefs";
import type { Track } from "@illusive/types";
import { alert_error } from "@illusive/illusi/src/alert";
import { insert_track_into_player_queue } from '@illusive/track_player_service';
import { default_playlists } from '@illusive/default_playlists';
import { GLOBALS } from '@illusive/globals';
import { SQLPlaylists } from '@illusive/sql/sql_playlists';
import { SQLTracks } from '@illusive/sql/sql_tracks';

export async function filter_play_tracks(start_track: Track, tracks: Track[], playlist_name: string) {
    if(tracks.length === 0) return [];
    if(!GLOBALS.global_var.can_play_again_mutex || !is_empty(start_track.imported_id) || !is_empty(start_track.media_uri)) {
        GLOBALS.global_var.can_play_again_mutex = true;
        const known_playlist_names = Prefs.get_pref('only_play_downloaded') ? 
            (await SQLPlaylists.all_playlists_names())
            .map(({title}) => title)
            .concat(default_playlists.map(({name}) => name), ["My Library"]) : [];
        if(Prefs.get_pref('only_play_downloaded') && known_playlist_names.includes(playlist_name)) {
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
    const shuffled_tracks = Illusive.shuffle_tracks("SHUFFLE", [...tracks]);
    if (shuffled_tracks.length == 0) { return; }
    GLOBALS.global_var.play_tracks(shuffled_tracks[0], shuffled_tracks, from);
}
export async function push_track_to_playing_queue(track_data: Track) {
    await insert_track_into_player_queue(track_data, 1 + GLOBALS.global_var.playing_queue.length);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
export async function play_track_next(track_data: Track) {
    await insert_track_into_player_queue(track_data, 1);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
export async function sprinkle_into_queue(tracks: Track[]){
    tracks = shuffle_array(tracks);
    let i = 0;
    const min_length = Math.min(GLOBALS.global_var.playing_tracks.length, tracks.length);
    while( (i+=random_of([1,1,2,2,2,3])) < min_length){
        const insert_track = tracks[i];
        await insert_track_into_player_queue(insert_track, i);
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
    track_mix.tracks = SQLTracks.add_playback_saved_data_to_tracks(track_mix.tracks);
    GLOBALS.global_var.playing_tracks.push(...track_mix.tracks.slice(1));
}
export async function play(track_data: Track, from: string, track_callback: () => Track[]) {
    if(from === Constants.illusi_mix_from) await play_mix(track_data, from);
    else GLOBALS.global_var.play_tracks(track_data, track_callback(), from);
}