import * as Parser from '@origin/youtube/parser';
import type { YTArtistResult, YTChannelResult, YTCompactPlaylist, YTLibraryPlaylist, YTPlaylistResult, YTSearchResult, YTTrack } from '@origin/youtube/parser';
import { YouTubeSession } from '@origin/youtube/session';
import { YouTubeShared } from '@origin/youtube/shared';
import type { PromiseResult } from '@common/types';
import { urlid } from '@common/utils/util';
import { generror, generror_catch } from '@common/utils/error_util';
import { YTNodes } from 'youtubei.js';
import type { YT, Helpers } from 'youtubei.js';

type YTNode = Helpers.YTNode;
interface ChannelFeed {
	has_continuation: boolean;
	getContinuation: () => Promise<ChannelFeed>;
	videos: Helpers.ObservedArray;
	playlists: Helpers.ObservedArray;
	channels: Helpers.ObservedArray;
}

export namespace YouTube {
	type Opts = YouTubeSession.Opts;
	type Privacy = 'PUBLIC' | 'UNLISTED' | 'PRIVATE';

	export type Page<T> = YouTubeShared.Page<T>;
	const make_page = YouTubeShared.make_page;

	export async function get_continuation(_opts: Opts, continuation_id: string): PromiseResult<Page<unknown>> {
		return await YouTubeShared.get_continuation(continuation_id);
	}

	function channel_feed_page<T>(feed: ChannelFeed, select: (feed: ChannelFeed) => YTNode[], parse: (node: YTNode) => T | undefined): Page<T[]> {
		const data = select(feed).map(parse).filter((item): item is T => item !== undefined);
		const continuation = feed.has_continuation ? YouTubeShared.register_more(async () => channel_feed_page(await feed.getContinuation(), select, parse)) : null;
		return { data, continuation };
	}

	function register_channel_tab<T>(channel: YT.Channel, get_tab: (channel: YT.Channel) => Promise<ChannelFeed>, select: (feed: ChannelFeed) => YTNode[], parse: (node: YTNode) => T | undefined, enabled: boolean): string | null {
		if (!enabled) return null;
		return YouTubeShared.register_more(async () => channel_feed_page(await get_tab(channel), select, parse));
	}

	export function playlist_urlid(playlist_url: string) {
		return urlid(playlist_url, 'youtube.com/', 'playlist?list=', /&.+/);
	}

	function parse_search(search: YT.Search): YTSearchResult {
		return {
			tracks: search.videos.map(Parser.parse_track_node).filter((t): t is YTTrack => t !== undefined),
			playlists: search.playlists.map(Parser.parse_playlist_node).filter(p => p !== undefined),
			artists: search.channels.map(c => c.is(YTNodes.Channel) ? Parser.parse_channel(c.as(YTNodes.Channel)) : undefined).filter((a): a is YTChannelResult => a !== undefined)
		};
	}

	function parse_playlist(playlist: YT.Playlist): YTPlaylistResult {
		return {
			header: {
				title: playlist.info.title ?? '',
				creator: [{ name: playlist.info.author?.name ?? '', channel_id: playlist.info.author?.id || undefined }],
				description: playlist.info.description,
				thumbnails: (playlist.info.thumbnails ?? []).map(t => ({ url: t.url, width: t.width, height: t.height }))
			},
			tracks: playlist.items.map(Parser.parse_track_node).filter((t): t is YTTrack => t !== undefined)
		};
	}

	export async function get_home(opts: Opts): PromiseResult<Page<YTTrack[]>> {
		try {
			const session = await YouTubeSession.get(opts);
			const home = await session.getHomeFeed();
			return make_page(home, feed => feed.videos.map(Parser.parse_track_node).filter((t): t is YTTrack => t !== undefined));
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube home', 'MEDIUM'); }
	}

	export async function search(opts: Opts, search_query: string): PromiseResult<Page<YTSearchResult>> {
		try {
			const session = await YouTubeSession.get(opts);
			const results = await session.search(search_query);
			return make_page(results, parse_search);
		} catch (error) { return generror_catch(error, 'Failed to search YouTube', 'MEDIUM', { search_query }); }
	}

	export async function get_playlist(opts: Opts, playlist_id: string): PromiseResult<Page<YTPlaylistResult>> {
		try {
			const session = await YouTubeSession.get(opts);
			let id = playlist_urlid(playlist_id);
			if (id.startsWith('MPRE')) {
				const album = await session.music.getAlbum(id);
				const olak = album.url?.match(/[?&]list=([^&]+)/)?.[1];
				if (olak === undefined) return generror('Could not resolve album audio playlist id', 'MEDIUM', { playlist_id });
				id = olak;
			}
			const playlist = await session.getPlaylist(id);
			return make_page(playlist, parse_playlist);
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube playlist', 'MEDIUM', { playlist_id }); }
	}

	export async function get_artist(opts: Opts, artist_id: string): PromiseResult<YTArtistResult> {
		try {
			const session = await YouTubeSession.get(opts);
			const channel_id = await YouTubeSession.resolve_channel_id(opts, artist_id);
			const channel = await session.getChannel(channel_id);
			const artist: YTChannelResult = {
				channel_id: channel.metadata.external_id ?? channel_id,
				name: channel.metadata.title ?? '',
				thumbnails: (channel.metadata.thumbnail ?? []).map(t => ({ url: t.url, width: t.width, height: t.height }))
			};
			return {
				artist,
				tracks: channel.videos.map(Parser.parse_track_node).filter((t): t is YTTrack => t !== undefined),
				albums: [],
				playlists: channel.playlists.map(Parser.parse_playlist_node).filter((p): p is YTCompactPlaylist => p !== undefined),
				similar_artists: channel.channels.map(c => c.is(YTNodes.Channel) ? Parser.parse_channel(c.as(YTNodes.Channel)) : undefined).filter((a): a is YTChannelResult => a !== undefined),
				tracks_continuation: register_channel_tab(channel, ch => ch.getVideos(), f => f.videos, Parser.parse_track_node, channel.has_videos),
				albums_continuation: register_channel_tab(channel, ch => ch.getReleases(), f => f.playlists, Parser.parse_playlist_node, channel.has_releases),
				playlists_continuation: register_channel_tab(channel, ch => ch.getPlaylists(), f => f.playlists, Parser.parse_playlist_node, channel.has_playlists),
				similar_artists_continuation: null
			};
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube channel', 'MEDIUM', { artist_id }); }
	}

	export async function get_youtube_mix(opts: Opts, video_id: string): PromiseResult<Page<YTTrack[]>> {
		try {
			const session = await YouTubeSession.get(opts);
			const info = await session.getInfo(video_id);
			const tracks = (info.watch_next_feed ?? []).map(Parser.parse_track_node).filter((t): t is YTTrack => t !== undefined);
			return { data: tracks, continuation: null };
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube mix', 'MEDIUM', { video_id }); }
	}

	export async function get_library(opts: Opts): PromiseResult<Page<YTLibraryPlaylist[]>> {
		try {
			const session = await YouTubeSession.get(opts);
			const playlists = await session.getPlaylists();
			return make_page(playlists, feed => feed.playlists.map((node) => {
				if (node.is(YTNodes.GridPlaylist)) {
					const gp = node.as(YTNodes.GridPlaylist);
					return { playlist_id: gp.id, title: (gp.title.text ?? ''), thumbnails: (gp.thumbnails ?? []).map(t => ({ url: t.url, width: t.width, height: t.height })) };
				}
				if (node.is(YTNodes.LockupView)) {
					const lv = node.as(YTNodes.LockupView);
					const playlist = Parser.parse_lockup_playlist(lv);
					return { playlist_id: playlist.playlist_id, title: playlist.title, thumbnails: playlist.thumbnails };
				}
				return undefined;
			}).filter((p): p is YTLibraryPlaylist => p !== undefined));
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube library', 'MEDIUM'); }
	}

	export async function like_track(opts: Opts, video_id: string): Promise<boolean> { return await YouTubeShared.like_track(opts, video_id); }
	export async function dislike_track(opts: Opts, video_id: string): Promise<boolean> { return await YouTubeShared.dislike_track(opts, video_id); }
	export async function unlike_track(opts: Opts, video_id: string): Promise<boolean> { return await YouTubeShared.remove_rating(opts, video_id); }

	export async function create_playlist(opts: Opts, title: string, _privacy: Privacy) {
		return await YouTubeShared.create_playlist(opts, title, 'YouTube');
	}
	export async function delete_playlist(opts: Opts, playlist_id: string): Promise<boolean> {
		return await YouTubeShared.delete_playlist(opts, playlist_urlid(playlist_id));
	}
	export async function add_tracks_to_playlist(opts: Opts, playlist_id: string, video_ids: string[]): Promise<boolean> {
		return await YouTubeShared.add_tracks_to_playlist(opts, playlist_urlid(playlist_id), video_ids);
	}
	export async function remove_tracks_to_playlist(opts: Opts, playlist_id: string, video_ids: string[]): Promise<boolean> {
		return await YouTubeShared.remove_tracks_from_playlist(opts, playlist_urlid(playlist_id), video_ids);
	}
	export async function edit_playlist_data(opts: Opts, playlist_id: string, playlist_data: { name: string; description: string; privacy: Privacy }): Promise<boolean> {
		return await YouTubeShared.edit_playlist_data(opts, playlist_urlid(playlist_id), playlist_data.name, playlist_data.description);
	}
}
