import { generate_new_uid } from '@common/utils/util';
import { parse_track_title_artist } from '@illusive/parsers/title_parser';
import { best_thumbnail, create_uri } from '@illusive/illusive_utils';
import type { CompactArtist, CompactPlaylist, DownloadFromIdResult, MusicServicePlaylistBase, NamedUUID, Track } from '@illusive/types';
import type { YTChannelResult, YTCompactPlaylist, YTNamed, YTPlaylistHeader, YTTrack } from '@origin/youtube/parser';
import { YTNodes } from 'youtubei.js/agnostic';
import { YouTubeDL, type VideoInfo } from '@origin/youtube/youtube_dl';
import { IllusiIngest } from '@illusive/db/sync/illusi_ingest';

function youtube_named(named: YTNamed): NamedUUID {
	return { name: named.name, uri: named.channel_id === undefined ? null : create_uri('youtube', named.channel_id) };
}

export function youtube_info_metadata(info: VideoInfo): DownloadFromIdResult['metadata'] {
	let songs;
	try {
		const engagement_panels = info?.page[1]?.engagement_panels?.map(panel => panel.as(YTNodes.EngagementPanelSectionList));
		if (engagement_panels !== undefined && Array.isArray(engagement_panels) && engagement_panels.filter(item => item !== undefined).length > 0) {
			const structured_description_panel = engagement_panels.find(panel => panel.target_id === 'engagement-panel-structured-description');
			if (structured_description_panel !== undefined) {
				const music_renderer = structured_description_panel.content?.as(YTNodes.StructuredDescriptionContent).items.find(item => item.as(YTNodes.HorizontalCardList)?.header.as(YTNodes.ButtonView).icon_name === 'MUSIC')?.as(YTNodes.HorizontalCardList);
				if (music_renderer !== undefined) {
					songs = music_renderer.cards.map((item) => {
						const attributes = item.as(YTNodes.VideoAttributeView);
						return {
							artwork_url: Array.isArray(attributes.image) ? attributes.image?.[0]?.url : attributes.image?.image?.[0]?.url,
							title: attributes.title,
							artist: attributes.subtitle,
							album: attributes?.secondary_subtitle?.content
						};
					});
				}
			}
		}
	} catch (_) { }

	return {
		artist_id: info.basic_info.channel?.id ?? '',
		chapters: YouTubeDL.get_chapters(info),
		songs
	};
}

export function youtube_parse_track(track: YTTrack): Track {
	return IllusiIngest.track('youtube', parse_track_title_artist({
		uid: generate_new_uid(track.title),
		title: track.title,
		artists: track.artists.map(youtube_named),
		duration: track.duration_seconds ?? NaN,
		youtube_id: track.video_id,
		service_plays: track.views ?? 0,
		artwork_url: best_thumbnail(track.thumbnails)?.url
	} as Track));
}

export function youtube_parse_videos(tracks: YTTrack[]): Track[] {
	return tracks.map(youtube_parse_track);
}

export function youtube_parse_playlists(playlists: YTCompactPlaylist[]): CompactPlaylist[] {
	return playlists.map(playlist => ({
		title: { name: playlist.title, uri: create_uri('youtube', playlist.playlist_id) },
		artist: playlist.artists.map(youtube_named),
		artwork_thumbnails: playlist.thumbnails,
		artwork_url: best_thumbnail(playlist.thumbnails)?.url
	}));
}

export function youtube_parse_channels(channels: YTChannelResult[]): CompactArtist[] {
	return channels.map(channel => IllusiIngest.artist('youtube', {
		name: { name: channel.name, uri: create_uri('youtube', channel.channel_id) },
		profile_artwork_url: best_thumbnail(channel.thumbnails)?.url,
		is_official_artist_channel: true
	}));
}

export function youtube_parse_playlist_header(header: YTPlaylistHeader): MusicServicePlaylistBase {
	return {
		title: header.title,
		creator: header.creator.map(youtube_named),
		description: header.description,
		artwork_url: best_thumbnail(header.thumbnails)?.url
	};
}
