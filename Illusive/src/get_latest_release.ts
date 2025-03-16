import { YouTubeMusic } from "../../origin/src";
import { CookieJar } from "../../origin/src/utils/cookie_util";
import { parse_runs } from "../../origin/src/utils/util";
import { parse_youtube_music_artist_album } from "./gen/youtube_music_parser";
import { apple_music_get_artist } from "./get_artist";
import { create_uri } from "./illusive_utilts";
import { Prefs } from "./prefs";
import { ArtistOpts, CompactPlaylist, NamedUUID } from "./types";

function get_cookie_jar(pref_opt: Prefs.PrefOptions) {
    return Prefs.get_pref('use_cookies_on_artist') ? Prefs.get_pref(pref_opt) as CookieJar : new CookieJar([]);
}

export async function youtube_music_get_latest_release(id: string, opts?: ArtistOpts): Promise<CompactPlaylist|undefined>{
    const artist_response = await YouTubeMusic.get_artist({cookie_jar: get_cookie_jar('youtube_music_cookie_jar'), proxy: opts?.proxy}, id);

    if("error" in artist_response) return undefined;

    const artist_info: NamedUUID = {name: parse_runs(artist_response.data.header?.musicImmersiveHeaderRenderer.title.runs), uri: create_uri("youtubemusic", artist_response.data.artist_id ?? id)};
    const artist_albums_response = await YouTubeMusic.get_only_artist_albums({cookie_jar: get_cookie_jar('youtube_music_cookie_jar'), proxy: opts?.proxy}, artist_response.icfg.ytcfg, id);;

    const potential_all_albums_singles = "error" in artist_albums_response ? [] : artist_albums_response.data.map(item => parse_youtube_music_artist_album({musicTwoRowItemRenderer: item}, artist_info));
    
    return potential_all_albums_singles?.[0] === undefined ? undefined : potential_all_albums_singles[0];
}

export async function apple_music_get_latest_release(id: string, opts?: ArtistOpts): Promise<CompactPlaylist|undefined>{
    return (await apple_music_get_artist(id, opts)).latest_release;
}