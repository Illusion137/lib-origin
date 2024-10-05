import * as Origin from '../../origin/src/index'
import { CookieJar } from '../../origin/src/utils/cookie_util';
import { extract_string_from_pattern, url_to_id } from '../../origin/src/utils/util';
import { Prefs } from './prefs';

export async function spotify_create_playlist(playlist_name: string) {
    const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
    const creation_response = await Origin.Spotify.create_playlist({"cookie_jar": cookie_jar, "playlist_name": playlist_name});
    if("error" in creation_response) return false;
    return creation_response.ok;
}
export async function spotify_delete_playlist(playlist_uri: string) {
    const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
    const deletion_response = await Origin.Spotify.delete_playlist({"cookie_jar": cookie_jar,"playlist_uri": playlist_uri});
    if("error" in deletion_response) return false;
    return deletion_response.ok;
}

export async function amazon_music_create_playlist(playlist_name: string) {
    const cookie_jar = Prefs.get_pref('amazon_music_cookie_jar');
    const creation_response = await Origin.AmazonMusic.create_playlist(playlist_name, {"cookie_jar": cookie_jar});
    if("error" in creation_response) return false;
    return creation_response.ok;
}
export async function amazon_music_delete_playlist(playlist_url: string) {
    const cookie_jar = Prefs.get_pref('amazon_music_cookie_jar');
    const deletion_response = await Origin.AmazonMusic.delete_playlist(playlist_url, {"cookie_jar": cookie_jar});
    if("error" in deletion_response) return false;
    return deletion_response.ok;
}

export async function youtube_create_playlist(playlist_name: string) {
    const cookie_jar = Prefs.get_pref('youtube_cookie_jar');
    const home = await Origin.YouTube.get_home({});
    if("error" in home) return false;
    const creation_response = await Origin.YouTube.create_playlist({"cookie_jar": cookie_jar}, home.icfg.ytcfg, playlist_name, "UNLISTED");
    return creation_response;
}
export async function youtube_delete_playlist(playlist_url: string) {
    const cookie_jar = Prefs.get_pref('youtube_cookie_jar');
    const home = await Origin.YouTube.get_home({});
    if("error" in home) return false;
    const playlist_id = Origin.YouTube.playlist_url_to_id(playlist_url)
    const deletion_response = await Origin.YouTube.delete_playlist({"cookie_jar": cookie_jar}, home.icfg.ytcfg, playlist_id);
    return deletion_response;
}

export async function youtube_music_create_playlist(playlist_name: string) {
    const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
    const home = await Origin.YouTubeMusic.get_home({});
    if("error" in home) return false;
    const creation_response = await Origin.YouTubeMusic.create_playlist({"cookie_jar": cookie_jar}, home.icfg.ytcfg, playlist_name, "UNLISTED");
    return creation_response;
}
export async function youtube_music_delete_playlist(playlist_url: string) {
    const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
    const home = await Origin.YouTubeMusic.get_home({});
    if("error" in home) return false;
    const playlist_id = Origin.YouTubeMusic.playlist_url_to_id(playlist_url)
    const deletion_response = await Origin.YouTubeMusic.delete_playlist({"cookie_jar": cookie_jar}, home.icfg.ytcfg, playlist_id);
    return deletion_response;
}
export async function apple_music_create_playlist(playlist_name: string){
    const cookie_jar = Prefs.get_pref('apple_music_cookie_jar');
    const creation_response = await Origin.AppleMusic.create_playlist(playlist_name, "", false, [], {"cookie_jar": cookie_jar});
    if("error" in creation_response) return false;
    return creation_response.ok;
}
export async function apple_music_delete_playlist(playlist_url: string){
    const cookie_jar = Prefs.get_pref('apple_music_cookie_jar');
    const deletion_response = await Origin.AppleMusic.delete_playlist(url_to_id(playlist_url, "music.apple.com/", "us/", "library/", "playlist/", "?l=en-US"), {"cookie_jar": cookie_jar});
    if("error" in deletion_response) return false;
    return deletion_response.ok;
}
export async function soundcloud_create_playlist(playlist_name: string){
    const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
    const creation_response = await Origin.SoundCloud.create_playlist({"cookie_jar": cookie_jar, "title": playlist_name, "sharing": "private", "track_uids": []});
    return creation_response.ok;
}
export async function soundcloud_delete_playlist(playlist_url: string){
    const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
    const deletion_response = await Origin.SoundCloud.delete_playlist({"cookie_jar": cookie_jar, "playlist_id": extract_string_from_pattern(url_to_id(playlist_url, "soundcloud.com/", "m.soundcloud.com/", "soundcloud.com/"), /.+?\/sets\/(.+)/) as string});
    return deletion_response.ok;
}