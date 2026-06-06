import TrackPlayer, { State } from 'react-native-track-player';
import type { AddTrack } from 'react-native-track-player';
import type Roz from '@roze/types/roz';
import type { AudiobookTableItem } from '@illusive/db/schema';
import { Audiobooks } from '@illusive/audiobooks';
import { GLOBALS } from '@illusive/globals';
import { setup_track_player, save_past_queue } from '@illusive/track_player_service';

export interface AudiobookChapterTrack {
	index: number;
	uuid: string;
	title: string;
	audio_path: string;
	duration: number;
}

export interface AudiobookLoadOpts {
	autoplay?: boolean;
	start_chapter_index?: number;
	start_position_sec?: number;
	rate?: number;
}

export namespace AudiobookPlayer {
	let active_uuid: string | undefined;

	export function active_audiobook_uuid(): string | undefined { return active_uuid; }
	export function is_loaded(uuid: string): boolean { return active_uuid === uuid; }

	export function build_chapter_tracks(roz: Roz): AudiobookChapterTrack[] {
		const tracks: AudiobookChapterTrack[] = [];
		roz.chapters.forEach((cc, index) => {
			if (!cc.chapter.audio_path) return;
			tracks.push({
				index,
				uuid: cc.chapter.uuid,
				title: cc.chapter.title || `Chapter ${index + 1}`,
				audio_path: cc.chapter.audio_path,
				duration: cc.chapter.duration ?? 0,
			});
		});
		return tracks;
	}

	function queue_index_for_chapter(chapter_tracks: AudiobookChapterTrack[], roz_chapter_index: number): number {
		const exact = chapter_tracks.findIndex(ct => ct.index === roz_chapter_index);
		if (exact !== -1) return exact;
		const next_chapter = chapter_tracks.findIndex(ct => ct.index >= roz_chapter_index);
		return next_chapter === -1 ? 0 : next_chapter;
	}

	export async function load(meta: AudiobookTableItem, roz: Roz, opts: AudiobookLoadOpts = {}): Promise<AudiobookChapterTrack[]> {
		const chapter_tracks = build_chapter_tracks(roz);
		await setup_track_player();
		await save_past_queue();
		// hand the player over from the music side
		GLOBALS.global_var.playing_tracks = [];
		GLOBALS.global_var.playing_queue = [];
		GLOBALS.global_var.is_playing = false;
		await TrackPlayer.reset();
		active_uuid = meta.uuid;
		if (chapter_tracks.length === 0) return chapter_tracks;

		const artwork = meta.cover && meta.cover.length > 0 ? meta.cover : undefined;
		const add_tracks: AddTrack[] = chapter_tracks.map((ct) => ({
			url: Audiobooks.resolve_relative_path(ct.audio_path),
			title: ct.title,
			artist: meta.author || 'Audiobook',
			album: meta.title || 'Audiobook',
			artwork,
			duration: ct.duration,
		}));
		await TrackPlayer.add(add_tracks);

		if (opts.rate !== undefined && opts.rate > 0) await TrackPlayer.setRate(opts.rate);

		const start_queue_index = queue_index_for_chapter(chapter_tracks, opts.start_chapter_index ?? 0);
		if (start_queue_index > 0) await TrackPlayer.skip(start_queue_index);
		if (opts.start_position_sec !== undefined && opts.start_position_sec > 0) await TrackPlayer.seekTo(opts.start_position_sec);
		if (opts.autoplay) await TrackPlayer.play();
		return chapter_tracks;
	}

	export async function play(): Promise<void> { await TrackPlayer.play(); }
	export async function pause(): Promise<void> { await TrackPlayer.pause(); }

	export async function toggle(): Promise<void> {
		const state = await TrackPlayer.getPlaybackState();
		if (state.state === State.Playing || state.state === State.Buffering) await TrackPlayer.pause();
		else await TrackPlayer.play();
	}

	export async function seek_to(position_sec: number): Promise<void> {
		await TrackPlayer.seekTo(Math.max(0, position_sec));
	}

	export async function seek_by(delta_sec: number): Promise<void> {
		const progress = await TrackPlayer.getProgress();
		const target = progress.position + delta_sec;
		await TrackPlayer.seekTo(Math.max(0, progress.duration > 0 ? Math.min(progress.duration, target) : target));
	}

	export async function next(): Promise<void> {
		try { await TrackPlayer.skipToNext(); } catch (_) { /* last chapter */ }
	}

	export async function previous(): Promise<void> {
		const progress = await TrackPlayer.getProgress();
		if (progress.position > 3) { await TrackPlayer.seekTo(0); return; }
		try { await TrackPlayer.skipToPrevious(); } catch (_) { await TrackPlayer.seekTo(0); }
	}

	export async function skip_to_chapter(chapter_tracks: AudiobookChapterTrack[], roz_chapter_index: number): Promise<void> {
		const pos = chapter_tracks.findIndex(ct => ct.index === roz_chapter_index);
		if (pos < 0) return;
		await TrackPlayer.skip(pos);
		await TrackPlayer.play();
	}

	export async function set_rate(rate: number): Promise<void> {
		if (rate > 0) await TrackPlayer.setRate(rate);
	}

	export async function current_chapter_index(chapter_tracks: AudiobookChapterTrack[]): Promise<number | undefined> {
		const queue_index = await TrackPlayer.getActiveTrackIndex();
		if (queue_index === undefined) return undefined;
		return chapter_tracks[queue_index]?.index;
	}

	export async function save_progress(meta: AudiobookTableItem, chapter_tracks: AudiobookChapterTrack[]): Promise<void> {
		const queue_index = await TrackPlayer.getActiveTrackIndex();
		if (queue_index === undefined) return;
		const current = chapter_tracks[queue_index];
		if (current === undefined) return;
		const progress = await TrackPlayer.getProgress();
		const prior_ms = chapter_tracks.slice(0, queue_index).reduce((acc, ct) => acc + ct.duration * 1000, 0);
		const total_listened_ms = Math.round(prior_ms + progress.position * 1000);
		await Audiobooks.save_read_progress(meta.uuid, current.index, Math.round(progress.position * 1000), total_listened_ms);
	}

	export function mark_inactive(): void {
		active_uuid = undefined;
	}

	export async function unload(): Promise<void> {
		try { await TrackPlayer.reset(); } catch (_) { /* not set up */ }
		active_uuid = undefined;
		GLOBALS.global_var.playing_tracks = [];
		GLOBALS.global_var.playing_queue = [];
		GLOBALS.global_var.is_playing = false;
	}
}
