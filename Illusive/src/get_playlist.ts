import * as Origin from '../../origin/src/index'
import { MusicServicePlaylist, MusicServicePlaylistContinuation, Runs } from './types'
import { get_main_key, make_topic, parse_runs, remove_prod, url_to_id } from '../../origin/src/utils/util';
import * as SCSearch from '../../origin/src/soundcloud/types/Search';
import { Prefs } from './prefs';
import * as YT_YTCFG from '../../origin/src/youtube/types/YTCFG';
import * as YT_CONTINUATION from "../../origin/src/youtube/types/Continuation";
import * as YTMUSIC_YTCFG from '../../origin/src/youtube_music/types/YTCFG';
import * as YTMUSIC_CONTINUATION from "../../origin/src/youtube_music/types/Continuation";
import { parse_playlist_continuation_contents } from '../../origin/src/youtube/parser';
import { YouTubeTrack } from '../../origin/src/youtube/types/PlaylistResults_1';
import { YouTubeMusicPlaylistTrack } from '../../origin/src/youtube_music/types/PlaylistResults_0';
import { PlaylistResults_1 } from '../../origin/src/youtube_music/types/PlaylistResults_1';
import { best_thumbnail, create_uri, date_from, spotify_uri_to_uri, youtube_music_split_artists } from './illusive_utilts';
import { parse_amazon_music_playlist_track, parse_apple_music_playlist_track, parse_apple_music_user_playlist_track, parse_musi_track, parse_soundcloud_artist_track, parse_spotify_album_track, parse_spotify_collection_track, parse_spotify_playlist_track, parse_youtube_music_album_track, parse_youtube_music_playlist_track, parse_youtube_playlist_track } from './track_parser';
import { ResponseError } from '../../origin/src/utils/types';
import { UserPlaylist } from '../../origin/src/spotify/types/UserPlaylist';
import { Album } from '../../origin/src/spotify/types/Album';
import { Collection } from '../../origin/src/spotify/types/Collection';

export async function musi_get_playlist(url: string): Promise<MusicServicePlaylist> {
    const playlist_response = await Origin.Musi.get_playlist(url);
    if("error" in playlist_response) return {"title": "", "tracks": [], "playlist_continuation": null, "error": [playlist_response]};
    return {
        "title": playlist_response.success.data.title,
        "tracks": playlist_response.success.data.data.map(parse_musi_track),
        "playlist_continuation": null
    };
}

type YouTubePlaylistContinuation = {"ytcfg": YT_YTCFG.YTCFG, "continuation": YT_CONTINUATION.Continuation};
export async function youtube_get_playlist(url: string): Promise<MusicServicePlaylist> {
    const cookie_jar = Prefs.get_pref("youtube_cookie_jar");
    const playlist_id = url_to_id(url, "youtube.com/playlist?list=");
    const playlist_response = await Origin.YouTube.get_playlist({"cookie_jar": cookie_jar}, playlist_id);
    if("error" in playlist_response && typeof playlist_response.error === "string") return {"title": "", "tracks": [], "playlist_continuation": null, "error": [playlist_response as ResponseError]};
    if(playlist_response.data.playlist_data === undefined) return {"title": "", "tracks": [], "playlist_continuation": null, "error": [{"error": "playlist_data is undefined"}]};
    if("playlistId" in playlist_response.data.playlist_data){
        if(playlist_response.data.playlist_data?.ownerText?.runs !== undefined)
            return {
                "title": playlist_response.data.playlist_data.title.simpleText,
                "creator": [{"name": parse_runs((playlist_response.data.playlist_data.ownerText.runs)), "uri": create_uri("youtube", playlist_response.data.playlist_data.ownerEndpoint.browseEndpoint.browseId)}],
                "tracks": playlist_response.data.tracks.filter(track => track !== undefined).map(track => parse_youtube_playlist_track(track)),
                "playlist_continuation": playlist_response.data.continuation === null ? null : {"ytcfg": playlist_response.icfg.ytcfg, "continuation": playlist_response.data.continuation} as YouTubePlaylistContinuation
            };
        else
            return {
                "title": playlist_response.data.playlist_data.title.simpleText,
                "creator": [],
                "tracks": playlist_response.data.tracks.filter(track => track !== undefined).map(track => parse_youtube_playlist_track(track)),
                "playlist_continuation": playlist_response.data.continuation === null ? null : {"ytcfg": playlist_response.icfg.ytcfg, "continuation": playlist_response.data.continuation} as YouTubePlaylistContinuation
            };
    }
    const owner = playlist_response.data.playlist_data.pageHeaderViewModel.metadata.contentMetadataViewModel.metadataRows[0].metadataParts[0]; 
    return {
        "title": playlist_response.data.playlist_data.pageHeaderViewModel.title.dynamicTextViewModel.text.content,
        "creator": [{"name": owner.text?.content ?? "", "uri": null}],
        "tracks": playlist_response.data.tracks.filter(track => track !== undefined).map(track => parse_youtube_playlist_track(track)),
        "playlist_continuation": playlist_response.data.continuation === null ? null : {"ytcfg": playlist_response.icfg.ytcfg, "continuation": playlist_response.data.continuation} as YouTubePlaylistContinuation
    };
}
export async function youtube_get_playlist_continuation(opts: YouTubePlaylistContinuation): Promise<MusicServicePlaylistContinuation> {
    const cookie_jar = Prefs.get_pref("youtube_cookie_jar");
    const playlist_response = await Origin.YouTube.get_continuation({"cookie_jar": cookie_jar}, opts.ytcfg, opts.continuation);
    if("error" in playlist_response) return {"tracks": [], "playlist_continuation": null, "error": [playlist_response]};
    const parsed_playlist = parse_playlist_continuation_contents(playlist_response);
    return {"tracks": parsed_playlist.tracks.filter(track => track !== undefined).map(track => parse_youtube_playlist_track(track as unknown as YouTubeTrack)), "playlist_continuation": {"ytcfg": opts.ytcfg, "continuation": parsed_playlist.continuation} as YouTubePlaylistContinuation}
}

type YouTubeMusicPlaylistContinuation = {"ytcfg": YTMUSIC_YTCFG.YTCFG, "continuation": YTMUSIC_CONTINUATION.Continuation, "type": "ALBUM" | "PLAYLIST", "artist"?: Runs, "album"?: Runs};

export async function youtube_music_get_playlist(url: string): Promise<MusicServicePlaylist> {
    const cookie_jar = Prefs.get_pref("youtube_music_cookie_jar"); 
    const playlist_response = await Origin.YouTubeMusic.get_playlist({"cookie_jar": cookie_jar}, url);
    if("error" in playlist_response) return {"title": "", "tracks": [], "playlist_continuation": null, "error": [playlist_response as ResponseError]};
    if(url.includes("OLAK5uy_")) { // Album
        return {
            "title": parse_runs(playlist_response.data.playlist_data.title.runs),
            "creator": youtube_music_split_artists(playlist_response.data.playlist_data.straplineTextOne.runs as Runs),
            "thumbnail_uri": playlist_response.data.playlist_data.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails[0].url,
            "date": date_from({"year": parseInt(playlist_response.data.playlist_data.subtitle.runs[2].text)}),
            "tracks": playlist_response.data.tracks.map(track => parse_youtube_music_album_track(track, playlist_response.data.playlist_data.straplineTextOne.runs, playlist_response.data.playlist_data.title.runs as Runs)),
            "playlist_continuation": playlist_response.data.continuation === null ? null : {"ytcfg": playlist_response.icfg.ytcfg, "continuation": playlist_response.data.continuation, "type": "ALBUM", "artist": playlist_response.data.playlist_data.straplineTextOne.runs, "album": playlist_response.data.playlist_data.title.runs} as YouTubeMusicPlaylistContinuation
        };
    }
    return { //Playlist
        "title": parse_runs(playlist_response.data.playlist_data.title.runs),
        "creator": youtube_music_split_artists(playlist_response.data.playlist_data.straplineTextOne.runs as Runs),
        "thumbnail_uri": playlist_response.data.playlist_data.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails[0].url,
        "date": date_from({"year": parseInt(playlist_response.data.playlist_data.subtitle.runs[2].text)}),
        "tracks": playlist_response.data.tracks.map(parse_youtube_music_playlist_track).filter(item => item !== undefined),
        "playlist_continuation": playlist_response.data.continuation === null ? null : {"ytcfg": playlist_response.icfg.ytcfg, "continuation": playlist_response.data.continuation, "type": "PLAYLIST"} as YouTubeMusicPlaylistContinuation
    };
}
export async function youtube_music_get_playlist_continuation(opts: YouTubeMusicPlaylistContinuation): Promise<MusicServicePlaylistContinuation>{
    const cookie_jar = Prefs.get_pref("youtube_music_cookie_jar");
    const playlist_response = await Origin.YouTubeMusic.get_continuation({"cookie_jar": cookie_jar}, opts.ytcfg, opts.continuation);
    if("error" in playlist_response) return {"tracks": [], "playlist_continuation": null, "error": [playlist_response]};
    const parsed_playlist = playlist_response as unknown as PlaylistResults_1;
    if(parsed_playlist?.continuationContents?.musicPlaylistShelfContinuation === undefined) return {"tracks": [], "playlist_continuation": null};
    return {
        "tracks": parsed_playlist.continuationContents.musicPlaylistShelfContinuation.contents.map(track => 
            opts.type === "PLAYLIST" ? parse_youtube_music_playlist_track(track.musicResponsiveListItemRenderer as unknown as YouTubeMusicPlaylistTrack) :
                parse_youtube_music_album_track(track.musicResponsiveListItemRenderer as unknown as YouTubeMusicPlaylistTrack, opts.artist as Runs, opts.album as Runs)
        ).filter(item => item !== undefined),
        "playlist_continuation": {
            "ytcfg": opts.ytcfg, 
            "continuation": parsed_playlist.continuationContents?.musicPlaylistShelfContinuation?.continuations === undefined ? null :
                parsed_playlist.continuationContents?.musicPlaylistShelfContinuation.continuations,
            "type": opts.type,
            "artist": opts.artist,
            "album": opts.album
        } as YouTubeMusicPlaylistContinuation
    };
}

type SpotifyPlaylistContinuation = {"client": Origin.Spotify.Client, "id": string, "current": number, "total": number, "limit": number, "type": "ALBUM" | "PLAYLIST" | "COLLECTION"};

export async function spotify_get_playlist(url: string): Promise<MusicServicePlaylist> {
    let playlist_response: UserPlaylist|Album|Collection|ResponseError;
    const cookie_jar = Prefs.get_pref("spotify_cookie_jar");
    const playlist_limit: number = Prefs.get_pref("spotify_playlist_limit");
    const client = await Origin.Spotify.get_client(url, cookie_jar);
    if("error" in client) return {"title": "", "tracks": [], "playlist_continuation": null, "error": [client]};
    const playlist_id = url_to_id(url, "open.spotify.com/", "playlist/", "album/", "collection/");
    const playlist_type = url_to_id(url, "open.spotify.com/").replace(/\/.+/, '');
    switch(playlist_type){
        case "playlist":   playlist_response = await Origin.Spotify.get_playlist(playlist_id, {"cookie_jar": cookie_jar, "client": client, "limit": playlist_limit}); break;
        case "album":      playlist_response = await Origin.Spotify.get_album(playlist_id, {"cookie_jar": cookie_jar, "client": client, "limit": playlist_limit}); break;
        case "tracks":
        case "collection": playlist_response = await Origin.Spotify.get_collection({"cookie_jar": cookie_jar, "client": client, "limit": playlist_limit}); break;
        default: return {"title": "", "tracks": [], "playlist_continuation": null};
    }
    if(playlist_response === undefined) return {"title": "", "tracks": [], "playlist_continuation": null, "error": [{"error": "playlist_response is undefined"}]};
    if((typeof playlist_response === "object" && "error" in playlist_response)) return {"title": "", "tracks": [], "playlist_continuation": null, "error": [playlist_response]};
    if("playlistV2" in playlist_response.data){
        return {
            "title": playlist_response.data.playlistV2.name,
            "creator": [{"name": playlist_response.data.playlistV2.ownerV2.data.name, "uri": spotify_uri_to_uri(playlist_response.data.playlistV2.ownerV2.data.uri)}],
            "description": playlist_response.data.playlistV2.description,
            "tracks": playlist_response.data.playlistV2.content.items.map(parse_spotify_playlist_track),
            "playlist_continuation": playlist_limit >= playlist_response.data.playlistV2.content.totalCount ? null : 
                {"client": client, "id": playlist_id, "current": playlist_limit, "total": playlist_response.data.playlistV2.content.totalCount, "limit": playlist_limit, "type": "PLAYLIST" } as SpotifyPlaylistContinuation
        }
    }
    else if("albumUnion" in playlist_response.data){
        const album_union = playlist_response.data.albumUnion;
        const artwork = best_thumbnail(playlist_response.data.albumUnion.coverArt.sources);
        return {
            "title": album_union.name,
            "creator": playlist_response.data.albumUnion.artists.items.map(artist => {
                return {"name": make_topic(artist.profile.name), "uri": spotify_uri_to_uri(artist.uri)}
            }),
            "thumbnail_uri": playlist_response.data.albumUnion.coverArt.sources[0].url,
            "date": new Date(playlist_response.data.albumUnion.date.isoString),
            "tracks": playlist_response.data.albumUnion.tracks.items.map(track => parse_spotify_album_track(track, {"name": album_union.name, "uri": album_union.uri}, artwork?.url)),
            "playlist_continuation": playlist_limit >= playlist_response.data.albumUnion.tracks.totalCount ? null : 
                {"client": client, "id": playlist_id, "current": playlist_limit, "total": playlist_response.data.albumUnion.tracks.totalCount, "limit": playlist_limit, "type": "ALBUM" } as SpotifyPlaylistContinuation
        }
    }
    else{
        return {
            "title": "spotify-lib",
            "tracks": playlist_response.data.me.library.tracks.items.map(parse_spotify_collection_track),
            "playlist_continuation": playlist_limit >= playlist_response.data.me.library.tracks.totalCount ? null : 
                {"client": client, "id": playlist_id, "current": playlist_limit, "total": playlist_response.data.me.library.tracks.totalCount, "limit": playlist_limit, "type": "COLLECTION" } as SpotifyPlaylistContinuation
        }
    }
}
export async function spotify_get_playlist_continuation(opts: SpotifyPlaylistContinuation): Promise<MusicServicePlaylistContinuation>{
    let playlist_response;
    const cookie_jar = Prefs.get_pref("spotify_cookie_jar");
    switch(opts.type){
        case "PLAYLIST":   playlist_response = await Origin.Spotify.get_playlist(opts.id, {"cookie_jar": cookie_jar, "client": opts.client, "limit": opts.limit, "offset": opts.current}); break;
        case "ALBUM":      playlist_response = await Origin.Spotify.get_album(opts.id, {"cookie_jar": cookie_jar, "client": opts.client, "limit": opts.limit, "offset": opts.current}); break;
        case "COLLECTION": playlist_response = await Origin.Spotify.get_collection({"cookie_jar": cookie_jar, "client": opts.client, "limit": opts.limit, "offset": opts.current}); break;
        default: return {"tracks": [], "playlist_continuation": null};
    }
    if(playlist_response === undefined || "error" in playlist_response) return {"tracks": [], "playlist_continuation": null, "error": [playlist_response]};
    if("playlistV2" in playlist_response.data){
        return {
            "tracks": playlist_response.data.playlistV2.content.items.map(parse_spotify_playlist_track),
            "playlist_continuation": opts.current + opts.limit >= playlist_response.data.playlistV2.content.totalCount ? null : 
                {"client": opts.client, "id": opts.id, "current": opts.current + opts.limit, "total": playlist_response.data.playlistV2.content.totalCount, "limit": opts.limit, "type": "PLAYLIST" } as SpotifyPlaylistContinuation
        }
    }
    else if("albumUnion" in playlist_response.data){
        const album_union = playlist_response.data.albumUnion;
        const artwork = best_thumbnail(playlist_response.data.albumUnion.coverArt.sources);
        return {
            "tracks": playlist_response.data.albumUnion.tracks.items.map(track => parse_spotify_album_track(track, album_union, artwork?.url)),
            "playlist_continuation": opts.current + opts.limit >= playlist_response.data.albumUnion.tracks.totalCount ? null : 
                {"client": opts.client, "id": opts.id, "current": opts.current + opts.limit, "total": playlist_response.data.albumUnion.tracks.totalCount, "limit": opts.limit, "type": "ALBUM" } as SpotifyPlaylistContinuation
        }
    }
    else{
        return {
            "tracks": playlist_response.data.me.library.tracks.items.map(parse_spotify_collection_track),
            "playlist_continuation": opts.current + opts.limit >= playlist_response.data.me.library.tracks.totalCount ? null : 
                {"client": opts.client, "id": opts.id, "current": opts.current + opts.limit, "total": playlist_response.data.me.library.tracks.totalCount, "limit": opts.limit, "type": "COLLECTION" } as SpotifyPlaylistContinuation
        }
    }
}

export async function amazon_music_get_playlist(url: string): Promise<MusicServicePlaylist> {
    const cookie_jar = Prefs.get_pref("amazon_music_cookie_jar");
    const playlist_response = await Origin.AmazonMusic.get_playlist(url, {"cookie_jar": cookie_jar});
    if("error" in playlist_response && typeof playlist_response.error === "string") return {"title": "", "tracks": [], "playlist_continuation": null, "error": [playlist_response]};
    return {
        "title": playlist_response.title,
        "tracks": playlist_response.tracks.map(track => parse_amazon_music_playlist_track(track)),
        "playlist_continuation": null
    };
}

type SoundcloudPlaylistContinuation = {"next_href": string|null, "locale_params": {"client_id": string}, "depth": number};

export async function soundcloud_get_playlist(url: string): Promise<MusicServicePlaylist> {
    const cookie_jar = Prefs.get_pref("soundcloud_cookie_jar");
    const playlist_limit: number = Prefs.get_pref("soundcloud_playlist_limit");
    if(url.includes("/sets/")){
        const playlist_path = url_to_id(url, "soundcloud.com/", "m.soundcloud.com/");
        const playlist_response = await Origin.SoundCloud.get_playlist({"cookie_jar": cookie_jar, "playlist_path": playlist_path})
        if("error" in playlist_response && typeof playlist_response.error === "string") return {"title": "", "tracks": [], "playlist_continuation": null, "error": [playlist_response]};
        return {
            "title": remove_prod(playlist_response.hydration.data.title),
            "creator": [{"name": playlist_response.hydration.data.user.username, "uri": create_uri("soundcloud", url_to_id(playlist_response.hydration.data.user.permalink))}],
            "description": playlist_response.hydration.data.description,
            "thumbnail_uri": playlist_response.hydration.data.artwork_url,
            "date": new Date(playlist_response.hydration.data.created_at),
            "tracks": playlist_response.tracks.map(track => parse_soundcloud_artist_track(track)),
            "playlist_continuation": null
        };
    }
    const hydration = await Origin.SoundCloud.get_hydration("https://www.soundcloud.com", {"cookie_jar": cookie_jar});
    if("error" in hydration) return {"title": "", "tracks": [], "playlist_continuation": null, "error": [hydration as ResponseError]};
    const client_id = await Origin.SoundCloud.get_client_id(Origin.SoundCloud.asset_scripts(hydration.scripts_urls), cookie_jar);
    if(typeof client_id === "object") return {"title": "", "tracks": [], "playlist_continuation": null, "error": [client_id]};
    const artist_id = url_to_id(url, "soundcloud.com/", "m.soundcloud.com/");
    const artist_response = await Origin.SoundCloud.get_artist("TRACKS", {"cookie_jar": cookie_jar, "client_id": client_id, "artist_id": artist_id, "limit": playlist_limit});
    if("error" in artist_response) return {"title": "", "tracks": [], "playlist_continuation": null, "error": [artist_response]};
    return {
        "title": remove_prod(artist_response.user.data.username),
        "creator": [{"name": artist_response.user.data.username, "uri": create_uri("soundcloud", url_to_id(artist_response.user.data.permalink))}],
        "description": artist_response.user.data.description,
        "thumbnail_uri": artist_response.user.data.avatar_url,
        "date": new Date( artist_response.user.data.created_at ),
        "tracks": artist_response.artist_data.collection.map(track => parse_soundcloud_artist_track(track)),
        "playlist_continuation": {"next_href": artist_response.artist_data.next_href, "locale_params": {"client_id": client_id}, "depth": 1} as SoundcloudPlaylistContinuation
    };
}
export async function soundcloud_get_playlist_continuation(opts: SoundcloudPlaylistContinuation): Promise<MusicServicePlaylistContinuation>{
    const cookie_jar = Prefs.get_pref("soundcloud_cookie_jar");
    if(opts.next_href === null) return {"tracks":[], "playlist_continuation": null}
    const artist_response = await Origin.SoundCloud.continuation(opts.next_href, opts.locale_params, {"cookie_jar": cookie_jar}, opts.depth) as unknown as SCSearch.SearchOf<SCSearch.Track>;
    return {
        "tracks": artist_response.collection.map(track => parse_soundcloud_artist_track(track)),
        "playlist_continuation": {"next_href": artist_response.next_href, "locale_params": opts.locale_params, "depth": 1} as SoundcloudPlaylistContinuation
    };
}

type AppleMusicPlaylistContinuation = {"playlist_id": string, "offset": number, "total": number, "authorization": string};

export async function apple_music_get_playlist(url: string): Promise<MusicServicePlaylist> {
    const cookie_jar = Prefs.get_pref("apple_music_cookie_jar");
    const playlist_path = url_to_id(url, "music.apple.com/");
    const playlist_response = await Origin.AppleMusic.get_playlist(playlist_path, {"cookie_jar": cookie_jar});
    if("error" in playlist_response) return {"title": "", "tracks": [], "playlist_continuation": null, "error": [playlist_response]};
    if("resources" in playlist_response.data){ // User Playlist
        const playlist_data_main_key = get_main_key(playlist_response.data.resources.playlists);
        const playlist_data = playlist_response.data.resources.playlists[playlist_data_main_key];
        const playlist_songs = playlist_response.data.resources['library-songs'];
        const playlist_id = url_to_id(playlist_path, "us/", "library/", "playlist/", "?l=en-US");
        const song_keys = Object.keys(playlist_songs);

        const playlist_meta_main_key = get_main_key(playlist_response.data.resources["library-playlists"]);
        return {
            "title": playlist_data.attributes.name,
            "creator": [{"name": playlist_data.attributes.curatorName, "uri": null}],
            "thumbnail_uri": playlist_data.attributes?.artwork?.url,
            "description": playlist_data.attributes.description.standard,
            "date": new Date(playlist_data.attributes.lastModifiedDate),
            "tracks": song_keys.map(key => parse_apple_music_user_playlist_track(playlist_songs[key])), 
            "playlist_continuation": {"playlist_id": playlist_id, "offset": 0 + song_keys.length, "total": playlist_response.data.resources["library-playlists"][playlist_meta_main_key].relationships.tracks.meta.total, "authorization": playlist_response.authorization} as AppleMusicPlaylistContinuation
        };
    }
    else {
        return {
            "title": playlist_response.data.sections[0].items[0].title,
            "creator": playlist_response.data.sections[0].items[0].subtitleLinks.map(link => {
                return {"name": link.title, "uri": create_uri("applemusic", link.segue.destination.contentDescriptor.identifiers.storeAdamID)}
            }),
            "thumbnail_uri": playlist_response.data.sections[0].items[0].artwork.dictionary.url,
            "tracks": playlist_response.data.sections[1].items.map(track => parse_apple_music_playlist_track(track)), 
            "playlist_continuation": null
        };
    }
}
export async function apple_music_get_playlist_continuation(opts: AppleMusicPlaylistContinuation): Promise<MusicServicePlaylistContinuation>{
    const cookie_jar = Prefs.get_pref("apple_music_cookie_jar");
    if(opts.offset >= opts.total) return { "tracks":[], "playlist_continuation": null };
    const playlist_response = await Origin.AppleMusic.get_playlist_continuation(opts.playlist_id, opts.offset, opts.authorization, {"cookie_jar": cookie_jar});
    if("error" in playlist_response) return { "tracks":[], "playlist_continuation": null, "error": [playlist_response] };
    const playlist_songs = playlist_response.resources['library-songs'];
    const song_keys = Object.keys(playlist_songs);
    return {
        "tracks": song_keys.map(key => parse_apple_music_user_playlist_track(playlist_songs[key])),
        "playlist_continuation": {"playlist_id": opts.playlist_id, "offset": opts.offset + song_keys.length, "total": opts.total, "authorization": opts.authorization} as AppleMusicPlaylistContinuation
    }
}

export async function illusi_get_playlist(url: string): Promise<MusicServicePlaylist> {
    const playlist_response = await fetch(url);
    if(!playlist_response.ok) return {"title": "", "tracks": [], "playlist_continuation": null};
    return await playlist_response.json();
}

export async function api_get_playlist(url: string): Promise<MusicServicePlaylist> {
    const playlist_response = await fetch(url);
    if(!playlist_response.ok) return {"title": "", "tracks": [], "playlist_continuation": null};
    return await playlist_response.json();
}