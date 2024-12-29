import { Playlist, SortType, Track } from "../../types";

export function sort_playlist_tracks(sort_mode: SortType, tracks: Track[]): Track[] {
    switch(sort_mode) {
        case undefined:
        case "OLDEST":       return tracks;
        case "NEWEST":       return tracks.slice().reverse();
        case "ALPHABETICAL": return tracks.sort((a, b) => a.title.localeCompare(b.title) );
        default: return tracks;
    }
}

export function sort_playlists(playlists: Playlist[]) {
    const ordered_playlists: Playlist[] = [];
    for(let i = 0; i < playlists.length; i++) {
        if(playlists[i].pinned)
            ordered_playlists.unshift(playlists[i]);
        else
            ordered_playlists.push(playlists[i]);
    }
    return ordered_playlists;
}