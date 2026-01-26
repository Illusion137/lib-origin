import * as Origin from '@origin/index';
import { is_empty, random_of, shuffle_array } from "@common/utils/util";
import { Illusive } from "@illusive/illusive";
import { Prefs } from "@illusive/prefs";
import type { DownloadFromIdResult, ISOString, MusicServiceType, Promises, Track, TrackMetaData } from "@illusive/types";
import { Logger } from "@illusive/illusi/src/logger";
import { alert_error } from '@illusive/illusi/src/alert';
import { Wifi } from '@illusive/illusi/src/wifi_utils';
import { Constants } from '@illusive/constants';
import { GLOBALS } from '@illusive/globals';
import { SQLTracks } from '@illusive/sql/sql_tracks';
import { track_exists } from '@illusive/illusive_utils';
import { SQLBackpack } from '@illusive/sql/sql_backpack';
import { SQLfs } from '@illusive/sql/sql_fs';
import { catch_ignore } from '@common/utils/error_util';

export async function get_proxies(sample_length: number){
    const proxies: Origin.Proxy.Proxy[] = [];
    if(Prefs.get_pref("fastpack") && sample_length > 4) {
        const proxy_list = await Origin.Proxy.get_new_proxy_list(proxy => proxy.https);
        if(!("error" in proxy_list)) proxies.push(...proxy_list);
    }
    return proxies;
}
export function loggedin_services() {
    const services: MusicServiceType[] = [];
    const entries = [...Illusive.music_service.entries()];
    for(const entry of entries)
        if(entry[1].has_credentials()) services.push(entry[0]);
    return services;
}
export function unsampled_tracks_service(service: MusicServiceType, tracks: Track[]) {
    switch(service) {
        case "YouTube Music":
        case "YouTube":      return tracks.filter(track => is_empty(track.youtube_id));
        case "Amazon Music": return tracks.filter(track => is_empty(track.amazonmusic_id));
        case "Apple Music":  return tracks.filter(track => is_empty(track.applemusic_id));
        case "SoundCloud":   return tracks.filter(track => is_empty(track.soundcloud_id));
        case "Spotify":      return tracks.filter(track => is_empty(track.spotify_id));
        case "Illusi":       return tracks.filter(track => is_empty(track.illusi_id));
        case "BandLab":      return tracks.filter(track => is_empty(track.bandlab_id));
        case "Musi":
        case "API":
        default: return [];
    }
}
export function unsampled_tracks_meta(tracks: Track[]) {
    return tracks.filter(track => (
        new Date(Date.now() - (is_empty(track.meta?.last_sampled_date) ? 
            new Date(0)
                : new Date(track.meta!.last_sampled_date!)).getTime()).getTime() > (30 * 24 * 60 * 60 * 1000)
    ));
}
export async function next_sample_tracks_service(ingore_services: MusicServiceType[] = []) {
    const possible_services = loggedin_services().filter(item => ingore_services.includes(item));
    if(possible_services.length === 0) return [];
    const service = random_of(possible_services);
    const tracks: Track[] = unsampled_tracks_service(service, GLOBALS.global_var.sql_tracks);
    if(tracks.length === 0) return next_sample_tracks_service(ingore_services.concat([service]));
    return shuffle_array(tracks).slice(0, Constants.tracks_per_sample);
}
export async function next_sample_tracks_meta() {
    // if(GLOBALS.global_var.sql_tracks.some(track => !is_empty(track.youtube_id) && track.artists[0].uri === null)){
    //     const unsampled = GLOBALS.global_var.sql_tracks.filter(track => !is_empty(track.youtube_id) && track.artists[0].uri === null);
    //     return shuffle_array(unsampled).slice(0, Constants.tracks_per_sample);
    // }
    const tracks: Track[] = unsampled_tracks_meta(GLOBALS.global_var.sql_tracks);
    return shuffle_array(tracks).slice(0, Constants.tracks_per_sample);
}
export async function sample_tracks_service(sample_tracks: Track[], to: MusicServiceType) {
    const proxies = await get_proxies(sample_tracks.length);
    const updated_tracks: Track[] = [];
    for(const track of sample_tracks) {
        if(track.imported_id) continue;
        const conversion_track = await Illusive.convert_track(track, {to_music_service: to, proxies, possible_services: [to]});
        if("error" in conversion_track) { 
            Logger.log_error(conversion_track).catch(catch_ignore); 
            continue;
        }
        updated_tracks.push(await SQLTracks.update_track_with_new_track_data(track, conversion_track.track!));
    }
    return updated_tracks;
}

export async function handle_track_meta_data(track: Track, metadata: undefined|DownloadFromIdResult['metadata'], unavailable: boolean) {
    if(!track_exists(track, GLOBALS.global_var.sql_tracks)) return;
    const new_metadata: TrackMetaData = {
        ...(!is_empty(track.meta) ? track.meta! : ({
            plays: 0,
            added_date: new Date().toISOString() as ISOString,
            last_played_date: new Date().toISOString() as ISOString
        })),
        ...(is_empty(metadata) ? {} : {
            chapters: metadata!.chapters,
            songs: metadata!.songs,
        }),
        unavailable: unavailable,
        last_sampled_date: new Date().toISOString() as ISOString
    }
    track.meta = new_metadata;
    await SQLTracks.update_track_meta_data(track.uid, new_metadata);
}
export async function handle_incoming_youtube_music_track_data(track: Track, new_track: Track) {
    if(!track_exists(track, GLOBALS.global_var.sql_tracks)) return;
    track.alt_title = track.title;
    track.title = new_track.title;
    track.artists = new_track.artists;
    track.album = new_track.album;
    track.explicit = new_track.explicit;
    track.youtubemusic_id = new_track.youtubemusic_id;
    await SQLTracks.update_track(track.uid, track);
}
export async function sample_tracks_meta(sample_tracks: Track[]){
    for(const track of sample_tracks) {
        try {            
            if(track.imported_id) continue;
            const download_uri = await Illusive.get_download_url(SQLfs.document_directory(""), track, "highestaudio", true);
            let unavailable = false;
            if ("error" in download_uri && download_uri.error.message.toLowerCase().includes("unavailable")) {
                if (is_empty(track.media_uri)){
                    await SQLBackpack.add_to_backpack(track.uid);
                    alert_error(`Sampler found track that is now unavailable and is now put in your backpack: \n${JSON.stringify({title: track.title, uid: track.uid})}`);
                }
                else unavailable = true;
            }
            if("url" in download_uri && download_uri.url.includes("file://")) {
                continue;
            }
            if("metadata" in download_uri) {
                await handle_track_meta_data(track, download_uri.metadata, unavailable);
            }
            (SQLTracks.add_playback_saved_data_to_track(track));
        } catch (error: any) {
            Logger.log_error(error).catch(catch_ignore);
            continue;
        }
    }
}

async function super_speed_sample_unavailable_tracks(tracks: Track[]) {
    return await Promise.all(tracks.map(async(track) => {
        if(is_empty(track.youtube_id)) return;
        const thumbnail_uri = Illusive.get_youtube_lowest_quality_thumbnail_uri(track.youtube_id!);
        const response = await fetch(thumbnail_uri);
        if(!response.ok){
            if(is_empty(track.media_uri)){
                await SQLBackpack.add_to_backpack(track.uid);
                alert_error(`Quick-Sampler found track that is now unavailable and is now put in your backpack: \n${JSON.stringify({title: track.title, uid: track.uid})}`);
            }
            else {
                const new_metadata: TrackMetaData = {
                    ...track.meta!,
                    unavailable: true
                }
                track.meta = new_metadata;
                await SQLTracks.update_track_meta_data(track.uid, new_metadata);
            }
        }
    }));
}
export async function speed_sample_unavailable_tracks(tracks: Track[], super_speed = false){
    if(super_speed) { 
        await super_speed_sample_unavailable_tracks(tracks);
        return;
    }
    const promises: Promises = [];
    for(const track of tracks){
        if(is_empty(track.youtube_id)) continue;
        const thumbnail_uri = Illusive.get_youtube_lowest_quality_thumbnail_uri(track.youtube_id!);
        const response = await fetch(thumbnail_uri);
        if(!response.ok){
            if(is_empty(track.media_uri)){
                promises.push(SQLBackpack.add_to_backpack(track.uid));
                alert_error(`Quick-Sampler found track that is now unavailable and is now put in your backpack: \n${JSON.stringify({title: track.title, uid: track.uid})}`);
            }
            else {
                const new_metadata: TrackMetaData = {
                    ...track.meta!,
                    unavailable: true
                }
                track.meta = new_metadata;
                promises.push(SQLTracks.update_track_meta_data(track.uid, new_metadata));
            }
        }
    }
    await Promise.all(promises);
}

export async function sample(){
    if(!Prefs.get_pref('enable_sampler')) return;
    if(Prefs.get_pref('expensive_wifi_only') && !await Wifi.wifi_connected()) return;
    // const rand = random_of([false, true]);
    // if(rand === true){
    await sample_tracks_meta(await next_sample_tracks_meta());
    // }
    // else {
        // await sample_tracks_service(await next_sample_tracks_service([]), random_of(loggedin_services()));
    // }
}

export async function mass_sample_youtube_to_youtube_music(){
    await Illusive.mass_convert_youtube_to_youtube_music(GLOBALS.global_var.sql_tracks, handle_incoming_youtube_music_track_data);
}