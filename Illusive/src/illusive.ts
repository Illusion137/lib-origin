import { amazon_music_add_tracks_to_playlist, amazon_music_delete_tracks_from_playlist, apple_music_add_tracks_to_playlist, apple_music_delete_tracks_from_playlist, soundcloud_add_tracks_to_playlist, soundcloud_delete_tracks_from_playlist, spotify_add_tracks_to_playlist, spotify_delete_tracks_from_playlist, youtube_add_tracks_to_playlist, youtube_delete_tracks_from_playlist, youtube_music_add_tracks_to_playlist, youtube_music_delete_tracks_from_playlist } from "./add_delete_tracks_from_playlist";
import { amazon_music_create_playlist, amazon_music_delete_playlist, apple_music_create_playlist, apple_music_delete_playlist, soundcloud_create_playlist, soundcloud_delete_playlist, spotify_create_playlist, spotify_delete_playlist, youtube_create_playlist, youtube_delete_playlist, youtube_music_create_playlist, youtube_music_delete_playlist } from "./create_delete_playlist";
import { amazon_music_get_playlist, api_get_playlist, apple_music_get_playlist, apple_music_get_playlist_continuation, illusi_get_playlist, musi_get_playlist, soundcloud_get_playlist, soundcloud_get_playlist_continuation, spotify_get_playlist, spotify_get_playlist_continuation, youtube_get_playlist, youtube_get_playlist_continuation, youtube_music_get_playlist, youtube_music_get_playlist_continuation } from "./get_playlist";
import { amazon_music_get_user_playlists, apple_music_get_user_playlists, soundcloud_get_user_playlists, spotify_get_user_playlists, youtube_get_user_playlists, youtube_music_get_user_playlists } from "./get_user_playlist";
import { amazon_music_search, soundcloud_search, soundcloud_search_continuation, spotify_search, youtube_music_search, youtube_search } from "./search";
import { soundcloud_download_from_id, youtube_download_from_id } from "./download_from_id";
import { Artwork, MusicService, MusicServiceType, Track } from "./types";
import { Prefs } from "./prefs";
import * as Origin from '../../origin/src/index'
import { shuffle_array } from "./illusive_utilts";
import { is_empty, remove_topic } from "../../origin/src/utils/util";
import { ResponseError } from "../../origin/src/utils/types";
import { get_soundcloud_track_mix, get_youtube_track_mix } from "./get_track_mix";

export namespace Illusive {
    export const illusi_icon: number = require('./assets/illusi_icon.png');
    export const illusi_dark_icon: number = require('./assets/illusi_dark_icon.png');
    export const imported_thumbnail: number = require('./assets/imported_thumbnail.png');

    export const sqlite_directory       = "SQLite/";
    export const thumbnail_archive_path = "thumbnail_archive/";
    export const media_archive_path     = "media_archive/";
    export const lyrics_archive_path    = "lyrics_archive/";

    export const default_directories = [thumbnail_archive_path, media_archive_path, lyrics_archive_path];
    export const default_directories_wsql = default_directories.concat(sqlite_directory);
    
    const illusi = new MusicService(
        {
            'app_icon': illusi_icon,
            'valid_playlist_url_regex': /(https?:\/\/)illusi\.dev\/playlist\/.+/i,
            'link_text': 'https://illusi.dev/playlist/...',
            'required_cookie_credentials': [],
            'get_user_playlists': undefined,
            'get_playlist': illusi_get_playlist,
            'search': undefined,
            'explore': undefined,
            'create_playlist': undefined,
            'delete_playlist': undefined,
            'add_tracks_to_playlist': undefined,
            'delete_tracks_from_playlist': undefined
        });
    const musi = new MusicService(
        {
            'app_icon': 'https://is2-ssl.mzstatic.com/image/thumb/Purple122/v4/7d/76/2f/7d762f0e-10ab-1ff2-baf7-84cdaca16219/Icon-1x_U007emarketing-0-6-0-85-220.png/350x350.png?',
            'valid_playlist_url_regex': /(https?:\/\/)feelthemusi\.com\/playlist\/.+/i,
            'link_text': 'https://feelthemusi.com/playlist/...',
            'required_cookie_credentials': [],
            'get_user_playlists': undefined,
            'get_playlist': musi_get_playlist,
            'search': undefined,
            'explore': undefined,
            'create_playlist': undefined,
            'delete_playlist': undefined,
            'add_tracks_to_playlist': undefined,
            'delete_tracks_from_playlist': undefined
        });
    const youtube = new MusicService(
        {
            'app_icon': 'https://is5-ssl.mzstatic.com/image/thumb/Purple122/v4/fc/c7/18/fcc718a6-bd55-b1aa-93e4-4073a2ad3b13/logo_youtube_color-1x_U007emarketing-0-6-0-85-220.png/350x350.png?',
            'web_view_url': 'https://m.youtube.com/',
            'pref_cookie_jar': "youtube_cookie_jar",
            'valid_playlist_url_regex': /(https?:\/\/)(www\.)?youtube\.com\/playlist\?list=.+/i,
            'link_text': 'https://www.youtube.com/playlist?list=...',
            'required_cookie_credentials': ["LOGIN_INFO"],
            'get_user_playlists': youtube_get_user_playlists,
            'get_playlist': youtube_get_playlist,
            'get_playlist_continuation': youtube_get_playlist_continuation,
            'cookie_jar_callback': () => Prefs.get_pref("youtube_cookie_jar"),
            'search': youtube_search,
            'explore': undefined,
            'create_playlist': youtube_create_playlist,
            'delete_playlist': youtube_delete_playlist,
            'add_tracks_to_playlist': youtube_add_tracks_to_playlist,
            'delete_tracks_from_playlist': youtube_delete_tracks_from_playlist,
            'get_track_mix': get_youtube_track_mix,
            'download_from_id': youtube_download_from_id
        });
    const youtube_music = new MusicService(
        {
            'app_icon': 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/44/c6/3d/44c63da2-7a82-bd82-821d-1cd01f2b510f/AppIcon-0-1x_U007emarketing-0-0-0-7-0-0-0-85-220-0.png/350x350.png?',
            'web_view_url': 'https://music.youtube.com/',
            'pref_cookie_jar': "youtube_music_cookie_jar",
            'valid_playlist_url_regex': /(https?:\/\/)(www\.)?music\.youtube\.com\/playlist\?list=.+/i,
            'link_text': 'https://music.youtube.com/playlist?list=...',
            'required_cookie_credentials': ["LOGIN_INFO"],
            'get_user_playlists': youtube_music_get_user_playlists,
            'get_playlist': youtube_music_get_playlist,
            'get_playlist_continuation': youtube_music_get_playlist_continuation,
            'cookie_jar_callback': () => Prefs.get_pref("youtube_music_cookie_jar"),
            'search': youtube_music_search,
            'explore': undefined,
            'create_playlist': youtube_music_create_playlist,
            'delete_playlist': youtube_music_delete_playlist,
            'add_tracks_to_playlist': youtube_music_add_tracks_to_playlist,
            'delete_tracks_from_playlist': youtube_music_delete_tracks_from_playlist
        });
    const spotify = new MusicService(
        {
            'app_icon': 'https://is2-ssl.mzstatic.com/image/thumb/Purple122/v4/63/64/fa/6364fa97-398a-46da-32ac-765e8f328548/AppIcon-0-1x_U007emarketing-0-6-0-0-0-85-220-0.png/350x350.png?',
            'web_view_url': 'https://open.spotify.com/',
            'pref_cookie_jar': "spotify_cookie_jar",
            'valid_playlist_url_regex': /(https?:\/\/)open\.spotify\.com\/(playlist|album|collection)\/.+/i,
            'link_text': 'https://open.spotify.com/playlist/... or  \n - https://open.spotify.com/album/...',
            'required_cookie_credentials': ["sp_dc"],
            'get_user_playlists': spotify_get_user_playlists,
            'get_playlist': spotify_get_playlist,
            'get_playlist_continuation': spotify_get_playlist_continuation,
            'cookie_jar_callback': () => Prefs.get_pref("spotify_cookie_jar"),
            'search': spotify_search,
            'explore': undefined,
            'create_playlist': spotify_create_playlist,
            'delete_playlist': spotify_delete_playlist,
            'add_tracks_to_playlist': spotify_add_tracks_to_playlist,
            'delete_tracks_from_playlist': spotify_delete_tracks_from_playlist
        });
    const amazon_music = new MusicService(
        {
            'app_icon': 'https://is4-ssl.mzstatic.com/image/thumb/Purple122/v4/fc/b8/aa/fcb8aae7-180e-7b29-7c83-255f1c86eba8/AppIcon-1x_U007emarketing-0-10-0-85-220.png/350x350.png?',
            'web_view_url': 'https://music.amazon.com/',
            'pref_cookie_jar': "amazon_music_cookie_jar",
            'valid_playlist_url_regex': /(https?:\/\/)music\.amazon\.com\/(playlists|user-playlists)\/.+/i,
            'link_text': 'https://music.amazon.com/user-playlists/... or  \n - https://music.amazon.com/playlists/...',
            'required_cookie_credentials': ["at-main"],
            'get_user_playlists': amazon_music_get_user_playlists,
            'get_playlist': amazon_music_get_playlist,
            'cookie_jar_callback': () => Prefs.get_pref("amazon_music_cookie_jar"),
            'search': amazon_music_search,
            'explore': undefined,
            'create_playlist': amazon_music_create_playlist,
            'delete_playlist': amazon_music_delete_playlist,
            'add_tracks_to_playlist': amazon_music_add_tracks_to_playlist,
            'delete_tracks_from_playlist': amazon_music_delete_tracks_from_playlist
        });
    const apple_music = new MusicService(
        {
            'app_icon': 'https://is1-ssl.mzstatic.com/image/thumb/Purple122/v4/8e/18/bd/8e18bd19-1453-d9be-620d-66930b61e487/AppIcon-0-0-1x_U007emarketing-0-10-0-85-220.png/246x0w.webp',
            'web_view_url': 'https://music.apple.com/us/home',
            'pref_cookie_jar': "apple_music_cookie_jar",
            'valid_playlist_url_regex': /(https?:\/\/)music\.apple\.com\/.+?\/playlist\/.+?/i,
            'link_text': 'https://music.apple.com/us/playlist/.../... or \n - https://music.apple.com/library/playlist/...',
            'required_cookie_credentials': ["commerce-authorization-token"],
            'get_user_playlists': apple_music_get_user_playlists,
            'get_playlist': apple_music_get_playlist,
            'get_playlist_continuation': apple_music_get_playlist_continuation,
            'cookie_jar_callback': () => Prefs.get_pref("apple_music_cookie_jar"),
            'search': undefined,
            'explore': undefined,
            'create_playlist': apple_music_create_playlist,
            'delete_playlist': apple_music_delete_playlist,
            'add_tracks_to_playlist': apple_music_add_tracks_to_playlist,
            'delete_tracks_from_playlist': apple_music_delete_tracks_from_playlist
        });
    const soundcloud = new MusicService(
        {
            'app_icon': 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/87/15/59/871559b2-5653-32f3-c9aa-b61a39bb8d84/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/246x0w.webp',
            'web_view_url': 'https://soundcloud.com/discover',
            'pref_cookie_jar': "soundcloud_cookie_jar",
            'valid_playlist_url_regex': /(https?:\/\/)soundcloud\.com\/.+?\/(sets\/.+)?/i,
            'link_text': 'https://soundcloud.com/.../sets/... or \n - https://soundcloud.com/...',
            'required_cookie_credentials': ["sc_anonymous_id"],
            'get_user_playlists': soundcloud_get_user_playlists,
            'get_playlist': soundcloud_get_playlist,
            'get_playlist_continuation': soundcloud_get_playlist_continuation,
            'cookie_jar_callback': () => Prefs.get_pref("soundcloud_cookie_jar"),
            'search': soundcloud_search,
            'search_continuation': soundcloud_search_continuation,
            'explore': undefined,
            'create_playlist': soundcloud_create_playlist,
            'delete_playlist': soundcloud_delete_playlist,
            'add_tracks_to_playlist': soundcloud_add_tracks_to_playlist,
            'delete_tracks_from_playlist': soundcloud_delete_tracks_from_playlist,
            'get_track_mix': get_soundcloud_track_mix,
            'download_from_id': soundcloud_download_from_id
        });
    const api = new MusicService(
        {
            'app_icon': illusi_dark_icon,
            'valid_playlist_url_regex': /.+/,
            'link_text': "...any link that returns an Illusive-Playlist",
            'required_cookie_credentials': [],
            'get_playlist': api_get_playlist,
        });

    export const music_service: Map<MusicServiceType, MusicService> = new Map<MusicServiceType, MusicService>([
        ["Illusi", illusi],
        ["Musi", musi],
        ["YouTube", youtube],
        ["YouTube Music", youtube_music],
        ["Spotify", spotify],
        ["Amazon Music", amazon_music],
        ["SoundCloud", soundcloud],
        ["Apple Music", apple_music],
        ["API", api],
    ]);

    export async function convert_track(track: Track, to_music_service: MusicServiceType): Promise<Track|ResponseError>{
        if(music_service.get(to_music_service)?.search === undefined) return {"error": "can't convert to this music-service"};
        const search_tracks = await music_service.get(to_music_service)!.search!(`${remove_topic(track.artists[0].name)} ${track.title}`);
        if(search_tracks.tracks.length === 0) return {"error": "no tracks"};
        type Max = {"index": number, "value": number};
        let best: Max = {"index": 0, "value": 25};
        let all_negative_values = true;
        const ttitle = track.title.toLowerCase();
        const tartist = track.artists[0].name.toLowerCase();
        for(let i = 0; i < search_tracks.tracks.length; i++){
            const current: Max = {"index": i, "value": 0};
            const ctrack = search_tracks.tracks[i];
            const ctitle = ctrack.title.toLowerCase();
            const cartist = ctrack.artists[0].name.toLowerCase();
            if(ctitle.includes(ttitle)) current.value += 30;
            if(ctitle.includes(ttitle) && ctitle.includes(remove_topic(tartist))) current.value += 40;
            if(ctitle.includes(ttitle) && cartist.includes(remove_topic(tartist))) current.value += 55;
            if(cartist.includes(remove_topic(tartist))) current.value += 15;
            if(cartist.includes(" - Topic")) current.value += 15;
            if(ctitle.includes("Official Audio")) current.index += 10;
            if(ctitle.includes("Official Music Video")) current.index += 8;
            if(ctitle.includes("Music Video")) current.index += 5;
            if(!isNaN(track.duration) && ! isNaN(ctrack.duration))
                current.value += (15 - Math.abs(ctrack.duration - track.duration)) * 4;

            if(current.value > 0) all_negative_values = false;
            if(current.value > best.value) best = current;
        }
        if(all_negative_values) return {"error": "Unable to find good conversion"};
        const best_match: Track = search_tracks.tracks[best.index];
        return best_match;
    }

    type ExportTrack = {"url": string, "new_track_data"?: Track}
    export async function get_download_url(document_directory: string, track: Track, quality?: string): Promise<ExportTrack|ResponseError>{
        if(!is_empty(track.media_uri) || !is_empty(track.imported_id))
            return { "url": document_directory + media_archive_path + track.media_uri! };
        else if(!is_empty(track.youtube_id))
            return await music_service.get("YouTube")!.download_from_id!(track.youtube_id!, quality ?? "highestaudio");
        else if(!is_empty(track.soundcloud_permalink))
            return await music_service.get("SoundCloud")!.download_from_id!(track.soundcloud_permalink!, quality!);
        const new_track_data = await convert_track(track, "YouTube");
        if("error" in new_track_data) return new_track_data;
        const youtube_dl_response = await music_service.get("YouTube")!.download_from_id!(new_track_data.youtube_id!, quality ?? "highestaudio");
        if("error" in youtube_dl_response) return youtube_dl_response;
        return { "url": youtube_dl_response.url, "new_track_data": new_track_data };
    }

    type ExportMix = {"tracks": Track[], "new_track_data"?: Track}
    export async function get_track_mix(track: Track): Promise<ExportMix|ResponseError> {
        if(!is_empty(track.youtube_id))
            return await music_service.get("YouTube")!.get_track_mix!(track.youtube_id!);
        else if(!is_empty(track.soundcloud_permalink))
            return await music_service.get("SoundCloud")!.get_track_mix!(track.soundcloud_permalink!);
        const new_track_data = await convert_track(track, "YouTube");
        if("error" in new_track_data) return new_track_data;
        const youtube_mix_response = await music_service.get("YouTube")!.get_track_mix!(new_track_data.youtube_id!);
        if("error" in youtube_mix_response) return youtube_mix_response;
        return {"tracks": youtube_mix_response.tracks, "new_track_data": new_track_data};
    }

    export async function get_highest_quality_youtube_thumbnail_uri(video_id: string){
        const uris_descending = [
            `https://i.ytimg.com/vi/${video_id}/maxresdefault.jpg`,
            `https://i.ytimg.com/vi/${video_id}/hq720.jpg`,
            `https://i.ytimg.com/vi/${video_id}/sddefault.jpg`,
            `https://i.ytimg.com/vi/${video_id}/hqdefault.jpg`,
            `https://i.ytimg.com/vi/${video_id}/mqdefault.jpg`,
            `https://i.ytimg.com/vi/${video_id}/default.jpg`,
        ];
        for(const uri of uris_descending){
            try {
                const result = await fetch(uri, {});
                if(result.status === 200) return uri;
            } catch (error) {}
        }
        return `https://img.youtube.com/vi/${video_id}/0.jpg`;
    }

    export async function get_best_track_artwork(track: Track): Promise<Artwork> {
        if(!is_empty(track.imported_id))
            return imported_thumbnail;
        if(!is_empty(track.thumbnail_uri))
            return {"uri": track.thumbnail_uri!, "cache": 'force-cache'};
        if(!is_empty(track.youtube_id))
            return {"uri": await get_highest_quality_youtube_thumbnail_uri(track.youtube_id!), "cache": 'force-cache'};
        if(!is_empty(track.artwork_url))
            return {"uri": track.artwork_url!, "cache": 'force-cache'};
        return illusi_dark_icon;
    }

    export function get_track_artwork(track: Track): Artwork {
        if(!is_empty(track.imported_id))
            return imported_thumbnail;
        if(!is_empty(track.artwork_url))
            return {"uri": track.artwork_url!, "cache": 'force-cache'};
        if(!is_empty(track.youtube_id))
            return {"uri": `https://img.youtube.com/vi/${track.youtube_id}/0.jpg`, "cache": 'force-cache'};
        return illusi_dark_icon;
    }

    export async function get_suggestions(query: string){ return await Origin.Google.get_suggestions(query); }

    export async function get_track_lryics(track: Track){
        const search_response = await Origin.Genius.search(`${remove_topic(track.artists[0].name)} ${track.title}`);
        if("error" in search_response) return search_response;
        const lyrics_response = await Origin.Genius.get_lyrics(search_response);
        return lyrics_response;
    }

    export type ShuffleMode = "ORDER" | "SHUFFLE";
    export function shuffle_tracks(mode: ShuffleMode, tracks: Track[], start_track?: Track): Track[]{
        if(Prefs.get_pref('only_play_downloaded')) tracks = tracks.filter(track => !is_empty(track.media_uri));
        switch(mode){
            case "ORDER": {
                if(start_track === undefined) return tracks;
                const start_track_index = tracks.findIndex(track => track.uid === start_track.uid);
                if(start_track_index === -1) return tracks;
                return tracks.slice(start_track_index);
            }
            case "SHUFFLE": {
                const shuffled = shuffle_array(tracks);
                if(start_track === undefined) return shuffled;
                const start_track_index = tracks.findIndex(track => track.uid === start_track.uid);
                if(start_track_index === -1) return shuffled;
                [tracks[0], tracks[start_track_index]] = [tracks[start_track_index], tracks[0]];
                return shuffled;
            }
            default: return tracks;
        }
    }
}