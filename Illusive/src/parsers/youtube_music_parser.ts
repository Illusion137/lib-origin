import { parse_runs, parse_time } from '@common/utils/parse_util';
import { empty_undefined, generate_new_uid, is_empty } from '@common/utils/util'
import type { NavigationEndpoint } from '@origin/youtube/types/ChannelResultsW';
import { find_album_year, parse_subtitle_text } from '@origin/youtube_music/parser';
import type { ArtistCarouselContent, ArtistTopTrack } from '@origin/youtube_music/types/ArtistResults_0';
import type { YouTubeMusicPlaylistTrack } from '@origin/youtube_music/types/PlaylistResults_0';
import type { MusicCardShelfRenderer, MusicResponsiveListItemRenderer2, SearchMusicResponsiveListItemRenderer } from '@origin/youtube_music/types/SearchResults_0';
import type { YouTubeMusicAlbum, YouTubeMusicAlbumType, YouTubeMusicNammedBrowseID, YouTubeMusicTrack } from '@origin/youtube_music/types/types';
import { best_thumbnail, create_uri, is_duration_string, youtube_music_split_artists, youtube_views_number } from '@illusive/illusive_utils';
import type { CompactArtist, CompactPlaylist, ISOString, MusicServicePlaylist, NamedUUID, Runs, Track } from '@illusive/types';
import { reinterpret_cast } from '../../../common/cast';

const responsive_item_types = ["Song", "Video", "Single", "Album", "Playlist", "EP", "Profile"];

function includes_plays_text(ptext: string){
    if(ptext === undefined) return false;
    return ptext.endsWith(' plays') || ptext.endsWith(' views');
}

type PossibleMusicResponsiveListItemRenderers = "Album"|"Artist"|"Song"|"EP"|"Video"|"Single"|"Profile"|"Playlist";
export function determine_music_responsive_list_item_renderer(item: MusicResponsiveListItemRenderer2): PossibleMusicResponsiveListItemRenderers{
    const [ type ] = parse_subtitle_text(item.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs);
    return reinterpret_cast<PossibleMusicResponsiveListItemRenderers>(parse_runs(type));
}

export function parse_youtube_music_album_type(album_type: YouTubeMusicAlbumType): CompactPlaylist['album_type']{
    switch(album_type){
        case "Album": return "ALBUM";
        case "Single": return "SINGLE";
        case "EP": return "EP";
        case "Song": return "SONG";
        default: return "ALBUM";
    }
}

export function parse_youtube_music_compact_line_artist(artist: YouTubeMusicNammedBrowseID): NamedUUID{
    return {
        name: artist.name,
        uri: artist.browse_id === undefined ? null : create_uri("youtubemusic", artist.browse_id)
    }
}

export function parse_youtube_music_albums(albums: YouTubeMusicAlbum[], type: CompactPlaylist['type']): CompactPlaylist[]{
    return albums.map(album => ({
        title: {name: album.title, uri: album.browse_id === undefined ? null : create_uri("youtubemusic", album.browse_id)},
        artist: album.artists.map(parse_youtube_music_compact_line_artist),
        artwork_thumbnails: album.thumbnails,
        explicit: album.badges.includes("MUSIC_EXPLICIT_BADGE") ? "EXPLICIT" : "NONE",
        type: type,
        artwork_url: best_thumbnail(album.thumbnails)?.url,
        album_type: parse_youtube_music_album_type(album.album_type)
    }));
}

export function parse_youtube_music_track(track: YouTubeMusicTrack): Track{
    return {
        uid: generate_new_uid(track.title),
        title: track.title,
        artists: track.artists.map(parse_youtube_music_compact_line_artist),
        artwork_url: best_thumbnail(track.thumbnails)?.url,
        duration: NaN,
        album: track.album ? parse_youtube_music_compact_line_artist(track.album) : track.album,
        youtube_id: track.video_id,
        explicit: track.badges.includes("MUSIC_EXPLICIT_BADGE") ? "EXPLICIT" : "NONE",
        plays: track.plays
    }
}

export function parse_youtube_music_album_track(track: YouTubeMusicPlaylistTrack, artists: Runs, album: Runs, browse_id: string, artwork_url: string|undefined): Track {
    const plays_run = track.flexColumns?.map(
        flex_column => flex_column.musicResponsiveListItemFlexColumnRenderer.text.runs
    ).find(run => includes_plays_text(parse_runs(run)));
    const plays_text = parse_runs(plays_run);
    return {
        uid: generate_new_uid(parse_runs(track.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs)),
        title: parse_runs(track.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs),
        artists: youtube_music_split_artists(artists),
        duration: parse_time(parse_runs(track.fixedColumns[0].musicResponsiveListItemFixedColumnRenderer.text.runs)),
        album: empty_undefined(parse_runs(album)) !== undefined ? {name: parse_runs(album),  uri: (album?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ?? browse_id) ? create_uri('youtubemusic', album?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ?? browse_id) : null } : undefined,
        explicit: track?.badges?.length >= 1 && track?.badges[0].musicInlineBadgeRenderer.icon.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE",
        artwork_url: best_thumbnail(track?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails)?.url ?? artwork_url,
        youtube_id: track.playlistItemData.videoId,
        youtubemusic_id: track.playlistItemData.playlistSetVideoId,
        plays: youtube_views_number(plays_text)
    }
}

export function parse_youtube_music_playlist_track(track: YouTubeMusicPlaylistTrack): Track|undefined {
    if(is_empty(track)) return undefined;
    const [duration_column] = track.fixedColumns;
    const [title_column, artist_column, album_column] = track.flexColumns;
    const album_runs = album_column.musicResponsiveListItemFlexColumnRenderer.text.runs;
    if(track.playlistItemData?.videoId === undefined) return undefined;
    if(youtube_music_split_artists(artist_column.musicResponsiveListItemFlexColumnRenderer.text.runs as Runs).length === 0)
        throw new Error("No YouTube Music Split Artists");
    if(includes_plays_text(parse_runs(album_runs)))
        throw new Error("YouTube Music Album is plays");
    return {
        uid: generate_new_uid(parse_runs(title_column.musicResponsiveListItemFlexColumnRenderer.text.runs)),
        title: parse_runs(title_column.musicResponsiveListItemFlexColumnRenderer.text.runs),
        artists: youtube_music_split_artists(artist_column.musicResponsiveListItemFlexColumnRenderer.text.runs as Runs),
        duration: parse_time(parse_runs(duration_column.musicResponsiveListItemFixedColumnRenderer.text.runs)),
        album: empty_undefined(parse_runs(album_runs)) !== undefined ? {name: parse_runs(album_runs), uri: album_runs[0].navigationEndpoint?.browseEndpoint?.browseId !== undefined ? create_uri("youtubemusic", album_runs[0].navigationEndpoint.browseEndpoint.browseId) : null} : undefined,
        explicit: track.badges !== undefined && track?.badges?.length >= 1 && track.badges[0].musicInlineBadgeRenderer.icon.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE",
        youtube_id: track.playlistItemData.videoId,
        artwork_url: best_thumbnail(track?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails)?.url,
        youtubemusic_id: track.playlistItemData.playlistSetVideoId
    }
}

export function parse_youtube_music_artist_tracks_track(track: YouTubeMusicPlaylistTrack): Track|undefined {
    if(is_empty(track)) return undefined;
    const [duration_column] = track.fixedColumns;
    const [title_column, artist_column, plays_column, album_column] = track.flexColumns;
    const plays_run = plays_column.musicResponsiveListItemFlexColumnRenderer.text.runs;
    const plays_text = includes_plays_text(parse_runs(plays_run)) ? parse_runs(plays_run): undefined;
    const album_runs = album_column.musicResponsiveListItemFlexColumnRenderer.text.runs;
    if(track.playlistItemData?.videoId === undefined) return undefined;
    if(youtube_music_split_artists(artist_column.musicResponsiveListItemFlexColumnRenderer.text.runs as Runs).length === 0)
        throw new Error("No YouTube Music Split Artists");
    if(includes_plays_text(parse_runs(album_runs))) {
        throw new Error("No YouTube Music Album Parsed");
    }
    
    return {
        uid: generate_new_uid(parse_runs(title_column.musicResponsiveListItemFlexColumnRenderer.text.runs)),
        title: parse_runs(title_column.musicResponsiveListItemFlexColumnRenderer.text.runs),
        artists: youtube_music_split_artists(artist_column.musicResponsiveListItemFlexColumnRenderer.text.runs as Runs),
        duration: parse_time(parse_runs(duration_column.musicResponsiveListItemFixedColumnRenderer.text.runs)),
        album: empty_undefined(parse_runs(album_runs)) !== undefined ? {name: parse_runs(album_runs), uri: album_runs[0].navigationEndpoint?.browseEndpoint?.browseId !== undefined ? create_uri("youtubemusic", album_runs[0].navigationEndpoint.browseEndpoint.browseId) : null} : undefined,
        explicit: track.badges !== undefined && track?.badges?.length >= 1 && track.badges[0].musicInlineBadgeRenderer.icon.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE",
        youtube_id: track.playlistItemData.videoId,
        artwork_url: best_thumbnail(track?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails)?.url,
        youtubemusic_id: track.playlistItemData.playlistSetVideoId,
        plays: youtube_views_number(plays_text)
    }
}

export function parse_youtube_music_search_artist(playlist: SearchMusicResponsiveListItemRenderer, is_artist: boolean): CompactArtist{
    const [title_column] = playlist.flexColumns;
    const title_runs = title_column.musicResponsiveListItemFlexColumnRenderer.text.runs;

    return {
        name: {name: parse_runs(title_runs), uri: title_runs[0].navigationEndpoint?.browseEndpoint?.browseId === undefined ? null : create_uri("youtubemusic", title_runs[0].navigationEndpoint?.browseEndpoint?.browseId)},
        profile_artwork_url: best_thumbnail(playlist.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails)?.url,
        is_official_artist_channel: is_artist
    };
}

export function parse_youtube_music_search_playlist(playlist: SearchMusicResponsiveListItemRenderer): CompactPlaylist{
    const [title_column, info_column] = playlist.flexColumns;
    const info_runs = info_column.musicResponsiveListItemFlexColumnRenderer.text.runs;
    const start_artist_index = info_runs.findIndex(item => responsive_item_types.includes(item.text)) === -1 ? 0 : 2;
    const end_artist_index = info_runs.findIndex((item, i) => item.text === " • " && i >= start_artist_index);
    const artists = end_artist_index === -1 ? [] : info_runs.slice(start_artist_index, end_artist_index).filter(item => item.text.trim() !== "&" && item.text.trim() !== ",");
    const title_runs = title_column.musicResponsiveListItemFlexColumnRenderer.text.runs;

    const album_endpoint = playlist.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.playlistId ?? playlist.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl?.replace('"/playlist?list=', '') ?? title_runs[0].navigationEndpoint?.browseEndpoint?.browseId.replace('"/playlist?list=', '');

    return {
        title: {name: parse_runs(title_runs), uri: album_endpoint === undefined ? null : create_uri("youtubemusic", album_endpoint)},
        artist: artists.map(artist => ({name: artist.text, uri: artist.navigationEndpoint?.browseEndpoint?.browseId === undefined ? null : create_uri("youtubemusic", artist.navigationEndpoint?.browseEndpoint?.browseId)})),
        artwork_thumbnails: playlist.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails,
        explicit: playlist.badges?.[0].musicInlineBadgeRenderer.icon.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE",
        type: 'PLAYLIST'
    };
}

export function parse_youtube_music_search_top_result_contents_track(track: SearchMusicResponsiveListItemRenderer): Track{
    const [title_column, info_column, plays_column] = track.flexColumns;
    const [_, artists, maybe_album] = parse_subtitle_text(track.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs);
    const info_runs = info_column.musicResponsiveListItemFlexColumnRenderer.text.runs;
    const duration = info_runs[info_runs.length - 1];
    const album = maybe_album?.[0].navigationEndpoint ? maybe_album[0] : undefined;
    return {
        uid: generate_new_uid(parse_runs(title_column.musicResponsiveListItemFlexColumnRenderer.text.runs)),
        title: parse_runs(title_column.musicResponsiveListItemFlexColumnRenderer.text.runs),
        artists: artists.map(artist => ({name: artist.text, uri: artist.navigationEndpoint?.browseEndpoint?.browseId === undefined ? null : create_uri("youtubemusic", artist.navigationEndpoint?.browseEndpoint?.browseId)})),
        album: {name: album?.text ?? "", uri: album?.navigationEndpoint?.browseEndpoint?.browseId === undefined ? null : create_uri("youtubemusic", album?.navigationEndpoint?.browseEndpoint?.browseId)},
        duration: is_duration_string(duration.text) ? parse_time(duration.text) : NaN,
        explicit: track.badges !== undefined && track.badges.length >= 1 && track.badges[0].musicInlineBadgeRenderer.icon.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE",
        youtube_id: track.playlistItemData.videoId,
        artwork_url: best_thumbnail(track?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails)?.url,
        plays: youtube_views_number(parse_runs(plays_column?.musicResponsiveListItemFlexColumnRenderer?.text?.runs))
    };
}

function parse_youtube_music_search_top_result_artist(card: MusicCardShelfRenderer): CompactArtist{
    return {
        name: {name: parse_runs(card.title.runs), uri: card.title?.runs?.[0]?.navigationEndpoint === undefined ? null : create_uri("youtubemusic", card.title.runs[0].navigationEndpoint.browseEndpoint!.browseId)},
        profile_artwork_url: best_thumbnail(card?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails)?.url,
        is_official_artist_channel: true
    }
}

function parse_youtube_music_search_top_result_album(card: MusicCardShelfRenderer): CompactPlaylist{
    const subtitle_items = card.subtitle.runs.filter(item => item.text !== " • ");
    const possible_artists = subtitle_items?.filter(item => !(responsive_item_types.includes(item.text) || includes_plays_text(item.text) || is_duration_string(item.text)));
    return {
        title: {name: parse_runs(card.title.runs), uri: card.title?.runs?.[0]?.navigationEndpoint === undefined ? null : create_uri("youtubemusic", card.title.runs[0].navigationEndpoint.browseEndpoint!.browseId)},
        artist: possible_artists.map(item => ({name: item.text, uri: item.navigationEndpoint === undefined ? null : create_uri("youtubemusic", item.navigationEndpoint.browseEndpoint!.browseId)})),
        explicit: card.subtitleBadges !== undefined && card.subtitleBadges.length >= 1 && card.subtitleBadges[0].musicInlineBadgeRenderer.icon.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE",
        type: 'ALBUM',
        artwork_thumbnails: card.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails
    }
}
async function parse_youtube_music_search_top_result_track(card: MusicCardShelfRenderer, get_playlist: (id: string) => Promise<MusicServicePlaylist>): Promise<Track|undefined>{
    if(card.title?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId === undefined) return undefined;
    const title = parse_runs(card.title.runs);
    const subtitle_items = card.subtitle.runs.filter(item => item.text !== " • ");
    const duration = subtitle_items?.find(item => is_duration_string(item?.text))?.text
    const plays = subtitle_items?.find(item => includes_plays_text(item.text))?.text;
    const possible_artists = subtitle_items?.filter(item => !(responsive_item_types.includes(item.text) || includes_plays_text(item.text) || is_duration_string(item.text)));
    const album_menu_item = card.menu.menuRenderer.items.find(item => item?.menuNavigationItemRenderer?.icon?.iconType === "ALBUM");
    const potential_endpoint: string|undefined = (album_menu_item?.menuNavigationItemRenderer?.navigationEndpoint as NavigationEndpoint)?.browseEndpoint?.browseId;
    const album_maybe = potential_endpoint !== undefined ? await get_playlist(potential_endpoint) : undefined;
    return {
        uid: generate_new_uid(title),
        title: title,
        album: album_maybe?.error === undefined ? {name: album_maybe?.title ?? "", uri: potential_endpoint === undefined ? null : create_uri("youtubemusic", potential_endpoint)} : undefined,
        artists: possible_artists.map(item => ({name: item.text, uri: item.navigationEndpoint === undefined ? null : create_uri("youtubemusic", item.navigationEndpoint.browseEndpoint!.browseId)})),
        duration: parse_time(duration),
        explicit: card.subtitleBadges === undefined ? "NONE" : card.subtitleBadges[0].musicInlineBadgeRenderer.icon.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE",
        youtube_id: card.title.runs[0].navigationEndpoint.watchEndpoint.videoId,
        plays: youtube_views_number(plays),
        artwork_url: best_thumbnail(card.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails)?.url
    }
}
function parse_youtube_music_search_top_result_track_2(card: MusicCardShelfRenderer): Track|undefined{
    if(card.title?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId === undefined) return undefined;
    const title = parse_runs(card.title.runs);
    const subtitle_items = card.subtitle.runs.filter(item => item.text !== " • ");
    const duration = subtitle_items?.find(item => is_duration_string(item?.text))?.text
    const plays = subtitle_items?.find(item => includes_plays_text(item.text))?.text;
    const possible_artists = subtitle_items?.filter(item => !(responsive_item_types.includes(item.text) || includes_plays_text(item.text) || is_duration_string(item.text)));
    const album_menu_item = card.menu.menuRenderer.items.find(item => item?.menuNavigationItemRenderer?.icon?.iconType === "ALBUM");
    const potential_endpoint: string|undefined = (album_menu_item?.menuNavigationItemRenderer?.navigationEndpoint as NavigationEndpoint)?.browseEndpoint?.browseId;
    const album_maybe = potential_endpoint !== undefined ? {error: 'yes'} : undefined;
    return {
        uid: generate_new_uid(title),
        title: title,
        album: album_maybe?.error === undefined ? undefined : undefined,
        artists: possible_artists.map(item => ({name: item.text, uri: item.navigationEndpoint === undefined ? null : create_uri("youtubemusic", item.navigationEndpoint.browseEndpoint!.browseId)})),
        duration: parse_time(duration),
        explicit: card.subtitleBadges === undefined ? "NONE" : card.subtitleBadges[0].musicInlineBadgeRenderer.icon.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE",
        youtube_id: card.title.runs[0].navigationEndpoint.watchEndpoint.videoId,
        plays: youtube_views_number(plays)
    }
}

type LabledTrack = Track & {type: "TRACK"};
type LabledArtist = CompactArtist & {type: "ARTIST"};
type LabledAlbum = CompactPlaylist & {type: "ALBUM"};

export function parse_youtube_music_search_top_result_2(card: MusicCardShelfRenderer|undefined): LabledTrack|LabledArtist|LabledAlbum|undefined{
    if(is_empty(card)) return undefined;
    const top_result: LabledTrack|LabledArtist|LabledAlbum|undefined = card!.subtitle.runs[0].text === "Artist" ? 
        {...parse_youtube_music_search_top_result_artist(card!), type: "ARTIST"} : 
        card!.subtitle.runs[0].text === "Album" ?
        {...parse_youtube_music_search_top_result_album(card!), type: "ALBUM"} : 
        card!.subtitle.runs[0].text === "Playlist" ? undefined :
        {...parse_youtube_music_search_top_result_track_2(card!) ?? ({} as any), type: "TRACK"};
    return top_result;
}


export async function parse_youtube_music_search_top_result(card: MusicCardShelfRenderer|undefined, get_playlist: (id: string) => Promise<MusicServicePlaylist>): Promise<{
    top_result: LabledTrack|LabledArtist|LabledAlbum;
    side_contents: Track[];
}|undefined>{
    if(is_empty(card)) return undefined;
    const top_result: LabledTrack|LabledArtist|LabledAlbum|undefined = card!.subtitle.runs[0].text === "Artist" ? 
        {...parse_youtube_music_search_top_result_artist(card!), type: "ARTIST"} : 
        card!.subtitle.runs[0].text === "Album" ?
        {...parse_youtube_music_search_top_result_album(card!), type: "ALBUM"} : 
        card!.subtitle.runs[0].text === "Playlist" ? undefined :
        {...await parse_youtube_music_search_top_result_track(card!, get_playlist) ?? ({} as any), type: "TRACK"};
    if(top_result === undefined || Object.keys(top_result).length <= 1) return undefined;
    const side_contents: Track[] = card!.contents === undefined ? [] : 
        card!.contents
            .filter(item => item?.musicResponsiveListItemRenderer?.playlistItemData?.videoId !== undefined)
            .map(item => parse_youtube_music_search_top_result_contents_track(item.musicResponsiveListItemRenderer));
    return {top_result, side_contents};
}

export function parse_youtube_music_artist_track(item: ArtistTopTrack): Track{
    const album_endpoint = item.musicResponsiveListItemRenderer.flexColumns?.[3]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0].navigationEndpoint?.watchEndpoint.videoId;
    const plays_run = item.musicResponsiveListItemRenderer.flexColumns?.map(
        flex_column => flex_column.musicResponsiveListItemFlexColumnRenderer.text.runs
    ).find(run => includes_plays_text(parse_runs(run)));
    const plays_text = parse_runs(plays_run);
    return {
        uid: generate_new_uid(parse_runs(item.musicResponsiveListItemRenderer.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs)),
        title: parse_runs(item.musicResponsiveListItemRenderer.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs),
        artists: youtube_music_split_artists(item.musicResponsiveListItemRenderer.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs as Runs),
        duration: NaN,
        album: {name: parse_runs(item.musicResponsiveListItemRenderer.flexColumns?.[3]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs), uri: album_endpoint !== undefined ? create_uri('youtubemusic', album_endpoint) : null},
        artwork_url: best_thumbnail(item.musicResponsiveListItemRenderer.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails)?.url,
        explicit: item?.musicResponsiveListItemRenderer?.badges?.[0]?.musicInlineBadgeRenderer.icon.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE",
        youtube_id: item.musicResponsiveListItemRenderer.playlistItemData.videoId,
        plays: youtube_views_number(plays_text),
    }
}

export function parse_youtube_music_artist_album(item: ArtistCarouselContent, artist_info: NamedUUID, type: CompactPlaylist['type']): CompactPlaylist{
    const endpoint = item.musicTwoRowItemRenderer.navigationEndpoint.browseEndpoint?.browseId ?? item.musicTwoRowItemRenderer?.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint.browseId;
    const date = new Date();
    date.setFullYear(find_album_year(item));
    const subtitle = parse_runs(item.musicTwoRowItemRenderer.subtitle.runs);
    return {
        title: {name: parse_runs(item.musicTwoRowItemRenderer.title.runs), uri: endpoint !== undefined ? create_uri('youtubemusic', endpoint) : null},
        artist: [artist_info],
        artwork_thumbnails: item.musicTwoRowItemRenderer.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails,
        artwork_url: best_thumbnail(item.musicTwoRowItemRenderer.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails)?.url,
        explicit: item.musicTwoRowItemRenderer?.subtitleBadges?.[0]?.musicInlineBadgeRenderer?.icon?.iconType === "MUSIC_EXPLICIT_BADGE" ? "EXPLICIT" : "NONE",
        type: type,
        date: date.toISOString() as ISOString,
        album_type: subtitle.includes("Album") ? "ALBUM" : subtitle.includes("Single") ? "SINGLE" : subtitle.includes("EP") ? "EP" : undefined
    }
}

export function parse_youtube_music_artist_similar_artist(item: ArtistCarouselContent): CompactArtist{
    const endpoint = item.musicTwoRowItemRenderer.navigationEndpoint.browseEndpoint?.browseId ?? item.musicTwoRowItemRenderer?.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint.browseId;
    return {
        name: {name: parse_runs(item.musicTwoRowItemRenderer.title.runs), uri: endpoint !== undefined ? create_uri('youtubemusic', endpoint) : null},
        profile_artwork_url: best_thumbnail(item.musicTwoRowItemRenderer.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails)?.url,
        is_official_artist_channel: true
    }
}