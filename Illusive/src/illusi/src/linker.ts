import { split_uri } from "../../illusive_utilts";
import { Prefs } from "../../prefs";
import { CompactPlaylist, ConvertTo, LinkerLink, MusicServiceType } from "../../types";
import { convert_playlist, playlist_tracks } from "./playlist_converter";
import { Wifi } from "./wifi_utils";
import * as uuid from "react-native-uuid";

export function isdefault_playlist(compact_playlist: CompactPlaylist) {
    if(compact_playlist.title.uri === undefined) return false;
    const [service, id] = split_uri(compact_playlist.title.uri!);
    switch(service) {
        case "amazonmusic": return false;
        case "applemusic": return false;
        case "soundcloud": return id.includes("likes");
        case "spotify": return compact_playlist.type !== "PLAYLIST";
        case "youtube": return ["LL", "WL"].includes(id);
        case "youtubemusic": return ["LM", "WL"].includes(id);
        default: return false;
    }
}

export function create_link(link: {
    uuid_uri: string;
    full_sample: boolean;
    to: ConvertTo;
    to_service: MusicServiceType
}): LinkerLink {
    return {
        link_uuid: uuid.default.v4(),
        full_sample: link.full_sample,
        to: link.to,
        to_service: link.to_service,
        uuid_uri: link.uuid_uri
    }
}
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
    for(const link of links)
        await convert_playlist(await playlist_tracks(link.uuid_uri), link.to_service, {to: link.to, full_sample: link.full_sample});
}