import * as Origin from '@origin/index'
import { is_empty } from '@common/utils/util';
import { Constants } from '@illusive/constants';
import { Prefs } from '@illusive/prefs';
import type { Track } from '@illusive/types';
import type { ResponseError } from '@common/types';

export async function spotify_add_tracks_to_playlist(tracks: Track[], playlist_uri: string) {
    const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.spotify_id));
    const uris = tracks.map(track => track.spotify_id) as string[];
    let add_response;
    if(playlist_uri === Constants.library_write_playlist) add_response = await Origin.Spotify.add_tracks_to_library({cookie_jar: cookie_jar, var: {uris: uris}});
    else add_response = await Origin.Spotify.add_tracks_to_playlist({cookie_jar: cookie_jar, var: {playlistUri: playlist_uri, uris}});
    if("error" in add_response) return false;
    return true;
}
export async function spotify_delete_tracks_from_playlist(tracks: Track[], playlist_uri: string) {
    const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.spotify_id));
    const uris = tracks.map(track => track.spotify_id) as string[];
    let deletion_response: ResponseError|{};
    if(playlist_uri === Constants.library_write_playlist) deletion_response = await Origin.Spotify.delete_tracks_from_library({cookie_jar: cookie_jar, var: {uris}});
    else                          deletion_response = await Origin.Spotify.delete_tracks_from_playlist({cookie_jar: cookie_jar, var: {playlistUri: playlist_uri, uids: uris}});
    if("error" in deletion_response) return false;
    return true;
}

export async function amazon_music_add_tracks_to_playlist(tracks: Track[], playlist_url: string) {
    const cookie_jar = Prefs.get_pref('amazon_music_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.amazonmusic_id));
    const uris = tracks.map(track => track.amazonmusic_id) as string[];
    const playlist_response = await Origin.AmazonMusic.get_playlist(playlist_url, {});
    if("error" in playlist_response) return false;
    const add_response = await Origin.AmazonMusic.add_to_playlist(playlist_url, playlist_response.title, uris, {cookie_jar: cookie_jar});
    if("error" in add_response) return false;
    return add_response.ok;
}
export async function amazon_music_delete_tracks_from_playlist(tracks: Track[], playlist_url: string) {
    const cookie_jar = Prefs.get_pref('amazon_music_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.amazonmusic_id));
    const uris = tracks.map(track => track.amazonmusic_id) as string[];
    const deletion_response = await Origin.AmazonMusic.delete_from_playlist(playlist_url, uris, 0, {cookie_jar: cookie_jar});
    if("error" in deletion_response) return false;
    return deletion_response.ok;
}

let home_;
export async function youtube_add_tracks_to_playlist(tracks: Track[], playlist_url: string) {
    const cookie_jar = Prefs.get_pref('youtube_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.youtube_id));
    const uris = tracks.map(track => track.youtube_id) as string[];
    if(home_ === undefined) home_ = await Origin.YouTube.get_home({cookie_jar});
    if("error" in home_) return false;
    const add_response = await Origin.YouTube.add_tracks_to_playlist({cookie_jar}, home_.icfg.ytcfg, playlist_url, uris);
    return add_response;
}
export async function youtube_delete_tracks_from_playlist(tracks: Track[], playlist_url: string) {
    const cookie_jar = Prefs.get_pref('youtube_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.youtube_id));
    const uris = tracks.map(track => track.youtube_id as string );
    const home = await Origin.YouTube.get_home({cookie_jar});
    if("error" in home) return false;
    const deletion_response = await Origin.YouTube.remove_tracks_to_playlist({cookie_jar: cookie_jar}, home.icfg.ytcfg, playlist_url, uris);
    return deletion_response;
}

export async function youtube_music_add_tracks_to_playlist(tracks: Track[], playlist_url: string) {
    const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.youtubemusic_id));
    const uris = tracks.map(track => track.youtubemusic_id) as string[];
    const home = await Origin.YouTubeMusic.get_home({cookie_jar: cookie_jar});
    if("error" in home) return false;
    const add_response = await Origin.YouTubeMusic.add_tracks_to_playlist({cookie_jar: cookie_jar}, home.icfg.ytcfg, playlist_url, uris);
    return add_response;
}
export async function youtube_music_delete_tracks_from_playlist(tracks: Track[], playlist_url: string) {
    const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.youtubemusic_id));
    const uris = tracks.map(track => {
        return {
            video_id: track.youtube_id as string,
            set_video_id: track.youtubemusic_id as string
        }
    });
    const home = await Origin.YouTubeMusic.get_home({cookie_jar: cookie_jar});
    if("error" in home) return false;
    const deletion_response = await Origin.YouTubeMusic.remove_tracks_to_playlist({cookie_jar: cookie_jar}, home.icfg.ytcfg, playlist_url, uris);
    return deletion_response;
}
export async function apple_music_add_tracks_to_playlist(tracks: Track[], playlist_url: string) {
    const cookie_jar = Prefs.get_pref('apple_music_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.applemusic_id));
    const uris = tracks.map(track => ({id: track.applemusic_id!, type: "songs"}));
    const add_response = await Origin.AppleMusic.add_tracks_to_playlist(playlist_url, uris as {id: string, type: "songs"}[], {cookie_jar: cookie_jar});
    if("error" in add_response) return false;
    return add_response.ok;
}
export async function apple_music_delete_tracks_from_playlist(tracks: Track[], playlist_url: string) {
    const cookie_jar = Prefs.get_pref('apple_music_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.applemusic_id));
    const uris = tracks.map(track => track.applemusic_id!);
    const data = await Origin.AppleMusic.get_serialized_server_data("https://music.apple.com/us/library/all-playlists/", {cookie_jar: cookie_jar});
    if("error" in data) return false;
    let all_ok = true;
    for(const uri of uris) {
        const deletion_response = await Origin.AppleMusic.remove_track_from_playlist(playlist_url, uri, data.authorization, {cookie_jar: cookie_jar});
        if("error" in deletion_response || !deletion_response.ok) {
            all_ok = false;
        }
    }
    return all_ok;
}
export async function soundcloud_add_tracks_to_playlist(tracks: Track[], playlist_url: string) {
    const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.soundcloud_id));
    const uris = tracks.map(track => track.soundcloud_id!);
    const add_response = await Origin.SoundCloud.add_tracks_to_playlist({cookie_jar: cookie_jar, playlist_name: playlist_url, track_ids: uris});
    if("error" in add_response) return false;
    return add_response.data.ok;
}
export async function soundcloud_delete_tracks_from_playlist(tracks: Track[], playlist_url: string) {
    const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
    tracks = tracks.filter(track => !is_empty(track.soundcloud_id));
    const uris = tracks.map(track => track.soundcloud_id!);
    const deletion_response = await Origin.SoundCloud.delete_tracks_to_playlist({cookie_jar: cookie_jar, playlist_name: playlist_url, track_ids: uris});
    if("error" in deletion_response) return false;
    return true;
}

export async function illusi_add_tracks_to_playlist(tracks: Track[], playlist_uri: string): Promise<boolean> {
    // const uuid = playlist_uri.split(':')[1];
    // const rows = tracks.map(track => ({ uuid, track_uid: track.uid }));
    // for(const row of rows){
    //     await SQLPlaylists.insert_track_playlist(row);
    // }
    // return true;
    return false;
}

export async function illusi_delete_tracks_from_playlist(tracks: Track[], playlist_uri: string): Promise<boolean> {
    // const uuid = playlist_uri.split(':')[1];
    // const rows = tracks.map(track => ({ uuid, track_uid: track.uid }));
    // await SQLPlaylists.delete_all_tracks_playlist(rows);
    // return true;
    return false;
}