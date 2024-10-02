import * as Origin from '../../origin/src/index'
import { CookieJar } from '../../origin/src/utils/cookie_util';
import { extract_string_from_pattern, is_empty, url_to_id } from '../../origin/src/utils/util';
import { Prefs } from './prefs';
import { Track } from './types';

export async function spotify_add_tracks_to_playlist(tracks: Track[], playlist_uri: string | "LIBRARY") {
    const cookie_jar: CookieJar = Prefs.get_pref('spotify_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.spotify_id));
    const uris = tracks.map(track => track.spotify_id) as string[];
    let add_response;
    if(playlist_uri == "LIBRARY") add_response = await Origin.Spotify.add_tracks_to_library({"cookie_jar": cookie_jar, "uris": uris});
    else                          add_response = await Origin.Spotify.add_tracks_to_playlist({"cookie_jar": cookie_jar,"playlist_uri": playlist_uri, "uris": uris});
    if("error" in add_response) return false;
    return add_response.ok;
}
export async function spotify_delete_tracks_from_playlist(tracks: Track[], playlist_uri: string | "LIBRARY") {
    const cookie_jar: CookieJar = Prefs.get_pref('spotify_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.spotify_id));
    const uris = tracks.map(track => track.spotify_id) as string[];
    let deletion_response;
    if(playlist_uri == "LIBRARY") deletion_response = await Origin.Spotify.delete_tracks_from_library({"cookie_jar": cookie_jar, "uris": uris});
    else                          deletion_response = await Origin.Spotify.delete_tracks_from_playlist({"cookie_jar": cookie_jar, "playlist_uri": playlist_uri, "uids": uris});
    if("error" in deletion_response) return false;
    return deletion_response.ok;
}

export async function amazon_music_add_tracks_to_playlist(tracks: Track[], playlist_url: string) {
    const cookie_jar: CookieJar = Prefs.get_pref('amazon_music_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.amazonmusic_id));
    const uris = tracks.map(track => track.amazonmusic_id) as string[];
    const playlist_response = await Origin.AmazonMusic.get_playlist(playlist_url, {});
    if("error" in playlist_response) return false;
    const add_response = await Origin.AmazonMusic.add_to_playlist(playlist_url, playlist_response.title, uris, {"cookie_jar": cookie_jar});
    if("error" in add_response) return false;
    return add_response.ok;
}
export async function amazon_music_delete_tracks_from_playlist(tracks: Track[], playlist_url: string) {
    const cookie_jar: CookieJar = Prefs.get_pref('amazon_music_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.amazonmusic_id));
    const uris = tracks.map(track => track.amazonmusic_id) as string[];
    const deletion_response = await Origin.AmazonMusic.delete_from_playlist(playlist_url, uris, 0, {"cookie_jar": cookie_jar});
    if("error" in deletion_response) return false;
    return deletion_response.ok;
}

export async function youtube_add_tracks_to_playlist(tracks: Track[], playlist_url: string) {
    const cookie_jar: CookieJar = Prefs.get_pref('youtube_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.youtube_id));
    const uris = tracks.map(track => track.youtube_id) as string[];
    const home = await Origin.YouTube.get_home({});
    if("error" in home) return false;
    const add_response = await Origin.YouTube.add_tracks_to_playlist({"cookie_jar": cookie_jar}, home.icfg.ytcfg, Origin.YouTube.playlist_url_to_id(playlist_url), uris);
    return add_response;
}
export async function youtube_delete_tracks_from_playlist(tracks: Track[], playlist_url: string) {
    const cookie_jar: CookieJar = Prefs.get_pref('youtube_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.youtube_id));
    const uris = tracks.map(track => track.youtube_id as string );
    const home = await Origin.YouTube.get_home({});
    if("error" in home) return false;
    const deletion_response = await Origin.YouTube.remove_tracks_to_playlist({"cookie_jar": cookie_jar}, home.icfg.ytcfg, Origin.YouTube.playlist_url_to_id(playlist_url), uris);
    return deletion_response;
}

export async function youtube_music_add_tracks_to_playlist(tracks: Track[], playlist_url: string) {
    const cookie_jar: CookieJar = Prefs.get_pref('youtube_music_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.youtubemusic_id));
    const uris = tracks.map(track => track.youtubemusic_id) as string[];
    const home = await Origin.YouTubeMusic.get_home({"cookie_jar": cookie_jar});
    if("error" in home) return false;
    const add_response = await Origin.YouTubeMusic.add_tracks_to_playlist({"cookie_jar": cookie_jar}, home.icfg.ytcfg, Origin.YouTubeMusic.playlist_url_to_id(playlist_url), uris);
    return add_response;
}
export async function youtube_music_delete_tracks_from_playlist(tracks: Track[], playlist_url: string) {
    const cookie_jar: CookieJar = Prefs.get_pref('youtube_music_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.youtubemusic_id));
    const uris = tracks.map(track => {
        return {
            video_id: track.youtube_id as string,
            set_video_id: track.youtubemusic_id as string
        }
    });
    const home = await Origin.YouTubeMusic.get_home({"cookie_jar": cookie_jar});
    if("error" in home) return false;
    const deletion_response = await Origin.YouTubeMusic.remove_tracks_to_playlist({"cookie_jar": cookie_jar}, home.icfg.ytcfg, Origin.YouTubeMusic.playlist_url_to_id(playlist_url), uris);
    return deletion_response;
}
export async function apple_music_add_tracks_to_playlist(tracks: Track[], playlist_url: string){
    const cookie_jar: CookieJar = Prefs.get_pref('apple_music_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.applemusic_id));
    const uris = tracks.map(track => { return {"id": track.applemusic_id!, "type": "songs"}});
    const add_response = await Origin.AppleMusic.add_tracks_to_playlist(url_to_id(playlist_url, "music.apple.com/", "us/", "library/", "playlist/", "?l=en-US"), uris as {id: string, type: "songs"}[], {"cookie_jar": cookie_jar});
    if("error" in add_response) return false;
    return add_response.ok;
}
export async function apple_music_delete_tracks_from_playlist(tracks: Track[], playlist_url: string){
    const cookie_jar: CookieJar = Prefs.get_pref('apple_music_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.applemusic_id));
    const uris = tracks.map(track => track.applemusic_id!);
    const data = await Origin.AppleMusic.getSerializedServerData("https://music.apple.com/us/library/all-playlists/", {"cookie_jar": cookie_jar});
    if("error" in data) return false;
    for(const uri of uris){
        const deletion_response = await Origin.AppleMusic.removeTrackFromPlaylist(url_to_id(playlist_url, "music.apple.com/", "us/", "library/", "playlist/", "?l=en-US"), uri, data.authorization, {"cookie_jar": cookie_jar});
        if("error" in deletion_response) return false;
        if(!deletion_response.ok) return false;
    }
    return true;
}
export async function soundcloud_add_tracks_to_playlist(tracks: Track[], playlist_url: string){
    const cookie_jar: CookieJar = Prefs.get_pref('soundcloud_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.soundcloud_id));
    const uris = tracks.map(track => track.soundcloud_id!);
    const add_response = await Origin.SoundCloud.add_tracks_to_playlist({"cookie_jar": cookie_jar, "playlist_name": extract_string_from_pattern(url_to_id(playlist_url, "soundcloud.com/", "m.soundcloud.com/", "soundcloud.com/"), /.+?\/sets\/(.+)/) as string, "track_ids": uris});
    return add_response.ok;
}
export async function soundcloud_delete_tracks_from_playlist(tracks: Track[], playlist_url: string){
    const cookie_jar: CookieJar = Prefs.get_pref('soundcloud_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.soundcloud_id));
    const uris = tracks.map(track => track.soundcloud_id!);
    const deletion_response = await Origin.SoundCloud.add_tracks_to_playlist({"cookie_jar": cookie_jar, "playlist_name": extract_string_from_pattern(url_to_id(playlist_url, "soundcloud.com/", "m.soundcloud.com/", "soundcloud.com/"), /.+?\/sets\/(.+)/) as string, "track_ids": uris});
    return deletion_response.ok;
}