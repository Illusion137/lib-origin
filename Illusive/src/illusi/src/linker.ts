import { music_service_uri_to_music_service, split_uri } from "@illusive/illusive_utils";
import { Prefs } from "@illusive/prefs";
import type { LinkerLink } from "@illusive/types";
import { Wifi } from "@illusive/illusi/src/wifi_utils";
import { convert_playlist } from "@illusive/playlist_converter";
import { get_playlist_tracks } from "@illusive/playlist_utils";
import { GLOBALS } from "@illusive/globals";

export async function save_link(link: LinkerLink) {
    const new_links = Prefs.get_pref('linker_links').concat(link);
    await Prefs.save_pref('linker_links', new_links);
}
export async function update_link(link: LinkerLink) {
    const new_links = Prefs.get_pref('linker_links');
    const index = new_links.findIndex(l => l.link_uuid === link.link_uuid);
    new_links[index] = link;
    await Prefs.save_pref('linker_links', new_links);
}
export async function delete_link(link: LinkerLink){
    const new_links = Prefs.get_pref('linker_links').filter(l => l.link_uuid !== link.link_uuid);
    await Prefs.save_pref('linker_links', new_links);
}

export async function fetch_linked_playlists(links: LinkerLink[]) {
    if(!Prefs.get_pref("enable_linker")) return;
    if(Prefs.get_pref("expensive_wifi_only") && !await Wifi.wifi_connected()) return;

    for(const link of links){
        switch(link.type){
            case "INCOMING": {
                const playlist_tracks = await get_playlist_tracks(link.illusi_uuid, GLOBALS.global_var.sql_tracks, true);
                const incoming_playlist_tracks = await get_playlist_tracks(link.service_uri, GLOBALS.global_var.sql_tracks, link.full_service_playlist);
                await convert_playlist(playlist_tracks, incoming_playlist_tracks, "Illusi", {
                    check_connection: true, 
                    divide_and_conquer: false,
                    full_sample: "NONE", 
                    convert_opts: {
                        uuid_uri: link.illusi_uuid
                    }
                });
                break;
            }
            case "OUTGOING": {
                const playlist_tracks = await get_playlist_tracks(link.service_uri, GLOBALS.global_var.sql_tracks, link.full_service_playlist);
                const incoming_playlist_tracks = await get_playlist_tracks(link.illusi_uuid, GLOBALS.global_var.sql_tracks, true);
                const [music_service] = split_uri(link.service_uri);
                await convert_playlist(playlist_tracks, incoming_playlist_tracks, music_service_uri_to_music_service(music_service), {
                    check_connection: true, 
                    divide_and_conquer: false,
                    full_sample: "NONE", 
                    convert_opts: {
                        uuid_uri: link.illusi_uuid
                    }
                });
                break;
            }
        }
    }
}