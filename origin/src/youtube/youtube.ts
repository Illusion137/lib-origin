import * as Parser from '@origin/youtube/parser';
import type { YTPlaylistResult, YTSearchResult, YTTrack, YTLibraryPlaylist, YTChannelResult } from '@origin/youtube/parser';
import { YouTubeSession } from '@origin/youtube/session';
import type { PromiseResult } from '@common/types';
import { gen_uuid, milliseconds_of, urlid } from '@common/utils/util';
import { generror, generror_catch } from '@common/utils/error_util';
import { YTNodes } from 'youtubei.js';
import type { YT } from 'youtubei.js';

export namespace YouTube {
	type Opts = YouTubeSession.Opts;
	type Privacy = 'PUBLIC' | 'UNLISTED' | 'PRIVATE';

	export interface Page<T> { data: T; continuation: string | null }

	interface CachedContinuation { next: () => Promise<Page<unknown>>; created_at: number }
	const continuations = new Map<string, CachedContinuation>();
	const CONTINUATION_TTL_MS = milliseconds_of({ minutes: 30 });

	function prune_continuations() {
		const now = Date.now();
		for (const [id, entry] of continuations) {
			if (now - entry.created_at > CONTINUATION_TTL_MS) continuations.delete(id);
		}
	}

	function has_continuation(feed: { has_continuation?: boolean }): boolean {
		return 'has_continuation' in feed ? feed.has_continuation === true : false;
	}

	function register_continuation<F extends { has_continuation?: boolean; getContinuation: () => Promise<F> }, T>(feed: F, parse: (feed: F) => T): string | null {
		if (!has_continuation(feed)) return null;
		prune_continuations();
		const id = gen_uuid();
		continuations.set(id, { created_at: Date.now(), next: async () => make_page(await feed.getContinuation(), parse) });
		return id;
	}

	function make_page<F extends { has_continuation?: boolean; getContinuation: () => Promise<F> }, T>(feed: F, parse: (feed: F) => T): Page<T> {
		return { data: parse(feed), continuation: register_continuation(feed, parse) };
	}

	export async function get_continuation(_opts: Opts, continuation_id: string): PromiseResult<Page<unknown>> {
		const entry = continuations.get(continuation_id);
		if (entry === undefined) return generror('Unknown or expired YouTube continuation', 'LOW', { continuation_id });
		continuations.delete(continuation_id);
		try {
			return await entry.next();
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube continuation', 'MEDIUM', { continuation_id }); }
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

	export async function get_artist(opts: Opts, artist_id: string): PromiseResult<YTChannelResult> {
		try {
			const session = await YouTubeSession.get(opts);
			const channel_id = await YouTubeSession.resolve_channel_id(opts, artist_id);
			const channel = await session.getChannel(channel_id);
			return {
				channel_id: channel.metadata.external_id ?? channel_id,
				name: channel.metadata.title ?? '',
				thumbnails: (channel.metadata.thumbnail ?? []).map(t => ({ url: t.url, width: t.width, height: t.height }))
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

	export async function like_track(opts: Opts, video_id: string): Promise<boolean> {
		try { return (await (await YouTubeSession.get(opts)).interact.like(video_id)).success; } catch { return false; }
	}
	export async function dislike_track(opts: Opts, video_id: string): Promise<boolean> {
		try { return (await (await YouTubeSession.get(opts)).interact.dislike(video_id)).success; } catch { return false; }
	}
	export async function unlike_track(opts: Opts, video_id: string): Promise<boolean> {
		try { return (await (await YouTubeSession.get(opts)).interact.removeRating(video_id)).success; } catch { return false; }
	}

	export async function create_playlist(opts: Opts, title: string, _privacy: Privacy) {
		try {
			const session = await YouTubeSession.get(opts);
			const created = await session.playlist.create(title, []);
			if (!created.success) return generror('Failed to create YouTube playlist', 'LOW', { title });
			return { playlistId: created.playlist_id };
		} catch (error) { return generror_catch(error, 'Failed to create YouTube playlist', 'MEDIUM', { title }); }
	}
	export async function delete_playlist(opts: Opts, playlist_id: string): Promise<boolean> {
		try { return (await (await YouTubeSession.get(opts)).playlist.delete(playlist_urlid(playlist_id))).success; } catch { return false; }
	}
	export async function add_tracks_to_playlist(opts: Opts, playlist_id: string, video_ids: string[]): Promise<boolean> {
		try { await (await YouTubeSession.get(opts)).playlist.addVideos(playlist_urlid(playlist_id), video_ids); return true; } catch { return false; }
	}
	export async function remove_tracks_to_playlist(opts: Opts, playlist_id: string, video_ids: string[]): Promise<boolean> {
		try { await (await YouTubeSession.get(opts)).playlist.removeVideos(playlist_urlid(playlist_id), video_ids); return true; } catch { return false; }
	}
	export async function edit_playlist_data(opts: Opts, playlist_id: string, playlist_data: { name: string; description: string; privacy: Privacy }): Promise<boolean> {
		try {
			const session = await YouTubeSession.get(opts);
			const id = playlist_urlid(playlist_id);
			await session.playlist.setName(id, playlist_data.name);
			await session.playlist.setDescription(id, playlist_data.description);
			return true;
		} catch { return false; }
	}
}
