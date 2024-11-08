import { Illusive } from "../../illusive";
import { MusicServicePlaylist, MusicServiceType, Track } from "../../types";
import { ResponseError } from "../../../../origin/src/utils/types";
import { is_empty } from "../../../../origin/src/utils/util";
import * as SQLActions from './sql_actions';
import * as Origin from '../../../../origin/src/index';

type ConvertPlaylistBase = {
    furl: string;
    to: { playlist_name: string } | { url: string };
    callback?: () => any;
};
type ConvertPlaylistSample = { full_sample: true; fast_convert: boolean; }
    | { full_sample: false; };
type ConvertPlaylistOpts = ConvertPlaylistSample & ConvertPlaylistBase;

export function loggedin_services(){
    const services: MusicServiceType[] = [];
    const entries = [...Illusive.music_service.entries()];
    for(const entry of entries)
        if(entry[1].has_credentials()) services.push(entry[0]);
    return services;
}
export function track_intersection(f: Track, t: Track): boolean{
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
export async function sample_track(tracks: Track[]){

}
export async function convert_playlist<T extends MusicServiceType>(from: T, to: Exclude<MusicServiceType, T>, opts: ConvertPlaylistOpts){
    const from_service = Illusive.music_service.get(from)!;
    const to_service = Illusive.music_service.get(to)!;
    const from_ok = from_service.cookie_jar_callback === undefined || from_service.has_credentials();
    const to_ok = to_service.create_playlist !== undefined && to_service.add_tracks_to_playlist !== undefined;
    if(!from_ok) return {"error": `Unable to access playlist from ${from_service}`};
    if(!to_ok) return {"error": `Unable to create/modify playlist from ${to_service}`};
    if(opts.full_sample && to_service.search === undefined) return {"error": `Unable to sample tracks to ${to_service}; Missing search function`};
    
    const from_playlist: ResponseError|MusicServicePlaylist = await from_service.get_full_playlist(opts.furl);
    // TODO Remove line below
    if("error" in from_playlist) return from_playlist;
    if(opts.full_sample){
        const proxies: Origin.Proxy.Proxy[] = [];
        if(opts.fast_convert){
            const proxy_list = await Origin.Proxy.get_proxy_list();
            if(!("error" in proxy_list))
                proxies.push(...proxy_list);
        }
        const updated_tracks: Track[] = [];
        for(const track of from_playlist.tracks){
            if(track.imported_id) continue;
            const conversion_track = await Illusive.convert_track(track, to, proxies, [to]);
            if("error" in conversion_track) { 
                Logger.log_error(conversion_track); 
                continue;
            }
            updated_tracks.push(await SQLActions.merge_track_with_new_track(track, conversion_track););
        }
        from_playlist.tracks = updated_tracks;
    }
    if("playlist_name" in opts.to){
        // const created_playlist = await to_service.create_playlist!(opts.to.playlist_name);
    }
    else {
        const to_playlist: ResponseError|MusicServicePlaylist = await to_service.get_full_playlist(opts.to.url);
        if("error" in to_playlist) return to_playlist;
        from_playlist.tracks = from_playlist.tracks.filter((f) => {
            for(const t of to_playlist.tracks)
                if(track_intersection(f, t)) false;    
            return true;
        });
        const insertion = await to_service.add_tracks_to_playlist!(from_playlist.tracks, opts.to.url);
        if(!insertion) return {"error": `Failed to add tracks to playlist; url: ${opts.to.url}`};
    }
    return {"ok": true};
}