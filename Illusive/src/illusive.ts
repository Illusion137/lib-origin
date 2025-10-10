import fuzzysort from 'fuzzysort';
import * as Origin from '@origin/index'
import { TimedCache, type PromiseResult, type ResponseError } from "@common/types";
import { extract_string_from_pattern, is_empty, json_catch, random_of, shuffle_array } from "@common/utils/util";
import { amazon_music_add_tracks_to_playlist, amazon_music_delete_tracks_from_playlist, apple_music_add_tracks_to_playlist, apple_music_delete_tracks_from_playlist, soundcloud_add_tracks_to_playlist, soundcloud_delete_tracks_from_playlist, spotify_add_tracks_to_playlist, spotify_delete_tracks_from_playlist, youtube_add_tracks_to_playlist, youtube_delete_tracks_from_playlist, youtube_music_add_tracks_to_playlist, youtube_music_delete_tracks_from_playlist } from "@illusive/add_delete_tracks_from_playlist";
import { amazon_music_create_playlist, amazon_music_delete_playlist, apple_music_create_playlist, apple_music_delete_playlist, soundcloud_create_playlist, soundcloud_delete_playlist, spotify_create_playlist, spotify_delete_playlist, youtube_create_playlist, youtube_delete_playlist, youtube_music_create_playlist, youtube_music_delete_playlist } from "@illusive/create_delete_playlist";
import { soundcloud_download_from_id, youtube_download_from_id } from "@illusive/download_from_id";
import { apple_music_get_artist, soundcloud_get_artist, youtube_music_get_artist } from '@illusive/get_artist';
import { apple_music_get_latest_releases, soundcloud_get_latest_releases, youtube_music_get_latest_releases } from '@illusive/get_latest_releases';
import { amazon_music_get_playlist, api_get_playlist, apple_music_get_playlist, apple_music_get_playlist_continuation, illusi_get_playlist, musi_get_playlist, soundcloud_get_playlist, soundcloud_get_playlist_continuation, spotify_get_playlist, spotify_get_playlist_continuation, youtube_get_playlist, youtube_get_playlist_continuation, youtube_music_get_playlist, youtube_music_get_playlist_continuation } from "@illusive/get_playlist";
import { get_soundcloud_track_mix, get_youtube_track_mix } from "@illusive/get_track_mix";
import { amazon_music_get_user_playlists, apple_music_get_user_playlists, soundcloud_get_user_playlists, spotify_get_user_playlists, youtube_get_user_playlists, youtube_music_get_user_playlists } from "@illusive/get_user_playlist";
import { all_words, artist_string, clean_title, is_topic, number_epsilon_distance, one_includes_word_not_other, str_or_include } from "@illusive/illusive_utils";
import { Prefs } from "@illusive/prefs";
import { amazon_music_search, apple_music_search, soundcloud_search, soundcloud_search_continuation, spotify_search, youtube_music_search, youtube_search } from "@illusive/search";
import type { Artwork, CompactArtist, CompactPlaylist, DownloadFromIdResult, MusicSearchResponse, MusicServiceType, Track } from "@illusive/types";
import { MusicService } from "@illusive/types";
import { youtube_music_get_new_releases } from '@illusive/new_releases';
import { parse_youtube_music_track } from '@illusive/parsers/youtube_music_parser';
import { Constants } from '@illusive/constants';
import { generror } from '@common/utils/error_util';
import { remove_topic } from '@common/utils/clean_util';
import pathlib from 'path-browserify';

export namespace Illusive {
    export const illusi_icon_index = 0;
    export const illusi_dark_icon_index = 1;
    export const imported_thumbnail_index = 2;

    export const sqlite_directory       = "SQLite/";
    export const custom_thumbnail_archive_path = "custom_thumbnail_archive/";
    export const thumbnail_archive_path = "thumbnail_archive/";
    export const media_archive_path     = "media_archive/";
    export const lyrics_archive_path    = "lyrics_archive/";

    export const default_directories = [custom_thumbnail_archive_path, thumbnail_archive_path, media_archive_path, lyrics_archive_path];
    export const default_directories_wsql = default_directories.concat(sqlite_directory);
    
    const illusi = new MusicService(
        {
            app_icon: illusi_icon_index,
            valid_playlist_url_regex: /(https?:\/\/)illusi\.dev\/playlist\/.+/i,
            link_text: 'https://illusi.dev/playlist/...',
            required_cookie_credentials: [],
            get_user_playlists: undefined,
            get_playlist: illusi_get_playlist,
            search: undefined,
            explore: undefined,
            create_playlist: undefined,
            delete_playlist: undefined,
            add_tracks_to_playlist: undefined,
            delete_tracks_from_playlist: undefined
        });
    const musi = new MusicService(
        {
            app_icon: 'https://is2-ssl.mzstatic.com/image/thumb/Purple122/v4/7d/76/2f/7d762f0e-10ab-1ff2-baf7-84cdaca16219/Icon-1x_U007emarketing-0-6-0-85-220.png/350x350.png?',
            valid_playlist_url_regex: /(https?:\/\/)feelthemusi\.com\/playlist\/.+/i,
            link_text: 'https://feelthemusi.com/playlist/...',
            required_cookie_credentials: [],
            get_user_playlists: undefined,
            get_playlist: musi_get_playlist,
            search: undefined,
            explore: undefined,
            create_playlist: undefined,
            delete_playlist: undefined,
            add_tracks_to_playlist: undefined,
            delete_tracks_from_playlist: undefined
        });
    const youtube = new MusicService(
        {
            app_icon: 'https://is5-ssl.mzstatic.com/image/thumb/Purple122/v4/fc/c7/18/fcc718a6-bd55-b1aa-93e4-4073a2ad3b13/logo_youtube_color-1x_U007emarketing-0-6-0-85-220.png/350x350.png?',
            web_view_url: 'https://m.youtube.com/',
            pref_cookie_jar: "youtube_cookie_jar",
            valid_playlist_url_regex: /(https?:\/\/)(www\.)?youtube\.com\/playlist\?list=.+/i,
            link_text: 'https://www.youtube.com/playlist?list=...',
            required_cookie_credentials: ["LOGIN_INFO"],
            get_user_playlists: youtube_get_user_playlists,
            get_playlist: youtube_get_playlist,
            get_playlist_continuation: youtube_get_playlist_continuation,
            cookie_jar_callback: () => Prefs.get_pref("youtube_cookie_jar"),
            search: youtube_search,
            explore: undefined,
            create_playlist: youtube_create_playlist,
            delete_playlist: youtube_delete_playlist,
            add_tracks_to_playlist: youtube_add_tracks_to_playlist,
            delete_tracks_from_playlist: youtube_delete_tracks_from_playlist,
            get_track_mix: get_youtube_track_mix,
            download_from_id: youtube_download_from_id,
            get_artist: youtube_music_get_artist,
            get_latest_releases: youtube_music_get_latest_releases
        });
    const youtube_music = new MusicService(
        {
            app_icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/44/c6/3d/44c63da2-7a82-bd82-821d-1cd01f2b510f/AppIcon-0-1x_U007emarketing-0-0-0-7-0-0-0-85-220-0.png/350x350.png?',
            web_view_url: 'https://music.youtube.com/',
            pref_cookie_jar: "youtube_music_cookie_jar",
            valid_playlist_url_regex: /(https?:\/\/)(www\.)?music\.youtube\.com\/playlist\?list=.+/i,
            link_text: 'https://music.youtube.com/playlist?list=...',
            required_cookie_credentials: ["LOGIN_INFO"],
            get_user_playlists: youtube_music_get_user_playlists,
            get_playlist: youtube_music_get_playlist,
            get_playlist_continuation: youtube_music_get_playlist_continuation,
            cookie_jar_callback: () => Prefs.get_pref("youtube_music_cookie_jar"),
            search: youtube_music_search,
            explore: undefined,
            create_playlist: youtube_music_create_playlist,
            delete_playlist: youtube_music_delete_playlist,
            add_tracks_to_playlist: youtube_music_add_tracks_to_playlist,
            delete_tracks_from_playlist: youtube_music_delete_tracks_from_playlist,
            get_artist: youtube_music_get_artist,
            get_new_releases: youtube_music_get_new_releases, 
            get_latest_releases: youtube_music_get_latest_releases
        });
    const spotify = new MusicService(
        {
            app_icon: 'https://is2-ssl.mzstatic.com/image/thumb/Purple122/v4/63/64/fa/6364fa97-398a-46da-32ac-765e8f328548/AppIcon-0-1x_U007emarketing-0-6-0-0-0-85-220-0.png/350x350.png?',
            web_view_url: 'https://open.spotify.com/',
            pref_cookie_jar: "spotify_cookie_jar",
            valid_playlist_url_regex: /(https?:\/\/)open\.spotify\.com\/(playlist|album|collection)\/.+/i,
            link_text: 'https://open.spotify.com/playlist/... or  \n - https://open.spotify.com/album/...',
            required_cookie_credentials: ["sp_dc"],
            get_user_playlists: spotify_get_user_playlists,
            get_playlist: spotify_get_playlist,
            get_playlist_continuation: spotify_get_playlist_continuation,
            cookie_jar_callback: () => Prefs.get_pref("spotify_cookie_jar"),
            search: spotify_search,
            explore: undefined,
            create_playlist: spotify_create_playlist,
            delete_playlist: spotify_delete_playlist,
            add_tracks_to_playlist: spotify_add_tracks_to_playlist,
            delete_tracks_from_playlist: spotify_delete_tracks_from_playlist
        });
    const amazon_music = new MusicService(
        {
            app_icon: 'https://is4-ssl.mzstatic.com/image/thumb/Purple122/v4/fc/b8/aa/fcb8aae7-180e-7b29-7c83-255f1c86eba8/AppIcon-1x_U007emarketing-0-10-0-85-220.png/350x350.png?',
            web_view_url: 'https://music.amazon.com/',
            pref_cookie_jar: "amazon_music_cookie_jar",
            valid_playlist_url_regex: /(https?:\/\/)music\.amazon\.com\/(playlists|user-playlists)\/.+/i,
            link_text: 'https://music.amazon.com/user-playlists/... or  \n - https://music.amazon.com/playlists/...',
            required_cookie_credentials: ["at-main"],
            get_user_playlists: amazon_music_get_user_playlists,
            get_playlist: amazon_music_get_playlist,
            cookie_jar_callback: () => Prefs.get_pref("amazon_music_cookie_jar"),
            search: amazon_music_search,
            explore: undefined,
            create_playlist: amazon_music_create_playlist,
            delete_playlist: amazon_music_delete_playlist,
            add_tracks_to_playlist: amazon_music_add_tracks_to_playlist,
            delete_tracks_from_playlist: amazon_music_delete_tracks_from_playlist
        });
    const apple_music = new MusicService(
        {
            app_icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple122/v4/8e/18/bd/8e18bd19-1453-d9be-620d-66930b61e487/AppIcon-0-0-1x_U007emarketing-0-10-0-85-220.png/246x0w.webp',
            web_view_url: 'https://music.apple.com/us/home',
            pref_cookie_jar: "apple_music_cookie_jar",
            valid_playlist_url_regex: /(https?:\/\/)music\.apple\.com\/.+?\/playlist\/.+?/i,
            link_text: 'https://music.apple.com/us/playlist/.../... or \n - https://music.apple.com/library/playlist/...',
            required_cookie_credentials: ["commerce-authorization-token"],
            get_user_playlists: apple_music_get_user_playlists,
            get_playlist: apple_music_get_playlist,
            get_playlist_continuation: apple_music_get_playlist_continuation,
            cookie_jar_callback: () => Prefs.get_pref("apple_music_cookie_jar"),
            search: apple_music_search,
            explore: undefined,
            create_playlist: apple_music_create_playlist,
            delete_playlist: apple_music_delete_playlist,
            add_tracks_to_playlist: apple_music_add_tracks_to_playlist,
            delete_tracks_from_playlist: apple_music_delete_tracks_from_playlist,
            get_artist: apple_music_get_artist,
            get_latest_releases: apple_music_get_latest_releases
        });
    const soundcloud = new MusicService(
        {
            app_icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/87/15/59/871559b2-5653-32f3-c9aa-b61a39bb8d84/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/246x0w.webp',
            web_view_url: 'https://soundcloud.com/discover',
            pref_cookie_jar: "soundcloud_cookie_jar",
            valid_playlist_url_regex: /(https?:\/\/)soundcloud\.com\/.+?\/(sets\/.+)?/i,
            link_text: 'https://soundcloud.com/.../sets/... or \n - https://soundcloud.com/...',
            required_cookie_credentials: ["sc_anonymous_id", "oauth_token", "datadome"],
            get_user_playlists: soundcloud_get_user_playlists,
            get_playlist: soundcloud_get_playlist,
            get_playlist_continuation: soundcloud_get_playlist_continuation,
            cookie_jar_callback: () => Prefs.get_pref("soundcloud_cookie_jar"),
            search: soundcloud_search,
            search_continuation: soundcloud_search_continuation,
            explore: undefined,
            create_playlist: soundcloud_create_playlist,
            delete_playlist: soundcloud_delete_playlist,
            add_tracks_to_playlist: soundcloud_add_tracks_to_playlist,
            delete_tracks_from_playlist: soundcloud_delete_tracks_from_playlist,
            get_track_mix: get_soundcloud_track_mix,
            download_from_id: soundcloud_download_from_id,
            get_artist: soundcloud_get_artist,
            get_latest_releases: soundcloud_get_latest_releases
        });
    const api = new MusicService(
        {
            app_icon: illusi_dark_icon_index,
            valid_playlist_url_regex: /.+/,
            link_text: "...any link that returns an Illusive-Playlist",
            required_cookie_credentials: [],
            get_playlist: api_get_playlist,
        });

    export const music_service: Map<MusicServiceType, MusicService> = new Map<MusicServiceType, MusicService>([
        ["YouTube", youtube],
        ["YouTube Music", youtube_music],
        ["Spotify", spotify],
        ["SoundCloud", soundcloud],
        ["Apple Music", apple_music],
        ["Amazon Music", amazon_music],
        ["Illusi", illusi],
        ["Musi", musi],
        ["API", api],
    ]);
    export const free_music_services: MusicServiceType[] = ["API", "Illusi", "Musi", "YouTube", "Spotify", "SoundCloud", "Apple Music"];

    interface ExportTrack {"new_track_data"?: Track}
    const download_url_timed_cache = new TimedCache<string, (DownloadFromIdResult&ExportTrack)|ResponseError>(Constants.playlist_cache_duration_seconds); 
    export async function get_download_url(document_directory: string, track: Track, quality?: string, redownload_mode?: boolean): Promise<(DownloadFromIdResult&ExportTrack)|ResponseError> {
        if(!is_empty(track.media_uri) && !(redownload_mode ?? false))
            return { url: pathlib.join(document_directory, media_archive_path, track.media_uri!) };
        const key = track.uid + (track.illusi_id ?? "") + ";:;" + quality;
        if(download_url_timed_cache.get(key)) return download_url_timed_cache.get(key)!;
        if(!is_empty(track.youtube_id))
            return download_url_timed_cache.update(key, await music_service.get("YouTube")!.download_from_id!(track.youtube_id!, quality ?? "highestaudio")) ;
        else if(!is_empty(track.soundcloud_permalink))
            return download_url_timed_cache.update(key, await music_service.get("SoundCloud")!.download_from_id!(track.soundcloud_permalink!, quality!));
        const new_track_data = await convert_track(track, {});
        if("error" in new_track_data) return new_track_data;
        if(is_empty(new_track_data.track!.youtube_id) && is_empty(new_track_data.track!.soundcloud_id)) return generror("No track data found in getting download_url", {track, quality, redownload_mode});
        const mode: MusicServiceType = new_track_data.track!.youtube_id ? "YouTube" : "SoundCloud";
        const convert_response = await music_service.get(mode)!.download_from_id!(mode === "YouTube" ? new_track_data.track!.youtube_id! : new_track_data.track!.soundcloud_permalink!, quality ?? "highestaudio");
        if("error" in convert_response) return convert_response;
        return download_url_timed_cache.update(key, { url: convert_response.url, metadata: convert_response.metadata, new_track_data: new_track_data.track });
    }

    interface ExportMix {"tracks": Track[], "new_track_data"?: Track}
    export async function get_track_mix(track: Track): Promise<ExportMix|ResponseError> {
        if(!is_empty(track.youtube_id))
            return await music_service.get("YouTube")!.get_track_mix!(track.youtube_id!);
        else if(!is_empty(track.soundcloud_permalink))
            return await music_service.get("SoundCloud")!.get_track_mix!(track.soundcloud_permalink!);
        const to_service: MusicServiceType = "YouTube Music";
        const new_track_data = await convert_track(track, {to_music_service: to_service});
        if("error" in new_track_data) return new_track_data;
        if(is_empty(new_track_data.track!.youtube_id) && is_empty(new_track_data.track!.soundcloud_id)) return generror("No track data found in getting track_mix", {track});
        const mode: MusicServiceType = new_track_data.track!.youtube_id ? "YouTube" : "SoundCloud";
        const mix_response = await music_service.get(to_service)!.get_track_mix!(mode === "YouTube" ? new_track_data.track!.youtube_id! : new_track_data.track!.soundcloud_permalink!);
        if("error" in mix_response) return mix_response;
        return {tracks: mix_response.tracks, new_track_data: new_track_data.track};
    }

    export function get_youtube_lowest_quality_thumbnail_uri(video_id: string){
        return `https://i.ytimg.com/vi/${video_id}/default.jpg`;
    } 
    export async function get_highest_quality_youtube_thumbnail_uri(video_id: string) {
        const uris_descending = [
            `https://i.ytimg.com/vi/${video_id}/maxresdefault.jpg`,
            `https://i.ytimg.com/vi/${video_id}/hq720.jpg`,
            `https://i.ytimg.com/vi/${video_id}/sddefault.jpg`,
            `https://i.ytimg.com/vi/${video_id}/hqdefault.jpg`,
            `https://i.ytimg.com/vi/${video_id}/mqdefault.jpg`,
            `https://i.ytimg.com/vi/${video_id}/default.jpg`,
        ];
        for(const uri of uris_descending) {
            try {
                const result = await fetch(uri, {});
                if(result.status === 200) return uri;
            } catch (error) {}
        }
        return `https://img.youtube.com/vi/${video_id}/0.jpg`;
    }

    export async function get_highest_quality_service_thumbnail_uri(uri: string){
        if(!/w\d{3,}-h\d{3,}/.test(uri)) return uri;
        const [width_str, height_str] = [extract_string_from_pattern(uri, /w(\d{3,})/g), extract_string_from_pattern(uri, /h(\d{3,})/g)];
        const [width, height] = [parseInt(width_str as string), parseInt(height_str as string)];
        const uris_descending = [
            uri.replace(/w\d{3,}/, 'w2000').replace(/h\d{3,}/, 'h2000'),
            uri.replace(/w\d{3,}/, 'w1000').replace(/h\d{3,}/, 'h1000'),
            uri.replace(/w\d{3,}/, 'w500').replace(/h\d{3,}/, 'h500'),
            uri.replace(/w\d{3,}/, `w${width * 8}`).replace(/h\d{3,}/, `h${height * 8}`),
            uri.replace(/w\d{3,}/, `w${width * 6}`).replace(/h\d{3,}/, `h${height * 6}`),
            uri.replace(/w\d{3,}/, `w${width * 4}`).replace(/h\d{3,}/, `h${height * 4}`),
            uri.replace(/w\d{3,}/, `w${width * 2}`).replace(/h\d{3,}/, `h${height * 2}`),
        ];
        for(const duri of uris_descending) {
            try {
                const result = await fetch(duri, {});
                if(result.status === 200) return duri;
            } catch (error) {}
        }
        return uri;
    }

    export async function get_best_track_artwork(document_directory: string, track: Track): Promise<Artwork> {
        if(!is_empty(track.imported_id))
            return imported_thumbnail_index;
        if(!is_empty(track.thumbnail_uri))
            return pathlib.join(document_directory, thumbnail_archive_path, track.thumbnail_uri!);
        if(!is_empty(track.artwork_url))
            return await get_highest_quality_service_thumbnail_uri(track.artwork_url!);
        if(!is_empty(track.youtube_id))
            return await get_highest_quality_youtube_thumbnail_uri(track.youtube_id!);
        return illusi_dark_icon_index;
    }

    export function get_track_artwork(document_directory: string, track: Track): Artwork {
        if(!is_empty(track.thumbnail_uri)){
            if(track.thumbnail_uri!.includes(track.uid))
                return pathlib.join(document_directory, thumbnail_archive_path, track.thumbnail_uri!);
            else
                return pathlib.join(document_directory, custom_thumbnail_archive_path, track.thumbnail_uri!);
        }
        if(!is_empty(track.imported_id))
            return imported_thumbnail_index;
        if(!is_empty(track.artwork_url))
            return track.artwork_url!;
        if(!is_empty(track.youtube_id))
            return `https://img.youtube.com/vi/${track.youtube_id}/0.jpg`;
        return illusi_dark_icon_index;
    }

    export async function get_suggestions(query: string){
        const suggestions = await Origin.YouTubeMusic.search_suggestions({}, query);
        return suggestions.map(s => typeof s === "string" ? s : parse_youtube_music_track(s));
    }

    async function lyrics_try_good_result(track: Track, search_query: string){
        const search_response = await Origin.Genius.search_songs(search_query, {});
        if("error" in search_response) return search_response;
        const best_result = search_response.find(hit => {
            const title_result = fuzzysort.single(
                clean_title(hit.result.title).trim(), 
                clean_title(track.title).trim(),
            );
            const artist_result = fuzzysort.single(
                clean_title(hit.result.artist_names).trim(), 
                clean_title(artist_string(track)).trim(),
            );
            return (title_result?.score ?? 0) >= 0.6 && (artist_result?.score ?? 0.5) >= 0.5
        });
        if(best_result === undefined) return generror("Unable to find a good lyrics result", {track, search_query});
        return best_result.result;
    }
    async function lyrics_get_first_good_result(track: Track, search_queries: string[]){
        for(const search_query of search_queries){
            const result = await lyrics_try_good_result(track, search_query);
            if("error" in result) continue;
            return result;
        }
        return generror("Unable to find a good lyrics result", {track, search_queries});
    }
    export async function get_track_lryics(track: Track): PromiseResult<string> {
        const artist_name = track.artists[0].name === "Various Artists" || track.artists[0].name.includes("Release") ? "" : track.artists[0].name;

        const track_title_split = track.title.split(' - ');
        const best_result = await lyrics_get_first_good_result(track, [
            track_title_split.length === 2 ? `${clean_title(track_title_split[0])} ${clean_title(track_title_split[1])}` : undefined,
            track_title_split.length === 2 ? `${clean_title(track_title_split[1])} ${remove_topic(artist_name)}` : undefined,
            `${remove_topic(artist_name)} ${track.title.replace(`${artist_name} - `, '')}`
        ].filter(s => s !== undefined));
        if("error" in best_result) return best_result;

        const lyrics_response = await Origin.Genius.get_lyrics(best_result, {});
        return lyrics_response;
    }

    export type ShuffleMode = "ORDER" | "SHUFFLE";
    export function shuffle_tracks(mode: ShuffleMode, tracks: Track[], start_track?: Track): Track[] {
        switch(mode) {
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

    interface ConvertTrackOptsNull {
        to_music_service?: MusicServiceType;
        deep_convert?: boolean;
        proxies?: Origin.Proxy.Proxy[];
        possible_services?: MusicServiceType[];
    }
    interface ConvertTrackOpts {
        to_music_service: MusicServiceType;
        deep_convert: boolean;
        proxies: Origin.Proxy.Proxy[];
        possible_services: MusicServiceType[];
    }
    
    export function convert_track_default_opts(track: Track, opts: ConvertTrackOptsNull): ConvertTrackOpts {
        opts.to_music_service = opts.to_music_service ?? "YouTube Music";
        opts.deep_convert = opts.deep_convert ?? false;
        opts.proxies = opts.proxies ?? [];
        opts.possible_services = opts.possible_services ?? (
            track.explicit === "EXPLICIT" ? ["YouTube Music"]
                : opts.deep_convert ?
                    ["YouTube Music", "SoundCloud", "YouTube"] :
                ["YouTube Music", "SoundCloud"]);
        return opts as ConvertTrackOpts;
    }

    export function is_youtube(track: Track) {
        return !!track.youtube_id && !track.amazonmusic_id && !track.applemusic_id && !track.soundcloud_id && !track.spotify_id;
    }
    
    function conversion_search_query(track: Track): string {
        if (is_youtube(track) && /^.+? - .+/gm.test(track.title))
            return track.title;
        return `${remove_topic(track.artists[0].name)} ${track.title}` + (track.artists.length > 1 ? `ft ${track.artists.slice(1).map(item => remove_topic(item.name)).join(', ')}` : "");
    }
    
    function conversion_score(i: number, track: Track, convert_from_track: Track, to: MusicServiceType) {
        let score = 0;
    
        if(track.artists.length === 0 || convert_from_track.artists.length === 0) return -1;
    
        const track_title = track.title.toLowerCase();
        const track_artist = remove_topic(track.artists[0].name.toLowerCase());
        const tracK_words = all_words(track_title);
    
        const current_title = convert_from_track.title.toLowerCase();
        const current_artist = convert_from_track.artists[0].name.toLowerCase();
        const current_words = all_words(current_title);
    
        if(to === "YouTube Music" && track.explicit === "EXPLICIT" && convert_from_track.explicit !== "EXPLICIT")
            score -= 150;
    
        if (one_includes_word_not_other(tracK_words, current_words, "instrumental")) score -= 50;
        if (one_includes_word_not_other(tracK_words, current_words, "spedup")) score -= 50;
        if (one_includes_word_not_other(tracK_words, current_words, "speedup")) score -= 50;
        if (one_includes_word_not_other(tracK_words, current_words, "sped") && one_includes_word_not_other(tracK_words, current_words, "up")) score -= 50;
        if (one_includes_word_not_other(tracK_words, current_words, "speed") && one_includes_word_not_other(tracK_words, current_words, "up")) score -= 50;
    
        if (str_or_include(current_title, track_title)) score += 30;
        if (str_or_include(current_title, track_title) && str_or_include(current_title, track_artist)) score += 40;
        if (str_or_include(current_title, track_title) && str_or_include(current_artist, track_artist)) score += 55;
        if (str_or_include(current_artist, remove_topic(track_artist))) score += 15;
        if (to === "YouTube" && current_artist.includes(" - Topic")) score += 15;
        if (current_title.includes("Official Audio")) score += 10;
        if (current_title.includes("Official Music Video")) score += 8;
        if (current_title.includes("Official Video")) score += 8;
        if (current_title.includes("Official Visualizer")) score += 8;
        if (current_title.includes("Music Video")) score += 5;
        if (!is_empty(track.duration) && !is_empty(convert_from_track.duration))
            score += (6 - Math.abs(convert_from_track.duration - track.duration)) * 4;
        if (score > 80) score += 5 * i;
        return score;
    }
    
    export interface MaxTrack { track?: Track, score: number };
    export async function convert_track(track: Track, _opts_: ConvertTrackOptsNull): PromiseResult<MaxTrack> {
        const opts = convert_track_default_opts(track, _opts_);
        const convert_to_music_service = music_service.get(opts.to_music_service);
    
        if (convert_to_music_service?.search === undefined) return generror(`Can't convert to this music-service; ${opts.to_music_service} lacks a search property`, {track, opts});
    
        opts.possible_services = opts.possible_services.filter(service => service !== opts.to_music_service);
    
        const query = conversion_search_query(track);
        let best: MaxTrack = { score: 30 };
        let all_negative_values = true;
    
        const search_tracks = await convert_to_music_service.search(query, { proxy: random_of(opts.proxies) });
        if (search_tracks.tracks.length === 0) {
            return opts.possible_services.length === 0 ?
                generror("Unable to convert track; No tracks found", {track, opts}) :
                convert_track(track, { ...opts, to_music_service: opts.possible_services[0] });
        }
        if ("error" in search_tracks) {
            return opts.possible_services.length === 0 ?
                search_tracks.error![0] :
                convert_track(track, { ...opts, to_music_service: opts.possible_services[0] });
        }
        search_tracks.tracks.sort((a, b) => (a.plays ?? 0) - (b.plays ?? 0));
        for (let i = 0; i < search_tracks.tracks.length; i++) {
            const score = conversion_score(i, track, search_tracks.tracks[i], opts.to_music_service);
    
            if (score > 30) all_negative_values = false;
            if (score > best.score) best = { track: search_tracks.tracks[i], score };
        }
    
        if (all_negative_values) {
            if (opts.possible_services.length === 0)
                return generror("Unable to find good track conversion", {track, opts});
            else return convert_track(track, { ...opts, to_music_service: opts.possible_services[0] });
        }
        else if (opts.deep_convert) {
            const deep_best = await convert_track(track, { ...opts, to_music_service: opts.possible_services[0] });
            if (!("error" in deep_best) && deep_best.score > best.score)
                best = deep_best;
        }
    
        return best;
    }
    type SmartSearch = (Track|CompactArtist|CompactPlaylist)[];
    export function smart_search(query: string, search: MusicSearchResponse): SmartSearch {
        if(is_empty(query)) return [];
        const smart_search_storage: SmartSearch = [];
        for(const artist of search.artists.slice(0, 3)){
            if(query.toLowerCase() === remove_topic(artist.name.name).toLowerCase()){
                smart_search_storage.push(artist);
                break;
            }
        }
        let found_track: Track;
        for(const track of search.tracks.slice(0, 5)){
            if(remove_topic(track.title).toLowerCase().includes(query.toLowerCase())){
                found_track = track;
                smart_search_storage.push(track);
                break;
            }
        }
        for(const track of search.tracks.filter(t =>  t.uid !== (found_track?.uid ?? ""))){
            smart_search_storage.push(track);
        }
        return smart_search_storage;
    }

    export async function mass_convert_youtube_to_youtube_music(tracks: Track[], callback: ( track: Track, new_track: Track ) => Promise<void>){
        for(const track of tracks){
            const dont_convert = 
                is_empty(track.youtube_id) || 
                track.explicit === "EXPLICIT" || 
                !is_empty(track.album?.name) || 
                !is_topic(track.artists[0].name);
            const guess_title = track.title.toLowerCase().replace(`${track.artists[0].name.toLowerCase()} - `, '');
            const just_kidding_do_convert = guess_title.length !== track.title.length 
                && track.explicit === "NONE" 
                && is_empty(track.album?.name)
                && !is_empty(track.youtube_id);
            if(dont_convert && !just_kidding_do_convert){
                continue;
            }
            const query = remove_topic(track.artists[0].name) + " " + guess_title;
            const searched: MusicSearchResponse|ResponseError = await youtube_music_search(query).catch(json_catch);
            if("error" in searched){
                continue;
            }
            const found = !just_kidding_do_convert ? searched.tracks.find(t => t.youtube_id === track.youtube_id) : 
                searched.tracks.find(t => 
                    number_epsilon_distance(t.duration, track.duration, 3) && 
                    str_or_include(clean_title(track.title).toLowerCase(), clean_title(t.title).toLowerCase()) &&
                    str_or_include(artist_string(track).toLowerCase(), artist_string(t).toLowerCase())
                );
            if(!is_empty(found)){
                await callback(track, found!);
            }
        }
    }
}