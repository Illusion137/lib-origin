import * as Origin from '../../../../origin/src/index';
import { Constants } from '../../constants';
import { Illusive } from "../../illusive";
import { Prefs } from "../../prefs";
import { Track } from "../../types";
import { alert_error } from './alert';
import { Logger } from './logger';
import { Wifi } from './wifi_utils';

export async function unzip_backpack(unavailable_tracks: Track[]): Promise<Track[]>{
    if(Prefs.get_pref('expensive_wifi_only') && !await Wifi.wifi_connected()){
        alert_error("Unable to unzip backpack due to lack of wifi connection and Preference['expensive_wifi_only']", true);
        return [];
    }
    const fastpack = Prefs.get_pref('fastpack') && unavailable_tracks.length >= Constants.fastpack_track_threshold;
    if(fastpack){
        let proxies: Origin.Proxy.Proxy[] = [];
        const promise_tracks: ReturnType<typeof Illusive.convert_track>[] = [];
        const fetched_proxies = await Origin.Proxy.get_proxy_list();
        if(!("error" in fetched_proxies)){
            proxies = fetched_proxies;
        }
        else await Logger.log_error(fetched_proxies);
        for(const utrack of unavailable_tracks)
            promise_tracks.push(Illusive.convert_track(utrack, "YouTube", proxies));
        const resolved_tracks = await Promise.all(promise_tracks);
        resolved_tracks.forEach(track => { if("error" in track) alert_error(track); })
        
        for(let i = 0; i < resolved_tracks.length; i++){
            if("error" in resolved_tracks[i]) continue;
            (<Track>resolved_tracks[i]).uid = unavailable_tracks[i].uid;
        }
        return <Track[]>resolved_tracks.filter(track => !("error" in track));
    }
    const tracks: Track[] = [];
    for(const utrack of unavailable_tracks){
        const track = await Illusive.convert_track(utrack, "YouTube");
        if("error" in track) {
            alert_error(track);
            continue;
        }
        track.uid = utrack.uid;
        tracks.push(track);
    }
    return tracks;
}