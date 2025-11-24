import { SoundCloud, YouTubeMusic } from "@origin/index";
import { CookieJar } from "@common/utils/cookie_util";
import { soundcloud_parse_track, soundcloud_parse_track_to_song } from "@illusive/parsers/soundcloud_parser";
import { parse_youtube_music_artist_album } from "@illusive/parsers/youtube_music_parser";
import { apple_music_get_artist, spotify_get_artist } from "@illusive/get_artist";
import { create_uri } from "@illusive/illusive_utils";
import { Prefs } from "@illusive/prefs";
import type { ArtistOpts, CompactPlaylist, NamedUUID, Track } from "@illusive/types";
import type * as SoundcloudTypes from '@origin/soundcloud/types/Search';
import { parse_runs } from "@common/utils/parse_util";

function get_cookie_jar(pref_opt: Prefs.PrefOptions) {
    return Prefs.get_pref('use_cookies_on_artist') ? Prefs.get_pref(pref_opt) as CookieJar : new CookieJar([]);
}

// TODO add into SQLArtists
export async function youtube_music_get_latest_releases(id: string, opts?: ArtistOpts): Promise<CompactPlaylist[]|undefined>{
    const artist_response = await YouTubeMusic.get_artist({cookie_jar: get_cookie_jar('youtube_music_cookie_jar'), proxy: opts?.proxy}, id);

    if("error" in artist_response) return undefined;

    const artist_info: NamedUUID = {name: parse_runs(artist_response.data.header?.musicImmersiveHeaderRenderer?.title?.runs ?? []), uri: create_uri("youtubemusic", artist_response.data.artist_id ?? id)};
    const artist_albums_response = await YouTubeMusic.get_only_artist_albums({cookie_jar: get_cookie_jar('youtube_music_cookie_jar'), proxy: opts?.proxy}, artist_response.icfg.ytcfg, id);;

    const potential_all_albums_singles = "error" in artist_albums_response ? [] : artist_albums_response.data.map(item => parse_youtube_music_artist_album({musicTwoRowItemRenderer: item}, artist_info));
    
    return potential_all_albums_singles.length <= 0 ? undefined : potential_all_albums_singles.slice(0, 3);
}

export async function apple_music_get_latest_releases(id: string, opts?: ArtistOpts): Promise<CompactPlaylist[]|undefined>{
    const latest_release = (await apple_music_get_artist(id, opts)).latest_release;
    return latest_release ? [latest_release] : undefined;
}

export async function spotify_get_latest_releases(id: string): Promise<CompactPlaylist[]|undefined>{
    const latest_release = (await spotify_get_artist(id)).latest_release;
    return latest_release ? [latest_release] : undefined;
}

export async function soundcloud_get_latest_releases(id: string, opts?: ArtistOpts): Promise<CompactPlaylist[]|undefined> {
    const artist_response = await SoundCloud.get_artist("TRACKS", {artist_permalink: id, limit: 4, cookie_jar: get_cookie_jar('soundcloud_cookie_jar'), fetch_opts: {proxy: opts?.proxy}});
    if("error" in artist_response) return undefined;

    return artist_response.artist_data.collection
        .map(raw => [raw, soundcloud_parse_track(raw)] as [SoundcloudTypes.Track, Track])
        .map(([raw, track]) => soundcloud_parse_track_to_song(track, raw));
}