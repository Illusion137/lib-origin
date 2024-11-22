import { is_empty } from '../../../../origin/src/utils/util';
import { Prefs } from '../../prefs';
import { CompactPlaylistData, DefaultPlaylist } from "../../types";
import * as GLOBALS from './globals';
import * as SQLPlaylists from './sql/sql_playlists';
import * as SQLRecentlyPlayed from './sql/sql_recently_played';

// call await SQLTracks.fetch_track_data(); before track_function prolly
export const default_playlists: DefaultPlaylist[] = [
    {
        name: "Recently Added", track_function: (async () => {
            const default_playlist_max_size = Prefs.get_pref('default_playlist_max_size');
            const tracks = GLOBALS.global_var.sql_tracks.slice(-default_playlist_max_size).reverse();
            return tracks;
        }), four_track_function: (async () => {
            return GLOBALS.global_var.sql_tracks.slice(-4).reverse();
        })
    },
    {
        name: "Past Queue", force_order: true, track_function: (async () => {
            const tracks = GLOBALS.global_var.past_playing_tracks;
            return tracks;
        }), four_track_function: (async () => {
            return GLOBALS.global_var.past_playing_tracks.slice(0, 4);
        })
    },
    {
        name: "Recently Played", track_function: (async () => {
            const tracks = await SQLRecentlyPlayed.recently_played_tracks();
            return tracks;
        }), four_track_function: (async () => {
            return await SQLRecentlyPlayed.recently_played_tracks(4);
        })
    },
    {
        name: "Formerly Played", track_function: (async () => {
            const default_playlist_max_size = Prefs.get_pref('default_playlist_max_size');
            const tracks = GLOBALS.global_var.sql_tracks.slice().sort((a, b) => new Date(a.meta!.last_played_date).getTime() - new Date(b.meta!.last_played_date).getTime()).slice(0, default_playlist_max_size);
            return tracks;
        }), four_track_function: (async () => {
            return GLOBALS.global_var.sql_tracks.slice().sort((a, b) => new Date(a.meta!.last_played_date).getTime() - new Date(b.meta!.last_played_date).getTime()).slice(0, 4);;
        })
    },
    {
        name: "Imported", track_function: (async () => {
            const default_playlist_max_size = Prefs.get_pref('default_playlist_max_size');
            const tracks = GLOBALS.global_var.sql_tracks.filter(track => !is_empty(track.imported_id)).slice(-default_playlist_max_size).reverse();
            return tracks;
        }), four_track_function: (async () => {
            return GLOBALS.global_var.sql_tracks.filter(track => !is_empty(track.imported_id)).slice(-4).reverse();
        })
    },
    {
        name: "Downloaded", track_function: (async () => {
            const default_playlist_max_size = Prefs.get_pref('default_playlist_max_size');
            const tracks = GLOBALS.global_var.sql_tracks.filter(track => !is_empty(track.media_uri)).slice(-default_playlist_max_size).reverse();
            return tracks;
        }), four_track_function: (async () => {
            return GLOBALS.global_var.sql_tracks.filter(track => !is_empty(track.media_uri)).slice(-4).reverse();
        })
    },
    {
        name: "Most Played", track_function: (async () => {
            const default_playlist_max_size = Prefs.get_pref('default_playlist_max_size');
            const tracks = GLOBALS.global_var.sql_tracks.slice().sort((a, b) => b.meta!.plays - a.meta!.plays).slice(0, default_playlist_max_size);
            return tracks;
        }), four_track_function: (async () => {
            return GLOBALS.global_var.sql_tracks.slice().sort((a, b) => b.meta!.plays - a.meta!.plays).slice(0, 4);
        })
    },
    {
        name: "Least Played", track_function: (async () => {
            const default_playlist_max_size = Prefs.get_pref('default_playlist_max_size');
            const tracks = GLOBALS.global_var.sql_tracks.slice().sort((a, b) => a.meta!.plays - b.meta!.plays).slice(0, default_playlist_max_size);
            return tracks;
        }), four_track_function: (async () => {
            return GLOBALS.global_var.sql_tracks.slice().sort((a, b) => a.meta!.plays - b.meta!.plays).slice(0, 4);
        })
    },
];

export async function default_compact_playlists() {
    const illusi_playlists: CompactPlaylistData[] = [];
    const library_four_track = GLOBALS.global_var.sql_tracks.slice(0, 4);
    illusi_playlists.push({
        title: "My Library",
        four_track: library_four_track,
        track_count: GLOBALS.global_var.sql_tracks.length,
        track_callback: async () => GLOBALS.global_var.sql_tracks,
        type: "LIBRARY"
    })
    for (const default_playlist of default_playlists) {
        if (default_playlist.name === "Recently Played") continue;
        const tracks = await default_playlist.track_function();
        illusi_playlists.push({
            title: default_playlist.name,
            four_track: tracks.slice(0, 4),
            track_count: tracks.length,
            track_callback: default_playlist.track_function,
            type: "PLAYLIST"
        })
    }
    return illusi_playlists;
}

export async function compact_playlists() {
    const playlists: CompactPlaylistData[] = [];
    for (const playlist of await SQLPlaylists.all_playlists_data()) {
        playlists.push({
            title: playlist.title,
            four_track: playlist.visual_data!.four_track!,
            track_count: playlist.visual_data!.track_count!,
            track_callback: async () => await SQLPlaylists.playlist_tracks(playlist.uuid),
            type: "PLAYLIST"
        })
    }
    return playlists;
}