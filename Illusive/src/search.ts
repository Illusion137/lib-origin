import * as Origin from '../../origin/src/index'
import { AmazonTrack } from '../../origin/src/amazon_music/types/ShowHomeCreateAndBindMethod';
import { Playlist, User, Track } from '../../origin/src/soundcloud/types/Search';
import { extract_string_from_pattern, generate_new_uid, make_topic, parse_runs, parse_time, remove_prod, url_to_id } from '../../origin/src/utils/util';
import { best_thumbnail, create_uri, spotify_uri_to_uri } from './illusive_utilts';
import { parse_amazon_music_playlist_track, parse_amazon_music_search_track, parse_spotify_search_track } from './track_parser';
import { MusicSearchResponse } from './types';
import { ResponseError } from '../../origin/src/utils/types';

export async function spotify_search(query: string): Promise<MusicSearchResponse>{
    const search_response = await Origin.Spotify.search(query, {});
    if("error" in search_response){
        return {
            "tracks": [],
            "playlists": [],
            "albums": [],
            "artists": [],
            "error": [search_response]
        }
    }
    return {
        "tracks": search_response.data.searchV2.tracksV2.items.map(parse_spotify_search_track),
        "playlists": search_response.data.searchV2.playlists.items.map(playlist => {
            if(playlist.data.__typename === "NotFound") return null;
            return {
                "title": {"name": playlist.data.name, "uri": spotify_uri_to_uri(playlist.data.uri)},
                "artist": [{"name": make_topic(playlist.data.ownerV2.data.name), "uri": spotify_uri_to_uri(playlist.data.ownerV2.data.uri)}],
                "artwork_thumbnails": playlist.data.images.items[0].sources
            }
        }).filter(item => item !== null),
        "albums": search_response.data.searchV2.albumsV2.items.map(album => {
            return {
                "title": {"name": album.data.name, "uri": spotify_uri_to_uri(album.data.uri)},
                "artist": [{"name": make_topic(album.data.artists.items[0].profile.name), "uri": spotify_uri_to_uri(album.data.artists.items[0].uri)}],
                "artwork_thumbnails": album.data.coverArt.sources,
                "year": album.data.date.year
            }
        }),
        "artists": search_response.data.searchV2.artists.items.map(artist => {
            return {
                "name": {"name": make_topic(artist.data.profile.name), "uri": spotify_uri_to_uri(artist.data.uri)},
                "profile_thumbnail_uri": best_thumbnail(artist.data.visuals.avatarImage?.sources!)?.url,
                "is_official_artist_channel": true
            }
        })
    }
}

export async function amazon_music_search(query: string): Promise<MusicSearchResponse> {
    const search_response = await Origin.AmazonMusic.search(query, {});
    if("error" in search_response){
        return {
            "tracks": [],
            "playlists": [],
            "albums": [],
            "artists": [],
            "error": [search_response]
        }
    }
    return {
        "tracks": search_response.map(track => { return parse_amazon_music_search_track(track) }),
        "playlists": [],
        "albums": [],
        "artists": []
    }
}

export async function youtube_search(query: string): Promise<MusicSearchResponse> {
    const search_response = await Origin.YouTube.search({}, query);
    if("error" in search_response){
        return {
            "tracks": [],
            "playlists": [],
            "albums": [],
            "artists": [],
            "error": [search_response as ResponseError]
        }
    }
    return {
        "tracks": search_response.data.videos.map(track => {
            if("title" in track!){
                return {
                    "uid": generate_new_uid(parse_runs(track.title.runs)),
                    "title": parse_runs(track.title.runs),
                    "artists": [{"name": parse_runs(track?.shortBylineText.runs), "uri": create_uri("youtube", track.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl)}],
                    "duration": parse_time(track.lengthText.simpleText),
                    "youtube_id": track.videoId,
                }
            } else return {
                "uid": generate_new_uid(parse_runs(track?.headline.runs)),
                "title": parse_runs(track?.headline.runs),
                "artists": [{"name": parse_runs(track?.shortBylineText.runs), "uri": create_uri("youtube", track!.shortBylineText!.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl)}],
                "duration": parse_time(parse_runs(track.lengthText.runs)),
                "youtube_id": track.videoId,
            };
        }),
        "playlists": search_response.data.playlists.map(playlist => {
            if("shortBylineText" in playlist){
                return {
                    "title": {"name": "runs" in playlist.title ? parse_runs(playlist.title.runs) : playlist.title, "uri": create_uri("youtube", playlist.playlistId)},
                    "artist": [{"name": parse_runs(playlist.shortBylineText.runs), "uri": create_uri("youtube", playlist.shortBylineText.runs[0].navigationEndpoint?.browseEndpoint.canonicalBaseUrl ?? "")}],
                    "thumbnail_uri": best_thumbnail(playlist.thumbnail.thumbnails)?.url,
                }
            }
            else return {
                "title": {"name": playlist.title.simpleText, "uri": create_uri("youtube", playlist.playlistId)},
                "artist": [{"name": playlist.longBylineText.simpleText, "uri": null}],
                "thumbnail_uri": best_thumbnail(playlist.thumbnail.thumbnails)?.url,
            }
        }),
        "albums": [],
        "artists": search_response.data.artists.map(artist => {
            if("simpleText" in artist.title){
                return {
                    "name": {"name": artist.title.simpleText, "uri": create_uri("youtube", artist.channelId)},
                    "profile_thumbnail_uri": artist.thumbnail.thumbnails[0].url,
                    "is_official_artist_channel": true
                }
            }
            else return {
                "name": {"name": parse_runs(artist.title.runs), "uri": create_uri("youtube", artist.channelId)},
                "profile_thumbnail_uri": artist.thumbnail.thumbnails[0].url,
                "is_official_artist_channel": true
            }
        })
    }
}

export async function youtube_music_search(query: string): Promise<MusicSearchResponse> {
    const search_response = await Origin.YouTubeMusic.search({}, query);
    if("error" in search_response){
        return {
            "tracks": [],
            "playlists": [],
            "albums": [],
            "artists": [],
            "error": [search_response as ResponseError]
        }
    }
    return {
        "tracks": [],
        "playlists": [],
        "albums": [],
        "artists": []
    }
}

export async function soundcloud_search(query: string): Promise<MusicSearchResponse> {
    const search_response = await Origin.SoundCloud.search("EVERYTHING", {"query": query});
    if("error" in search_response){
        return {
            "tracks": [],
            "playlists": [],
            "albums": [],
            "artists": [],
            "error": [search_response as ResponseError]
        }
    }
    const playlists_and_albums = search_response.collection.filter(item => item.kind === "playlist") as Playlist[];
    const playlists = playlists_and_albums.filter(item => item.is_album === false);
    const albums = playlists_and_albums.filter(item => item.is_album === true);
    const users = search_response.collection.filter(item => item.kind === "user") as User[];
    const tracks = search_response.collection.filter(item => item.kind === "track") as Track[];

    return {
        "tracks": tracks.map(track => {
            return {
                "uid": generate_new_uid(track.title),
                "title": remove_prod(track.title),
                "artists": [{"name": make_topic(track.user.username), "uri": create_uri("soundcloud", track.permalink)}],
                "duration": Math.floor(track.full_duration / 1000),
                "soundcloud_id": track.id,
                "soundcloud_permalink": track.permalink_url,
                "service_thumbnail": track.artwork_url
            }
        }),
        "playlists": playlists.map(playlist => {
            return {
                "title": {"name": playlist.title, "uri": create_uri("soundcloud", url_to_id(playlist.permalink_url))},
                "artist": Array.isArray(playlist.user) ? playlist.user.map(user => { 
                    return {
                        "name": make_topic(user.username),
                        "uri": create_uri("soundcloud", String(user.id))
                    } 
                }) : [{"name": make_topic(playlist.user.username), "uri": create_uri("soundcloud", playlist.user.permalink)}],
                "year": new Date(playlist.created_at).getFullYear(),
                "thumbnail_uri": playlist.artwork_url
            }
        }),
        "albums": albums.map(album => {
            return {
                "title": {"name": album.title, "uri": create_uri("soundcloud", url_to_id(album.permalink_url))},
                "artist": Array.isArray(album.user) ? album.user.map(user => { 
                    return {
                        "name": make_topic(user.username),
                        "uri": create_uri("soundcloud", Array.isArray(album.user) ? album.user[0].permalink_url : album.user.permalink_url)
                    } 
                }) : [{"name": make_topic(album.user.username), "uri": create_uri("soundcloud", url_to_id(album.user.permalink_url))}],
                "year": new Date(album.created_at).getFullYear(),
                "thumbnail_uri": album.artwork_url === null ? Array.isArray(album.user) ? album.user[0].avatar_url : album.user.avatar_url : album.artwork_url
            }
        }),
        "artists": users.map(artist => {
            return {
                "name": {"name": make_topic(artist.username), "uri": create_uri("soundcloud", url_to_id(artist.permalink_url))},
                "profile_thumbnail_uri": artist.avatar_url,
                "is_official_artist_channel": true
            }
        })
    }
}