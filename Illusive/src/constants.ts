export namespace Constants {
    export const sqlite_directory       = "SQLite/";
    export const custom_thumbnail_archive_path = "custom_thumbnail_archive/";
    export const thumbnail_archive_path = "thumbnail_archive/";
    export const media_archive_path     = "media_archive/";
    export const lyrics_archive_path    = "lyrics_archive/";

    export const default_directories = [custom_thumbnail_archive_path, thumbnail_archive_path, media_archive_path, lyrics_archive_path];
    export const default_directories_wsql = default_directories.concat(sqlite_directory);

    export const library_write_playlist = "LIBRARY";
    export const illusi_mix_from = "Illusi Mix";
    export const download_duration_epsilon = 11;
    export const ffmpeg_retcode_success = 0;
    export const playlist_cache_duration_seconds = 60 * 30;
    export const fastpack_track_threshold = 4;
    export const safe_max_fetch_continues = 20;
    export const previous_restart_threshold = 0.10;
    export const update_track_threshold = 0.60;
    export const reset_track_mutex_threshold = 0.50;
    export const best_search_result_amount = 4;
    export const recent_search_limit = 20;
    export const soundcloud_playlist_limit = 20;
    export const spotify_playlist_limit = 100;
    export const new_releases_backdate_days = 4;
    export const new_releases_artist_watch_small_amount = 50;
    export const download_queue_max_length = 5;
    export const download_lyrics_queue_max_length = 1;
    export const tracks_per_sample = 3;
    export const long_press_delay = 250;
    export const cached_ids_duration_milliseconds = 2000;
    export const use_illusive_cahce = true;
    export const tint_opacity = 0.18;
    export const last_version_pre_1700 = "16.2.5";
    export const illusi_url_base = "illusi://";
    export const import_uri_id = "Sudo";
    export const local_illusi_uri_id = "Sumi!";
    export const trackplayer_max_retries = 3;
    export const sudo_profile_picture_index = 3;
    export const sumi_profile_picture_index = 4;
}