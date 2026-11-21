import type Innertube from 'youtubei.js';
import { type Types } from 'youtubei.js';
import { YouTubeSession } from '@origin/youtube/session';
import type {
	FeatureRateLimit,
	ListCreatorVideosOpts,
	PathOrBuffer,
	StudioFeature,
	StudioVisibility,
	UploadVideoDetails,
	UploadVideoSuccessfulResult
} from '@origin/youtube/types';
import type { CookieJar } from '@common/utils/cookie_util';
import type { PromiseResult, ResponseSuccess } from '@common/types';
import { generror, generror_catch } from '@common/utils/error_util';
import { milliseconds_of } from '@common/utils/util';
import { reinterpret_cast } from '@common/cast';
import { fs, load_native_fs } from '@native/fs/fs';
import pathlib from 'path-browserify';
import { FSCache } from '@common/fs_cache';
import { load_native_botguard } from '@native/botguard_solver/botguard_solver';

type StudioWebClient = ReturnType<Innertube['studioWeb']>;
type UploadFeedbackItem = Awaited<ReturnType<StudioWebClient['uploadFeedback']>> extends { contents: infer C } ? C : unknown;
type CreatorVideo = Awaited<ReturnType<StudioWebClient['getCreatorVideos']>>[number];
interface ListCreatorVideosResult { videos: CreatorVideo[]; next_page_token?: string; estimated_total_size?: number }

export namespace YouTubeStudio {
	let preloaded_cookies: string | undefined;
	let auto_retry = true;
	const studio_web_cache = new Map<string, StudioWebClient>();

	export function preload_cookies(cookie?: string) {
		preloaded_cookies = cookie ?? (typeof process !== 'undefined' ? process?.env?.YOUTUBE_COOKIE_JAR : undefined);
		YouTubeSession.preload_cookies(cookie);
		studio_web_cache.clear();
	}

	export function set_retry_on_auth_challenge(enabled: boolean) {
		auto_retry = enabled;
		for (const studio_web of studio_web_cache.values()) studio_web.setAutoRetrying(enabled);
	}

	function session_opts(cookie?: string): YouTubeSession.Opts {
		const resolved = cookie ?? preloaded_cookies;
		if (resolved === undefined) return {};
		return { cookie_jar: reinterpret_cast<CookieJar>({ toString: () => resolved }) };
	}

	async function get_session(cookie?: string): Promise<Innertube> {
		return await YouTubeSession.get(session_opts(cookie));
	}

	export async function get_channel_id(index?: number, cookie?: string): PromiseResult<string> {
		try {
			const client = await get_session(cookie);
			const channel_id_cache_key = { cookie: client.session.cookie, index };
			const channel_id_cache_hit = await FSCache.check_cache<string>(channel_id_cache_key, milliseconds_of({ minutes: 15 }), { serial_type: 'stringable' });
			if (channel_id_cache_hit) return channel_id_cache_hit;

			const account_info = await client.account.getInfo(true);
			const account = account_info[index ?? 0];
			if (account === undefined) return generror('No accounts found', 'LOW');
			const resolve_url = `https://www.youtube.com/${account.channel_handle.text}`;
			const cache_hit = await FSCache.check_cache<string>(resolve_url, milliseconds_of({ months: 1 }), { serial_type: 'stringable' });
			if (cache_hit) return cache_hit;
			const resolved = await client.resolveURL(resolve_url);
			const channel_id = resolved.payload.browseId as string;
			await FSCache.insert_cache(resolve_url, channel_id, { serial_type: 'stringable' });
			await FSCache.insert_cache(channel_id_cache_key, channel_id, { serial_type: 'stringable' });
			return channel_id;
		} catch (error) { return generror_catch(error, 'Failed to resolve the creator channel id', 'CRITICAL'); }
	}

	async function get_studio_web(cookie?: string): PromiseResult<StudioWebClient> {
		try {
			const channel_id = await get_channel_id(undefined, cookie);
			if (typeof channel_id === 'object') return channel_id;
			const cached = studio_web_cache.get(channel_id);
			if (cached !== undefined) return cached;
			const client = await get_session(cookie);
			const studio_web = client.studioWeb(await load_native_botguard(), channel_id);
			studio_web.setAutoRetrying(auto_retry);
			studio_web_cache.set(channel_id, studio_web);
			return studio_web;
		} catch (error) { return generror_catch(error, 'Failed to create the YouTube Studio client', 'CRITICAL'); }
	}

	async function file_reader_of_path(file_path: string): PromiseResult<Types.FileNamedBufferReader> {
		await load_native_fs();
		const info = await fs().get_info(file_path);
		if (!info.exists || info.is_directory) return generror('Cannot upload a path that is not a readable file', 'MEDIUM', { file_path });
		return {
			file_name: pathlib.basename(file_path),
			source: {
				total_bytes: info.size,
				read_chunk: async (position, length) => {
					const chunk = await fs().read_as_buffer_range(file_path, position, length);
					if ('error' in chunk) throw chunk.error;
					return new Uint8Array(chunk);
				}
			}
		};
	}

	async function file_reader_of(data: PathOrBuffer, fallback_name: string): PromiseResult<Types.FileNamedBufferReader> {
		if ('buffer' in data) {
			const bytes = new Uint8Array(data.buffer);
			return { file_name: fallback_name, source: { total_bytes: bytes.byteLength, read_chunk: async (position, length) => bytes.subarray(position, position + length) } };
		}
		return await file_reader_of_path(data.path);
	}

	async function base64_reader_of(data: PathOrBuffer, fallback_name: string): PromiseResult<Types.FileNamedBufferBase64> {
		if ('buffer' in data) return { file_name: fallback_name, source: { base64: data.buffer.toString('base64') } };
		await load_native_fs();
		const base64 = await fs().read_as_string(data.path, { encoding: 'base64' });
		if (typeof base64 === 'object') return base64;
		return { file_name: pathlib.basename(data.path), source: { base64 } };
	}

	async function to_fork_details(details: Partial<UploadVideoDetails>): PromiseResult<Partial<Types.UploadVideoDetails>> {
		const { thumbnail, subtitles, ...rest } = details;
		const fork: Partial<Types.UploadVideoDetails> = { ...rest };
		if (thumbnail !== undefined) {
			const reader = await file_reader_of(thumbnail, 'thumbnail.jpg');
			if ('error' in reader) return reader;
			fork.thumbnail = reader;
		}
		if (subtitles !== undefined) {
			const data = await base64_reader_of(subtitles.data, 'subtitles.srt');
			if ('error' in data) return data;
			fork.subtitles = { data, synced: subtitles.synced };
		}
		return fork;
	}

	export async function upload_thumbnail(video_id: string, thumbnail: PathOrBuffer): PromiseResult<ResponseSuccess> {
		return await update_video(video_id, { thumbnail });
	}

	export async function upload_subtitles(video_id: string, subtitles: NonNullable<UploadVideoDetails['subtitles']>, language = 'en-US'): PromiseResult<ResponseSuccess> {
		try {
			const studio_web = await get_studio_web();
			if ('error' in studio_web) return studio_web;
			const data = await base64_reader_of(subtitles.data, `${video_id}.srt`);
			if ('error' in data) return data;
			await studio_web.uploadSubtitles(video_id, { data, synced: subtitles.synced }, language);
			return { success: true };
		} catch (error) { return generror_catch(error, 'Failed to upload YouTube subtitles', 'MEDIUM', { video_id, language }); }
	}

	export async function update_video(video_id: string, details: Partial<UploadVideoDetails>): PromiseResult<ResponseSuccess> {
		try {
			const studio_web = await get_studio_web();
			if ('error' in studio_web) return studio_web;
			const fork_details = await to_fork_details(details);
			if ('error' in fork_details) return fork_details;
			await studio_web.updateVideo(video_id, fork_details);
			return { success: true };
		} catch (error) { return generror_catch(error, 'Failed to update YouTube video', 'MEDIUM', { video_id }); }
	}

	export async function publish_video(video_id: string, visibility: StudioVisibility = 'PRIVATE'): PromiseResult<ResponseSuccess> {
		try {
			const studio_web = await get_studio_web();
			if ('error' in studio_web) return studio_web;
			await studio_web.publishVideo(video_id, visibility);
			return { success: true };
		} catch (error) { return generror_catch(error, 'Failed to publish YouTube video', 'MEDIUM', { video_id, visibility }); }
	}

	export interface UploadFeedbackResult { contents: UploadFeedbackItem; next: () => Promise<UploadFeedbackResult | null> }
	export async function upload_feedback(tokens: string[], type: 'FEEDBACK_TOKENS'): PromiseResult<{ isProcessed: boolean }>;
	export async function upload_feedback(tokens: string[], type: 'CONTINUATION_TOKENS'): PromiseResult<UploadFeedbackResult>;
	export async function upload_feedback(tokens: string[], type: 'FEEDBACK_TOKENS' | 'CONTINUATION_TOKENS') {
		try {
			const studio_web = await get_studio_web();
			if ('error' in studio_web) return studio_web;
			if (type === 'FEEDBACK_TOKENS') return await studio_web.uploadFeedback(tokens, 'FEEDBACK_TOKENS');
			return reinterpret_cast<UploadFeedbackResult>(await studio_web.uploadFeedback(tokens, 'CONTINUATION_TOKENS'));
		} catch (error) { return generror_catch(error, 'Failed to fetch YouTube upload feedback', 'MEDIUM', { type }); }
	}

	export async function upload_feedback_cycle(initial_tokens: (string | null)[], callback_continue: (content: UploadFeedbackItem) => boolean) {
		const studio_web = await get_studio_web();
		if ('error' in studio_web) return;
		try {
			await studio_web.uploadFeedbackCycle(initial_tokens, callback_continue);
		} catch (_) { /* feedback polling is best effort */ }
	}

	export async function upload_video(file_path: string, details: Partial<UploadVideoDetails> = {}, on_scotty_progress?: (written_bytes: number, total_bytes: number) => void,
		on_initial_create_video?: (full_created: { created: unknown; feedback_token: string | null }) => unknown): PromiseResult<UploadVideoSuccessfulResult> {
		try {
			const studio_web = await get_studio_web();
			if ('error' in studio_web) return studio_web;
			const reader = await file_reader_of_path(file_path);
			if ('error' in reader) return reader;
			const fork_details = await to_fork_details(details);
			if ('error' in fork_details) return fork_details;

			let feedback_token: string | null = null;
			const result = await studio_web.uploadVideo(reader, fork_details, on_scotty_progress, (full_created) => {
				feedback_token = full_created.feedback_token;
				return on_initial_create_video?.(full_created);
			});

			const video_id = result.created.video_id;
			if (video_id === undefined || video_id === '') return generror('createvideo did not return a videoId', 'CRITICAL', { file_path });
			return {
				video_link: `https://youtu.be/${video_id}`,
				file_name: reader.file_name,
				feedback_token
			};
		} catch (error) { return generror_catch(error, 'Failed to upload video to YouTube', 'MEDIUM', { file_path }); }
	}

	export async function delete_video(video_id: string): PromiseResult<ResponseSuccess> {
		try {
			const studio_web = await get_studio_web();
			if ('error' in studio_web) return studio_web;
			const deleted = await studio_web.deleteVideo(video_id);
			if (!deleted) return generror('video/delete did not report success', 'MEDIUM', { video_id });
			return { success: true };
		} catch (error) { return generror_catch(error, 'Failed to delete YouTube video', 'MEDIUM', { video_id }); }
	}

	export async function get_creator_videos(video_ids: string[]): PromiseResult<CreatorVideo[]> {
		try {
			const studio_web = await get_studio_web();
			if ('error' in studio_web) return studio_web;
			return await studio_web.getCreatorVideos(video_ids);
		} catch (error) { return generror_catch(error, 'Failed to fetch creator videos', 'MEDIUM', { video_ids }); }
	}

	export async function list_creator_videos(opts: ListCreatorVideosOpts = {}): PromiseResult<ListCreatorVideosResult> {
		try {
			const studio_web = await get_studio_web();
			if ('error' in studio_web) return studio_web;
			const response = await studio_web.listCreatorVideos({ page_token: opts.page_token, order: opts.order, page_size: opts.page_size });
			return {
				videos: response.videos ?? [],
				next_page_token: response.next_page_token,
				estimated_total_size: isNaN(Number(response.total_size)) ? undefined : Number(response.total_size)
			};
		} catch (error) { return generror_catch(error, 'Failed to list creator videos', 'MEDIUM', { opts }); }
	}

	export async function list_creator_playlists(opts: { page_token?: string; page_size?: number } = {}) {
		try {
			const studio_web = await get_studio_web();
			if ('error' in studio_web) return studio_web;
			const channel_id = await get_channel_id();
			if (typeof channel_id === 'object') return channel_id;
			return await studio_web.listCreatorPlaylists(channel_id, { page_token: opts.page_token, page_size: opts.page_size });
		} catch (error) { return generror_catch(error, 'Failed to list creator playlists', 'MEDIUM', { opts }); }
	}

	export async function get_audio_waveform_url(video_id: string, scale_ms?: number): PromiseResult<string | undefined> {
		try {
			const studio_web = await get_studio_web();
			if ('error' in studio_web) return studio_web;
			return await studio_web.getAudioWaveformUrl(video_id, scale_ms);
		} catch (error) { return generror_catch(error, 'Failed to fetch audio waveform url', 'MEDIUM', { video_id }); }
	}

	// TODO investigate how this works when parse = true
	export async function check_feature_rate_limit(feature: StudioFeature): PromiseResult<FeatureRateLimit> {
		try {
			const studio_web = await get_studio_web();
			if ('error' in studio_web) return studio_web;
			const managed_execute = reinterpret_cast<(endpoint: string, payload: object) => Promise<{ allowed?: boolean; remainingTokens?: number }>>(studio_web.managedExecute.bind(studio_web));
			const response = await managed_execute('/feature_eligibility/check_feature_rate_limit', { feature });
			return {
				allowed: response.allowed !== undefined,
				remaining_tokens: response.remainingTokens ?? 0
			};
		} catch (error) { return generror_catch(error, 'Failed to check feature rate limit', 'MEDIUM', { feature }); }
	}
}
