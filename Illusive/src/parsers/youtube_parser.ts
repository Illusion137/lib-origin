import { parse_runs, parse_time } from "@common/utils/parse_util";
import { extract_string_from_pattern, generate_new_uid, is_empty } from "@common/utils/util";
import type { PlaylistPanelVideoRenderer } from "@origin/youtube/types/MixResults_0";
import type { PageHeaderViewModel } from "@origin/youtube/types/PageHeaderViewModel";
import type { PlaylistHeaderRenderer, PlaylistVideoRenderer } from "@origin/youtube/types/PlaylistResultsW";
import type { CompactChannelRenderer, CompactPlaylistRenderer, VideoWithContextRenderer } from "@origin/youtube/types/SearchResultsM";
import type { ChannelRenderer, PlaylistRenderer, VideoRenderer } from "@origin/youtube/types/SearchResultsW";
import { best_thumbnail, create_uri, youtube_views_number } from "@illusive/illusive_utils";
import type { CompactArtist, CompactPlaylist, DownloadFromIdResult, ExplicitMode, MusicServicePlaylistBase, Track } from "@illusive/types";
import { YTNodes } from "youtubei.js/agnostic";
import { YouTubeDL, type VideoInfo } from '@origin/youtube_dl/index';
// import type { VideoInfo } from "youtubei.js/dist/src/parser/youtube";

export function youtube_info_metadata(info: VideoInfo): DownloadFromIdResult['metadata'] {
    let songs;
    try {
        const engagement_panels = info?.page[1]?.engagement_panels?.map(panel => panel.as(YTNodes.EngagementPanelSectionList));
        if(engagement_panels !== undefined && Array.isArray(engagement_panels) && engagement_panels.filter(item => item !== undefined).length > 0) {
            const structured_description_panel = engagement_panels.find(panel => panel.target_id === "engagement-panel-structured-description");
            if(structured_description_panel !== undefined) {
                const music_renderer = structured_description_panel.content?.as(YTNodes.StructuredDescriptionContent).items.find(item => item.as(YTNodes.HorizontalCardList)?.header.as(YTNodes.ButtonView).icon_name === "MUSIC")?.as(YTNodes.HorizontalCardList);
                if(music_renderer !== undefined) {
                    songs = music_renderer.cards.map(item => {
                        const attributes = item.as(YTNodes.VideoAttributeView);
                        return {
                            artwork_url: Array.isArray(attributes.image) ? attributes.image?.[0]?.url : attributes.image?.image?.[0]?.url,
                            title: attributes.title,
                            artist: attributes.subtitle,
                            album: attributes?.secondary_subtitle?.content,
                        };
                    });
                }
            }
        }
    } catch (_) {}


    return {
        artist_id: info.basic_info.channel?.id ?? "",
        chapters: YouTubeDL.get_chapters(info),
        songs,
    };
}

export function extract_youtube_title_info(track: Track) {    
    const prods_0 = extract_string_from_pattern(track.title, / ?[([] ?prod\.?(.+?)[)]]/ig);
    const prods_1 = extract_string_from_pattern(track.title, / ?[([] ?produced\.?(.+?)[)]]/ig);
    const prods: string[] = [prods_0, prods_1].filter(item => typeof item === "string").map(item => item.replace(/ by /i, ''));
    const feats_0 = extract_string_from_pattern(track.title, / ?[([] ?ft\.?(.+?)[)]]/ig);
    const feats_1 = extract_string_from_pattern(track.title, / ?[([] ?feat\.?(.+?)[)]]/ig);
    const feats: string[] = [feats_0, feats_1].filter(item => typeof item === "string");
    const unreleased = / ?[([] ?unreleased ?[)]]/ig.test(track.title) || / unreleased/g.test(track.title);
    const explicit = / ?[([] ?explicit ?[)]]/ig.test(track.title) || / ?[([] ?explicit version ?[)]]/ig.test(track.title);
    const clean = / ?[([].*?clean.*?[)]]/ig.test(track.title);
    return {
        prods: prods[0],
        feats: feats[0],
        unreleased,
        explicit,
        clean
    }   
}
export function clean_youtube_title(title: string){
    return title
    .replace(/ ?full song ?/ig, '')
    .replace(/ ?[([] ?prod\.?.+?[)]]/ig, '')
    .replace(/ ?[([] ?dir\.?.+?[)]]/ig, '')
    .replace(/ ?[([] ?ft\.?.+?[)]]/ig, '')
    .replace(/ ?[([] ?feat\.?.+?[)]]/ig, '')
    .replace(/ ?[([] ?w\/.+?[)]]/ig, '')
    .replace(/ ?[([] ?unreleased ?[)]]/ig, '')
    .replace(/ ?[([] ?explicit ?[)]]/ig, '')
    .replace(/ ?[([] ?explicit version ?[)]]/ig, '')
    .replace(/ ?[([] ?official ?[)]]/ig, '')
    .replace(/ ?[([] ?legendado ?[)]]/ig, '')
    .replace(/ ?[([] ?full video ?[)]]/ig, '')
    .replace(/ ?[([] ?video version ?[)]]/ig, '')
    .replace(/ ?[([] ?music ?[)]]/ig, '')
    .replace(/ ?[([] ?audio ?[)]]/ig, '')
    .replace(/ ?[([] ?video ?[)]]/ig, '')
    .replace(/ ?[([] ?lyrics? ?[)]]/ig, '')
    .replace(/ ?[([] ?lyrics? video ?[)]]/ig, '')
    .replace(/ ?[([] ?music video ?[)]]/ig, '')
    .replace(/ ?[([] ?official audio ?[)]]/ig, '')
    .replace(/ ?[([] ?official video ?[)]]/ig, '')
    .replace(/ ?[([] ?official visual ?[)]]/ig, '')
    .replace(/ ?[([] ?official lyrics? ?[)]]/ig, '')
    .replace(/ ?[([] ?official lyrics? video ?[)]]/ig, '')
    .replace(/ ?[([] ?exclusive music video ?[)]]/ig, '')
    .replace(/ ?[([] ?official music video ?[)]]/ig, '')
    .replace(/ ?[([].*?official music video ?[)]]/ig, '')
    .replace(/ ?[([] ?visualizer ?[)]]/ig, '')
    .replace(/ ?[([] ?visualiser ?[)]]/ig, '')
    .replace(/ ?[([] ?official visualizer ?[)]]/ig, '')
    .replace(/ ?[([] ?official mv ?[)]]/ig, '')
    .replace(/ ?[([] ?reupload ?[)]]/ig, '')
    .replace(/ ?[([] ?bass boosted ?[)]]/ig, '')
    .replace(/ ?[([] ?HD ?[)]]/ig, '')
    .replace(/ ?[([] ?HQ ?[)]]/ig, '')
    .replace(/ ?[([] ?remix ?[)]]/ig, '')
    .replace(/ ?[([] ?ost ?[)]]/ig, '')
    .replace(/ ?[([] ?fanmade ?[)]]/ig, '')
    .replace(/ ?[([] ?extended ?[)]]/ig, '')
    .replace(/ ?[([] ?tik tok ?[)]]/ig, '')
    .replace(/ ?[([] ?tiktok ?[)]]/ig, '')
    .replace(/ ?[([] ?amv ?[)]]/ig, '')
    .replace(/ ?[([] ?full ?[)]]/ig, '')
    .replace(/ ?[([] ?full song ?[)]]/ig, '')
    .replace(/ ?[([] ?best version ?[)]]/ig, '')
    .replace(/ ?[([] ?best ?[)]]/ig, '')
    .replace(/ ?[([].*?only.*?[)]]/ig, '')
    .replace(/ ?[([].*?remix.*?[)]]/ig, '')
    .replace(/ ?[([].*?clean.*?[)]]/ig, '')
    .replace(/ ?[([].*?by.*?[)]]/ig, '')
    .replace(/unreleased/ig, '');
}
export function parse_youtube_title_artist(track: Track): Track {
    const new_title = clean_youtube_title(track.title);
    const info = extract_youtube_title_info(track);
    const joined_artists = !is_empty(info.feats) ? track.artists.concat({name: info.feats, uri: null}) : track.artists;
    return {
        ...track,
        title: new_title,
        alt_title: track.title,
        artists: joined_artists,
        explicit: (info.explicit ? "EXPLICIT" : 
            info.clean ? "CLEAN" : "NONE") as ExplicitMode,
        unreleased: info.unreleased,
        prods: info.prods,
    }
}

export function youtube_parse_videos(videos: {video_renderer: VideoRenderer[]}|{compact_video_renderer: VideoWithContextRenderer[]}|{playlist_panel_video_renderer: PlaylistPanelVideoRenderer[]}|{playlist_video_renderer: PlaylistVideoRenderer[]} ): Track[] {
    if("video_renderer" in videos) {
        return videos.video_renderer.filter(track => !is_empty(track?.lengthText?.simpleText)).map(track => {
            const artist_id = track?.shortBylineText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl;
            return parse_youtube_title_artist({
                uid: generate_new_uid(parse_runs(track.title.runs)),
                title: parse_runs(track.title.runs),
                artists: [{name: parse_runs(track?.shortBylineText.runs), uri: artist_id ? create_uri("youtube", artist_id) : null}],
                duration: parse_time(track.lengthText.simpleText),
                youtube_id: track.videoId,
                plays: youtube_views_number(track?.shortViewCountText?.simpleText)
            } as Track)
        })
    } else if("compact_video_renderer" in videos) {
        return videos.compact_video_renderer.filter(track => !is_empty(track?.lengthText?.runs)).map(track => {
            const artist_id = track.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl;
            return parse_youtube_title_artist({
                uid: generate_new_uid(parse_runs(track?.headline.runs)),
                title: parse_runs(track?.headline.runs),
                artists: [{name: parse_runs(track?.shortBylineText.runs), uri: artist_id ? create_uri("youtube", artist_id) : null}],
                duration: parse_time(parse_runs(track.lengthText.runs)),
                youtube_id: track.videoId,
                plays: youtube_views_number(parse_runs(track?.shortViewCountText?.runs ?? []))
            } as Track);
        });
    } else if("playlist_panel_video_renderer" in videos) {
        return videos.playlist_panel_video_renderer.filter(track => !is_empty(track?.lengthText.simpleText)).map(track => { 
            return parse_youtube_title_artist ({
                uid: generate_new_uid(track.title.simpleText),
                title: track.title.simpleText,
                artists: [{name: parse_runs(track.shortBylineText.runs), uri: create_uri("youtube", track.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId)}],
                duration: parse_time(track.lengthText.simpleText),
                youtube_id: track.videoId
            } as Track)
        });
    } 
    else return videos.playlist_video_renderer.filter(track => !is_empty(track?.lengthSeconds)).map(track => {
        return parse_youtube_title_artist({
            uid: generate_new_uid(parse_runs(track.title.runs)),
            title: parse_runs(track.title.runs),
            artists: [{name: parse_runs(track.shortBylineText.runs), uri: track.shortBylineText.runs[0]?.navigationEndpoint === undefined ? null : create_uri("youtube", track.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId)}],
            duration: parseInt(track.lengthSeconds),
            plays: youtube_views_number(track.videoInfo?.runs?.[0]?.text),
            youtube_id: track.videoId,
        });
    })
}

export function youtube_parse_playlists(playlists: {playlist_renderer: PlaylistRenderer[]}|{compact_playlist_renderer: CompactPlaylistRenderer[]}): CompactPlaylist[] {
    if("playlist_renderer" in playlists) {
        return playlists.playlist_renderer.map(playlist => {
            return {
                title: {name: playlist.title.simpleText, uri: create_uri("youtube", playlist.playlistId)},
                artist: [{name: playlist.longBylineText.runs[0].text, uri: null}],
                artwork_url: best_thumbnail(playlist?.thumbnail?.thumbnails)?.url,
            }
        });
    }
    return playlists.compact_playlist_renderer.map(playlist => {
        return {
            title: {name: "runs" in playlist.title ? parse_runs(playlist.title.runs) : playlist.title, uri: create_uri("youtube", playlist.playlistId)},
            artist: [{name: parse_runs(playlist.shortBylineText.runs), uri: create_uri("youtube", playlist.shortBylineText.runs[0].navigationEndpoint?.browseEndpoint.canonicalBaseUrl ?? "")}],
            artwork_url: best_thumbnail(playlist?.thumbnail?.thumbnails)?.url,
        }
    });
}

export function youtube_parse_channels(channels: {channel_renderer: ChannelRenderer[]}|{compact_channel_renderer: CompactChannelRenderer[]}): CompactArtist[] {
    if("channel_renderer" in channels) {
        return channels.channel_renderer.map(channel => {
            return {
                name: {name: channel.title.simpleText, uri: create_uri("youtube", channel.channelId)},
                profile_artwork_url: channel?.thumbnail?.thumbnails?.[0].url,
                is_official_artist_channel: true
            }
        });
    }
    return channels.compact_channel_renderer.map(channel => {
        return {
            name: {name: parse_runs(channel.title.runs), uri: create_uri("youtube", channel.channelId)},
            profile_artwork_url: channel?.thumbnail?.thumbnails?.[0]?.url,
            is_official_artist_channel: true
        }
    });
}

export function youtube_parse_playlist_header(header: { playlist_header_content_renderer: PageHeaderViewModel } | { playlist_header_renderer: PlaylistHeaderRenderer }): MusicServicePlaylistBase {
    if("playlist_header_renderer" in header) {
        const playlist_data = header.playlist_header_renderer;
        if(playlist_data?.ownerText?.runs !== undefined)
            return {
                title: playlist_data.title.simpleText,
                creator: [{name: parse_runs((playlist_data.ownerText.runs)), uri: create_uri("youtube", playlist_data.ownerEndpoint.browseEndpoint.browseId)}],
            };
        else
            return {
                title: playlist_data.title.simpleText,
                creator: [],
            };
    }
    const owner = header.playlist_header_content_renderer.metadata.contentMetadataViewModel.metadataRows[0].metadataParts[0]; 
    return {
        title: header.playlist_header_content_renderer.title.dynamicTextViewModel.text.content,
        creator: [{name: owner.text?.content ?? "", uri: null}],
    };
}