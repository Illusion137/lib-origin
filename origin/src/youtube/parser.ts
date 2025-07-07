import type { ChannelResultsW } from "./types/ChannelResultsW";
import type { ChannelResultsWContinuation } from "./types/ChannelResultsWContinuation";
// import { HomeResultsW } from "./types/HomeResultsW";
import type { HomeResultsWContinuation } from "./types/HomeResultsWContinuation";
import type { LibraryResultsW } from "./types/LibraryResultsW";
import type { MixResults_0 } from "./types/MixResults_0";
import type { PlaylistResultsW, PlaylistVideoRenderer } from "./types/PlaylistResultsW";
import type { PlaylistResultsWContinuation } from "./types/PlaylistResultsWContinuation";
import type { SearchResultsM } from "./types/SearchResultsM";
import type { SearchResultsW } from "./types/SearchResultsW";
import type { SearchResultsWContinuation } from "./types/SearchResultsWContinuation";
import type { InitialData } from "./types/types";

export function parse_home_contents(initial_data: InitialData) {
    initial_data;
    // const contents = (initial_data as HomeResultsW).contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.richGridRenderer.contents;
    return {
        // videos: { video_renderer: contents.filter(item => item.richItemRenderer !== undefined).map(item => item.richItemRenderer!.content.videoRenderer)},
        // shorts: { shorts_renderer: contents.filter(item => item.richSectionRenderer !== undefined).map(item => item.richSectionRenderer!.content.richShelfRenderer.contents
            // .filter(item => item.richItemRenderer.content.shortsLockupViewModel !== undefined).map(item => item.richItemRenderer.content.shortsLockupViewModel!)).map(item => item[0])},
        // continuation: contents.find(item => item.continuationItemRenderer !== undefined)?.continuationItemRenderer ?? null
    }
}
export function parse_home_continuation_contents(initial_data: InitialData) {
    const contents = (initial_data as HomeResultsWContinuation).onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems;
    return {
        videos: { video_renderer: contents.filter(item => item.richItemRenderer !== undefined).map(item => item.richItemRenderer!.content.videoRenderer)},
        shorts: { shorts_renderer: contents.filter(item => item.richSectionRenderer !== undefined).map(item => item.richSectionRenderer!.content.richShelfRenderer.contents
            .filter(item => item.richItemRenderer.content.shortsLockupViewModel !== undefined).map(item => item.richItemRenderer.content.shortsLockupViewModel)).map(item => item[0])},
        continuation: contents.find(item => item.continuationItemRenderer !== undefined)?.continuationItemRenderer ?? null
    }
}
export function parse_library_contents(initial_data: InitialData) {
    const contents = initial_data as LibraryResultsW;
    const playlists = contents.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.richGridRenderer.contents.map(item => {
        return {
            title: item.richItemRenderer.content.lockupViewModel.metadata.lockupMetadataViewModel.title.content,
            thumbnails: item.richItemRenderer.content.lockupViewModel.contentImage.collectionThumbnailViewModel.primaryThumbnail.thumbnailViewModel.image.sources,
            endpoint: item.richItemRenderer.content.lockupViewModel.contentId
        }
    })
    return playlists;
}
export function parse_playlist_contents(initial_data: InitialData) {
    const contents = initial_data as PlaylistResultsW;
    const playlist_contents = contents.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;
    const continuation_item = playlist_contents.find(item => item.continuationItemRenderer !== undefined);
    return {
        tracks: { playlist_video_renderer: playlist_contents.filter(item => item.playlistVideoRenderer !== undefined).map(item => item.playlistVideoRenderer) as PlaylistVideoRenderer[] },
        playlist_data: contents.header?.pageHeaderRenderer?.content !== undefined ? { playlist_header_content_renderer: contents.header?.pageHeaderRenderer?.content.pageHeaderViewModel } : { playlist_header_renderer: contents.header.playlistHeaderRenderer},
        continuation: continuation_item?.continuationItemRenderer ?? null
    }
}
export function parse_playlist_continuation_contents(initial_data: InitialData) {
    const contents = initial_data as PlaylistResultsWContinuation;
    const playlist_contents = contents.onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems;
    const continuation_item = playlist_contents.find(item => item.continuationItemRenderer !== undefined);
    return {
        tracks: { playlist_video_renderer: playlist_contents.filter(item => item.playlistVideoRenderer !== undefined).map(item => item.playlistVideoRenderer) as PlaylistVideoRenderer[]},
        continuation: continuation_item?.continuationItemRenderer ?? null
    }
}
export function parse_channel_contents(initial_data: InitialData) {
    const contents = initial_data as ChannelResultsW;
    const tabs = contents.contents.twoColumnBrowseResultsRenderer.tabs.filter(tab => tab.tabRenderer !== undefined).map(tab => tab.tabRenderer!);
    return {
        header: contents.header.pageHeaderRenderer.content.pageHeaderViewModel,
        tabs: tabs
    }
}
export function parse_channel_continuation_contents(initial_data: InitialData) {
    const contents = initial_data as ChannelResultsWContinuation;
    const tabs = contents.contents.twoColumnBrowseResultsRenderer.tabs.filter(tab => tab.tabRenderer !== undefined).map(tab => tab.tabRenderer!);
    return {
        tabs: tabs
    }
}
export function parse_search_contents(initial_data: InitialData) {
    const contents = (initial_data as SearchResultsW|SearchResultsM).contents;
    if("twoColumnSearchResultsRenderer" in contents) {
        const items = contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
        const continuations = contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer?.contents?.[1]?.continuationItemRenderer;
        return {
            videos: {video_renderer: items.filter(item => item.videoRenderer !== undefined).map(item => item.videoRenderer)},
            artists: {channel_renderer: items.filter(item => item.channelRenderer !== undefined).map(item => item.channelRenderer)},
            playlists: {playlist_renderer: items.filter(item => item.playlistRenderer !== undefined).map(item => item.playlistRenderer)},
            continuation: continuations ?? null
        }
    }
    const items = contents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
    const continuations = contents.sectionListRenderer.contents?.[1]?.continuationItemRenderer;
    return {
        videos: {compact_video_renderer: items.filter(item => item.videoWithContextRenderer !== undefined).map(item => item.videoWithContextRenderer)},
        artists: {compact_channel_renderer: items.filter(item => item.compactChannelRenderer !== undefined).map(item => item.compactChannelRenderer)},
        playlists: {compact_playlist_renderer: items.filter(item => item.compactPlaylistRenderer !== undefined).map(item => item.compactPlaylistRenderer)},
        continuation: continuations ?? null
    }
}
export function parse_search_continuation_contents(initial_data: InitialData) {
    const contents = (initial_data as unknown as SearchResultsWContinuation).onResponseReceivedCommands[0].appendContinuationItemsAction.continuationItems;
    const items = contents[0].itemSectionRenderer.contents;
    const continuation = contents?.[1]?.continuationItemRenderer;
    return {
        videos: {video_renderer: items.filter(item => item.videoRenderer !== undefined).map(item => item.videoRenderer)},
        artists: {channel_renderer: items.filter(item => item.channelRenderer !== undefined).map(item => item.channelRenderer)},
        playlists: {playlist_renderer: items.filter(item => item.playlistRenderer !== undefined).map(item => item.playlistRenderer)},
        continuation: continuation ?? null
    }
}
export function parse_mix_contents(initial_data: InitialData) {
    const contents = (initial_data as MixResults_0).contents.twoColumnWatchNextResults.playlist.playlist.contents;
    return {
        videos: {playlist_panel_video_renderer: contents.filter(item => item.playlistPanelVideoRenderer !== undefined).map(item => item.playlistPanelVideoRenderer)}
    }
}