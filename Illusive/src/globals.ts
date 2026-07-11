import { reinterpret_cast } from "@common/cast";
import { TimedCache, type ResponseError } from "@common/types";
import { Constants } from "@illusive/constants";
import type { Prefs } from "@illusive/prefs";
import { track_store } from "@illusive/stores/track_store";
import type { BottomAlertType, CompactPlaylist, Downloading, DownloadTrackResult, HexColor, LyricsDownloadingResult, MusicServiceArtist, NamedUUID, Playlist, SerializedCompactPlaylistData, Track } from "@illusive/types";

const downloading: Downloading[] = [];

const global_var = {
    // Backed by track_store so reads stay reactive; do not mutate the returned array
    // in place — go through SQLGlobal/track_store actions.
    get sql_tracks() { return track_store.getState().tracks; },
    set sql_tracks(tracks: Track[]) { track_store.getState().set_tracks(tracks); },
    is_playing: false,
    playing_tracks: [] as Track[],
    playing_track_index: 0,
    past_playing_tracks: [] as Track[],
    past_track_index: 0,
    playing_queue: [] as string[],
    can_play_again_mutex: false,
    kill_audioplayer: () => { return },
    open_audiobook: (uuid: string) => { uuid; },
    enhance_audiobook_cover: async (uuid: string, source_path: string): Promise<string | undefined> => { uuid; source_path; return undefined; },
    play_tracks: (first_track: Track, tracks: Track[], playlist_name: string, force_order?: boolean) => { first_track; tracks; playlist_name; force_order; },
    download_track: async (track: Track, redownload?: boolean): Promise<DownloadTrackResult> => { track; redownload; return "GOOD"; },
    download_track_lyrics: async (track: Track): Promise<LyricsDownloadingResult> => { track; return reinterpret_cast<LyricsDownloadingResult>("GOOD"); },
    playlist_cache: new TimedCache<string, { tracks: Track[], playlist_data: Playlist & { creator?: NamedUUID[] }, continuation?: unknown }>(Constants.playlist_cache_duration_seconds * 1000),
    compact_playlist_cache: new TimedCache<string, CompactPlaylist>(Constants.playlist_cache_duration_seconds * 1000),
    serialized_playlist_cache: new TimedCache<string, SerializedCompactPlaylistData>(5 * 1000),
    artist_cache: new TimedCache<string, { artist_data: MusicServiceArtist }>(Constants.playlist_cache_duration_seconds * 1000),
    set_theme: (_: Prefs.Theme) => { return },
    bottom_alert: (text: string, type: BottomAlertType, _?: string | ResponseError) => { text; type; },
    tint_table: new Map<Track['uid'], HexColor>()
};

export const GLOBALS = { global_var, downloading };