import * as SQLTracks from '../../../../Illusive/src/illusi/src/sql/sql_tracks';
import * as Origin from '../../../../origin/src/index';
import { is_empty } from '../../../../origin/src/utils/util';
import { Constants } from '../../constants';
import { Illusive } from '../../illusive';
import { Prefs } from "../../prefs";
import type { MusicServiceType, Track } from "../../types";
import { alert_error } from './alert';
import { Logger } from './logger';
import { Wifi } from './wifi_utils';

export async function unzip_backpack(unavailable_tracks: Track[]): Promise<Track[]> {
    if(Prefs.get_pref('expensive_wifi_only') && !await Wifi.wifi_connected()) {
        alert_error("Unable to unzip backpack due to lack of wifi connection and Preference['expensive_wifi_only']");
        return [];
    }
    const fastpack = Prefs.get_pref('fastpack') && unavailable_tracks.length >= Constants.fastpack_track_threshold;
    const to_service: MusicServiceType = 'YouTube Music';
    if(fastpack) {
        let proxies: Origin.Proxy.Proxy[] = [];
        const promise_tracks: ReturnType<typeof Illusive.convert_track>[] = [];
        const fetched_proxies = await Origin.Proxy.get_new_proxy_list(proxy => proxy.https);
        if(!("error" in fetched_proxies)) {
            proxies = fetched_proxies;
        } else await Logger.log_error(fetched_proxies);
        for(const utrack of unavailable_tracks)
            promise_tracks.push(Illusive.convert_track(utrack, {to_music_service: to_service, proxies, deep_convert: true}));
        const resolved_tracks = await Promise.all(promise_tracks);
        resolved_tracks.forEach(track => { if("error" in track) alert_error(track); })
        
        for(let i = 0; i < resolved_tracks.length; i++) {
            if("error" in resolved_tracks[i]) continue;
            (resolved_tracks[i] as Illusive.MaxTrack).track!.uid = unavailable_tracks[i].uid;
        }
        const tracks = resolved_tracks.filter(track => !("error" in track)).filter(track => !is_empty(track)).map(item => (item as Illusive.MaxTrack).track) as Track[];
        return SQLTracks.add_playback_saved_data_to_tracks(tracks);
    }
    const tracks: Track[] = [];
    for(const utrack of unavailable_tracks) {
        const track = await Illusive.convert_track(utrack, {to_music_service: to_service, deep_convert: true});
        if("error" in track) {
            alert_error(track);
            continue;
        }
        track.track!.uid = utrack.uid;
        track.track!.meta = utrack.meta;
        track.track!.meta!.unavailable = false;
        tracks.push(track.track!);
    }
    return SQLTracks.add_playback_saved_data_to_tracks(tracks);
}