import { useState } from "react";
import { Downloading, DownloadTrackResult, NamedUUID, Playlist, PQueue, SetState, TimedCache, Track } from "../../types";

export let downloading: Downloading[] = [];

export let global_var = {
    "sql_tracks": [] as Track[],
    "is_playing": false,
    "playing_tracks": [] as Track[],
    "playing_track_index": 0,
    "playing_queue": new PQueue<Track>(),
    "can_play_again_mutex": false,
    "play_tracks": (first_track: Track, tracks: Track[], playlist_name: string) => {},
    "download_track": async(track: Track, progress_updater?: SetState, start_download?: SetState, set_finished_downloaded?: SetState): Promise<DownloadTrackResult|void> => {},
    "playlist_cache": new TimedCache<string, {tracks: Track[], playlist_data: Playlist & {creator?: NamedUUID[]}, continuation?: unknown}>(30 * 1000)
};