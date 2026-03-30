import type { AddTrack } from 'react-native-track-player';
import TrackPlayer, {
    AppKilledPlaybackBehavior,
    Capability,
    Event,
    PitchAlgorithm,
    RepeatMode,
    TrackType
}
    from 'react-native-track-player';
import { is_empty, recreate } from '@common/utils/util';
import { Constants } from '@illusive/constants';
import { Illusive } from '@illusive/illusive';
import type { ISOString, Track } from '@illusive/types';
import { alert_trackplayer_error } from '@illusive/illusi/src/alert';
import { handle_new_track_data } from '@illusive/downloader';
import { artist_string } from '@illusive/illusive_utils';
import { sample } from '@illusive/sampler';
import { GLOBALS } from '@illusive/globals';
import { SQLfs } from '@illusive/sql/sql_fs';
import { SQLBackpack } from '@illusive/sql/sql_backpack';
import { resolved_artwork } from '@illusive/artwork';
import { SQLRecentlyPlayed } from '@illusive/sql/sql_recently_played';
import { SQLTracks } from '@illusive/sql/sql_tracks';
import { Prefs } from './prefs';
import { catch_log } from '@common/utils/error_util';
import { SQLTrackPlays } from './sql/sql_track_plays';
import { reinterpret_cast } from '@common/cast';
// import * as ImageManipulator from 'expo-image-manipulator';
// import { Image } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const placeholder_mp3 = require('./assets/placeholder.mp3');

export let trackplayer_has_been_setup = false;

export async function setup_track_player(): Promise<boolean> {
    GLOBALS.global_var.past_playing_tracks = GLOBALS.global_var.playing_tracks.length === 0 ?
        GLOBALS.global_var.past_playing_tracks : GLOBALS.global_var.playing_tracks;
    let index = 0;
    try {
        index = await TrackPlayer.getActiveTrackIndex() ?? 0;
    } catch (_) { }
    GLOBALS.global_var.past_track_index = GLOBALS.global_var.playing_tracks.length === 0 ? GLOBALS.global_var.past_track_index : index;
    try {
        await TrackPlayer.getActiveTrackIndex();
    } catch (_) {
        await TrackPlayer.setupPlayer();
        trackplayer_has_been_setup = true;
        await TrackPlayer.updateOptions({
            android: {
                appKilledPlaybackBehavior:
                    AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            },
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
                Capability.SeekTo,
                Capability.PlayFromSearch,
            ],
            progressUpdateEventInterval: 1,
        });
        await TrackPlayer.setRepeatMode(RepeatMode.Off);
        await TrackPlayer.setEqualizer(Prefs.equalizer_presets[Prefs.get_pref('equalizer_preset')] as unknown as number[]);
        await TrackPlayer.setCrossFade(Prefs.get_pref('crossfade'));
        return true;
    }
    return true;
}

export async function save_past_queue() {
    const index = await TrackPlayer.getActiveTrackIndex();
    if (index === undefined) return;
    await Prefs.save_pref('past_queue', { index, tracks: GLOBALS.global_var.playing_tracks.map(track => ({ ...track, playback: undefined, downloading_data: undefined })) });
}

export async function on_modify_track_player_queue() {
    await save_past_queue();
    await check_push_next_track(await TrackPlayer.getActiveTrackIndex() ?? 0);
}

export async function insert_track_into_player_queue(track_data: Track, plus_index: number) {
    if (!GLOBALS.global_var.is_playing) return;
    const track_index = await TrackPlayer.getActiveTrackIndex();
    if (track_index === null || track_index === undefined) return;
    const track = recreate(track_data);
    track.playback = {
        artwork: track.playback?.artwork ?? 0,
        added: false,
        successful: false
    };
    GLOBALS.global_var.playing_tracks.splice(track_index + plus_index, 0, track);
    GLOBALS.global_var.playing_queue.push(track.uid);
    await on_modify_track_player_queue();
}

export async function delete_track_from_player_queue(track_data: Track, current_track_index: number) {
    const global_index = GLOBALS.global_var.playing_tracks.slice(current_track_index).findIndex(track => track.uid === track_data.uid);
    if (global_index !== -1) {
        const absolute_index = current_track_index + global_index;
        GLOBALS.global_var.playing_tracks.splice(absolute_index, 1);
        // TP queue is lazily loaded so indices may differ from playing_tracks — match by position relative to current
        const tp_queue = await TrackPlayer.getQueue();
        const tp_index = tp_queue.slice(current_track_index).findIndex(track => track.title === track_data.title);
        if (tp_index !== -1) await TrackPlayer.remove([current_track_index + tp_index]);
    }
    await on_modify_track_player_queue();
}

// async function get_square_artwork(uri: string) {
//     const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
//         Image.getSize(uri, (w, h) => resolve({ width: w, height: h }), reject);
//     });

//     const size = Math.min(width, height);
//     const crop = {
//         originX: (width - size) / 2,
//         originY: (height - size) / 2,
//         width: size,
//         height: size,
//     };

//     const result = await ImageManipulator.ImageManipulator.manipulate(uri, 
//         // [
//             // { crop },
//             // { resize: { width: 512, height: 512 } }, // recommended size for lockscreen
//         // ]
//     );
//     result.crop().

//     return result.uri;
// }


export async function illusive_track_to_track_player_track(track: Track): Promise<AddTrack | 'skip'> {
    if (track === undefined) return 'skip';
    const url_data = await Illusive.get_download_url(SQLfs.document_directory(""), track, "18");
    if ("error" in url_data) {
        GLOBALS.global_var.bottom_alert("Failed to convert track to Illusive track", "WARN", url_data);
        if (url_data.error.message.includes("Video unavailable"))
            await SQLBackpack.add_to_backpack(track.uid);
        return 'skip';
    }
    if ("duration" in url_data && url_data.duration && !isNaN(url_data.duration) && is_empty(track.duration)) {
        track.duration = url_data.duration;
    }
    const nt_response = await handle_new_track_data(track, url_data);
    if (!("error" in nt_response)) track = nt_response;
    // TODO if file doesn't exist might as well just remove it from the queue and skip
    const artwork = resolved_artwork(track.playback!.artwork);
    return {
        url: url_data.url,
        title: track.title,
        artist: artist_string(track),
        album: track.album?.name,
        duration: track.duration,
        artwork: typeof artwork === "number" ? artwork : artwork.uri,
        pitchAlgorithm: PitchAlgorithm.Linear,
        type: is_empty(track.soundcloud_id) ? TrackType.HLS : TrackType.HLS,
        headers: {},
        contentType: 'audio/mp4',
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
        ...(url_data.isSabr && {
            isSabr: url_data.isSabr,
            sabrServerUrl: url_data.sabrServerUrl,
            sabrUstreamerConfig: url_data.sabrUstreamerConfig,
            sabrFormats: (url_data.sabrFormats ?? []) as unknown as Record<string, unknown>[],
            poToken: url_data.poToken,
        }),
    };
}

let updated_metadata_mutex = false;

export function get_x_threshold(playing_track: Track, threshold_percent: number) {
    const begdur = playing_track.meta?.begdur ?? 0;
    const enddur = playing_track.meta?.enddur ?? playing_track.duration;
    return ((begdur + ((enddur - begdur)) * threshold_percent) / playing_track.duration);
}
export function get_restart_threshold(playing_track: Track) {
    return get_x_threshold(playing_track, Constants.previous_restart_threshold);
}
export function is_in_restart_threshold(playing_track: Track, position: number) {
    return position / playing_track.duration >= get_restart_threshold(playing_track);
}
export function get_metadata_update_threshold(playing_track: Track) {
    return get_x_threshold(playing_track, Constants.update_track_threshold);
}
export function is_in_metadata_update_threshold(playing_track: Track, position: number) {
    return position / playing_track.duration >= get_metadata_update_threshold(playing_track);
}

export function get_reset_mutex_threshold(playing_track: Track) {
    return get_x_threshold(playing_track, Constants.reset_track_mutex_threshold);
}
export function is_in_reset_mutex_threshold(playing_track: Track, position: number) {
    return position / playing_track.duration <= get_reset_mutex_threshold(playing_track);
}

export async function track_player_previous() {
    try {
        const progress = await TrackPlayer.getProgress();
        const track_index = await TrackPlayer.getActiveTrackIndex();
        if (track_index === undefined || track_index === 0) {
            await TrackPlayer.seekTo(0);
            updated_metadata_mutex = false;
            return;
        }
        const illusi_track = GLOBALS.global_var.playing_tracks?.[track_index];
        if (is_in_restart_threshold(illusi_track, progress.position)) {
            await TrackPlayer.seekTo(illusi_track?.meta?.begdur ?? 0);
            updated_metadata_mutex = false;
            return;
        }
        await TrackPlayer.skipToPrevious();
    } catch (error) { alert_trackplayer_error({ error: error as Error }); }
}

export async function check_push_next_track(queue_index: number) {
    // const prev_track_index = queue_index - 1;
    // const prev_illusi_track = GLOBALS.global_var.playing_tracks[prev_track_index];
    const next_track_index = queue_index + 1;
    const next_illusi_track = GLOBALS.global_var.playing_tracks[next_track_index];

    if (next_illusi_track && !next_illusi_track.playback!.added && !next_illusi_track.playback!.successful) {
        GLOBALS.global_var.playing_tracks[next_track_index].playback!.added = true;

        const react_native_track = await illusive_track_to_track_player_track(next_illusi_track);
        if (react_native_track === null) {
            await TrackPlayer.add({ url: placeholder_mp3, title: 'NULL', artist: 'Sudo' }, next_track_index);
        } else if (react_native_track === 'skip') {
            GLOBALS.global_var.playing_tracks.splice(next_track_index, 1);
            // re-check immediately so the track now shifted into next_track_index gets loaded
            await check_push_next_track(queue_index);
        } else {
            next_illusi_track.playback!.successful = true;
            try {
                await TrackPlayer.add(react_native_track, next_track_index);
            } catch (error) {
                next_illusi_track.playback!.successful = false;
                GLOBALS.global_var.bottom_alert("Failed to add track to queue", "WARN", { error: error as Error });
            }
        }
    }
    // if (prev_illusi_track && prev_illusi_track.playback!.added === false && prev_illusi_track.playback!.successful === false) {
    //     prev_illusi_track.playback!.added = true;

    //     const react_native_track = await illusive_track_to_track_player_track(prev_illusi_track);
    //     if (react_native_track === null) {
    //         await TrackPlayer.add({ url: placeholder_mp3, title: 'NULL', artist: 'Sudo' }, prev_track_index);
    //     } 
    //     else if (react_native_track === 'skip') {
    //         // GLOBALS.global_var.playing_tracks.splice(prev_track_index, 1);
    //     }
    //      else {
    //         prev_illusi_track.playback!.successful = true;
    //         await TrackPlayer.add(react_native_track, prev_track_index);
    //     }
    // }
}

export async function track_player_next() {
    try {
        await TrackPlayer.skipToNext();
    } catch (error) { alert_trackplayer_error({ error: error as Error }); }
}

export async function track_player_on_error(data: { error: string }) {
    const error_msg = `TP: ${data.error}`;
    GLOBALS.global_var.bottom_alert(error_msg, "WARN");
    for (let i = 0; i < Constants.trackplayer_max_retries; i++) {
        try {
            await TrackPlayer.retry();
        } catch (_) {
            continue;
        }
        break;
    }
    const index = await TrackPlayer.getActiveTrackIndex();
    if (index === undefined) return;
    const illusi_track = GLOBALS.global_var.playing_tracks[index];
    await delete_track_from_player_queue(illusi_track, index);
}

export async function playback_service() {
    TrackPlayer.addEventListener(Event.RemoteDuck, async (_) => { return });
    TrackPlayer.addEventListener(Event.PlaybackError, async (data) => {
        await track_player_on_error(reinterpret_cast<{ error: string }>(data));
    });
    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (data) => {
        try {
            if (data.index === undefined) return;
            updated_metadata_mutex = false;
            const illusi_track = GLOBALS.global_var.playing_tracks[data.index];
            if (illusi_track.meta?.begdur !== undefined) { await TrackPlayer.seekTo(illusi_track.meta.begdur); };
            GLOBALS.global_var.playing_queue = [];

            if (data.index !== 0 && illusi_track.playback!.added && !illusi_track.playback!.successful) {
                await TrackPlayer.pause();
                const new_react_native_track = await illusive_track_to_track_player_track(illusi_track);
                if (new_react_native_track === null || new_react_native_track === 'skip') {
                    await track_player_next();
                } else {
                    GLOBALS.global_var.playing_tracks[data.index].playback!.successful = true;
                    // await TrackPlayer.updateMetadataForTrack(data.index, new_react_native_track);
                }
                await TrackPlayer.play();
            }

            await SQLRecentlyPlayed.insert_recently_played_track(GLOBALS.global_var.playing_tracks[data.index]);
            await sample();
            await save_past_queue();
        } catch (error) { alert_trackplayer_error({ error: error as Error }); }
    });
    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, async (data) => {
        try {
            const illusi_track = GLOBALS.global_var.playing_tracks[data.track];

            if (is_in_reset_mutex_threshold(illusi_track, data.position)) {
                updated_metadata_mutex = false;
            }
            else if (is_in_metadata_update_threshold(illusi_track, data.position) && !updated_metadata_mutex) {
                updated_metadata_mutex = true;
                const current_track = await SQLTracks.track_from_uid(GLOBALS.global_var.playing_tracks[data.track].uid) as Track;
                if (is_empty(current_track.meta!.plays)) current_track.meta!.plays = 0;
                current_track.meta!.last_played_date = (new Date().toISOString() as ISOString);
                current_track.meta!.plays++;
                await SQLTracks.update_track_meta_data(current_track.uid, current_track.meta!);
                await SQLTrackPlays.insert_track_play(current_track.uid); // TODO fix whatever going on here
            }
            if (illusi_track.meta?.enddur !== undefined && data.position >= illusi_track.meta?.enddur) await track_player_next();

            check_push_next_track(data.track).catch(catch_log);
        } catch (_) { }
    });
    TrackPlayer.addEventListener(Event.RemotePrevious, async () => { await track_player_previous(); });
    TrackPlayer.addEventListener(Event.RemoteNext, async () => { await track_player_next(); });
    TrackPlayer.addEventListener(Event.RemotePause, async () => { await TrackPlayer.pause(); });
    TrackPlayer.addEventListener(Event.RemotePlay, async () => { await TrackPlayer.play(); });
    TrackPlayer.addEventListener(Event.RemoteSeek, async (data) => { await TrackPlayer.seekTo(data.position); });
}