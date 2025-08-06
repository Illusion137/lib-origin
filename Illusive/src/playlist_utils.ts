import type { ConvertTo, MusicServiceType, Track } from "./types";
import { music_service_track_primary_key, music_service_uri_to_music_service, split_uri } from "./illusive_utilts";
import { Constants } from "./constants";
import { Illusive } from "./illusive";
import { generror } from "@common/utils/error_util";
import type { PromiseResult } from "@common/types";
import * as SQLPlaylists from '@illusive/illusi/src/sql/sql_playlists';
import { Prefs } from "./prefs";

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
export async function playlist_tracks_excluding_playlist(tracks: Track[], uuid_uri: string, global_tracks: Track[], get_sql_playlist_tracks: (uuid: string) => Promise<Track[]>) {
    const ptracks = await get_playlist_tracks(uuid_uri, global_tracks, get_sql_playlist_tracks);
    return tracks.filter((f) => {
        for(const t of ptracks)
            if(track_intersection(f, t)) false;    
        return true;
    });
}
type MutilatePlaylistMode = "ADD"|"REMOVE";
type MutilatePlaylistResponse = PromiseResult<{ok: boolean}>;
export async function mutilate_to_illusi_playlist(convert_opts: ConvertTo, incoming_tracks: Track[], mode: MutilatePlaylistMode): MutilatePlaylistResponse{
    if("title" in convert_opts) {
        const all_playlists = await SQLPlaylists.all_playlists_data();
        const found_playlist = all_playlists.find(playlist => playlist.title === convert_opts.title);
        if(found_playlist !== undefined){
            //TODO check if tracks exist in library first
            if(mode === "ADD") await SQLPlaylists.insert_all_tracks_playlist(found_playlist.uuid, incoming_tracks.map(({uid}) => uid));
            if(mode === "REMOVE") await SQLPlaylists.delete_all_tracks_playlist(found_playlist.uuid, incoming_tracks.map(({uid}) => uid));
            return {ok: true};
        }
        const playlist_uuid = await SQLPlaylists.create_playlist(convert_opts.title);
        await SQLPlaylists.insert_all_tracks_playlist(playlist_uuid, incoming_tracks.map(({uid}) => uid));
        return {ok: true};
    } else {
        if(mode === "ADD") await SQLPlaylists.insert_all_tracks_playlist(convert_opts.uuid_uri, incoming_tracks.map(({uid}) => uid)); 
        if(mode === "REMOVE") await SQLPlaylists.delete_all_tracks_playlist(convert_opts.uuid_uri, incoming_tracks.map(({uid}) => uid)); 
        return {ok: true};
    }
}
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
export async function mutilate_playlist(to_service: MusicServiceType, convert_opts: ConvertTo, incoming_tracks: Track[], mode: MutilatePlaylistMode){
    if(to_service === "Illusi") return mutilate_to_illusi_playlist(convert_opts, incoming_tracks, mode);
    else return mutilate_to_service_playlist(to_service, convert_opts, incoming_tracks, mode);
}

async function playlist_convert_divide_and_conquer(to: MusicServiceType, convert_to: ConvertTo, incoming_tracks: Track[], mode: MutilatePlaylistMode, depth: number): Promise<boolean>{
    if(depth >= 16) return false;
    if(incoming_tracks.length === 0) return true;
    if(incoming_tracks.length === 1) {
        const status = await mutilate_playlist(to, convert_to, incoming_tracks, mode);
        if(!("error" in status) && !status.ok){
            // TODO Maybe sample
            // await sample_tracks_meta(from_tracks);
        }
        return true;
    }
    const conquer = await mutilate_playlist(to, convert_to, incoming_tracks, mode);
    if(!("error" in conquer) && conquer.ok) return true;
    const left_conquer = await playlist_convert_divide_and_conquer(to, convert_to, incoming_tracks.slice(0, incoming_tracks.length / 2), mode, depth + 1);
    const right_conquer = await playlist_convert_divide_and_conquer(to, convert_to, incoming_tracks.slice(incoming_tracks.length / 2), mode, depth + 1);
    return left_conquer && right_conquer;
}

interface ConvertPlaylistOpts {
    convert_opts: ConvertTo;
    full_sample: "NONE"|"SPEED_SAMPLE"|"SUPER_SPEED_SAMPLE";
    divide_and_conquer: boolean;
    check_connection: boolean;
}
export async function convert_playlist(playlist_tracks: Track[], incoming_tracks: Track[], to_service: MusicServiceType, opts: ConvertPlaylistOpts) {
    if(opts.check_connection && Prefs.get_pref("expensive_wifi_only") && !await Wifi.wifi_connected()) return {error: new Error("Unable to convert playlist due to lack of wifi connection and Preference['expensive_wifi_only']")};
    const service = Illusive.music_service.get(to_service)!;
    const to_ok = service.create_playlist !== undefined && service.add_tracks_to_playlist !== undefined;
    if(!to_ok) return {error: new Error(`Unable to create/modify playlist from ${to_service}`)};
    if(opts.full_sample !== "NONE" && service.search === undefined) return {error: new Error(`Unable to sample tracks to ${to_service}; Missing search function`)};
    //TODO SAMPLING
    // if(opts.full_sample === "SPEED_SAMPLE") from_tracks = await sample_tracks_service(from_tracks, to);
    if(to_service === "YouTube" || to_service === "YouTube Music") {
        // await speed_sample_unavailable_tracks(from_tracks); 
        incoming_tracks = incoming_tracks.filter(track => !(track.meta?.unavailable ?? false));
    }
    if(!("uuid_uri" in opts.convert_opts)){
        const status = await mutilate_playlist(to_service, opts.convert_opts, incoming_tracks, "ADD");
        return status;
    }
    const differences = await playlist_tracks_differences_actions(playlist_tracks, incoming_tracks, music_service_track_primary_key(to_service));
    if(opts.divide_and_conquer){
        const ok = 
        {ok: await playlist_convert_divide_and_conquer(to_service, opts.convert_opts, differences.to_add, "ADD", 0)}.ok && 
        {ok: await playlist_convert_divide_and_conquer(to_service, opts.convert_opts, differences.to_remove, "REMOVE", 0)}.ok;
        return {ok};
    }    
    const status_add = await mutilate_playlist(to_service, opts.convert_opts, differences.to_add, "ADD");
    const status_remove = await mutilate_playlist(to_service, opts.convert_opts, differences.to_remove, "REMOVE");
    const ok = (!("error" in status_add) && status_add.ok) && (!("error" in status_remove) && status_remove.ok);
    return {ok};
}