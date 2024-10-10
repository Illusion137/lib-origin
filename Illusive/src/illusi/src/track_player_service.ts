import TrackPlayer, {
    AppKilledPlaybackBehavior,
    Capability,
    RepeatMode,
    Event,
    AddTrack,
    PitchAlgorithm,
    TrackType
} from 'react-native-track-player';
import * as GLOBALS from './globals';
import * as SQLActions from './sql_actions';
import { Track } from '../..//types';
import { is_empty } from '../../../../origin/src/utils/util';
import { Illusive } from '../../illusive';

const placeholder_mp3 = require('../../assets/placeholder.mp3');

export async function setup_track_player(): Promise<boolean> {
    try {
        const active_index = await TrackPlayer.getActiveTrackIndex();
    } catch (error) {         
        await TrackPlayer.setupPlayer();
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
            compactCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.PlayFromSearch,
            ],
            progressUpdateEventInterval: 1,
        });
        await TrackPlayer.setRepeatMode(RepeatMode.Off);
        return true;
    }
    return true;
}

export async function illusive_track_to_track_player_track(track: Track): Promise<AddTrack | 'skip'> {
    const url_data = await Illusive.get_download_url(SQLActions.document_directory(""), track, "18");
    if ("error" in url_data) {
        if (url_data.error.includes("Video unavailable")) {
            await SQLActions.add_to_backpack(track.uid);
        }
        return 'skip';
    }
    if ("new_track_data" in url_data && url_data.new_track_data !== undefined) {
        await SQLActions.update_track_with_new_track_data(track, url_data.new_track_data);
        track = url_data.new_track_data!;
    }
    return {
        "url": url_data.url,
        "title": track.title,
        "artist": track.artists[0].name,
        "album": track.album?.name,
        "duration": track.duration,
        "artwork": typeof (track.playback!.artwork) === "number" ? track.playback!.artwork as unknown as string : track.playback!.artwork.uri,
        "pitchAlgorithm": PitchAlgorithm.Linear,
        "type": is_empty(track.soundcloud_id) ? TrackType.Default : TrackType.HLS,
        "headers": {},
        "contentType": 'audio/mp4',
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    };
}

let next_track_into_queue_mutex = false;
let previous_next_mutex = false;
let initial_playback_track_changed_mutex = false;
let changed_mutex = false;
let updated_metadata_mutex = false;

export async function track_player_previous(){
    if (previous_next_mutex) return;
    try {
        previous_next_mutex = true;
        const active_index = await TrackPlayer.getActiveTrackIndex();
        if (active_index === undefined) return;
        if (GLOBALS.global_var.playing_tracks[active_index - 1].playback!.successful === false) {
            await TrackPlayer.skipToPrevious();
            await TrackPlayer.skipToPrevious();
        }
        else await TrackPlayer.skipToPrevious();
        previous_next_mutex = false;
    } catch (error) { }
}

export async function track_player_next(){
    if (previous_next_mutex) return;
    try {
        const active_index = await TrackPlayer.getActiveTrackIndex();
        if (active_index === undefined) return;
        if (active_index + 1 >= GLOBALS.global_var.playing_tracks.length) {
            previous_next_mutex = false;
            return;
        }
        if (GLOBALS.global_var.playing_tracks[active_index + 1].playback!.added) {
            await TrackPlayer.skipToNext();
            previous_next_mutex = false;
            return;
        }
        next_track_into_queue_mutex = true;
        GLOBALS.global_var.playing_track_index++;
        const react_native_track = await illusive_track_to_track_player_track(GLOBALS.global_var.playing_tracks[active_index + 1]);
        if (react_native_track == null || react_native_track === 'skip') {
            //handle dat
            await TrackPlayer.add({ url: placeholder_mp3, 'title': 'NULL', 'artist': 'Sudo' }, active_index + 1);
        }
        else {
            GLOBALS.global_var.playing_tracks[active_index + 1].playback!.successful = true;
            GLOBALS.global_var.playing_tracks[active_index + 1].playback!.added = true;
            await TrackPlayer.add(react_native_track, active_index + 1);
        }
        next_track_into_queue_mutex = false;
        await TrackPlayer.skipToNext();
        previous_next_mutex = false;
    } catch (error) { }
}

export async function playback_service() {
    TrackPlayer.addEventListener(Event.RemoteDuck, async (data) => {

    });
    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (data) => {
        try {
            updated_metadata_mutex = false;
            if (!initial_playback_track_changed_mutex && !changed_mutex) {
                changed_mutex = true;

                if (!GLOBALS.global_var.playing_queue.is_empty)
                    GLOBALS.global_var.playing_queue.dequeue();
                GLOBALS.global_var.playing_queue.elements = {};
                GLOBALS.global_var.playing_queue.head = 0;
                GLOBALS.global_var.playing_queue.tail = 0;
                let index = await TrackPlayer.getActiveTrackIndex() ?? 0;

                if (index != 0 && GLOBALS.global_var.playing_tracks[index].playback!.successful == false && !previous_next_mutex) {
                    await TrackPlayer.pause();
                    let new_react_native_track = await illusive_track_to_track_player_track(GLOBALS.global_var.playing_tracks[index]);
                    if (new_react_native_track == null || new_react_native_track === 'skip') {
                        await track_player_next();
                    } else {
                        GLOBALS.global_var.playing_tracks[index + 1].playback!.added = true;
                        await TrackPlayer.updateMetadataForTrack(await TrackPlayer.getActiveTrackIndex() ?? 0, new_react_native_track)
                    }
                    await TrackPlayer.play();
                }
                index = await TrackPlayer.getActiveTrackIndex() ?? 0;

                await SQLActions.insert_recently_played_track(GLOBALS.global_var.playing_tracks[index]);
            } else {
                initial_playback_track_changed_mutex = false;
            }
        } catch (error) { console.log(error); }
        changed_mutex = false;
    });
    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, async (data) => {
        try {
            const tp_track = await TrackPlayer.getTrack(data.track);
            if (tp_track === undefined) return;

            const next_track_index = data.track + 1;
            const next_track = GLOBALS.global_var.playing_tracks[next_track_index];
            const progress = await TrackPlayer.getProgress();
            if (progress.position / progress.duration >= .75 && !updated_metadata_mutex) {
                updated_metadata_mutex = true;
                const current_track = await SQLActions.track_from_uid(GLOBALS.global_var.playing_tracks[data.track].uid);
                current_track.meta!.last_played_date = new Date();
                current_track.meta!.plays++;
                await SQLActions.update_track_meta_data(current_track.uid, current_track.meta!);
            }
            if (next_track.playback!.added === false && next_track.playback!.successful === false && !next_track_into_queue_mutex) {
                next_track.playback!["added"] = true;

                previous_next_mutex = true;
                next_track_into_queue_mutex = true;

                GLOBALS.global_var.playing_track_index += 2;
                let react_native_track = await illusive_track_to_track_player_track(next_track);
                if (react_native_track === null) {
                    await TrackPlayer.add({ url: placeholder_mp3, 'title': 'NULL', 'artist': 'Sudo' }, next_track_index);
                }
                else if (react_native_track === 'skip') {
                    GLOBALS.global_var.playing_tracks.splice(next_track_index, 1);
                }
                else {
                    next_track.playback!["successful"] = true;
                    await TrackPlayer.add(react_native_track, next_track_index);
                }
                next_track_into_queue_mutex = false;
                previous_next_mutex = false;
            }
        } catch (error) { }
    });
    TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
        await track_player_previous();
    });
    TrackPlayer.addEventListener(Event.RemoteNext, async () => {
        await track_player_next();
    });
    TrackPlayer.addEventListener(Event.RemotePause, async () => { await TrackPlayer.pause(); });
    TrackPlayer.addEventListener(Event.RemotePlay, async () => { await TrackPlayer.play(); });
    TrackPlayer.addEventListener(Event.RemoteSeek, async (data) => { await TrackPlayer.seekTo(data.position); });
}