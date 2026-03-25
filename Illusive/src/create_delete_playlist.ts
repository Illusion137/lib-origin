import { remove } from '@common/utils/clean_util';
import * as Origin from '@origin/index'
import { create_uri, spotify_uri_to_uri } from '@illusive/illusive_utils';
import { Prefs } from '@illusive/prefs';
import { supabase } from '@illusive/db/supabase';
import { gen_uuid } from '@common/utils/util';

export async function spotify_create_playlist(playlist_name: string) {
    const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
    const creation_response = await Origin.Spotify.create_playlist({cookie_jar: cookie_jar, playlist_name: playlist_name});
    if("error" in creation_response) return "";
    const uri = spotify_uri_to_uri(creation_response.uri);
    if(uri === null) return "";
    return uri;
}
export async function spotify_delete_playlist(playlist_uri: string) {
    const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
    const deletion_response = await Origin.Spotify.delete_playlist({cookie_jar: cookie_jar, playlist_uri: playlist_uri});
    if("error" in deletion_response) return false;
    return true;
}

export async function amazon_music_create_playlist(playlist_name: string) {
    const cookie_jar = Prefs.get_pref('amazon_music_cookie_jar');
    const creation_response = await Origin.AmazonMusic.create_playlist(playlist_name, {cookie_jar: cookie_jar});
    if("error" in creation_response) return "";
    return create_uri("amazonmusic", remove(creation_response.methods[0].url!, "https://na.mesk.skill.music.a2z.com/api/addTracksToPlaylist?", "playlistId=", /&.+/));
}
export async function amazon_music_delete_playlist(playlist_url: string) {
    const cookie_jar = Prefs.get_pref('amazon_music_cookie_jar');
    const deletion_response = await Origin.AmazonMusic.delete_playlist(playlist_url, {cookie_jar: cookie_jar});
    if("error" in deletion_response) return false;
    return deletion_response.ok;
}

export async function youtube_create_playlist(playlist_name: string) {
    const cookie_jar = Prefs.get_pref('youtube_cookie_jar');
    const home = await Origin.YouTube.get_home({});
    if("error" in home) return "";
    const creation_response = await Origin.YouTube.create_playlist({cookie_jar: cookie_jar}, home.icfg.ytcfg, playlist_name, "UNLISTED");
    if("error" in creation_response) return "";
    return create_uri("youtube", creation_response.playlistId);
}
export async function youtube_delete_playlist(playlist_url: string) {
    const cookie_jar = Prefs.get_pref('youtube_cookie_jar');
    const home = await Origin.YouTube.get_home({});
    if("error" in home) return false;
    const deletion_response = await Origin.YouTube.delete_playlist({cookie_jar: cookie_jar}, home.icfg.ytcfg, playlist_url);
    return deletion_response;
}

export async function youtube_music_create_playlist(playlist_name: string) {
    const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
    const home = await Origin.YouTubeMusic.get_home({});
    if("error" in home) return "";
    const creation_response = await Origin.YouTubeMusic.create_playlist({cookie_jar: cookie_jar}, home.icfg.ytcfg, playlist_name, "UNLISTED");
    if("error" in creation_response) return "";
    return create_uri("youtubemusic", creation_response.playlistId);
}
export async function youtube_music_delete_playlist(playlist_url: string) {
    const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
    const home = await Origin.YouTubeMusic.get_home({});
    if("error" in home) return false;
    const deletion_response = await Origin.YouTubeMusic.delete_playlist({cookie_jar: cookie_jar}, home.icfg.ytcfg, playlist_url);
    return deletion_response;
}
export async function apple_music_create_playlist(playlist_name: string) {
    const cookie_jar = Prefs.get_pref('apple_music_cookie_jar');
    const creation_response = await Origin.AppleMusic.create_playlist(playlist_name, "", false, [], {cookie_jar: cookie_jar});
    if("error" in creation_response) return "";
    return create_uri("applemusic", creation_response.data[0].id);
}
export async function apple_music_delete_playlist(playlist_url: string) {
    const cookie_jar = Prefs.get_pref('apple_music_cookie_jar');
    const deletion_response = await Origin.AppleMusic.delete_playlist(playlist_url, {cookie_jar: cookie_jar});
    if("error" in deletion_response) return false;
    return deletion_response.ok;
}
export async function soundcloud_create_playlist(playlist_name: string) {
    const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
    const creation_response = await Origin.SoundCloud.create_playlist({cookie_jar: cookie_jar, title: playlist_name, sharing: "private", track_uids: []});
    if("error" in creation_response) return "";
    return create_uri("soundcloud", creation_response.permalink);
}
export async function soundcloud_delete_playlist(playlist_url: string) {
    const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
    const deletion_response = await Origin.SoundCloud.delete_playlist({cookie_jar: cookie_jar, playlist_id: playlist_url});
    if("error" in deletion_response) return false;
    return deletion_response.data.ok;
}

export async function illusi_create_playlist(playlist_name: string): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return '';

    const uuid = gen_uuid();
    const result = await Origin.Illusi.create_playlist(playlist_name, uuid, { jwt: session.access_token });
    if ('error' in result) return '';
    return create_uri('illusi', result.uuid);
}

export async function illusi_delete_playlist(playlist_uri: string): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const uuid = playlist_uri.split(':')[1];
    return Origin.Illusi.delete_playlist(uuid, { jwt: session.access_token });
}