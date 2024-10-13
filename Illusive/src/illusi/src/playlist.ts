import { Playlist, Track } from "../../types";
import { default_playlists } from "./default_playlists";

export function sort_playlist_tracks(playlist: Playlist, tracks: Track[]): Track[]{
    switch(playlist.sort){
        case undefined:
        case "OLDEST":       return tracks;
        case "NEWEST":       return [...tracks].reverse();
        case "ALPHABETICAL": return tracks.sort((a, b) => a.title.localeCompare(b.title) );
        default: return [];
    }
}

export function sort_playlists(playlists: Playlist[]){
    const ordered_playlists: Playlist[] = [];
    for(let i = 0; i < playlists.length; i++){
        if(playlists[i].pinned)
            ordered_playlists.unshift(playlists[i]);
        else
            ordered_playlists.push(playlists[i]);
    }
    return ordered_playlists;
}

export async function resolved_default_playlists(){
    return await Promise.all(default_playlists.map(async(p) => {
        return {
            "name": p.name,
            "tracks": (await p.track_function()).slice(0,4)
        };
    }));
}