import type { PromiseResult } from "@common/types";
import { generror } from "@common/utils/error_util";
import { Constants } from "./constants";
import { Illusive } from "./illusive";
import { music_service_uri_to_music_service, split_uri } from "./illusive_utilts";
import type { CompactPlaylistData, ConvertTo, MusicServiceType, Playlist, SortType, Track } from "./types";

export async function get_playlist_tracks(uuid_uri: string, global_tracks: Track[], sql_playlist_tracks: (uuid: string) => Promise<Track[]>) {
    if(uuid_uri === Constants.library_write_playlist) {
        return global_tracks.slice();
    }
    const uuidv4_regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    const is_uuid = uuidv4_regex.test(uuid_uri);
    if(is_uuid) return await sql_playlist_tracks(uuid_uri);
    const [service, id] = split_uri(uuid_uri);
    const tracks = await Illusive.music_service.get(music_service_uri_to_music_service(service))!.get_full_playlist(id);
    if("error" in tracks) return [];
    return tracks.tracks;
}
interface PlaylistDifferences {
    to_add: Track[],
    to_remove: Track[]
}
type PrimaryKeyId = string|number;
function track_prop(track: Track, primary_key: keyof Track): PrimaryKeyId {
    return track[primary_key] as PrimaryKeyId;
}
export async function playlist_tracks_differences_actions(playlist_tracks: Track[], incoming_tracks: Track[], primary_key: keyof Track){
    const differences: PlaylistDifferences = {
        to_add: [],
        to_remove: []
    };
    const playlist_tracks_primary_ids = new Set(playlist_tracks.map(t => track_prop(t, primary_key)));
    const incoming_tracks_primary_ids = new Set(incoming_tracks.map(t => track_prop(t, primary_key)));

    for(const incoming_track of incoming_tracks){
        if(playlist_tracks_primary_ids.has(track_prop(incoming_track, primary_key))) continue;
        differences.to_add.push(incoming_track);
    }
    for(const playlist_track of playlist_tracks){
        if(incoming_tracks_primary_ids.has(track_prop(playlist_track, primary_key))) continue;
        differences.to_remove.push(playlist_track);
    }
    return differences;
}
export type MutilatePlaylistMode = "ADD"|"REMOVE";
export type MutilatePlaylistResponse = PromiseResult<{ok: boolean}>;

export async function mutilate_to_service_playlist(to_service: MusicServiceType, convert_opts: ConvertTo, incoming_tracks: Track[], mode: MutilatePlaylistMode): MutilatePlaylistResponse{
    const service = Illusive.music_service.get(to_service)!;
    if("title" in convert_opts) {
        const all_playlists = await service.get_user_playlists!();
        if("error" in all_playlists) return all_playlists;
        const found_playlist = all_playlists.playlists.find(playlist => playlist.title.name === convert_opts.title);
        if(found_playlist !== undefined){
            if(found_playlist.title.uri === undefined) return generror("Unable to find playlist title uri", {to_service, convert_opts, mode});
            const [, playlist_id] = split_uri(found_playlist.title.uri!);
            if(mode === "ADD") return { ok: await service.add_tracks_to_playlist!(incoming_tracks, playlist_id)};
            if(mode === "REMOVE") return { ok: await service.delete_tracks_from_playlist!(incoming_tracks, playlist_id)};
        }
        const [, playlist_id] = split_uri(await service.create_playlist!(convert_opts.title));
        return {ok: await service.add_tracks_to_playlist!(incoming_tracks, playlist_id)};
    }
    const [_, playlist_id] = split_uri(convert_opts.uuid_uri);
    if(mode === "ADD") return {ok: await service.add_tracks_to_playlist!(incoming_tracks, playlist_id)};
    else if(mode === "REMOVE") return {ok: await service.delete_tracks_from_playlist!(incoming_tracks, playlist_id)};
    return generror("Unknown Mutilate Mode", {to_service, convert_opts, mode});
}

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
    for(const playlist of playlists) {
        if(playlist.pinned)
            ordered_playlists.unshift(playlist);
        else
            ordered_playlists.push(playlist);
    }
    return ordered_playlists;
}

export function sort_playlists(playlists: Playlist[]) {
    const ordered_playlists: Playlist[] = [];
    for(const playlist of playlists) {
        if(playlist.pinned)
            ordered_playlists.unshift(playlist);
        else
            ordered_playlists.push(playlist);
    }
    return ordered_playlists;
}