import type { ConvertTo, MusicServiceType, Track } from "./types";
import { music_service_track_primary_key } from "./illusive_utils";
import { Illusive } from "./illusive";
import { SQLPlaylists } from '@illusive/sql/sql_playlists';
import { mutilate_to_service_playlist, playlist_tracks_differences_actions, type MutilatePlaylistMode, type MutilatePlaylistResponse } from "./playlist_utils";
import { SQLTracks } from "@illusive/sql/sql_tracks";
import { Prefs } from "@illusive/prefs";
import { Wifi } from "@illusive/illusi/src/wifi_utils";
import { sample_tracks_meta, sample_tracks_service, speed_sample_unavailable_tracks } from "@illusive/sampler";

export async function mutilate_to_illusi_playlist(convert_opts: ConvertTo, incoming_tracks: Track[], mode: MutilatePlaylistMode): MutilatePlaylistResponse {
    const track_uids = incoming_tracks.map(({ uid }) => uid);

    if (mode === "ADD") {
        const existing_track_uids = (await Promise.all(incoming_tracks.map(async (track) => ({ track, exists: await SQLTracks.track_uid_exists(track) }))))
            .filter(p => p.exists)
            .map(p => p.track.uid);

        if ("title" in convert_opts) {
            const all_playlists = await SQLPlaylists.all_playlists_data();
            const found_playlist = all_playlists.find(playlist => playlist.title === convert_opts.title);
            const playlist_uuid = found_playlist?.uuid ?? await SQLPlaylists.create_playlist(convert_opts.title);
            await SQLPlaylists.insert_all_tracks_playlist(existing_track_uids.map(track_uid => ({ uuid: playlist_uuid, track_uid })));
        } else {
            await SQLPlaylists.insert_all_tracks_playlist(existing_track_uids.map(track_uid => ({ uuid: convert_opts.uuid_uri, track_uid })));
        }
    } else { // REMOVE
        if ("title" in convert_opts) {
            const all_playlists = await SQLPlaylists.all_playlists_data();
            const found_playlist = all_playlists.find(playlist => playlist.title === convert_opts.title);
            if(found_playlist) {
                await SQLPlaylists.delete_all_tracks_playlist(track_uids.map(track_uid => ({ uuid: found_playlist.uuid, track_uid })));
            }
        } else {
            await SQLPlaylists.delete_all_tracks_playlist(track_uids.map(track_uid => ({ uuid: convert_opts.uuid_uri, track_uid })));
        }
    }
    
    return { ok: true };
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
            await sample_tracks_meta(incoming_tracks);
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
    
    if(opts.full_sample === "SPEED_SAMPLE") incoming_tracks = await sample_tracks_service(incoming_tracks, to_service);
    
    if(to_service === "YouTube" || to_service === "YouTube Music") {
        await speed_sample_unavailable_tracks(incoming_tracks, opts.full_sample === "SUPER_SPEED_SAMPLE"); 
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