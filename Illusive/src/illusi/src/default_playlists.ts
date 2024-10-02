import * as SQLActions from './sql_actions';
import * as GLOBALS from './globals';
import { DefaultPlaylist } from "../../types";
import { Prefs } from '../../prefs';
import { is_empty } from '../../../../origin/src/utils/util';

export const default_playlists: DefaultPlaylist[] = [
    { "name": "Recently Added", "track_function": (async() => {
        await SQLActions.fetch_track_data();
		const default_playlist_max_size = Prefs.get_pref('default_playlist_max_size');
        const tracks = [...GLOBALS.global_var.sql_tracks].reverse().slice(0, default_playlist_max_size);
        return tracks;
    }) },
    { "name": "Formerly Played", "track_function": (async() => {
        await SQLActions.fetch_track_data();
		const default_playlist_max_size = Prefs.get_pref('default_playlist_max_size');
        const tracks = [...GLOBALS.global_var.sql_tracks].sort((a,b) => a.meta!.last_played_date.getTime() - b.meta!.last_played_date.getTime()).slice(0, default_playlist_max_size);;
        return tracks;
    }) },
    { "name": "Recently Played", "track_function": (async() => {
        await SQLActions.fetch_track_data();
        const tracks = await SQLActions.recently_played_tracks();
        return tracks;
    }) },
    { "name": "Downloaded", "track_function": (async() => {
        await SQLActions.fetch_track_data();
		const default_playlist_max_size = Prefs.get_pref('default_playlist_max_size');
        const tracks = [...GLOBALS.global_var.sql_tracks].reverse().filter(track => !is_empty(track.media_uri) && is_empty(track.imported_id)).slice(0, default_playlist_max_size);
        return tracks;
    }) },
    { "name": "Imported", "track_function": (async() => {
        await SQLActions.fetch_track_data();
		const default_playlist_max_size = Prefs.get_pref('default_playlist_max_size');
        const tracks = [...GLOBALS.global_var.sql_tracks].reverse().filter(track => !is_empty(track.imported_id)).slice(0, default_playlist_max_size);
        return tracks;
    }) },
    { "name": "Most Played", "track_function": (async() => {
        await SQLActions.fetch_track_data();
		const default_playlist_max_size = Prefs.get_pref('default_playlist_max_size');
        const tracks = [...GLOBALS.global_var.sql_tracks].sort((a,b) => b.meta!.plays - a.meta!.plays).slice(0, default_playlist_max_size);
        return tracks;
    }) },
    { "name": "Least Played", "track_function": (async() => {
        await SQLActions.fetch_track_data();
		const default_playlist_max_size = Prefs.get_pref('default_playlist_max_size');
        const tracks = [...GLOBALS.global_var.sql_tracks].sort((a,b) => a.meta!.plays - b.meta!.plays).slice(0, default_playlist_max_size);
        return tracks;
    }) },
];