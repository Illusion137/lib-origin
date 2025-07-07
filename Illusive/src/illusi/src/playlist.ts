import type { CompactPlaylistData, Playlist, SortType, Track } from "../../types";

function date_time(date?: string): number{
    if(date) return new Date(date).getTime();
    return 0;
}

export function sort_playlist_tracks(sort_mode: SortType, tracks: Track[]): Track[] {
    switch(sort_mode) {
        case undefined:
        case "OLDEST":                  return tracks;
        case "NEWEST":                  return tracks.slice().reverse();
        case "ALPHABETICAL":            return tracks.sort((a, b) => a.title.localeCompare(b.title) );
        case "ALPHABETICAL_REVERSE":    return tracks.sort((a, b) => b.title.localeCompare(a.title) );
        case "DURATION_HILOW":          return tracks.sort((a, b) => b.duration - a.duration);
        case "DURATION_LOWHI":          return tracks.sort((a, b) => a.duration - b.duration);
        case "PLAYS_HILOW":             return tracks.sort((a, b) => (b.meta?.plays ?? 0) - (a.meta?.plays ?? 0));
        case "PLAYS_LOWHI":             return tracks.sort((a, b) => (a.meta?.plays ?? 0) - (b.meta?.plays ?? 0));
        case "VIEWS_HILOW":             return tracks.sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0));
        case "VIEWS_LOWHI":             return tracks.sort((a, b) => (a.plays ?? 0) - (b.plays ?? 0));
        case "ADDED_DATE_HILOW":        return tracks.sort((a, b) => date_time(b.meta?.added_date) - date_time(a.meta?.added_date)); 
        case "ADDED_DATE_LOWHI":        return tracks.sort((a, b) => date_time(a.meta?.added_date) - date_time(b.meta?.added_date));
        case "DOWNLOAD_DATE_HILOW":     return tracks.sort((a, b) => date_time(b.meta?.downloaded_date) - date_time(a.meta?.downloaded_date));
        case "DOWNLOAD_DATE_LOWHI":     return tracks.sort((a, b) => date_time(a.meta?.downloaded_date) - date_time(b.meta?.downloaded_date));
        case "LAST_PLAYED_DATE_HILOW":  return tracks.sort((a, b) => date_time(b.meta?.last_played_date) - date_time(a.meta?.last_played_date));
        case "LAST_PLAYED_DATE_LOWHI":  return tracks.sort((a, b) => date_time(a.meta?.last_played_date) - date_time(b.meta?.last_played_date));
        case "LAST_SAMPLED_DATE_HILOW": return tracks.sort((a, b) => date_time(b.meta?.last_sampled_date) - date_time(a.meta?.last_sampled_date));
        case "LAST_SAMPLED_DATE_LOWHI": return tracks.sort((a, b) => date_time(a.meta?.last_sampled_date) - date_time(b.meta?.last_sampled_date));
        default: return tracks;
    }
}

export function sort_compact_playlists_data(playlists: CompactPlaylistData[]) {
    const ordered_playlists: CompactPlaylistData[] = [];
    for(let i = 0; i < playlists.length; i++) {
        if(playlists[i].pinned)
            ordered_playlists.unshift(playlists[i]);
        else
            ordered_playlists.push(playlists[i]);
    }
    return ordered_playlists;
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