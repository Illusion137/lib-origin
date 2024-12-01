import { empty_undefined, generate_new_uid, is_empty, parse_runs, parse_time, remove } from '../../../origin/src/utils/util'
import { YouTubeMusicPlaylistTrack } from '../../../origin/src/youtube_music/types/PlaylistResults_0';
import { MusicCardShelfRenderer, SearchMusicResponsiveListItemRenderer } from '../../../origin/src/youtube_music/types/SearchResults_0';
import { best_thumbnail, create_uri, is_duration_string, youtube_music_split_artists, youtube_views_number } from '../illusive_utilts';
import { CompactArtist, CompactPlaylist, Runs, Track } from '../types';

const responsive_item_types = ["Song", "Video", "Single", "Album", "Playlist", "EP"];

function includes_plays_text(ptext: string){
    return remove(ptext, ' play', ' plays', ' view', ' views').length !== ptext.length;
}

export function parse_youtube_music_album_track(track: YouTubeMusicPlaylistTrack, artists: Runs, album: Runs): Track {
    return {
        uid: generate_new_uid(parse_runs(track.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs)),
        title: parse_runs(track.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs),
        artists: youtube_music_split_artists(artists),
        duration: parse_time(parse_runs(track.fixedColumns[0].musicResponsiveListItemFixedColumnRenderer.text.runs)),
        album: empty_undefined(parse_runs(album)) !== undefined ? {name: parse_runs(album), uri: null} : undefined,
        explicit: track.badges.length >= 1 && track.badges[0].musicInlineBadgeRenderer.icon.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE",
        youtube_id: track.playlistItemData.videoId,
        youtubemusic_id: track.playlistItemData.playlistSetVideoId
    }
}

export function parse_youtube_music_playlist_track(track: YouTubeMusicPlaylistTrack): Track|undefined {
    const [duration_column] = track.fixedColumns;
    const [title_column, artist_column, album_column] = track.flexColumns;
    const album_runs = album_column.musicResponsiveListItemFlexColumnRenderer.text.runs;
    if(track.playlistItemData?.videoId === undefined) return undefined;
    return {
        uid: generate_new_uid(parse_runs(title_column.musicResponsiveListItemFlexColumnRenderer.text.runs)),
        title: parse_runs(title_column.musicResponsiveListItemFlexColumnRenderer.text.runs),
        artists: youtube_music_split_artists(artist_column.musicResponsiveListItemFlexColumnRenderer.text.runs as Runs),
        duration: parse_time(parse_runs(duration_column.musicResponsiveListItemFixedColumnRenderer.text.runs)),
        album: empty_undefined(parse_runs(album_runs)) !== undefined ? {name: parse_runs(album_runs), uri: album_runs[0].navigationEndpoint?.browseEndpoint?.browseId !== undefined ? create_uri("youtubemusic", album_runs[0].navigationEndpoint.browseEndpoint.browseId) : null} : undefined,
        explicit: track.badges !== undefined && track.badges.length >= 1 && track.badges[0].musicInlineBadgeRenderer.icon.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE",
        youtube_id: track.playlistItemData.videoId,
        youtubemusic_id: track.playlistItemData.playlistSetVideoId
    }
}

export function parse_youtube_music_search_artist(playlist: SearchMusicResponsiveListItemRenderer): CompactArtist{
    const [title_column] = playlist.flexColumns;
    const title_runs = title_column.musicResponsiveListItemFlexColumnRenderer.text.runs;

    return {
        name: {name: parse_runs(title_runs), uri: title_runs[0].navigationEndpoint === undefined ? null : create_uri("youtubemusic", title_runs[0].navigationEndpoint.browseEndpoint!.browseId)},
        profile_artwork_url: best_thumbnail(playlist.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails)?.url,
        is_official_artist_channel: false
    };
}

export function parse_youtube_music_search_playlist(playlist: SearchMusicResponsiveListItemRenderer): CompactPlaylist{
    const [title_column, info_column] = playlist.flexColumns;
    const info_runs = info_column.musicResponsiveListItemFlexColumnRenderer.text.runs;
    const start_artist_index = info_runs.findIndex(item => responsive_item_types.includes(item.text));
    const end_artist_index = info_runs.findIndex(item => item.text === " • ", start_artist_index === -1 ? 0 : start_artist_index + 2);
    const artists = end_artist_index === -1 ? [] : info_runs.slice(start_artist_index + 1, end_artist_index).filter(item => item.text.trim() !== "&" && item.text.trim() !== ",");
    const title_runs = title_column.musicResponsiveListItemFlexColumnRenderer.text.runs;

    return {
        title: {name: parse_runs(title_runs), uri: title_runs[0].navigationEndpoint === undefined ? null : create_uri("youtubemusic", title_runs[0].navigationEndpoint.browseEndpoint!.browseId)},
        artist: artists.map(artist => ({name: artist.text, uri: artist.navigationEndpoint?.browseEndpoint?.browseId === undefined ? null : create_uri("youtubemusic", artist.navigationEndpoint?.browseEndpoint?.browseId)})),
        artwork_thumbnails: playlist.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails,
        explicit: playlist.badges !== undefined && playlist.badges[0].musicInlineBadgeRenderer.icon.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE"
    };
}

export function parse_youtube_music_search_top_result_contents_track(track: SearchMusicResponsiveListItemRenderer): Track{
    const [title_column, info_column, plays_column] = track.flexColumns;
    const info_runs = info_column.musicResponsiveListItemFlexColumnRenderer.text.runs;
    const start_artist_index = info_runs.findIndex(item => responsive_item_types.includes(item.text));
    const end_artist_index = info_runs.findIndex(item => item.text === " • ", start_artist_index === -1 ? 0 : start_artist_index + 2);
    const artists = end_artist_index === -1 ? [] : info_runs.slice(start_artist_index + 1, end_artist_index).filter(item => item.text.trim() !== "&" && item.text.trim() !== ",");
    const duration = info_runs[info_runs.length - 1];
    return {
        uid: generate_new_uid(parse_runs(title_column.musicResponsiveListItemFlexColumnRenderer.text.runs)),
        title: parse_runs(title_column.musicResponsiveListItemFlexColumnRenderer.text.runs),
        artists: artists.map(artist => ({name: artist.text, uri: artist.navigationEndpoint?.browseEndpoint?.browseId === undefined ? null : create_uri("youtubemusic", artist.navigationEndpoint?.browseEndpoint?.browseId)})),
        duration: is_duration_string(duration.text) ? parse_time(duration.text) : NaN,
        explicit: track.badges !== undefined && track.badges.length >= 1 && track.badges[0].musicInlineBadgeRenderer.icon.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE",
        youtube_id: track.playlistItemData.videoId,
        plays: youtube_views_number(parse_runs(plays_column?.musicResponsiveListItemFlexColumnRenderer?.text?.runs))
    };
}

function parse_youtube_music_search_top_result_artist(card: MusicCardShelfRenderer): CompactArtist{
    return {
        name: {name: parse_runs(card.title.runs), uri: card.title?.runs?.[0]?.navigationEndpoint === undefined ? null : create_uri("youtubemusic", card.title.runs[0].navigationEndpoint.browseEndpoint!.browseId)},
        profile_artwork_url: "",
        is_official_artist_channel: false
    }
}
function parse_youtube_music_search_top_result_track(card: MusicCardShelfRenderer): Track{
    const title = parse_runs(card.title.runs);
    const subtitle_items = card.subtitle.runs.filter(item => item.text !== " • ");
    const duration = subtitle_items.find(item => is_duration_string(item.text))?.text
    const plays = subtitle_items.find(item => includes_plays_text(item.text))?.text;
    const possible_artists = subtitle_items.filter(item => !(responsive_item_types.includes(item.text) || includes_plays_text(item.text) || is_duration_string(item.text)));

    return {
        uid: generate_new_uid(title),
        title: title,
        artists: possible_artists.map(item => ({name: item.text, uri: item.navigationEndpoint === undefined ? null : create_uri("youtubemusic", item.navigationEndpoint.browseEndpoint!.browseId)})),
        duration: parse_time(duration),
        explicit: card.subtitleBadges === undefined ? "NONE" : card.subtitleBadges[0].musicInlineBadgeRenderer.icon.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE",
        youtube_id: card.title.runs[0].navigationEndpoint.watchEndpoint!.videoId,
        plays: youtube_views_number(plays)
    }
}

type LabledTrack = Track & {type: "TRACK"};
type LabledArtist = CompactArtist & {type: "ARTIST"};

export function parse_youtube_music_search_top_result(card: MusicCardShelfRenderer|undefined): {
    top_result: LabledTrack|LabledArtist;
    side_contents: Track[];
}|undefined{

    if(is_empty(card)) return undefined;
    const top_result: LabledTrack|LabledArtist = card!.subtitle.runs[0].text === "Artist" ? 
        {...parse_youtube_music_search_top_result_artist(card!), type: "ARTIST"} : 
        {...parse_youtube_music_search_top_result_track(card!), type: "TRACK"};
    const side_contents: Track[] = card!.contents === undefined ? [] : 
        card!.contents
            .filter(item => item?.musicResponsiveListItemRenderer?.playlistItemData?.videoId !== undefined)
            .map(item => parse_youtube_music_search_top_result_contents_track(item.musicResponsiveListItemRenderer));
    return {top_result, side_contents};
}