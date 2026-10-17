import { YouTubeSession } from '@origin/youtube/session';
import type { PromiseResult } from '@common/types';
import { gen_uuid, milliseconds_of } from '@common/utils/util';
import { generror, generror_catch } from '@common/utils/error_util';

// TODO Update ytbi to inlcude better playlist creation and editing
export namespace YouTubeShared {
	type Opts = YouTubeSession.Opts;

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

	export function register_more(next: () => Promise<Page<unknown>>): string {
		prune_continuations();
		const id = gen_uuid();
		continuations.set(id, { created_at: Date.now(), next });
		return id;
	}

	export function register_feed<F extends { has_continuation?: boolean; getContinuation: () => Promise<F> }, T>(feed: F, parse: (feed: F) => T): string | null {
		if (!('has_continuation' in feed) || feed.has_continuation !== true) return null;
		return register_more(async () => make_page(await feed.getContinuation(), parse));
	}

	export function make_page<F extends { has_continuation?: boolean; getContinuation: () => Promise<F> }, T>(feed: F, parse: (feed: F) => T): Page<T> {
		return { data: parse(feed), continuation: register_feed(feed, parse) };
	}

	export async function get_continuation(continuation_id: string): PromiseResult<Page<unknown>> {
		const entry = continuations.get(continuation_id);
		if (entry === undefined) return generror('Unknown or expired YouTube continuation', 'LOW', { continuation_id });
		continuations.delete(continuation_id);
		try {
			return await entry.next();
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube continuation', 'MEDIUM', { continuation_id }); }
	}

	export async function like_track(opts: Opts, video_id: string): Promise<boolean> {
		try { return (await (await YouTubeSession.get(opts)).interact.like(video_id)).success; } catch { return false; }
	}
	export async function dislike_track(opts: Opts, video_id: string): Promise<boolean> {
		try { return (await (await YouTubeSession.get(opts)).interact.dislike(video_id)).success; } catch { return false; }
	}
	export async function remove_rating(opts: Opts, video_id: string): Promise<boolean> {
		try { return (await (await YouTubeSession.get(opts)).interact.removeRating(video_id)).success; } catch { return false; }
	}

	export async function create_playlist(opts: Opts, title: string, label: string) {
		try {
			const created = await (await YouTubeSession.get(opts)).playlist.create(title, []);
			if (!created.success) return generror(`Failed to create ${label} playlist`, 'LOW', { title });
			return { playlistId: created.playlist_id };
		} catch (error) { return generror_catch(error, `Failed to create ${label} playlist`, 'MEDIUM', { title }); }
	}
	export async function delete_playlist(opts: Opts, playlist_id: string): Promise<boolean> {
		try { return (await (await YouTubeSession.get(opts)).playlist.delete(playlist_id)).success; } catch { return false; }
	}
	export async function add_tracks_to_playlist(opts: Opts, playlist_id: string, video_ids: string[]): Promise<boolean> {
		try { await (await YouTubeSession.get(opts)).playlist.addVideos(playlist_id, video_ids); return true; } catch { return false; }
	}
	export async function remove_tracks_from_playlist(opts: Opts, playlist_id: string, video_ids: string[], use_set_video_ids = false): Promise<boolean> {
		try { await (await YouTubeSession.get(opts)).playlist.removeVideos(playlist_id, video_ids, use_set_video_ids); return true; } catch { return false; }
	}
	export async function edit_playlist_data(opts: Opts, playlist_id: string, name: string, description: string): Promise<boolean> {
		try {
			const session = await YouTubeSession.get(opts);
			await session.playlist.setName(playlist_id, name);
			await session.playlist.setDescription(playlist_id, description);
			return true;
		} catch { return false; }
	}
}
