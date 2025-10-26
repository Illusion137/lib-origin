import { gen_uuid, is_empty, json_catch } from "@common/utils/util";
import type { MusicServicePlaylist, NamedUUID, Playlist, SerializedCompactPlaylistData, Track } from "./types";
import { ExampleObj } from "./illusi/src/example_objs";
import { SQLPlaylists } from "./sql/sql_playlists";
import type { ResponseError } from "@common/types";
import { Illusive } from "./illusive";
import { best_thumbnail, create_uri, make_https, music_service_uri_to_music_service, split_uri } from "./illusive_utils";
import { GLOBALS } from "./globals";
import { SQLTracks } from "./sql/sql_tracks";
import { reinterpret_cast } from '../../common/cast';
import { default_playlists } from "./default_playlists";
import { Constants } from "./constants";

export namespace PlaylistPage {
    export interface PlaylistInitialData
    {
        playlist_data: Playlist & {creator?: NamedUUID[]};
        initial_tracks: Track[]|Promise<Track[]>, continuation: unknown, error?: ResponseError
    };
    
    export async function playlist_initial_data_default_playlist(default_playlist_title: string): Promise<PlaylistInitialData>{
        return {
            initial_tracks: [],
            continuation: null,
            playlist_data: Object.assign({
                ...ExampleObj.playlist_example0,
            }, {title: default_playlist_title, creator: [{name: Constants.import_uri_id, uri: create_uri("illusi", Constants.import_uri_id)}]}) 
        };
    }
    
    export async function playlist_initial_data_uuid(uuid: string): Promise<PlaylistInitialData|undefined>{
        const playlist_data = await SQLPlaylists.playlist_data(uuid, "IGNORE");
        if(playlist_data){
            return {
                playlist_data: {...playlist_data, creator: [{name: Constants.import_uri_id, uri: create_uri("illusi", Constants.import_uri_id)}]},
                initial_tracks: [],
                continuation: null
            };
        }
        return undefined;
    }
    
    export async function playlist_initial_data_uri(uri: string): Promise<PlaylistInitialData>{
        let playlist_data: PlaylistInitialData = await playlist_initial_data_default_playlist("Unknown");
        
        const full_cache_result = GLOBALS.global_var.playlist_cache.get(uri);
        const full_cache_hit = full_cache_result !== undefined;
        if(full_cache_hit){
            const cached_tracks = SQLTracks.add_playback_saved_data_to_tracks(full_cache_result.tracks);
            return {
                playlist_data: full_cache_result.playlist_data,
                initial_tracks: cached_tracks,
                continuation: full_cache_result.continuation
            };
        }
    
        const compact_cache_result = GLOBALS.global_var.compact_playlist_cache.get(uri);
        const compact_cache_hit = compact_cache_result !== undefined;
        
        let thumbnail_url;
        if(compact_cache_hit) {
            thumbnail_url = await Illusive.get_highest_quality_service_thumbnail_uri( (!is_empty(compact_cache_result.artwork_thumbnails) ? best_thumbnail(compact_cache_result.artwork_thumbnails)?.url : compact_cache_result.artwork_url) ?? "");
            playlist_data.playlist_data = {...playlist_data, title: compact_cache_result.title.name, creator: compact_cache_result.artist, thumbnail_uri: thumbnail_url, date: compact_cache_result.date, uuid: gen_uuid()};
        }
        else thumbnail_url = undefined;
        const split = split_uri(uri);
        const playlist_or_error: MusicServicePlaylist|ResponseError = await Illusive.music_service.get( 
            music_service_uri_to_music_service(split[0]) )!.get_playlist(make_https(split[1])).catch(json_catch);
    
        if("error" in playlist_or_error && playlist_or_error.error !== undefined) {
            playlist_data.error = reinterpret_cast<ResponseError>(playlist_or_error);
            return playlist_data;
        }
        const playlist = reinterpret_cast<MusicServicePlaylist>(playlist_or_error);
        const id_playlist_data = {...ExampleObj.playlist_example0, ...playlist, title: playlist.title, description: playlist.description ?? "", thumbnail_uri: await Illusive.get_highest_quality_service_thumbnail_uri(thumbnail_url ?? playlist.artwork_url ?? playlist_data.playlist_data.thumbnail_uri ?? ''), creator: playlist.creator, date: playlist.date };
        const id_tracks = SQLTracks.add_playback_saved_data_to_tracks(playlist.tracks);
        const first_album_uri = id_tracks?.[0]?.album?.uri;
        if(id_tracks.every(track => track.album?.uri && first_album_uri && track.album.name === id_playlist_data.title && track.album.uri === first_album_uri)){
            for(const track of id_tracks){
                if(!track.playback) continue;
                track.playback.artwork = id_playlist_data.thumbnail_uri;
            }
        }
        
        playlist_data = {...playlist_data, playlist_data: {...playlist_data.playlist_data, ...id_playlist_data}};

        playlist_data.initial_tracks = id_tracks;
        playlist_data.continuation = playlist.continuation;
        GLOBALS.global_var.playlist_cache.add(uri, {tracks: id_tracks, playlist_data: id_playlist_data, continuation: playlist.continuation});
        return playlist_data;
    }
    
    export async function playlist_initial_data_write_playlist_uuid(serialized_playlist_data: SerializedCompactPlaylistData): Promise<PlaylistInitialData>{
        return {
            playlist_data: {
                title: serialized_playlist_data?.title ?? "", 
                uuid: gen_uuid(), 
                date: new Date().toISOString(),
            },
            initial_tracks: [],
            continuation: null
        };
    }
    
    export interface PlaylistRefresh {
        tracks: Track[];
    };
    const base_playlist_refresh = (): PlaylistRefresh => ({
        tracks: []
    });
    
    export async function playlist_refresh_uuid_or_default_playlist(initial_tracks: Track[], uuid: string, default_playlist_title: string): Promise<PlaylistRefresh>{
        const playlist_refresh: PlaylistRefresh = base_playlist_refresh();
        if(default_playlist_title){
            const default_playlist = default_playlists.find(playlist => playlist.name === default_playlist_title)!;
            playlist_refresh.tracks = await default_playlist.track_function();
        }
        else if(uuid){
            playlist_refresh.tracks = await SQLPlaylists.playlist_tracks(uuid);
        }
        playlist_refresh.tracks = initial_tracks;
        return playlist_refresh;
    }
    export async function playlist_refresh_write_playlist(write_playlist_uuid: string, serialized_playlist_data?: SerializedCompactPlaylistData): Promise<PlaylistRefresh>{
        const playlist_refresh: PlaylistRefresh = base_playlist_refresh();
        await SQLPlaylists.add_saved_data_to_write_playlist_tracks(write_playlist_uuid, serialized_playlist_data?.tracks ?? []);
        playlist_refresh.tracks = serialized_playlist_data?.tracks ?? [];
        return playlist_refresh;
    }
    export async function playlist_refresh_default_playlist(default_playlist_title: string): Promise<PlaylistRefresh>{
        const playlist_refresh: PlaylistRefresh = base_playlist_refresh();
        const default_playlist = default_playlists.find(playlist => playlist.name === default_playlist_title)!;
        playlist_refresh.tracks = await default_playlist.track_function();
        return playlist_refresh;
    }
} 
