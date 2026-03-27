import * as Origin from '@origin/index'
import { milliseconds_of, urlid } from '@common/utils/util';
import { create_thumbnails, create_uri, spotify_uri_to_type, spotify_uri_to_uri } from '@illusive/illusive_utils';
import { Prefs } from '@illusive/prefs';
import type { CompactPlaylist, CompactPlaylistsResult, ISOString } from '@illusive/types';
import type { RoZFetchRequestInit } from '@common/rozfetch';
import { generror } from '@common/utils/error_util';
import { supabase } from '@illusive/db/supabase';
import { Constants } from '@illusive/constants';

const fetch_opts: RoZFetchRequestInit = {
    cache_opts: {
        cache_ms: milliseconds_of({ minutes: 10 }),
        cache_mode: "memory",
        cache_ms_fail: 1
    }
};

export async function spotify_get_user_playlists(): Promise<CompactPlaylistsResult> {
    const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
    const user_playlists_response = await Origin.Spotify.account_playlists({ cookie_jar: cookie_jar, var: {}, fetch_opts });
    if ("error" in user_playlists_response) return { playlists: [], error: user_playlists_response.error };
    return {
        playlists: user_playlists_response.data.me.libraryV3.items.map(playlist => {
            return {
                title: { name: playlist.item.data.name!, uri: spotify_uri_to_uri(playlist.item.data.uri) },
                artist: [{
                    name: playlist.item.data.ownerV2?.data.name ?? "",
                    uri: spotify_uri_to_uri(playlist.item.data.ownerV2?.data.uri)
                }],
                artwork_thumbnails: playlist.item.data.images?.items.map(item => item.sources)[0] ?? [],
                date: playlist.addedAt.isoString as ISOString,
                type: spotify_uri_to_type(playlist.item.data.uri)
            }
        })
    };
}

export async function amazon_music_get_user_playlists(): Promise<CompactPlaylistsResult> {
    const cookie_jar = Prefs.get_pref('amazon_music_cookie_jar');
    const user_playlists_response = await Origin.AmazonMusic.account_playlists({ cookie_jar: cookie_jar, fetch_opts });
    if ("error" in user_playlists_response) return { playlists: [], error: user_playlists_response.error };
    return {
        playlists: user_playlists_response.map(playlist => {
            return {
                title: { name: playlist.primaryText!.text, uri: create_uri("amazonmusic", Origin.AmazonMusic.get_track_id(playlist)) },
                artist: [],
                artwork_thumbnails: create_thumbnails(playlist.image!),
            }
        })
    };
}

export async function youtube_get_user_playlists(): Promise<CompactPlaylistsResult> {
    const cookie_jar = Prefs.get_pref('youtube_cookie_jar');
    const user_playlists_response = await Origin.YouTube.get_library({ cookie_jar: cookie_jar });
    if ("error" in user_playlists_response) return { playlists: [], error: user_playlists_response.error };
    return {
        playlists: user_playlists_response.data.map(playlist => {
            return {
                title: { name: playlist.title, uri: create_uri("youtube", playlist.endpoint) },
                artist: [],
                artwork_thumbnails: playlist.thumbnails
            }
        })
    };
}

export async function youtube_music_get_user_playlists(): Promise<CompactPlaylistsResult> {
    const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
    const user_playlists_response = await Origin.YouTubeMusic.get_library({ cookie_jar: cookie_jar, fetch_opts });
    if ("error" in user_playlists_response) return { playlists: [], error: user_playlists_response.error };
    return {
        playlists: user_playlists_response.data.map(playlist => {
            return {
                title: { name: playlist.title, uri: create_uri("youtubemusic", playlist.endpoint) },
                artist: [],
                artwork_thumbnails: playlist.thumbnails,
            }
        })
    };
}

export async function apple_music_get_user_playlists(): Promise<CompactPlaylistsResult> {
    const cookie_jar = Prefs.get_pref('apple_music_cookie_jar');
    const user_playlists_response = await Origin.AppleMusic.account_playlists({ cookie_jar: cookie_jar, fetch_opts });
    if ("error" in user_playlists_response) return { playlists: [], error: user_playlists_response.error };
    return {
        playlists: Object.values(user_playlists_response.resources['library-playlists']).map(playlist => {
            return {
                title: { name: playlist.attributes.name, uri: create_uri("applemusic", playlist.id) },
                artist: [],
                date: playlist.attributes.dateAdded as ISOString
            }
        })
    };
}

export async function soundcloud_get_user_playlists(): Promise<CompactPlaylistsResult> {
    const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
    const user_playlists_response = await Origin.SoundCloud.get_all_user_playlists({ cookie_jar: cookie_jar, fetch_opts });
    if ("error" in user_playlists_response) return { playlists: [], error: user_playlists_response.error };
    const liked_music_playlist: CompactPlaylist[] = [{
        title: { name: "Liked Music", uri: create_uri("soundcloud", "soundcloud.com/you/likes") },
        artist: [{ name: "You", uri: null }]
    }];
    return {
        playlists: liked_music_playlist.concat(user_playlists_response.data.map(playlist => {
            return {
                title: { name: playlist.title, uri: create_uri("soundcloud", urlid(playlist.permalink_url)) },
                artist: Array.isArray(playlist.user) ? playlist.user.map(artist => {
                    return {
                        name: artist.username,
                        uri: create_uri("soundcloud", urlid(artist.permalink_url))
                    }
                }) : [{ name: playlist.user.username, uri: create_uri("soundcloud", urlid(playlist.user.permalink_url)) }],
                artwork_thumbnails: create_thumbnails(playlist.artwork_url),
                date: playlist.created_at as ISOString,
            }
        }))
    };
}

export async function bandlab_get_user_playlists(): Promise<CompactPlaylistsResult> {
    const cookie_jar = Prefs.get_pref('bandlab_cookie_jar');
    const user_uuid = Origin.BandLab.get_user_uuid(cookie_jar);
    if (!user_uuid) return { playlists: [], ...generror("BandLab", "MEDIUM") };
    return {
        playlists: [
            {
                title: { name: "Projects", uri: create_uri("bandlab", user_uuid) },
                artist: [{ name: "You", uri: create_uri("bandlab", user_uuid) }]
            }
        ]
    };
}

export async function illusi_get_user_playlists(): Promise<CompactPlaylistsResult> {
    const { data: { session } } = await supabase().auth.getSession();
    if (!session) return { playlists: [] };

    const result = await Origin.Illusi.get_playlists({ jwt: session.access_token });
    if ('error' in result) return { playlists: [] };

    return {
        playlists: result.map(playlist => ({
            title:             { name: playlist.title, uri: create_uri('illusi', playlist.uuid) },
            artist:            [{ name: Constants.local_illusi_uri_id, uri: create_uri('illusi', Constants.local_illusi_uri_id) }],
            artwork_thumbnails: [],
            date:              playlist.created_at as ISOString,
            type:              'PLAYLIST' as const,
        }))
    };
}