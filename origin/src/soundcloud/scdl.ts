import { encode_params } from "@common/utils/fetch_util";
import type { CookieJar } from "@common/utils/cookie_util";
import { is_empty } from "@common/utils/util";
import { SoundCloud } from "@origin/soundcloud/soundcloud";
import type { HydratableSound } from "@origin/soundcloud/types/Hydration";
import rozfetch from "@common/rozfetch";
import { generror } from "@common/utils/error_util";

export namespace SoundCloudDL {
    const dl_cache = {dls: [] as {permalink: string, url: string}[], enabled: true};

    export function enable_cache(enable: boolean) { dl_cache.enabled = enable; }
    export function dl_cache_full() { return dl_cache.enabled; }

    export async function get_download_info_from_permalink(permalink: string, cookie_jar?: CookieJar) {
        let fcache;
        if(dl_cache_full() && !is_empty(fcache = dl_cache.dls.find(item => item.permalink === permalink))) return fcache?.url as string;
        if(!(/(https:\/\/)?soundcloud\.com\/.+?\/.+/.exec(permalink))) return generror("Permalink-url doesn't match regex", {permalink, cookie_jar});
        const hydration = await SoundCloud.get_hydration(permalink, {cookie_jar: cookie_jar});
        if ("error" in hydration) return hydration;
        const client_id = await SoundCloud.get_client_id(hydration.scripts_urls, {cookie_jar});
        if (typeof client_id === "object") return client_id;
        const sound_hyrdration: HydratableSound = hydration.hydration.find((hydratable) => hydratable.hydratable === "sound") as HydratableSound;
        if (sound_hyrdration.data.media.transcodings.length === 0) return generror("No transcodings available", {permalink, cookie_jar});
        const filtered_transcodings = sound_hyrdration.data.media.transcodings.filter(transcoding => transcoding.format.protocol === "hls");
        let dl_url: Awaited<ReturnType<typeof get_download_url>> = generror("Unable to find good transcoding", {permalink, cookie_jar});
        for(const transcoding of filtered_transcodings){
            const potential_dl_url = await get_download_url(transcoding.url, {
                track_authorization: sound_hyrdration.data.track_authorization,
                client_id: client_id
            });
            if(typeof potential_dl_url === "object") continue;
            dl_url = potential_dl_url;
            break;
        }
        if(typeof dl_url === "object") return dl_url;
        if(dl_cache_full() && is_empty(dl_cache.dls.find(item => item.permalink === permalink)))
            dl_cache.dls.push({permalink, url: dl_url});
        return dl_url;
    }
    export async function get_download_url(base_api_path: string, params: { client_id: string, track_authorization: string }) {
        const soundcloud_media_url = `${base_api_path}?${encode_params(params)}`;
        const soundcloud_media_response = await rozfetch<{ "url": string }>(soundcloud_media_url);
        if("error" in soundcloud_media_response) return soundcloud_media_response;
        const soundcloud_media_json = await soundcloud_media_response.json();
        if("error" in soundcloud_media_json) return soundcloud_media_json;
        if(Object.keys(soundcloud_media_json).length === 0) return generror("Transcoding doesn't have listening url", {base_api_path, params});
        return soundcloud_media_json.url;
    }
}