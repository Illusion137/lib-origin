import { get_main_key, parse_runs } from "../utils/util";
import { ArtistResults_0, Content4, MusicCarouselShelfRenderer, MusicShelfRenderer } from "./types/ArtistResults_0";
import { ExploreResults_0 } from "./types/ExploreResults_0";
import { HomeResults_0 } from "./types/HomeResults_0";
import { LibraryResults_0, ParsedLibraryResults } from "./types/LibraryResults_0";
import { LibraryResults_1 } from "./types/LibraryResults_1";
import { MixResults_0 } from "./types/MixResults_0";
import { PlaylistResults_0 } from "./types/PlaylistResults_0";
import { PlaylistResults_1 } from "./types/PlaylistResults_1";
import { PlaylistResults_2 } from "./types/PlaylistResults_2";
import { SearchResults_0 } from "./types/SearchResults_0";
import { SearchResults_1 } from "./types/SearchResults_1";
import { TabRenderer_0 } from "./types/TabRender_0";
import { InitialData } from "./types/types";

export function parse_home_contents(initial_data: InitialData){
    const contents: HomeResults_0 = initial_data as unknown as HomeResults_0;
    return {
        // "contents": contents.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents,
        // "continuation": contents.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.continuations[0].nextContinuationData
    }
}
export function parse_explore_contents(initial_data: InitialData){
    const contents: ExploreResults_0 = initial_data as unknown as ExploreResults_0;
    return contents[1].contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents.filter(item => item.musicCarouselShelfRenderer !== undefined);
}
export function parse_library_contents(initial_data: InitialData){
    const contents = initial_data as unknown as LibraryResults_0|LibraryResults_1;
    const playlists = contents.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.richGridRenderer.contents.map(item => {
        return {
            "title": item.richItemRenderer.content.lockupViewModel.metadata.lockupMetadataViewModel.title.content,
            "thumbnails": item.richItemRenderer.content.lockupViewModel.contentImage.collectionThumbnailViewModel.primaryThumbnail.thumbnailViewModel.image.sources,
            "endpoint": item.richItemRenderer.content.lockupViewModel.contentId
        }
    })
    return playlists;
}
export function parse_playlist_contents(initial_data: InitialData){
    const contents: PlaylistResults_1 = initial_data as unknown as PlaylistResults_1;
    const playlist_contents = contents.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;
    const continuation_item = playlist_contents.find(item => item.continuationItemRenderer !== undefined);
    return {
        "tracks": playlist_contents.filter(item => item.playlistVideoRenderer !== undefined).map(item => item.playlistVideoRenderer),
        "playlist_data": contents.header?.pageHeaderRenderer?.content !== undefined ? contents.header?.pageHeaderRenderer?.content : contents.header.playlistHeaderRenderer,
        "continuation": continuation_item?.continuationItemRenderer ?? null
    }
}
export function parse_playlist_continuation_contents(initial_data: InitialData){
    const contents: PlaylistResults_2 = initial_data as unknown as PlaylistResults_2;
    const playlist_contents = contents.onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems;
    const continuation_item = playlist_contents.find(item => item.continuationItemRenderer !== undefined);
    return {
        "tracks": playlist_contents.filter(item => item.playlistVideoRenderer !== undefined).map(item => item.playlistVideoRenderer),
        "continuation": continuation_item?.continuationItemRenderer ?? null
    }
}
export function parse_artist_contents(initial_data: InitialData[]){
    const contents: ArtistResults_0 = initial_data as unknown as ArtistResults_0;
    return {
        "top_shelf": contents[1].contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents.filter(item => item.musicShelfRenderer !== undefined)[0].musicShelfRenderer as MusicShelfRenderer,
        "shelfs": contents[1].contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents.filter(item => item.musicCarouselShelfRenderer !== undefined).map(item => item.musicCarouselShelfRenderer) as MusicCarouselShelfRenderer[]
    }
}
export function parse_search_contents(initial_data: InitialData){
    const contents = initial_data as unknown as SearchResults_0|SearchResults_1;
    if("twoColumnSearchResultsRenderer" in contents.contents) 
    return {
        "videos": contents.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents.filter(item => item.videoRenderer !== undefined).map(item => item.videoRenderer),
        "artists": contents.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents.filter(item => item.channelRenderer !== undefined).map(item => item.channelRenderer),
        "playlists": contents.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents.filter(item => item.radioRenderer !== undefined).map(item => item.radioRenderer),
    }
    else 
    return {
        "videos": contents.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents.filter(item => item.videoWithContextRenderer !== undefined).map(item => item.videoWithContextRenderer),
        "artists": contents.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents.filter(item => item.compactChannelRenderer !== undefined).map(item => item.compactChannelRenderer),
        "playlists": contents.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents.filter(item => item.compactPlaylistRenderer !== undefined).map(item => item.compactPlaylistRenderer),
    }
}
export function parse_mix_contents(initial_data: InitialData){
    const contents: MixResults_0 = initial_data as MixResults_0;
    return {
        "tracks": contents.contents.twoColumnWatchNextResults.playlist.playlist.contents.map(item => item.playlistPanelVideoRenderer)
    }
}