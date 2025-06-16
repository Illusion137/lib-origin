import { parse_runs, youtube_views_number } from "../utils/util";
import { ArtistResults_0, ArtistCarouselContent, MusicCarouselShelfRenderer, MusicShelfRenderer, Run } from "./types/ArtistResults_0";
import { ExploreResults_0 } from "./types/ExploreResults_0";
import { HomeResults_0 } from "./types/HomeResults_0";
import { LibraryResults_0 } from "./types/LibraryResults_0";
import { NewReleasesAlbums, Run2 } from "./types/NewReleasesAlbums";
import { PlaylistResults_0 } from "./types/PlaylistResults_0";
import { SearchResults_0 } from "./types/SearchResults_0";
import { SuggestionMusicResponsiveListItemRenderer } from "./types/SearchSuggestions";
import { InitialData, YouTubeMusicAlbum, YouTubeMusicAlbumType, YouTubeMusicBadges, YouTubeMusicTrack } from "./types/types";

export function parse_home_contents(initial_data: InitialData[]) {
    const contents: HomeResults_0[] = initial_data as unknown as HomeResults_0[];
    return {
        contents: contents[1].contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents,
        continuation: contents[1].contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.continuations[0]?.nextContinuationData
    }
}
export function parse_explore_contents(initial_data: InitialData) {
    const contents: ExploreResults_0 = initial_data as unknown as ExploreResults_0;
    return contents[1].contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents.filter(item => item.musicCarouselShelfRenderer !== undefined);
}
export function parse_library_contents(initial_data: InitialData) {
    const contents: LibraryResults_0 = initial_data as unknown as LibraryResults_0;
    const playlists = contents.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].gridRenderer.items.map(item => {
        if(item.musicTwoRowItemRenderer.navigationEndpoint.browseEndpoint === undefined) return undefined;
        return {
            title: parse_runs(item.musicTwoRowItemRenderer.title.runs),
            thumbnails: item.musicTwoRowItemRenderer.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails,
            endpoint: item.musicTwoRowItemRenderer.navigationEndpoint.browseEndpoint.browseId.replace("VL", "")
        }
    })
    const filtered_playlists = playlists.filter(playlist => playlist !== undefined);
    return filtered_playlists;
}
export function parse_playlist_contents(initial_data: InitialData[]) {
    const contents = initial_data[1] as PlaylistResults_0;
    const inner_contents = contents.contents.twoColumnBrowseResultsRenderer.secondaryContents.sectionListRenderer.contents[0];
    const playlist_data_contents = contents.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0];
    return {
        tracks: inner_contents.musicShelfRenderer === undefined ?
            inner_contents.musicPlaylistShelfRenderer.contents.map(item => item.musicResponsiveListItemRenderer) :
            inner_contents.musicShelfRenderer.contents.map(item => item.musicResponsiveListItemRenderer),
        playlist_data: playlist_data_contents.musicResponsiveHeaderRenderer !== undefined ? playlist_data_contents.musicResponsiveHeaderRenderer : playlist_data_contents.musicEditablePlaylistDetailHeaderRenderer.header.musicResponsiveHeaderRenderer,
        continuation: inner_contents?.musicPlaylistShelfRenderer?.continuations ?? 
                inner_contents?.musicPlaylistShelfRenderer?.continuations ?? 
                inner_contents?.musicPlaylistShelfRenderer?.contents?.find(item => item?.continuationItemRenderer)?.continuationItemRenderer ??
                null
    }
}
export function parse_artist_contents(initial_data: InitialData[]) {
    const contents: ArtistResults_0 = initial_data as unknown as ArtistResults_0;
    return {
        top_shelf: contents[1].contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents.find(item => item.musicShelfRenderer !== undefined)?.musicShelfRenderer as MusicShelfRenderer,
        shelfs: contents[1].contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents.filter(item => item.musicCarouselShelfRenderer !== undefined).map(item => item.musicCarouselShelfRenderer) as MusicCarouselShelfRenderer[],
        artist_id: contents[1].responseContext.serviceTrackingParams[0].params.find(item => item.key === "browse_id")?.value,
        header: contents[1].header
    }
}
export function parse_search_contents(initial_data: InitialData[]) {
    const contents: SearchResults_0 = initial_data as unknown as SearchResults_0;
    return {
        contents: contents[1].contents.tabbedSearchResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents,
        mode_endpoints: contents[1].contents.tabbedSearchResultsRenderer.tabs[0].tabRenderer.content?.sectionListRenderer?.header?.chipCloudRenderer.chips.map(chip => {
                return {
                    endpoint: chip.chipCloudChipRenderer.navigationEndpoint.searchEndpoint,
                    id: chip.chipCloudChipRenderer.uniqueId
                }
        })
    };
}

const not_artist_names = ["&", ",", "and", "and,"];
export function parse_new_releases_albums(initial_data: InitialData[]): YouTubeMusicAlbum[]{
    const contents: NewReleasesAlbums = initial_data[1] as unknown as NewReleasesAlbums;
    const items = contents.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].gridRenderer.items
        .filter(item => item.musicTwoRowItemRenderer)
        .map(item => item.musicTwoRowItemRenderer);

    return items.map(item => {
        const [album_type, artists] = parse_subtitle_text(item.subtitle.runs as Run[]);
        return {
            title: parse_runs(item.title.runs),
            artists: artists?.map(artist => ({
                name: artist.text,
                browse_id: artist.navigationEndpoint?.browseEndpoint.browseId ?? ""
            })).filter(artist => !not_artist_names.includes(artist.name.trim())),
            album_type: parse_runs(album_type) as YouTubeMusicAlbumType,
            thumbnails: item.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails,
            badges: item.subtitleBadges?.map(badge => badge.musicInlineBadgeRenderer.icon.iconType) as YouTubeMusicBadges ?? [],
            browse_id: item.navigationEndpoint.browseEndpoint?.browseId ?? item?.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint.browseId
        }
    });
}
export function parse_track_search_suggestion(suggestion: SuggestionMusicResponsiveListItemRenderer): YouTubeMusicTrack{
    const [album_type, artists, plays_string] = parse_subtitle_text(suggestion.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs);
    const album = suggestion.flexColumns[2] !== undefined ? suggestion.flexColumns[2].musicResponsiveListItemFlexColumnRenderer.text.runs[0] : undefined;
    return {
        thumbnails: suggestion.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ?? [],
        title: parse_runs(suggestion.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs),
        artists: artists?.map(artist => ({
            name: artist.text,
            browse_id: artist.navigationEndpoint?.browseEndpoint.browseId ?? ""
        })).filter(artist => !not_artist_names.includes(artist.name.trim())),
        video_id: suggestion.playlistItemData.videoId,
        badges: suggestion.badges?.map(badge => badge.musicInlineBadgeRenderer.icon.iconType) as YouTubeMusicBadges ?? [],
        track_type: parse_runs(album_type) as YouTubeMusicAlbumType,
        album: album ? {
            name: album.text,
            browse_id: album.navigationEndpoint?.browseEndpoint?.browseId ?? ""
        } : album,
        plays: youtube_views_number(parse_runs(plays_string)),
    }
}

const separator = '•';
export function parse_subtitle_text(runs: Run[]){
    const separated_runs: Run2[][] = [];
    let run_section: Run2[] = [];
    for(const run of runs){
        if(run.text.trim().includes(separator)){
            separated_runs.push(run_section);
            run_section = [];
            continue;
        }
        run_section.push(run);
    }
    separated_runs.push(run_section);
    return separated_runs;
}

function is_numeric(num: any) { return !isNaN(num) }
export function find_album_year(album: ArtistCarouselContent): number {
    return parseInt(album.musicTwoRowItemRenderer.subtitle.runs.find(run => is_numeric(run.text))?.text ?? "0");
}
export function parse_album_data(album: ArtistCarouselContent) {
    return {
        thumbnail_uri: album.musicTwoRowItemRenderer.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails[0].url,
        type: album.musicTwoRowItemRenderer.subtitle.runs.length === 3 ? album.musicTwoRowItemRenderer.subtitle.runs[0].text : "Unknown",
        year: find_album_year(album),
        id: album.musicTwoRowItemRenderer.navigationEndpoint.browseEndpoint?.browseId.replace("VL", '') as string
    }
}