import * as Origin from '../../../../origin/src/index';
import { is_empty } from "../../../../origin/src/utils/util";
import { Illusive } from "../../illusive";
import { random_of, shuffle_array } from "../../illusive_utilts";
import { Prefs } from "../../prefs";
import { DownloadFromIdResult, ISOString, MusicServiceType, Promises, Track, TrackMetaData } from "../../types";
import * as GLOBALS from './globals';
import { Logger } from "./logger";
import * as SQLTracks from './sql/sql_tracks';
import * as SQLBackpack from './sql/sql_backpack';
import * as SQLfs from './sql/sql_fs';
import { alert_error } from './alert';
import { Wifi } from './wifi_utils';

export async function get_proxies(sample_length: number){
    const proxies: Origin.Proxy.Proxy[] = [];
    if(Prefs.get_pref("fastpack") && sample_length > 4) {
        const proxy_list = await Origin.Proxy.get_proxy_list();
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
        default: return [];
    }
}
export function unsampled_tracks_meta(tracks: Track[]) {
    return tracks.filter(track => (
        new Date(new Date().getTime() - (is_empty(track.meta?.last_sampled_date) ? 
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
    return shuffle_array(tracks).slice(0, Prefs.get_pref('tracks_per_sample'));
}
export async function next_sample_tracks_meta() {
    // if(GLOBALS.global_var.sql_tracks.some(track => !is_empty(track.youtube_id) && track.artists[0].uri === null)){
    //     const unsampled = GLOBALS.global_var.sql_tracks.filter(track => !is_empty(track.youtube_id) && track.artists[0].uri === null);
    //     return shuffle_array(unsampled).slice(0, Prefs.get_pref('tracks_per_sample'));
    // }
    const tracks: Track[] = unsampled_tracks_meta(GLOBALS.global_var.sql_tracks);
    return shuffle_array(tracks).slice(0, Prefs.get_pref('tracks_per_sample'));
}
export async function sample_tracks_service(sample_tracks: Track[], to: MusicServiceType) {
    const proxies = await get_proxies(sample_tracks.length);
    const updated_tracks: Track[] = [];
    for(const track of sample_tracks) {
        if(track.imported_id) continue;
        const conversion_track = await Illusive.convert_track(track, {to_music_service: to, proxies, possible_services: [to]});
        if("error" in conversion_track) { 
            Logger.log_error(conversion_track).catch(e => e); 
            continue;
        }
        updated_tracks.push(await SQLTracks.update_track_with_new_track_data(track, conversion_track.track!));
    }
    return updated_tracks;
}

export async function handle_track_meta_data(track: Track, metadata: undefined|DownloadFromIdResult['metadata'], unavailable: boolean) {
    if(!await SQLTracks.track_exists(track)) return;
    const new_metadata: TrackMetaData = {
        ...(!is_empty(track.meta) ? track.meta! : ({
            plays: 0,
            added_date: new Date().toISOString() as ISOString,
            last_played_date: new Date().toISOString() as ISOString
        })),
        ...(is_empty(metadata) ? {} : {
            age_restricted: metadata!.age_restricted,
            chapters: metadata!.chapters,
            songs: metadata!.songs,
        }),
        unavailable: unavailable,
        last_sampled_date: new Date().toISOString() as ISOString
    }
    track.meta = new_metadata;
    await SQLTracks.update_track_meta_data(track.uid, new_metadata);
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
            (await SQLTracks.add_playback_saved_data_to_tracks([track]))[0];
        } catch (error: any) {
            Logger.log_error(error).catch(e => e);
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
export async function speed_sample_unavailable_tracks(tracks: Track[], super_speed: boolean = false){
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