import { CookieJar } from "../utils/cookie_util";
import { ResponseError } from "../utils/types";
import { encode_params, is_empty } from "../utils/util";
import { SoundCloud } from "./soundcloud";
import { HydratableSound } from "./types/Hydration";

export namespace SoundCloudDL {
    let dl_cache = {dls: <{permalink: string, url: string}[]>[], enabled: true};

    export function enable_cache(enable: boolean) { dl_cache.enabled = enable; }
    export function dl_cache_full(){ return dl_cache.enabled; }

    export async function get_download_info_from_permalink(permalink: string, cookie_jar?: CookieJar) {
        let fcache = undefined;
        if(dl_cache_full() && !is_empty(fcache = dl_cache.dls.find(item => item.permalink === permalink))) return fcache!.url;
        if(!permalink.match(/(https:\/\/)?soundcloud\.com\/.+?\/.+/)) return {"error": "Permalink-url doesn't match regex"};
        const hydration = await SoundCloud.get_hydration(permalink, {"cookie_jar": cookie_jar});
        if ("error" in hydration) return hydration as ResponseError;
        const client_id = await SoundCloud.get_client_id(hydration.scripts_urls, cookie_jar);
        if (typeof client_id === "object") return client_id;
        const sound_hyrdration: HydratableSound = hydration.hydration.find((hydratable) => hydratable.hydratable === "sound") as HydratableSound;
        if (sound_hyrdration.data.media.transcodings.length === 0) return { "error": "No transcodings available" };
        const filtered_transcodings = sound_hyrdration.data.media.transcodings;
        const dl_url = await get_download_url(filtered_transcodings[0].url, {
            "track_authorization": sound_hyrdration.data.track_authorization,
            "client_id": client_id
        });
        if(dl_cache_full() && is_empty(dl_cache.dls.find(item => item.permalink === permalink)))
            dl_cache.dls.push({permalink, url: dl_url});
        return dl_url;
    }
    export async function get_download_url(base_api_path: string, params: { client_id: string, track_authorization: string }) {
        const soundcloud_media_url = `${base_api_path}?${encode_params(params)}`;
        const soundcloud_media_response: { "url": string } = await (await fetch(soundcloud_media_url)).json();
        return soundcloud_media_response.url;
    }
}