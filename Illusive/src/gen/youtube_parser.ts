import { CompactArtist, CompactPlaylist, MusicServicePlaylistBase, Track } from "../types";
import { CompactChannelRenderer, CompactPlaylistRenderer, VideoWithContextRenderer } from "../../../origin/src/youtube/types/SearchResultsM";
import { ChannelRenderer, PlaylistRenderer, VideoRenderer } from "../../../origin/src/youtube/types/SearchResultsW";
import { generate_new_uid, parse_runs, parse_time } from "../../../origin/src/utils/util";
import { best_thumbnail, create_uri, youtube_views_number } from "../illusive_utilts";
import { PlaylistHeaderRenderer, PlaylistVideoRenderer } from "../../../origin/src/youtube/types/PlaylistResultsW";
import { PageHeaderViewModel } from "../../../origin/src/youtube/types/PageHeaderViewModel";

export function youtube_parse_videos(videos: {video_renderer: VideoRenderer[]}|{compact_video_renderer: VideoWithContextRenderer[]}|{playlist_video_renderer: PlaylistVideoRenderer[]} ): Track[]{
    if("video_renderer" in videos){
        return videos.video_renderer.map(track => {
            return <Track>{
                "uid": generate_new_uid(parse_runs(track.title.runs)),
                "title": parse_runs(track.title.runs),
                "artists": [{"name": parse_runs(track?.shortBylineText.runs), "uri": create_uri("youtube", track.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl)}],
                "duration": parse_time(track.lengthText.simpleText),
                "youtube_id": track.videoId,
            }
        })
    }
    else if("compact_video_renderer" in videos){
        return videos.compact_video_renderer.map(track => {
            return <Track>{
                "uid": generate_new_uid(parse_runs(track?.headline.runs)),
                "title": parse_runs(track?.headline.runs),
                "artists": [{"name": parse_runs(track?.shortBylineText.runs), "uri": create_uri("youtube", track!.shortBylineText!.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl)}],
                "duration": parse_time(parse_runs(track.lengthText.runs)),
                "youtube_id": track.videoId,
            };
        });
    }
    else return videos.playlist_video_renderer.map(track => {
        return {
            "uid": generate_new_uid(parse_runs(track.title.runs)),
            "title": parse_runs(track.title.runs),
            "artists": [{"name": parse_runs(track.shortBylineText.runs), "uri": track.shortBylineText.runs[0]?.navigationEndpoint === undefined ? null : create_uri("youtube", track.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId)}],
            "duration": parseInt(track.lengthSeconds),
            "plays": youtube_views_number(track.videoInfo?.runs?.[0]?.text),
            "youtube_id": track.videoId,
        };
    })
}

export function youtube_parse_playlists(playlists: {playlist_renderer: PlaylistRenderer[]}|{compact_playlist_renderer: CompactPlaylistRenderer[]}): CompactPlaylist[]{
    if("playlist_renderer" in playlists){
        return playlists.playlist_renderer.map(playlist => {
            return {
                "title": {"name": playlist.title.simpleText, "uri": create_uri("youtube", playlist.playlistId)},
                "artist": [{"name": playlist.longBylineText.runs[0].text, "uri": null}],
                "artwork_url": best_thumbnail(playlist.thumbnail.thumbnails)?.url,
            }
        });
    }
    return playlists.compact_playlist_renderer.map(playlist => {
        return {
            "title": {"name": "runs" in playlist.title ? parse_runs(playlist.title.runs) : playlist.title, "uri": create_uri("youtube", playlist.playlistId)},
            "artist": [{"name": parse_runs(playlist.shortBylineText.runs), "uri": create_uri("youtube", playlist.shortBylineText.runs[0].navigationEndpoint?.browseEndpoint.canonicalBaseUrl ?? "")}],
            "artwork_url": best_thumbnail(playlist.thumbnail.thumbnails)?.url,
        }
    });
}

export function youtube_parse_channels(channels: {channel_renderer: ChannelRenderer[]}|{compact_channel_renderer: CompactChannelRenderer[]}): CompactArtist[]{
    if("channel_renderer" in channels){
        return channels.channel_renderer.map(channel => {
            return {
                "name": {"name": channel.title.simpleText, "uri": create_uri("youtube", channel.channelId)},
                "profile_artwork_url": channel.thumbnail.thumbnails[0].url,
                "is_official_artist_channel": true
            }
        });
    }
    return channels.compact_channel_renderer.map(channel => {
        return {
            "name": {"name": parse_runs(channel.title.runs), "uri": create_uri("youtube", channel.channelId)},
            "profile_artwork_url": channel.thumbnail.thumbnails[0].url,
            "is_official_artist_channel": true
        }
    });
}

export function youtube_parse_playlist_header(header: { playlist_header_content_renderer: PageHeaderViewModel } | { playlist_header_renderer: PlaylistHeaderRenderer }): MusicServicePlaylistBase{
    if("playlist_header_renderer" in header){
        const playlist_data = header.playlist_header_renderer;
        if(playlist_data?.ownerText?.runs !== undefined)
            return {
                "title": playlist_data.title.simpleText,
                "creator": [{"name": parse_runs((playlist_data.ownerText.runs)), "uri": create_uri("youtube", playlist_data.ownerEndpoint.browseEndpoint.browseId)}],
            };
        else
            return {
                "title": playlist_data.title.simpleText,
                "creator": [],
            };
    }
    const owner = header.playlist_header_content_renderer.metadata.contentMetadataViewModel.metadataRows[0].metadataParts[0]; 
    return {
        "title": header.playlist_header_content_renderer.title.dynamicTextViewModel.text.content,
        "creator": [{"name": owner.text?.content ?? "", "uri": null}],
    };
}