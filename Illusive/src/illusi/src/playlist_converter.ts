import { PromiseResult } from "../../../../origin/src/utils/types";
import { is_empty } from "../../../../origin/src/utils/util";
import { Constants } from '../../constants';
import { Illusive } from "../../illusive";
import { music_service_uri_to_music_service, split_uri } from "../../illusive_utilts";
import { Prefs } from "../../prefs";
import { ConvertTo, MusicServiceType, Track } from "../../types";
import * as GLOBALS from './globals';
import { sample_tracks_service } from './sampler';
import * as SQLPlaylists from './sql/sql_playlists';
import { Wifi } from "./wifi_utils";

interface ConvertPlaylistOpts {
    to: ConvertTo;
    full_sample: boolean;
}

export function track_intersection(f: Track, t: Track): boolean {
    if(!is_empty(f.illusi_id) && !is_empty(t.illusi_id) && f.illusi_id === t.illusi_id) return true;
    if(!is_empty(f.youtube_id) && !is_empty(t.youtube_id) && f.youtube_id === t.youtube_id) return true;
    if(!is_empty(f.youtubemusic_id) && !is_empty(t.youtubemusic_id) && f.youtubemusic_id === t.youtubemusic_id) return true;
    if(!is_empty(f.spotify_id) && !is_empty(t.spotify_id) && f.spotify_id === t.spotify_id) return true;
    if(!is_empty(f.amazonmusic_id) && !is_empty(t.amazonmusic_id) && f.amazonmusic_id === t.amazonmusic_id) return true;
    if(!is_empty(f.applemusic_id) && !is_empty(t.applemusic_id) && f.applemusic_id === t.applemusic_id) return true;
    if(!is_empty(f.soundcloud_id) && !is_empty(t.soundcloud_id) && f.soundcloud_id === t.soundcloud_id) return true;
    if(!is_empty(f.imported_id) && !is_empty(t.imported_id) && f.imported_id === t.imported_id) return true;
    return false;
}
export async function playlist_tracks(uuid_uri: string) {
    if(uuid_uri === Constants.library_write_playlist) {
        return GLOBALS.global_var.sql_tracks.slice();
    }
    const uuidv4_regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    const is_uuid = uuidv4_regex.test(uuid_uri);
    if(is_uuid) return await SQLPlaylists.playlist_tracks(uuid_uri);
    const [service, id] = split_uri(uuid_uri);
    const playlist_tracks = await Illusive.music_service.get(music_service_uri_to_music_service(service))!.get_full_playlist(id);
    if("error" in playlist_tracks) return [];
    return playlist_tracks.tracks;
}
export async function playlist_tracks_excluding_playlist(tracks: Track[], uuid_uri: string) {
    const ptracks = await playlist_tracks(uuid_uri);
    return tracks.filter((f) => {
        for(const t of ptracks)
            if(track_intersection(f, t)) false;    
        return true;
    });
}
export async function mutilate_playlist(to_service: MusicServiceType, to: ConvertTo, tracks: Track[]) {
    if("title" in to) {
        if(to_service === "Illusi") {
            const all_playlists = await SQLPlaylists.all_playlists_data()
            const found_playlist = all_playlists.find(playlist => playlist.title === to.title);
            if(found_playlist !== undefined){
                await SQLPlaylists.insert_all_tracks_playlist(found_playlist.uuid, tracks.map(({uid}) => uid));
                return {ok: true};
            }
            const playlist_uuid = await SQLPlaylists.create_playlist(to.title);
            await SQLPlaylists.insert_all_tracks_playlist(playlist_uuid, tracks.map(({uid}) => uid));
            return {ok: true};
        }
        const service = Illusive.music_service.get(to_service)!;
        const all_playlists = await service.get_user_playlists!();
        if("error" in all_playlists) return {ok: false};
        const found_playlist = all_playlists.playlists.find(playlist => playlist.title.name === to.title);
        if(found_playlist !== undefined){
            if(found_playlist.title.uri === undefined) return {ok: false};
            const [, playlist_id] = split_uri(found_playlist.title.uri!);
            return await service.add_tracks_to_playlist!(await playlist_tracks_excluding_playlist(tracks, found_playlist.title.uri!), playlist_id);
        }
        const [, playlist_id] = split_uri(await service.create_playlist!(to.title));
        return await service.add_tracks_to_playlist!(tracks, playlist_id);
    } else {
        if(to_service === "Illusi") {
            await SQLPlaylists.insert_all_tracks_playlist(to.uuid_uri, tracks.map(({uid}) => uid)); 
            return {ok: true};
        }
        const service = Illusive.music_service.get(to_service)!;
        const [_, playlist_id] = split_uri(to.uuid_uri);
        return await service.add_tracks_to_playlist!(await playlist_tracks_excluding_playlist(tracks, to.uuid_uri), playlist_id);
    }
}

export async function convert_playlist(from_tracks: Track[], to: MusicServiceType, opts: ConvertPlaylistOpts): PromiseResult<{"ok": true}> {
    if(Prefs.get_pref("expensive_wifi_only") && !await Wifi.wifi_connected()) return {error: new Error("Unable to convert playlist due to lack of wifi connection and Preference['expensive_wifi_only']")};
    const to_service = Illusive.music_service.get(to)!;
    const to_ok = to_service.create_playlist !== undefined && to_service.add_tracks_to_playlist !== undefined;
    if(!to_ok) return {error: new Error(`Unable to create/modify playlist from ${to}`)};
    if(opts.full_sample && to_service.search === undefined) return {error: new Error(`Unable to sample tracks to ${to}; Missing search function`)};
    if(opts.full_sample) from_tracks = await sample_tracks_service(from_tracks, to);
    await mutilate_playlist(to, opts.to, from_tracks);
    return {ok: true};
}

// export async function playlist_tracks_test(uuid_uri: string) {
//     const [service, id] = split_uri(uuid_uri);
//     const playlist_tracks = await Illusive.music_service.get(music_service_uri_to_music_service(service))!.get_full_playlist(id);
//     if("error" in playlist_tracks) return [];
//     return playlist_tracks.tracks;
// }

// export function track_intersection_test(f: Track, t: Track): boolean {
//     if(!is_empty(f.illusi_id) && !is_empty(t.illusi_id) && f.illusi_id === t.illusi_id) return true;
//     if(!is_empty(f.youtube_id) && !is_empty(t.youtube_id) && f.youtube_id === t.youtube_id) return true;
//     if(!is_empty(f.youtubemusic_id) && !is_empty(t.youtubemusic_id) && f.youtubemusic_id === t.youtubemusic_id) return true;
//     if(!is_empty(f.spotify_id) && !is_empty(t.spotify_id) && f.spotify_id === t.spotify_id) return true;
//     if(!is_empty(f.amazonmusic_id) && !is_empty(t.amazonmusic_id) && f.amazonmusic_id === t.amazonmusic_id) return true;
//     if(!is_empty(f.applemusic_id) && !is_empty(t.applemusic_id) && f.applemusic_id === t.applemusic_id) return true;
//     if(!is_empty(f.soundcloud_id) && !is_empty(t.soundcloud_id) && f.soundcloud_id === t.soundcloud_id) return true;
//     if(!is_empty(f.imported_id) && !is_empty(t.imported_id) && f.imported_id === t.imported_id) return true;
//     return false;
// }
// export async function playlist_tracks_excluding_playlist_test(tracks: Track[], uuid_uri: string) {
//     const ptracks = await playlist_tracks_test(uuid_uri);
//     return tracks.filter((f) => {
//         for(const t of ptracks)
//             if(track_intersection_test(f, t)) false;    
//         return true;
//     });
// }
// export async function convert_playlist_test(from_tracks: Track[], to: MusicServiceType, opts: ConvertPlaylistOpts): PromiseResult<{"ok": true}> {
//     const service = Illusive.music_service.get(to)!;
//     if("title" in opts.to) return {error: new Error("I dont know")};
//     const [_, playlist_id] = split_uri(opts.to.uuid_uri);
//     const filtered_tracks = await playlist_tracks_excluding_playlist_test(from_tracks, opts.to.uuid_uri);
//     console.log(filtered_tracks.length)
//     console.log(playlist_id);
//     const good = await service.add_tracks_to_playlist!(filtered_tracks, playlist_id);
//     console.log(good);
//     return {ok: true};
// }