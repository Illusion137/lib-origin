import { reinterpret_cast } from "@common/cast";
import { TimedCache, type ResponseError } from "@common/types";
import { Constants } from "@illusive/constants";
import type { Prefs } from "@illusive/prefs";
import type { BottomAlertType, CompactPlaylist, Downloading, DownloadTrackResult, HexColor, LyricsDownloadingResult, MusicServiceArtist, NamedUUID, Playlist, SerializedCompactPlaylistData, Track } from "@illusive/types";

const downloading: Downloading[] = [];

const global_var = {
    sql_tracks: [] as Track[],
    is_playing: false,
    playing_tracks: [] as Track[],
    playing_track_index: 0,
    past_playing_tracks: [] as Track[],
    past_track_index: 0,
    playing_queue: [] as string[],
    can_play_again_mutex: false,
    kill_audioplayer: () => {return},
    play_tracks: (first_track: Track, tracks: Track[], playlist_name: string) => {first_track; tracks; playlist_name;},
    download_track: async(track: Track, redownload?: boolean): Promise<DownloadTrackResult> => {track; redownload; return "GOOD";},
    download_track_lyrics: async(track: Track): Promise<LyricsDownloadingResult> => {track; return reinterpret_cast<LyricsDownloadingResult>("GOOD");},
    playlist_cache: new TimedCache<string, {tracks: Track[], playlist_data: Playlist & {creator?: NamedUUID[]}, continuation?: unknown}>(Constants.playlist_cache_duration_seconds * 1000),
    compact_playlist_cache: new TimedCache<string, CompactPlaylist>(Constants.playlist_cache_duration_seconds * 1000),
    serialized_playlist_cache: new TimedCache<string, SerializedCompactPlaylistData>(5 * 1000),
    artist_cache: new TimedCache<string, {artist_data: MusicServiceArtist}>(Constants.playlist_cache_duration_seconds * 1000),
    set_theme: (_: Prefs.Theme) => {return},
    selected_playlists_uuids: new Set<string>(),
    bottom_alert: (text: string, type: BottomAlertType, _?: string|ResponseError) => {text; type; },
    tint_table: new Map<Track['uid'], HexColor>()
};

export const GLOBALS = { global_var, downloading };