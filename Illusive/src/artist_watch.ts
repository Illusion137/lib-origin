import { Illusive } from "@illusive/illusive";
import type { CompactPlaylist, NamedUUID, Promises } from '@illusive/types';
import { is_empty, json_catch } from '@common/utils/util';
import { music_service_uri_to_music_service, split_uri } from "@illusive/illusive_utils";
import { get_proxies } from "@illusive/sampler";
import { Proxy } from "@origin/index";
import type { ResponseError } from "@common/types";
import { Constants } from "@illusive/constants";
import { SQLTracks } from "@illusive/sql/sql_tracks";

async function add_playback_data_to_releases(releases: (CompactPlaylist[]|ResponseError)[]){
    return await Promise.all(releases
        .filter(release => release !== undefined)
        .map(async(release) => "error" in release ? release : 
            release.map(
                (item) => item.song_track 
                    ? {...item, song_track: (SQLTracks.add_playback_saved_data_to_track(item.song_track)) }
                    : item)))
}

// export async function artist_watch(artists: NamedUUID[], on_update: (progress: number) => void): Promise<(CompactPlaylist[]|ResponseError)[]>{
export async function artist_watch(artists: NamedUUID[]): Promise<(CompactPlaylist[]|ResponseError)[]>{
    const proxies = await get_proxies(artists.length);
    if(proxies.length < 5) artists = artists.slice(0, Constants.new_releases_artist_watch_small_amount);
    const releases: (CompactPlaylist[]|undefined)[] = [];
    const promises: Promises = [];
    artists = artists.filter(artist => !is_empty(artist.uri));
    for(const artist of artists){
        const [service, id] = split_uri(artist.uri!);
        const music_service = Illusive.music_service.get(music_service_uri_to_music_service(service))!;
        if(music_service?.get_latest_releases !== undefined){
            // TODO reimplement proxies
            // if(proxies.length > 3){
                // promises.push(music_service.get_latest_releases(id, {proxy: Proxy.get_random_proxy(proxies)}).catch(json_catch))
            // }
            // else {
                releases.push(await music_service.get_latest_releases(id, {proxy: Proxy.get_random_proxy(proxies)}).catch(json_catch));
            // }
        }
    }
    if(promises.length > 0) return await add_playback_data_to_releases(
        (await Promise.all(promises) as (CompactPlaylist[]|ResponseError)[])
        .filter(release => release !== undefined)
    );
    return add_playback_data_to_releases(releases.filter(release => release !== undefined));
}