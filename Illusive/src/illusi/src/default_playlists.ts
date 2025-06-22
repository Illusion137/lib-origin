import { is_empty } from '../../../../origin/src/utils/util';
import { Prefs } from '../../prefs';
import { CompactPlaylistData, DefaultPlaylist, ResolvedDefaultPlaylist } from "../../types";
import * as GLOBALS from './globals';
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
        name: "Past Queue", check_existing_tracks: true, force_order: true, track_function: (async () => {
            const tracks = GLOBALS.global_var.past_playing_tracks;
            return tracks;
        }), four_track_function: (async () => {
            return GLOBALS.global_var.past_playing_tracks.slice(0, 4);
        })
    },
    {
        name: "Recently Played", check_existing_tracks: true, track_function: (async () => {
            const tracks = await SQLRecentlyPlayed.recently_played_tracks();
            return tracks;
        }), four_track_function: (async () => {
            return await SQLRecentlyPlayed.recently_played_tracks(4);
        })
    },
    {
        name: "Most Played", track_function: (async () => {
            const default_playlist_max_size = Prefs.get_pref('default_playlist_max_size');
            const tracks = GLOBALS.global_var.sql_tracks.filter(track => (track.meta?.plays ?? 0) !== 0).sort((a, b) => b.meta!.plays - a.meta!.plays).slice(0, default_playlist_max_size);
            return tracks;
        }), four_track_function: (async () => {
            return GLOBALS.global_var.sql_tracks.filter(track => (track.meta?.plays ?? 0) !== 0).sort((a, b) => b.meta!.plays - a.meta!.plays).slice(0, 4);
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
        name: "Formerly Played", track_function: (async () => {
            const default_playlist_max_size = Prefs.get_pref('default_playlist_max_size');
            const tracks = GLOBALS.global_var.sql_tracks.slice().sort((a, b) => new Date(a.meta!.last_played_date).getTime() - new Date(b.meta!.last_played_date).getTime()).slice(0, default_playlist_max_size);
            return tracks;
        }), four_track_function: (async () => {
            return GLOBALS.global_var.sql_tracks.slice().sort((a, b) => new Date(a.meta!.last_played_date).getTime() - new Date(b.meta!.last_played_date).getTime()).slice(0, 4);;
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
        const tracks = await default_playlist.track_function();
        illusi_playlists.push({
            title: default_playlist.name,
	        check_existing_tracks: default_playlist.name === "Recently Played" || default_playlist.name === "Past Queue",
            four_track: tracks.slice(0, 4),
            track_count: tracks.length,
            track_callback: default_playlist.track_function,
            type: "PLAYLIST"
        })
    }
    return illusi_playlists;
}

export function empty_resolved_default_playlists(): ResolvedDefaultPlaylist[] {
    return default_playlists.map((p) => {
        return {
            name: p.name,
            force_order: p.force_order,
            check_existing_tracks: p.check_existing_tracks,
            four_tracks: []
        };
    });
}

export async function resolved_default_playlists(): Promise<ResolvedDefaultPlaylist[]> {
    return await Promise.all(default_playlists.map(async(p) => {
        return {
            name: p.name,
            force_order: p.force_order,
            check_existing_tracks: p.check_existing_tracks,
            four_tracks: await p.four_track_function()
        };
    }));
}