import { split_uri } from "../../illusive_utilts";
import { Prefs } from "../../prefs";
import { CompactPlaylist, LinkerLink } from "../../types";
import { convert_playlist, playlist_tracks } from "./playlist_converter";
import { Wifi } from "./wifi_utils";

export function isdefault_playlist(compact_playlist: CompactPlaylist){
    if(compact_playlist.title.uri === undefined) return false;
    const [service, id] = split_uri(compact_playlist.title.uri!);
    switch(service){
        case "amazonmusic": return false;
        case "applemusic": return false;
        case "soundcloud": return id.includes("likes");
        case "spotify": return compact_playlist.type !== "PLAYLIST";
        case "youtube": return ["LL", "WL"].includes(id);
        case "youtubemusic": return ["LM", "WL"].includes(id);
        default: return false;
    }
}

export async function fetch_linked_playlists(links: LinkerLink[]){
    if(Prefs.get_pref("disable_linker")) return;
    if(Prefs.get_pref("expensive_wifi_only") && !await Wifi.wifi_connected()) return;
    for(const link of links)
        await convert_playlist(await playlist_tracks(link.uuid_uri), link.to_service, {to: link.to, full_sample: link.full_sample});
}