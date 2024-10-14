import { get_main_key, parse_runs } from "../utils/util";
import { ArtistResults_0, Content4, MusicCarouselShelfRenderer, MusicShelfRenderer } from "./types/ArtistResults_0";
import { ExploreResults_0 } from "./types/ExploreResults_0";
import { HomeResults_0 } from "./types/HomeResults_0";
import { LibraryResults_0, ParsedLibraryResults } from "./types/LibraryResults_0";
import { PlaylistResults_0, YouTubeMusicPlaylistTrack } from "./types/PlaylistResults_0";
import { PlaylistResults_2 } from "./types/PlaylistResults_2";
import { SearchResults_0 } from "./types/SearchResults_0";
import { TabRenderer_0 } from "./types/TabRender_0";
import { InitialData } from "./types/types";

export function parse_home_contents(initial_data: InitialData[]){
    const contents: HomeResults_0[] = initial_data as unknown as HomeResults_0[];
    return {
        "contents": contents[1].contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents,
        "continuation": contents[1].contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.continuations[0].nextContinuationData
    }
}
export function parse_explore_contents(initial_data: InitialData){
    const contents: ExploreResults_0 = initial_data as unknown as ExploreResults_0;
    return contents[1].contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents.filter(item => item.musicCarouselShelfRenderer !== undefined);
}
export function parse_library_contents(initial_data: InitialData){
    const contents: LibraryResults_0 = initial_data as unknown as LibraryResults_0;
    const playlists = contents.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].gridRenderer.items.map(item => {
        if(item.musicTwoRowItemRenderer.navigationEndpoint.browseEndpoint === undefined) return undefined;
        return {
            "title": parse_runs(item.musicTwoRowItemRenderer.title.runs),
            "thumbnails": item.musicTwoRowItemRenderer.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails,
            "endpoint": item.musicTwoRowItemRenderer.navigationEndpoint.browseEndpoint.browseId.replace("VL", "")
        }
    })
    const filtered_playlists = playlists.filter(playlist => playlist !== undefined)!;
    return filtered_playlists;
}
export function parse_playlist_contents(initial_data: InitialData[]){
    const contents = initial_data[1] as PlaylistResults_0;
    const inner_contents = contents.contents.twoColumnBrowseResultsRenderer.secondaryContents.sectionListRenderer.contents[0];
    const playlist_data_contents = contents.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0];
    return {
        "tracks": inner_contents.musicShelfRenderer === undefined ?
            inner_contents.musicPlaylistShelfRenderer.contents.map(item => item.musicResponsiveListItemRenderer) as YouTubeMusicPlaylistTrack[] :
            inner_contents.musicShelfRenderer.contents.map(item => item.musicResponsiveListItemRenderer) as YouTubeMusicPlaylistTrack[],
        "playlist_data": playlist_data_contents.musicResponsiveHeaderRenderer !== undefined ? playlist_data_contents.musicResponsiveHeaderRenderer : playlist_data_contents.musicEditablePlaylistDetailHeaderRenderer.header.musicResponsiveHeaderRenderer,
        "continuation": inner_contents.musicPlaylistShelfRenderer !== undefined ? 
            inner_contents.musicPlaylistShelfRenderer.continuations === undefined ? null :
                inner_contents.musicPlaylistShelfRenderer.continuations : null
    }
}
export function parse_artist_contents(initial_data: InitialData[]){
    const contents: ArtistResults_0 = initial_data as unknown as ArtistResults_0;
    return {
        "top_shelf": contents[1].contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents.filter(item => item.musicShelfRenderer !== undefined)[0].musicShelfRenderer as MusicShelfRenderer,
        "shelfs": contents[1].contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents.filter(item => item.musicCarouselShelfRenderer !== undefined).map(item => item.musicCarouselShelfRenderer) as MusicCarouselShelfRenderer[]
    }
}
export function parse_search_contents(initial_data: InitialData[]){
    const contents: SearchResults_0 = initial_data as unknown as SearchResults_0;
    return {
        "contents": contents[1].contents.tabbedSearchResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents,
        "mode_endpoints": contents[1].contents.tabbedSearchResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.header.chipCloudRenderer.chips.map(chip => {
                return {
                    "endpoint": chip.chipCloudChipRenderer.navigationEndpoint.searchEndpoint,
                    "id": chip.chipCloudChipRenderer.uniqueId
                }
        })
    };
}
function is_numeric(num: any){ return !isNaN(num) }
export function find_album_year(album: Content4): number {
    return parseInt(album.musicTwoRowItemRenderer.subtitle.runs.find(run => is_numeric(run.text))?.text ?? "0");
}
export function parse_album_data(album: Content4) {
    return {
        "thumbnail_uri": album.musicTwoRowItemRenderer.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails[0].url,
        "type": album.musicTwoRowItemRenderer.subtitle.runs.length === 3 ? album.musicTwoRowItemRenderer.subtitle.runs[0].text : "Unknown",
        "year": find_album_year(album),
        "id": album.musicTwoRowItemRenderer.navigationEndpoint.browseEndpoint?.browseId.replace("VL", '') as string
    }
}