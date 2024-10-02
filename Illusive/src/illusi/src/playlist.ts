import { Playlist, Track } from "../../types";

export function sort_playlist_tracks(playlist: Playlist, tracks: Track[]): Track[]{
    switch(playlist.sort){
        case "OLDEST":       return tracks;
        case "NEWEST":       return [...tracks].reverse();
        case "ALPHABETICAL": return tracks.sort((a, b) => a.title.localeCompare(b.title) );
    }
}