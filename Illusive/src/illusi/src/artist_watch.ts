import { Illusive } from "../../illusive";
import { CompactPlaylist, NamedUUID, Promises } from "../../types";
import { is_empty, json_catch } from '../../../../origin/src/utils/util';
import { music_service_uri_to_music_service, split_uri } from "../../illusive_utilts";
import { get_proxies } from "./sampler";
import { Proxy } from "../../../../origin/src";
import { ResponseError } from "../../../../origin/src/utils/types";
import { Prefs } from "../../prefs";

export async function artist_watch(artists: NamedUUID[]): Promise<(CompactPlaylist[]|ResponseError)[]>{
    const proxies = await get_proxies(artists.length);
    if(proxies.length < 10) artists = artists.slice(0, Prefs.prefs.new_releases_amount.default_value);
    const releases: (CompactPlaylist[]|undefined)[] = [];
    const promises: Promises = [];
    artists = artists.filter(artist => !is_empty(artist.uri));
    for(const artist of artists){
        const [service, id] = split_uri(artist.uri!);
        const music_service = Illusive.music_service.get(music_service_uri_to_music_service(service))!;
        if(music_service?.get_latest_releases !== undefined){
            if(proxies.length > 3){
                promises.push(music_service.get_latest_releases(id, {proxy: Proxy.get_random_proxy(proxies)}).catch(json_catch))
            }
            else {
                releases.push(await music_service.get_latest_releases(id, {proxy: Proxy.get_random_proxy(proxies)}).catch(json_catch));
            }
        }
    }
    if(promises.length > 0) return (await Promise.all(promises) as (CompactPlaylist[]|ResponseError)[]).filter(release => release !== undefined);
    return releases.filter(release => release !== undefined);
}