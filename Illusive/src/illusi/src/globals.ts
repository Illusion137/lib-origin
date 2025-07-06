import { TimedCache } from "../../../../origin/src/utils/types";
import { Constants } from "../../constants";
import { Prefs } from "../../prefs";
import { BottomAlertType, Downloading, DownloadTrackResult, HexColor, MusicServiceArtist, NamedUUID, Playlist, SetState, Track } from "../../types";

export const downloading: Downloading[] = [];

export const global_var = {
    sql_tracks: [] as Track[],
    is_playing: false,
    playing_tracks: [] as Track[],
    playing_track_index: 0,
    past_playing_tracks: [] as Track[],
    past_track_index: 0,
    playing_queue: [] as string[],
    can_play_again_mutex: false,
    play_tracks: (first_track: Track, tracks: Track[], playlist_name: string) => {first_track; tracks; playlist_name;},
    download_track: async(track: Track, redownload?: boolean, progress_updater?: SetState, start_download?: SetState, set_finished_downloaded?: SetState): Promise<DownloadTrackResult> => {track;redownload;progress_updater;start_download;set_finished_downloaded; return {} as any;},
    playlist_cache: new TimedCache<string, {tracks: Track[], playlist_data: Playlist & {creator?: NamedUUID[]}, continuation?: unknown}>(Constants.playlist_cache_duration_seconds * 1000),
    artist_cache: new TimedCache<string, {artist_data: MusicServiceArtist}>(Constants.playlist_cache_duration_seconds * 1000),
    set_theme: (_: Prefs.Theme) => {return},
    selected_playlists_uuids: new Set<string>(),
    bottom_alert: (text: string, type: BottomAlertType) => {text; type;},
    tint_table: new Map<Track['uid'], HexColor>()
};