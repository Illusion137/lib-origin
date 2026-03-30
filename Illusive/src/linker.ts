import { music_service_uri_to_music_service, split_uri } from "@illusive/illusive_utils";
import { Prefs } from "@illusive/prefs";
import type { LinkerLink } from "@illusive/types";
import { Wifi } from "@illusive/illusi/src/wifi_utils";
import { convert_playlist } from "@illusive/playlist_converter";
import { get_playlist_tracks_with_error } from "@illusive/playlist_utils";
import { GLOBALS } from "@illusive/globals";
import type { ResponseError } from "@common/types";

export async function run_link(link: LinkerLink){
    const illusi_playlist_tracks = await get_playlist_tracks_with_error(link.illusi_uuid, GLOBALS.global_var.sql_tracks, true);
    if("error" in illusi_playlist_tracks) return illusi_playlist_tracks;
    const other_service_tracks = await get_playlist_tracks_with_error(link.service_uri, GLOBALS.global_var.sql_tracks, link.full_service_playlist);
    if("error" in other_service_tracks) return other_service_tracks;
    switch(link.type){
        case "OUTGOING": {
            const [music_service] = split_uri(link.service_uri);
            return await convert_playlist(other_service_tracks, illusi_playlist_tracks, music_service_uri_to_music_service(music_service), {
                check_connection: true, 
                divide_and_conquer: false,
                full_sample: "NONE", 
                convert_opts: {
                    uuid_uri: link.illusi_uuid
                }
            });
        }
        case "INCOMING": {
            return await convert_playlist(illusi_playlist_tracks, other_service_tracks, "Illusi", {
                check_connection: true, 
                divide_and_conquer: false,
                full_sample: "NONE", 
                convert_opts: {
                    uuid_uri: link.illusi_uuid
                }
            });
        }
    }
}

export async function run_startup_links(links: LinkerLink[]) {
    if(!Prefs.get_pref("enable_linker")) return;
    if(Prefs.get_pref("expensive_wifi_only") && !await Wifi.wifi_connected()) return;

    const errors: ResponseError[] = [];
    for(const link of links){
        const result = await run_link(link);
        if("error" in result) errors.push(result);
    }
    if(errors.length === 0) GLOBALS.global_var.bottom_alert("Successfully fetched all links", "GOOD");
    else GLOBALS.global_var.bottom_alert(`Failed to fetch ${errors.length}/${links.length} links`, "WARN");
}