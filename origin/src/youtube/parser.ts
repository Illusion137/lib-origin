import { LibraryResultsW } from "./types/LibraryResultsW";
import { MixResults_0 } from "./types/MixResults_0";
import { PlaylistResultsW, PlaylistVideoRenderer } from "./types/PlaylistResultsW";
import { PlaylistResultsWContinuation } from "./types/PlaylistResultsWContinuation";
import { SearchResultsW } from "./types/SearchResultsW";
import { SearchResultsM } from "./types/SearchResultsM";
import { InitialData } from "./types/types";
import { SearchResultsWContinuation } from "./types/SearchResultsWContinuation";
import { HomeResultsW } from "./types/HomeResultsW";
import { HomeResultsWContinuation } from "./types/HomeResultsWContinuation";
import { ChannelResultsW } from "./types/ChannelResultsW";
import { ChannelResultsWContinuation } from "./types/ChannelResultsWContinuation";

export function parse_home_contents(initial_data: InitialData){
    const contents = (<HomeResultsW>initial_data).contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.richGridRenderer.contents;
    return {
        "videos": { video_renderer: contents.filter(item => item.richItemRenderer !== undefined).map(item => item.richItemRenderer!.content.videoRenderer)},
        "shorts": { shorts_renderer: contents.filter(item => item.richSectionRenderer !== undefined).map(item => item.richSectionRenderer!.content.richShelfRenderer.contents
            .filter(item => item.richItemRenderer.content.shortsLockupViewModel !== undefined).map(item => item.richItemRenderer.content.shortsLockupViewModel!)).map(item => item[0])},
        "continuation": contents.find(item => item.continuationItemRenderer !== undefined)?.continuationItemRenderer ?? null
    }
}
export function parse_home_continuation_contents(initial_data: InitialData){
    const contents = (<HomeResultsWContinuation>initial_data).onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems;
    return {
        "videos": { video_renderer: contents.filter(item => item.richItemRenderer !== undefined).map(item => item.richItemRenderer!.content.videoRenderer)},
        "shorts": { shorts_renderer: contents.filter(item => item.richSectionRenderer !== undefined).map(item => item.richSectionRenderer!.content.richShelfRenderer.contents
            .filter(item => item.richItemRenderer.content.shortsLockupViewModel !== undefined).map(item => item.richItemRenderer.content.shortsLockupViewModel!)).map(item => item[0])},
        "continuation": contents.find(item => item.continuationItemRenderer !== undefined)?.continuationItemRenderer ?? null
    }
}
export function parse_library_contents(initial_data: InitialData){
    const contents = <LibraryResultsW>initial_data;
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
    const contents = <PlaylistResultsW>initial_data;
    const playlist_contents = contents.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;
    const continuation_item = playlist_contents.find(item => item.continuationItemRenderer !== undefined);
    return {
        "tracks": { playlist_video_renderer: <PlaylistVideoRenderer[]>playlist_contents.filter(item => item.playlistVideoRenderer !== undefined).map(item => item.playlistVideoRenderer) },
        "playlist_data": contents.header?.pageHeaderRenderer?.content !== undefined ? { playlist_header_content_renderer: contents.header?.pageHeaderRenderer?.content.pageHeaderViewModel } : { playlist_header_renderer: contents.header.playlistHeaderRenderer},
        "continuation": continuation_item?.continuationItemRenderer ?? null
    }
}
export function parse_playlist_continuation_contents(initial_data: InitialData){
    const contents = <PlaylistResultsWContinuation>initial_data;
    const playlist_contents = contents.onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems;
    const continuation_item = playlist_contents.find(item => item.continuationItemRenderer !== undefined);
    return {
        "tracks": { playlist_video_renderer: <PlaylistVideoRenderer[]>playlist_contents.filter(item => item.playlistVideoRenderer !== undefined).map(item => item.playlistVideoRenderer)},
        "continuation": continuation_item?.continuationItemRenderer ?? null
    }
}
export function parse_channel_contents(initial_data: InitialData){
    const contents = <ChannelResultsW>initial_data;
    const tabs = contents.contents.twoColumnBrowseResultsRenderer.tabs.filter(tab => tab.tabRenderer !== undefined).map(tab => tab.tabRenderer!);
    return {
        "header": contents.header.pageHeaderRenderer.content.pageHeaderViewModel,
        "tabs": tabs
    }
}
export function parse_channel_continuation_contents(initial_data: InitialData){
    const contents = <ChannelResultsWContinuation>initial_data;
    const tabs = contents.contents.twoColumnBrowseResultsRenderer.tabs.filter(tab => tab.tabRenderer !== undefined).map(tab => tab.tabRenderer!);
    return {
        "tabs": tabs
    }
}
export function parse_search_contents(initial_data: InitialData){
    const contents = (<SearchResultsW|SearchResultsM>initial_data).contents;
    if("twoColumnSearchResultsRenderer" in contents){
        const items = contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
        const continuations = contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer?.contents?.[1]?.continuationItemRenderer;
        return {
            "videos": {video_renderer: items.filter(item => item.videoRenderer !== undefined).map(item => item.videoRenderer)},
            "artists": {channel_renderer: items.filter(item => item.channelRenderer !== undefined).map(item => item.channelRenderer)},
            "playlists": {playlist_renderer: items.filter(item => item.playlistRenderer !== undefined).map(item => item.playlistRenderer)},
            "continuation": continuations ?? null
        }
    }
    const items = contents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
    const continuations = contents.sectionListRenderer.contents?.[1]?.continuationItemRenderer;
    return {
        "videos": {compact_video_renderer: items.filter(item => item.videoWithContextRenderer !== undefined).map(item => item.videoWithContextRenderer)},
        "artists": {compact_channel_renderer: items.filter(item => item.compactChannelRenderer !== undefined).map(item => item.compactChannelRenderer)},
        "playlists": {compact_playlist_renderer: items.filter(item => item.compactPlaylistRenderer !== undefined).map(item => item.compactPlaylistRenderer)},
        "continuation": continuations ?? null
    }
}
export function parse_search_continuation_contents(initial_data: InitialData){
    const contents = (<SearchResultsWContinuation><unknown>initial_data).onResponseReceivedCommands[0].appendContinuationItemsAction.continuationItems;
    const items = contents[0].itemSectionRenderer.contents;
    const continuation = contents?.[1]?.continuationItemRenderer;
    return {
        "videos": {video_renderer: items.filter(item => item.videoRenderer !== undefined).map(item => item.videoRenderer)},
        "artists": {channel_renderer: items.filter(item => item.channelRenderer !== undefined).map(item => item.channelRenderer)},
        "playlists": {playlist_renderer: items.filter(item => item.playlistRenderer !== undefined).map(item => item.playlistRenderer)},
        "continuation": continuation ?? null
    }
}
export function parse_mix_contents(initial_data: InitialData){
    const contents = (<MixResults_0>initial_data).contents.twoColumnWatchNextResults.playlist.playlist.contents;
    return {
        "tracks": contents.map(item => item.playlistPanelVideoRenderer)
    }
}