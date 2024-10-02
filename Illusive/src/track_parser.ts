import * as Origin from '../../origin/src/index'
import * as SCSearch from '../../origin/src/soundcloud/types/Search';
import { YouTubeTrack } from '../../origin/src/youtube/types/PlaylistResults_1';
import { YouTubeMusicPlaylistTrack } from '../../origin/src/youtube_music/types/PlaylistResults_0';
import { empty_undefined, extract_string_from_pattern, generate_new_uid, is_empty, make_topic, parse_runs, parse_time, remove_prod, url_to_id } from '../../origin/src/utils/util'
import { best_thumbnail, create_uri, escape_regexpresion, spotify_uri_to_uri, youtube_music_split_artists, youtube_views_number } from './illusive_utilts';
import { ExplicitMode, Runs, Track } from './types';
import { PlaylistPanelVideoRenderer } from '../../origin/src/youtube/types/MixResults_0';
import { ContentItem } from '../../origin/src/spotify/types/UserPlaylist';
import { Item4 } from '../../origin/src/spotify/types/Album';
import { CollectionItem } from '../../origin/src/spotify/types/Collection';
import { AmazonTrack } from '../../origin/src/amazon_music/types/ShowHomeCreateAndBindMethod';
import { AppleTrack } from '../../origin/src/apple_music/types/TrackListSection';
import { AppleUserPlaylistTrack } from '../../origin/src/apple_music/types/UserPlaylist';
import { SpotifySearchTrack } from '../../origin/src/spotify/types/SearchResult';
import { AmazonSearchTrack } from '../../origin/src/amazon_music/types/SearchResult';

export function parse_youtube_title_artist(track: Track): Track {
    const artist = track.artists.map(artist => artist.name).join(", ");
    const new_title_pre = track.title.replace(new RegExp(escape_regexpresion(`${artist} - `), "i"), '')
    .replace(new RegExp(escape_regexpresion(` - ${artist}`), "i"), '')
    .replace(/ ?full song ?/ig, '')
    .replace(/ ?[\(\[] ?prod\.?.+?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?dir\.?.+?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?ft\.?.+?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?feat\.?.+?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?w\/.+?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?unreleased ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?explicit ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?explicit version ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?official ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?legendado ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?full video ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?video version ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?music ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?audio ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?video ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?lyrics? ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?lyrics? video ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?music video ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?official audio ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?official video ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?official visual ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?official lyrics? ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?official lyrics? video ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?exclusive music video ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?official music video ?[\)\]]/ig, '')
    .replace(/ ?[\(\[].*?official music video ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?visualizer ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?visualiser ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?official visualizer ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?official mv ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?reupload ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?bass boosted ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?sped up.*?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?HD ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?HQ ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?remix ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?ost ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?fanmade ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?extended ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?tik tok ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?tiktok ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?amv ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?full ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?full song ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?best version ?[\)\]]/ig, '')
    .replace(/ ?[\(\[] ?best ?[\)\]]/ig, '')
    .replace(/ ?[\(\[].*?only.*?[\)\]]/ig, '')
    .replace(/ ?[\(\[].*?remix.*?[\)\]]/ig, '')
    .replace(/ ?[\(\[].*?clean.*?[\)\]]/ig, '')
    .replace(/ ?[\(\[].*?by.*?[\)\]]/ig, '')
    // .replace(/[\(\[].+?[\)\]]/ig, '')
    .replace(/unreleased/ig, '');
    const new_title = new_title_pre.replace(/.+? - /i, '');
    const new_artist = new_title !== new_title_pre ? new_title_pre.replace(/ - .+?/i, ''): artist;
    return {
        ...track,
        title: new_title,
        artists: [{"name": new_artist, "uri": null}].concat([]),
        explicit: (/ ?[\(\[] ?explicit ?[\)\]]/ig.test(track.title) || / ?[\(\[] ?explicit version ?[\)\]]/ig.test(track.title) ? "EXPLICIT" : 
            / ?[\(\[].*?clean.*?[\)\]]/ig.test(track.title) ? "CLEAN" : "NONE") as ExplicitMode,
        unreleased: / ?[\(\[].*?unreleased.*?[\)\]]/ig.test(track.title) || / unreleased/ig.test(track.title),
        prods: [],
    }
}

export function track_parsed_data(){}

export function parse_musi_track(track: Origin.Musi.Track): Track {
    return {
        "uid": generate_new_uid(track.video_name),
        "title": track.video_name,
        "artists": [{"name": track.video_creator, "uri": null}],
        "duration": track.video_duration,
        "youtube_id": track.video_id
    }
}

export function parse_youtube_playlist_track(track: YouTubeTrack): Track {
    return {
        "uid": generate_new_uid(parse_runs(track.title.runs)),
        "title": parse_runs(track.title.runs),
        "artists": [{"name": parse_runs(track.shortBylineText.runs), "uri": track.shortBylineText.runs[0]?.navigationEndpoint === undefined ? null : create_uri("youtube", track.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId)}],
        "duration": parseInt(track.lengthSeconds),
        "plays": youtube_views_number(track.videoInfo?.runs?.[0]?.text),
        "youtube_id": track.videoId,
    };
}

export function parse_youtube_mix_track(track: PlaylistPanelVideoRenderer): Track {
    return {
        "uid": generate_new_uid(track.title.simpleText),
        "title": track.title.simpleText,
        "artists": [{"name": parse_runs(track.shortBylineText.runs), "uri": create_uri("youtube", track.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId)}],
        "duration": parse_time(track.lengthText.simpleText),
        "youtube_id": track.videoId
    }
}

export function parse_youtube_music_album_track(track: YouTubeMusicPlaylistTrack, artists: Runs, album: Runs): Track{
    return {
        "uid": generate_new_uid(parse_runs(track.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs)),
        "title": parse_runs(track.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs),
        "artists": youtube_music_split_artists(artists),
        "duration": parse_time(parse_runs(track.fixedColumns[0].musicResponsiveListItemFixedColumnRenderer.text.runs)),
        "album": empty_undefined(parse_runs(album)) !== undefined ? {"name": parse_runs(album), "uri": null} : undefined,
        "explicit": track.badges.length >= 1 && track.badges[0].musicInlineBadgeRenderer.icon.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE",
        "youtube_id": track.playlistItemData.videoId,
        "youtubemusic_id": track.playlistItemData.playlistSetVideoId
    }
}

export function parse_youtube_music_playlist_track(track: YouTubeMusicPlaylistTrack): Track|undefined{
    const artist_runs = track.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs;
    const album_runs = track.flexColumns[2].musicResponsiveListItemFlexColumnRenderer.text.runs;
    if(track.playlistItemData?.videoId === undefined) return undefined;
    return {
        "uid": generate_new_uid(parse_runs(track.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs)),
        "title": parse_runs(track.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs),
        "artists": youtube_music_split_artists(track.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs as Runs),
        "duration": parse_time(parse_runs(track.fixedColumns[0].musicResponsiveListItemFixedColumnRenderer.text.runs)),
        "album": empty_undefined(parse_runs(album_runs)) !== undefined ? {"name": parse_runs(album_runs), "uri": album_runs[0].navigationEndpoint?.browseEndpoint?.browseId !== undefined ? create_uri("youtubemusic", album_runs[0].navigationEndpoint.browseEndpoint.browseId) : null} : undefined,
        "explicit": track.badges !== undefined && track.badges.length >= 1 && track.badges[0].musicInlineBadgeRenderer.icon.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE",
        "youtube_id": track.playlistItemData.videoId,
        "youtubemusic_id": track.playlistItemData.playlistSetVideoId
    }
}

export function parse_spotify_playlist_track(track: ContentItem): Track{
    return {
        "uid": generate_new_uid(track.itemV2.data.name),
        "title": track.itemV2.data.name,
        "artists": track.itemV2.data.artists.items.map(artist => {
            return {"name": make_topic(artist.profile.name), "uri": spotify_uri_to_uri(artist.uri)};
        }),
        "plays": parseInt(track.itemV2.data.playcount),
        "album": {"name": track.itemV2.data.albumOfTrack.name, "uri": spotify_uri_to_uri(track.itemV2.data.albumOfTrack.uri)},
        "duration": Math.floor(track.itemV2.data.trackDuration.totalMilliseconds/1000),
        "explicit": track.itemV2.data.contentRating.label === "EXPLICIT" ? "EXPLICIT" : "NONE",
        "spotify_id": track.itemV2.data.uri,
        "artwork_url": best_thumbnail(track.itemV2.data.albumOfTrack.coverArt.sources)?.url
    }
}
export function parse_spotify_album_track(track: Item4, album: {name: string, uri: string}, service_thumbnail?: string): Track{
    return {
        "uid": generate_new_uid(track.track.name),
        "title": track.track.name,
        "artists": track.track.artists.items.map(artist => {
            return {"name": make_topic(artist.profile.name), "uri": spotify_uri_to_uri(artist.uri)};
        }),
        "plays": parseInt(track.track.playcount),
        "album": {"name": album.name, "uri": spotify_uri_to_uri(album.uri)},
        "duration": Math.floor(track.track.duration.totalMilliseconds/1000),
        "explicit": track.track.contentRating.label === "EXPLICIT" ? "EXPLICIT" : "NONE",
        "spotify_id": track.track.uri,
        "artwork_url": service_thumbnail
    }
}
export function parse_spotify_collection_track(track: CollectionItem): Track{
    return {
        "uid": generate_new_uid(track.track.data.name),
        "title": track.track.data.name,
        "artists": track.track.data.artists.items.map(artist => {
            return {"name": artist.profile.name, "uri": spotify_uri_to_uri(artist.uri)};
        }),
        "album": {"name": track.track.data.albumOfTrack.name, "uri": spotify_uri_to_uri(track.track.data.albumOfTrack.uri)},
        "duration": Math.floor(track.track.data.duration.totalMilliseconds/1000),
        "explicit": track.track.data.contentRating.label === "EXPLICIT" ? "EXPLICIT" : 'NONE',
        "spotify_id": track.track._uri,
        "artwork_url": best_thumbnail(track.track.data.albumOfTrack.coverArt.sources)?.url
    }
}
export function parse_spotify_search_track(track: SpotifySearchTrack): Track{
    return {
        "uid": generate_new_uid(track.item.data.name),
        "title": track.item.data.name,
        "artists": track.item.data.artists.items.map(artist => {
            return {"name": make_topic(artist.profile.name), "uri": spotify_uri_to_uri(artist.uri)};
        }),
        "album": {"name": track.item.data.albumOfTrack.name, "uri": spotify_uri_to_uri(track.item.data.albumOfTrack.uri)},
        "duration": Math.floor(track.item.data.duration.totalMilliseconds/1000),
        "explicit": track.item.data.contentRating.label === "EXPLICIT" ? "EXPLICIT" : "NONE",
        "artwork_url": best_thumbnail(track.item.data.albumOfTrack.coverArt.sources)?.url,
        "spotify_id": track.item.data.uri
    }
}

export function parse_amazon_music_playlist_track(track: AmazonTrack): Track{
    const album_regex = /([a-zA-Z?><{}|!@#$%^&*]+\s?[a-zA-Z?><{}|!@#$%^&*])+/;
    return {
        "uid": generate_new_uid(track.primaryText),
        "title": track.primaryText,
        "artists": [{"name": make_topic(track.secondaryText1), "uri": create_uri("amazonmusic", extract_string_from_pattern(track.secondaryText1Link.deeplink, /\/.+?\/(.+)\/.+/) as string)}],
        "duration": parse_time(track.secondaryText3),
        "album": {"name": extract_string_from_pattern(track.secondaryText2, album_regex) as string, "uri": create_uri("amazonmusic", extract_string_from_pattern(track.secondaryText1Link.deeplink, /\/.+?\/(.+)/) as string)},
        "explicit": track.secondaryText2.includes("[Explicit]") ? "EXPLICIT" : "NONE",
        "amazonmusic_id": Origin.AmazonMusic.get_track_id(track)
    }
}
export function parse_amazon_music_search_track(track: AmazonSearchTrack): Track{
    const album_regex = /([a-zA-Z?><{}|!@#$%^&*]+\s?[a-zA-Z?><{}|!@#$%^&*])+/;
    const title = typeof track.primaryText === "object" ? track.primaryText.text : track.primaryText;
    return {
        "uid": generate_new_uid(title),
        "title": title,
        "artists": [{"name": is_empty(track.secondaryText) ? "" : make_topic(track.secondaryText!), "uri": track.secondaryLink?.deeplink === undefined ? null : create_uri("amazonmusic", extract_string_from_pattern(track.secondaryLink?.deeplink!, /\/.+?\/(.+)\/.+/) as string)}],
        "duration": NaN,
        "explicit": track.tags.includes("E") ? "EXPLICIT" : "NONE",
        "amazonmusic_id": Origin.AmazonMusic.get_track_id(track)
    }
}

export function parse_apple_music_playlist_track(track: AppleTrack): Track{
    return {
        "uid": generate_new_uid(track.title),
        "title": track.title,
        "artists": track.subtitleLinks.map(link => {
            return {"name": make_topic(link.title), "uri": create_uri("applemusic", link.segue.destination.contentDescriptor.identifiers.storeAdamID)};
        }),
        "album": track.tertiaryLinks?.[0] !== undefined ? {"name": track.tertiaryLinks[0].title, "uri": create_uri("applemusic", track.tertiaryLinks[0].segue.destination.contentDescriptor.identifiers.storeAdamID)} : undefined,
        "duration": Math.floor(track.duration / 1000),
        "explicit": track.showExplicitBadge ? "EXPLICIT" : "NONE",
        "applemusic_id": track.id
    }
}
export function parse_apple_music_user_playlist_track(track: AppleUserPlaylistTrack): Track{
    return {
        "uid": generate_new_uid(track.attributes.name),
        "title": track.attributes.name,
        "artists": [{"name": make_topic(track.attributes.artistName), "uri": null}],
        "album": {"name": track.attributes.albumName, "uri": null},
        "duration": Math.floor(track.attributes.durationInMillis / 1000),
        "explicit": track.attributes.contentRating !== undefined && track.attributes.contentRating === "explicit" ? "EXPLICIT": "NONE",
        "applemusic_id": track.id
    };
}

export function parse_soundcloud_artist_track(track: SCSearch.Track): Track{
    return {
        "uid": generate_new_uid(track.title),
        "title": remove_prod(track.title),
        "artists": [{"name": make_topic(track.user.username), "uri": create_uri("soundcloud", url_to_id(track.user.permalink))}],
        "plays": track.playback_count,
        "duration": Math.floor(track.duration / 1000),
        "soundcloud_id": track.id,
        "soundcloud_permalink": track.permalink_url,
        "artwork_url": track.artwork_url?.replace("t200x200.jpg", "t500x500.jpg")
    }
}

export function parse_soundcloud_track(track: SCSearch.Track): Track{
    return {
        "uid": generate_new_uid(track.title),
        "title": track.title,
        "artists": [{"name": track.user.username, "uri": create_uri("soundcloud", String(track.user.id))}],
        "plays": track.playback_count,
        "duration": Math.floor(track.duration / 1000),
        "soundcloud_id": track.id,
        "soundcloud_permalink": track.permalink_url,
        "artwork_url": track.artwork_url!.replace("t200x200.jpg", "t500x500.jpg")
    }
}