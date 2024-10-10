import { CookieJar } from "../utils/cookie_util";
import { ResponseError } from "../utils/types";
import { encode_params } from "../utils/util";
import { SoundCloud } from "./soundcloud";
import { HydratableSound } from "./types/Hydration";

export namespace SoundCloudDL {
    export async function get_download_info_from_permalink(permalink: string, cookie_jar?: CookieJar) {
        if(!permalink.match(/(https:\/\/)?soundcloud\.com\/.+?\/.+/)) return {"error": "Permalink-url doesn't match regex"};
        const hydration = await SoundCloud.get_hydration(permalink, {"cookie_jar": cookie_jar});
        if ("error" in hydration) return hydration as ResponseError;
        const client_id = await SoundCloud.get_client_id(SoundCloud.asset_scripts(hydration.scripts_urls), cookie_jar);
        if (typeof client_id === "object") return client_id;
        const sound_hyrdration: HydratableSound = hydration.hydration.find((hydratable) => hydratable.hydratable === "sound") as HydratableSound;
        if (sound_hyrdration.data.media.transcodings.length === 0) return { "error": "No transcodings available" };
        const filtered_transcodings = sound_hyrdration.data.media.transcodings;
        return await get_download_url(filtered_transcodings[0].url, {
            "track_authorization": sound_hyrdration.data.track_authorization,
            "client_id": client_id
        })
    }
    export async function get_download_url(base_api_path: string, params: { client_id: string, track_authorization: string }) {
        const soundcloud_media_url = `${base_api_path}?${encode_params(params)}`;
        const soundcloud_media_response: { "url": string } = await (await fetch(soundcloud_media_url)).json();
        return soundcloud_media_response.url;
    }
}