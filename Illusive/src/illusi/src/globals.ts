import { Constants } from "../../constants";
import { Prefs } from "../../prefs";
import { Downloading, DownloadTrackResult, NamedUUID, Playlist, PQueue, SetState, TimedCache, Track } from "../../types";

export const downloading: Downloading[] = [];

export const global_var = {
    sql_tracks: [] as Track[],
    is_playing: false,
    playing_tracks: [] as Track[],
    playing_track_index: 0,
    past_playing_tracks: [] as Track[],
    past_track_index: 0,
    playing_queue: new PQueue<Track>(),
    can_play_again_mutex: false,
    play_tracks: (first_track: Track, tracks: Track[], playlist_name: string) => {first_track; tracks; playlist_name;},
    download_track: async(track: Track, progress_updater?: SetState, start_download?: SetState, set_finished_downloaded?: SetState): Promise<DownloadTrackResult|void> => {track;progress_updater;start_download;set_finished_downloaded;},
    playlist_cache: new TimedCache<string, {tracks: Track[], playlist_data: Playlist & {creator?: NamedUUID[]}, continuation?: unknown}>(Constants.playlist_cache_duration_seconds * 1000),
    set_theme: (_: Prefs.Theme) => {}
};