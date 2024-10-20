import * as Origin from '../../origin/src/index'
import { urlid } from '../../origin/src/utils/util';
import { create_thumbnails, create_uri, spotify_uri_to_type, spotify_uri_to_uri } from './illusive_utilts';
import { Prefs } from './prefs';
import { CompactPlaylistsResult } from './types';

export async function spotify_get_user_playlists(): Promise<CompactPlaylistsResult> {
    const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
    const user_playlists_response = await Origin.Spotify.account_playlists({"cookie_jar": cookie_jar});
    if("error" in user_playlists_response) return {"playlists": [], "error": user_playlists_response.error};
    return {
        "playlists": user_playlists_response.map(playlist => {
            return {
                "title": {"name": playlist.item.data.name!, "uri": spotify_uri_to_uri(playlist.item.data.uri)}, 
                "artist": [{
                    "name": playlist.item.data.ownerV2?.data.username ?? "",
                    "uri": spotify_uri_to_uri(playlist.item.data.ownerV2?.data.uri)
                }],
                "artwork_thumbnails": playlist.item.data.images?.items.map(item => item.sources)[0] ?? [],
                "date": new Date(playlist.addedAt.isoString),
                "type": spotify_uri_to_type(playlist.item.data.uri)
            }
        })
    };
}

export async function amazon_music_get_user_playlists(): Promise<CompactPlaylistsResult> {
    const cookie_jar = Prefs.get_pref('amazon_music_cookie_jar');
    const user_playlists_response = await Origin.AmazonMusic.account_playlists({"cookie_jar": cookie_jar});
    if("error" in user_playlists_response) return {"playlists": [], "error": user_playlists_response.error};
    return {
        "playlists": user_playlists_response.map(playlist => {
            return {
                "title": {"name": playlist.primaryText!.text, "uri": create_uri("amazonmusic", Origin.AmazonMusic.get_track_id(playlist))}, 
                "artist": [],
                "artwork_thumbnails": create_thumbnails(playlist.image!),
            }
        })
    };
}

export async function youtube_get_user_playlists(): Promise<CompactPlaylistsResult>{
    const cookie_jar = Prefs.get_pref('youtube_cookie_jar');
    const user_playlists_response = await Origin.YouTube.get_library({"cookie_jar": cookie_jar});
    if("error" in user_playlists_response) return {"playlists": [], "error": user_playlists_response.error};
    return {
        "playlists": user_playlists_response.data.map(playlist => {
            return {
                "title": {"name": playlist.title, "uri": create_uri("youtube", playlist.endpoint)}, 
                "artist": [],
                "artwork_thumbnails": playlist.thumbnails
            }
        })
    };
}

export async function youtube_music_get_user_playlists(): Promise<CompactPlaylistsResult>{
    const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
    const user_playlists_response = await Origin.YouTubeMusic.get_library({"cookie_jar": cookie_jar});
    if("error" in user_playlists_response) return {"playlists": [], "error": user_playlists_response.error};
    return {
        "playlists": user_playlists_response.data.map(playlist => {
            return {
                "title": {"name": playlist.title, "uri": create_uri("youtubemusic", playlist.endpoint)}, 
                "artist": [],
                "artwork_thumbnails": playlist.thumbnails,
            }
        })
    };
}

export async function apple_music_get_user_playlists(): Promise<CompactPlaylistsResult>{
    const cookie_jar = Prefs.get_pref('apple_music_cookie_jar');
    const user_playlists_response = await Origin.AppleMusic.account_playlists({"cookie_jar": cookie_jar});
    if("error" in user_playlists_response) return {"playlists": [], "error": user_playlists_response.error};
    return {
        "playlists": Object.values(user_playlists_response.resources['library-playlists']).map(playlist => {
            return {
                "title": {"name": playlist.attributes.name, "uri": create_uri("applemusic", playlist.id)}, 
                "artist": [],
                "year": new Date(playlist.attributes.dateAdded),
            }
        })
    };
}

export async function soundcloud_get_user_playlists(): Promise<CompactPlaylistsResult>{
    const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
    const user_playlists_response = await Origin.SoundCloud.get_all_user_playlists({"cookie_jar": cookie_jar});
    if("error" in user_playlists_response) return {"playlists": [], "error": user_playlists_response.error};
    return {
        "playlists": user_playlists_response.data.map(playlist => {
            return {
                "title": {"name": playlist.title, "uri": create_uri("soundcloud", urlid(playlist.permalink_url))}, 
                "artist": Array.isArray(playlist.user) ? playlist.user.map(artist => {
                    return {
                        "name": artist.username,
                        "uri": create_uri("soundcloud", urlid(artist.permalink_url))
                    }
                }) : [{"name": playlist.user.username, "uri": create_uri("soundcloud", urlid(playlist.user.permalink_url))}],
                "artwork_thumbnails": create_thumbnails(playlist.artwork_url),
                "year": new Date(playlist.created_at),
            }
        })
    };
}