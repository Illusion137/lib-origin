import * as SQLActions from './sql_actions';
import * as GLOBALS from './globals';
import { CompactPlaylistData, DefaultPlaylist } from "../../types";
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
        const tracks = [...await SQLActions.recently_played_tracks()].reverse();
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

export async function default_compact_playlists(){
    const illusi_playlists: CompactPlaylistData[] = [];
    const library_four_track = GLOBALS.global_var.sql_tracks.slice(0,4);
    illusi_playlists.push({
        "title": "My Library",
        "four_track": library_four_track,
        "track_count": GLOBALS.global_var.sql_tracks.length,
        "track_callback": async() => { return GLOBALS.global_var.sql_tracks; },
        "type": "LIBRARY"
    })
    for(const default_playlist of default_playlists){
        if(default_playlist.name === "Recently Played") continue;
        const tracks = await default_playlist.track_function();
        illusi_playlists.push({
            "title": default_playlist.name,
            "four_track": tracks.slice(0, 4),
            "track_count": tracks.length,
            "track_callback": default_playlist.track_function,
            "type": "PLAYLIST"
        })
    }
    return illusi_playlists;
}

export async function compact_playlists(){
    const playlists: CompactPlaylistData[] = [];
    for(const playlist of await SQLActions.all_playlists_data()){
        playlists.push({
            "title": playlist.title,
            "four_track": playlist.visual_data!.four_track!,
            "track_count": playlist.visual_data!.track_count!,
            "track_callback": async() => { return await SQLActions.playlist_tracks(playlist.uuid) },
            "type": "PLAYLIST"
        })
    }
    return playlists;
}