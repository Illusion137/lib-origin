/* eslint-disable @typescript-eslint/no-misused-promises */
import TrackPlayer, {
    AddTrack,
    AppKilledPlaybackBehavior,
    Capability,
    Event,
    PitchAlgorithm,
    RepeatMode,
    TrackType
} from 'react-native-track-player';
import { is_empty } from '../../../../origin/src/utils/util';
import { Constants } from '../../constants';
import { Illusive } from '../../illusive';
import { ISOString, Track } from '../../types';
import { alert_trackplayer_error } from './alert';
import { handle_new_track_data } from './downloader';
import * as GLOBALS from './globals';
import * as SQLBackpack from './sql/sql_backpack';
import * as SQLfs from './sql/sql_fs';
import * as SQLRecentlyPlayed from './sql/sql_recently_played';
import * as SQLTracks from './sql/sql_tracks';
import { artist_string } from '../../illusive_utilts';
import { sample } from './sampler';
// import { ffcache_yt } from './downloader';

const placeholder_mp3 = require('../../assets/placeholder.mp3');

let setup_calls = 0;
export async function setup_track_player(): Promise<boolean> {
    if(setup_calls % 2 == 1) {
        GLOBALS.global_var.past_playing_tracks = GLOBALS.global_var.playing_tracks;
        let index = 0;
        try {
            index = await TrackPlayer.getActiveTrackIndex() ?? 0;
        } catch (error) {}
        GLOBALS.global_var.past_track_index = index;
    }
    setup_calls++;
    try {
        await TrackPlayer.getActiveTrackIndex();
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
    const url_data = await Illusive.get_download_url(SQLfs.document_directory(""), track, "18");
    if ("error" in url_data) {
        if (url_data.error.message.includes("Video unavailable"))
            await SQLBackpack.add_to_backpack(track.uid);
        return 'skip';
    }
    const nt_response = await handle_new_track_data(track, url_data);
    if(!("error" in nt_response)) track = nt_response;
    // if(url_data.url.includes("googlevideo.com")){}
        // url_data.url = await ffcache_yt(url_data.url, track);
    return {
        url: url_data.url,
        title: track.title,
        artist: artist_string(track),
        album: track.album?.name,
        duration: track.duration,
        artwork: typeof (track.playback!.artwork) === "number" ? track.playback!.artwork as unknown as string : track.playback!.artwork.uri,
        pitchAlgorithm: PitchAlgorithm.Linear,
        type: is_empty(track.soundcloud_id) ? TrackType.Default : TrackType.HLS,
        headers: {},
        contentType: 'audio/mp4',
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    };
}

let updated_metadata_mutex = false;

export async function track_player_previous() {
    try {
        const progress = await TrackPlayer.getProgress();
        if((progress.position / progress.duration) >= Constants.previous_restart_threshold) {
            const track_index = await TrackPlayer.getActiveTrackIndex();
            if(track_index === undefined) await TrackPlayer.seekTo(0);
            else await TrackPlayer.seekTo(GLOBALS.global_var.playing_tracks?.[track_index]?.meta?.begdur ?? 0);
            return;
        }
        await TrackPlayer.skipToPrevious();
    } catch (error) { alert_trackplayer_error({error: error as Error}); }
}

export async function track_player_next() {
    try {
        await TrackPlayer.skipToNext();
    } catch (error) { alert_trackplayer_error({error: error as Error}); }
}

export async function playback_service() {
    TrackPlayer.addEventListener(Event.RemoteDuck, async (_) => {});
    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (data) => {
        try {
            if(data.index === undefined) return;
            updated_metadata_mutex = false;
            const illusi_track = GLOBALS.global_var.playing_tracks[data.index];
            if(illusi_track.meta?.begdur !== undefined) { await TrackPlayer.seekTo(illusi_track.meta.begdur); };
            GLOBALS.global_var.playing_queue = [];

            if (data.index !== 0 && illusi_track.playback!.added === true && illusi_track.playback!.successful === false) {
                await TrackPlayer.pause();
                const new_react_native_track = await illusive_track_to_track_player_track(illusi_track);
                if (new_react_native_track === null || new_react_native_track === 'skip') {
                    await track_player_next();
                } else {
                    GLOBALS.global_var.playing_tracks[data.index + 1].playback!.added = true;
                    await TrackPlayer.updateMetadataForTrack(data.index, new_react_native_track);
                }
                await TrackPlayer.play();
            }

            await SQLRecentlyPlayed.insert_recently_played_track(GLOBALS.global_var.playing_tracks[data.index]);
            await sample();
        } catch (error) { alert_trackplayer_error({error: error as Error}); }
    });
    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, async (data) => {
        try {
            const illusi_track = GLOBALS.global_var.playing_tracks[data.track];

            if (data.position / data.duration >= .75 && !updated_metadata_mutex) {
                updated_metadata_mutex = true;
                const current_track = await SQLTracks.track_from_uid(GLOBALS.global_var.playing_tracks[data.track].uid) as Track;
                if(is_empty(current_track.meta!.plays)) current_track.meta!.plays = 0;
                current_track.meta!.last_played_date = (new Date().toISOString() as ISOString);
                current_track.meta!.plays++;
                await SQLTracks.update_track_meta_data(current_track.uid, current_track.meta!);
            }
            if(illusi_track.meta?.enddur !== undefined && data.position >= illusi_track.meta?.enddur) await track_player_next();

            const next_track_index = data.track + 1;
            const next_illusi_track = GLOBALS.global_var.playing_tracks[next_track_index];
            if (next_illusi_track === undefined) return;
            
            if (next_illusi_track.playback!.added === false && next_illusi_track.playback!.successful === false) {
                next_illusi_track.playback!.added = true;

                const react_native_track = await illusive_track_to_track_player_track(next_illusi_track);
                if (react_native_track === null) {
                    await TrackPlayer.add({ url: placeholder_mp3, title: 'NULL', artist: 'Sudo' }, next_track_index);
                } else if (react_native_track === 'skip') {
                    GLOBALS.global_var.playing_tracks.splice(next_track_index, 1);
                } else {
                    next_illusi_track.playback!.successful = true;
                    await TrackPlayer.add(react_native_track, next_track_index);
                }
            }
        } catch (error) { }
    });
    TrackPlayer.addEventListener(Event.RemotePrevious, async () => { await track_player_previous(); });
    TrackPlayer.addEventListener(Event.RemoteNext,     async () => { await track_player_next(); });
    TrackPlayer.addEventListener(Event.RemotePause,    async () => { await TrackPlayer.pause(); });
    TrackPlayer.addEventListener(Event.RemotePlay,     async () => { await TrackPlayer.play(); });
    TrackPlayer.addEventListener(Event.RemoteSeek, async (data) => { await TrackPlayer.seekTo(data.position); });
}