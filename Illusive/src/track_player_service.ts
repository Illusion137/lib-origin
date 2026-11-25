import { is_empty, milliseconds_of, recreate } from '@common/utils/util';
import { Constants } from '@illusive/constants';
import { Illusive } from '@illusive/illusive';
import type { ISOString, Track } from '@illusive/types';
import { alert_trackplayer_error } from '@illusive/illusi/src/alert';
import { handle_new_track_data } from '@illusive/downloader';
import { artist_string } from '@illusive/illusive_utils';
import { sample } from '@illusive/sampler';
import { GLOBALS } from '@illusive/globals';
import { SQLfs } from '@illusive/sql/sql_fs';
import { SQLBackpack } from '@illusive/sql/sql_backpack';
import { resolved_artwork } from '@illusive/artwork';
import { SQLRecentlyPlayed } from '@illusive/sql/sql_recently_played';
import { SQLTracks } from '@illusive/sql/sql_tracks';
import { Prefs } from './prefs';
import { catch_log } from '@common/utils/error_util';
import { SQLTrackPlays } from './sql/sql_track_plays';
import { YouTubeDL } from '@origin/youtube/youtube_dl';
import { reinterpret_cast } from '@common/cast';
import type { Track as EPTrack, QueuedTrack, SabrStreamingInfo } from 'react-native-everything-player';
import { track_store } from './stores/track_store';
import { Illusi } from '@origin/illusi/illusi';
import { RequestQueue } from './db/sync/request_queue';
import EverythingPlayer, { AppKilledPlaybackBehavior, Capability, EQUALIZER_FREQUENCIES, Event, RepeatMode, State } from 'react-native-everything-player';

export let trackplayer_has_been_setup = false;

function has_duration(seconds: number | undefined): seconds is number {
	return seconds !== undefined && Number.isFinite(seconds) && seconds > 0;
}

/** Saves a length the player measured for a track that had none, locally and on the Illusi server */
async function record_playback_duration(track: Track, seconds: number) {
	await SQLTracks.update_track_duration(track.uid, seconds);
	if (!track.illusi_id || Illusi.get_session() === null) return;
	const result = await RequestQueue.send('duration_report', track.illusi_id, { duration_ms: Math.round(seconds * 1000), source: is_empty(track.media_uri) ? 'service' : 'download' });
	if (result !== null && Illusi.is_error(result)) catch_log(result.error);
}

export function watch_playback_duration(track: Track, index: number, on_duration: (seconds: number) => void): () => void {
	if (has_duration(track.duration)) return () => {};
	const subscription = EverythingPlayer.addEventListener(Event.PlaybackProgressUpdated, (data) => {
		if (data.track !== index || !has_duration(data.duration)) return;
		subscription.remove();
		const seconds = data.duration;
		track.duration = seconds;
		try {
			EverythingPlayer.updateMetadataForTrack(index, { duration: seconds });
		} catch (error) { catch_log(error); }
		record_playback_duration(track, seconds).catch(catch_log);
		on_duration(seconds);
	});
	return () => subscription.remove();
}

export function track_of_queued(queued: QueuedTrack): Track {
	const other = reinterpret_cast<Track | undefined>(queued.otherData);
	if (other !== undefined) return other;
	return track_store.getState().tracks_by_uid.get(queued.id) ?? {
		uid: queued.id,
		title: queued.title,
		artists: queued.artist ? [{ name: queued.artist, uri: null }] : [],
		album: queued.album ? { name: queued.album, uri: null } : undefined,
		duration: queued.duration ?? NaN,
		artwork_url: typeof queued.artwork === 'string' ? queued.artwork : undefined
	};
}

function queue_tracks(): Track[] {
	return EverythingPlayer.getQueue().map(track_of_queued);
}

function queue_track(index: number | undefined): Track | undefined {
	if (index === undefined) return undefined;
	const queued = EverythingPlayer.getQueue()[index];
	return queued === undefined ? undefined : track_of_queued(queued);
}

const PRESET_FREQUENCIES = [60, 150, 400, 1000, 2400, 15000];

/** A preset resampled onto the player's bands, interpolating along log frequency */
export function equalizer_bands(preset: Prefs.EqualizerPreset): number[] {
	const gains: readonly number[] = Prefs.equalizer_presets[preset] ?? Prefs.equalizer_presets.Default;
	const logs = PRESET_FREQUENCIES.map(Math.log);
	return EQUALIZER_FREQUENCIES.map((frequency) => {
		const x = Math.log(frequency);
		const upper = logs.findIndex(log => log >= x);
		if (upper === 0) return gains[0];
		if (upper === -1) return gains[gains.length - 1];
		const t = (x - logs[upper - 1]) / (logs[upper] - logs[upper - 1]);
		return gains[upper - 1] + (gains[upper] - gains[upper - 1]) * t;
	});
}

export async function setup_track_player(): Promise<boolean> {
	let playing_tracks: Track[] = [];
	let index = 0;
	try {
		playing_tracks = queue_tracks();
		index = EverythingPlayer.getActiveTrackIndex() ?? 0;
	} catch (_) { }
	GLOBALS.global_var.past_playing_tracks = playing_tracks.length === 0 ? GLOBALS.global_var.past_playing_tracks : playing_tracks;
	GLOBALS.global_var.past_track_index = playing_tracks.length === 0 ? GLOBALS.global_var.past_track_index : index;
	if (EverythingPlayer.isSetup()) {
		trackplayer_has_been_setup = true;
		return true;
	}
	await EverythingPlayer.setupPlayer({ enableVideo: false, sabrPoolAhead: 1, autoHandleRemoteEvents: false });
	trackplayer_has_been_setup = true;
	await EverythingPlayer.updateOptions({
		android: {
			appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification
		},
		capabilities: [
			Capability.Play,
			Capability.Pause,
			Capability.SkipToNext,
			Capability.SkipToPrevious,
			Capability.SeekTo,
			Capability.PlayFromSearch
		],
		progressUpdateEventInterval: 1,
		djCrossfade: true
	});
	EverythingPlayer.setRepeatMode(RepeatMode.Off);
	EverythingPlayer.setEqualizer(equalizer_bands(Prefs.get_pref('equalizer_preset')));
	EverythingPlayer.setCrossFade(Prefs.get_pref('crossfade'));
	return true;
}

export async function save_past_queue() {
	const index = EverythingPlayer.getActiveTrackIndex();
	if (index === undefined) return;
	await Prefs.save_pref('past_queue', { index, tracks: queue_tracks().map(track => ({ ...track, playback: undefined, downloading_data: undefined })) });
}

const queue_modified_listeners = new Set<() => void>();
export function subscribe_track_player_queue_modified(listener: () => void): () => void {
	queue_modified_listeners.add(listener);
	return () => { queue_modified_listeners.delete(listener); };
}

export async function on_modify_track_player_queue() {
	await save_past_queue();
	for (const listener of queue_modified_listeners) {
		try { listener(); } catch { }
	}
}

export function upcoming_track_count(): number {
	const index = EverythingPlayer.getActiveTrackIndex();
	if (index === null || index === undefined) return 0;
	return Math.max(EverythingPlayer.getQueue().length - index - 1, 0);
}

export async function wait_for_active_track(uid: string, timeout_ms = 10_000): Promise<boolean> {
	const deadline = Date.now() + timeout_ms;
	while (Date.now() < deadline) {
		try {
			if (queue_track(EverythingPlayer.getActiveTrackIndex() ?? undefined)?.uid === uid) return true;
		} catch (_) { }
		await new Promise(resolve => setTimeout(resolve, 200));
	}
	return false;
}

let queue_generation = 0;
export function invalidate_queue_inserts() {
	queue_generation++;
}

export async function insert_track_into_player_queue(track_data: Track, plus_index: number, add_to_playing_queue = true): Promise<boolean> {
	if (!GLOBALS.global_var.is_playing) return false;
	const run_generation = queue_generation;
	const track_index = EverythingPlayer.getActiveTrackIndex();
	if (track_index === null || track_index === undefined) return false;
	const track = recreate(track_data);
	track.playback = {
		artwork: track.playback?.artwork ?? 0,
		added: true,
		successful: false
	};
	const react_native_track = await illusive_track_to_track_player_track(track);
	if (react_native_track === 'skip') return false;
	const added = await run_native_queue_mutation(async () => {
		const active_index = EverythingPlayer.getActiveTrackIndex();
		if (run_generation !== queue_generation || active_index === null || active_index === undefined) return false;
		EverythingPlayer.add(react_native_track, Math.min(active_index + plus_index, EverythingPlayer.getQueue().length));
		return true;
	});
	if (!added) return false;
	track.playback.successful = true;
	if (add_to_playing_queue) GLOBALS.global_var.playing_queue.push(track.uid);
	await on_modify_track_player_queue();
	return true;
}

let delete_track_chain: Promise<void> = Promise.resolve();

export async function delete_track_from_player_queue(track_data: Track, current_track_index: number): Promise<void> {
	const run = delete_track_chain.then(async () => delete_track_from_player_queue_impl(track_data, current_track_index));
	delete_track_chain = run.catch(catch_log);
	return run;
}

async function delete_track_from_player_queue_impl(track_data: Track | undefined, current_track_index: number) {
	if (track_data === undefined) return;
	await run_native_queue_mutation(async () => {
		const native_index = EverythingPlayer.getQueue().findIndex((queued, i) => i >= current_track_index && queued.id === track_data.uid);
		if (native_index !== -1) EverythingPlayer.remove(native_index);
	});
	await on_modify_track_player_queue();
}

export async function illusive_track_to_track_player_track(track: Track): Promise<EPTrack | 'skip'> {
	if (track === undefined) return 'skip';
	const url_data = await Illusive.get_download_url(SQLfs.document_directory(''), track);
	if ('error' in url_data) {
		GLOBALS.global_var.bottom_alert(YouTubeDL.is_age_restricted_error(url_data) ? `"${track.title}" is age restricted on YouTube, sign in to YouTube to play it` : 'Failed to convert track to Illusive track', 'WARN', url_data);
		if (YouTubeDL.is_unavailable_error(url_data)) await SQLBackpack.report_unavailable(track);
		return 'skip';
	}
	if ('duration' in url_data && url_data.duration && !isNaN(url_data.duration) && is_empty(track.duration)) {
		track.duration = url_data.duration;
	}
	const nt_response = await handle_new_track_data(track, url_data);
	if (!('error' in nt_response)) track = nt_response;
	const artwork = resolved_artwork(track.playback!.artwork);
	const artwork_payload = typeof artwork === 'number' ? artwork : artwork.uri;
	return {
		id: track.uid,
		title: track.title,
		artist: artist_string(track),
		album: track.album?.name,
		duration: Math.max(Number.isFinite(track.duration) ? track.duration : 0, url_data.duration ?? 0),
		artwork: artwork_payload,
		startTime: track.meta?.begdur,
		endTime: track.meta?.enddur,
		userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
		contentType: 'audio/mp4',
		headers: {},
		otherData: track,
		streamingInfo: url_data.sabr_params
			? reinterpret_cast<SabrStreamingInfo>(url_data.sabr_params)
			: url_data.url
	};
}

let native_queue_mutation_chain: Promise<void> = Promise.resolve();
async function run_native_queue_mutation<T>(op: () => Promise<T>): Promise<T> {
	const run = native_queue_mutation_chain.then(op);
	native_queue_mutation_chain = run.then(() => undefined, () => undefined);
	return run;
}

let updated_metadata_mutex = false;

function position_fraction(playing_track: Track, position: number) {
	return playing_track.duration > 0 ? position / playing_track.duration : 0;
}

export function get_x_threshold(playing_track: Track, threshold_percent: number) {
	if (!(playing_track.duration > 0)) return 0;
	const begdur = playing_track.meta?.begdur ?? 0;
	const enddur = playing_track.meta?.enddur ?? playing_track.duration;
	return ((begdur + ((enddur - begdur)) * threshold_percent) / playing_track.duration);
}
export function get_restart_threshold(playing_track: Track) {
	return get_x_threshold(playing_track, Constants.previous_restart_threshold);
}
export function is_in_restart_threshold(playing_track: Track, position: number) {
	return position_fraction(playing_track, position) >= get_restart_threshold(playing_track);
}
export function get_metadata_update_threshold(playing_track: Track) {
	return get_x_threshold(playing_track, Constants.update_track_threshold);
}
export function is_in_metadata_update_threshold(playing_track: Track, position: number) {
	return position_fraction(playing_track, position) >= get_metadata_update_threshold(playing_track);
}

export function get_reset_mutex_threshold(playing_track: Track) {
	return get_x_threshold(playing_track, Constants.reset_track_mutex_threshold);
}
export function is_in_reset_mutex_threshold(playing_track: Track, position: number) {
	return position_fraction(playing_track, position) <= get_reset_mutex_threshold(playing_track);
}

export async function track_player_previous() {
	try {
		const progress = EverythingPlayer.getProgress();
		const track_index = EverythingPlayer.getActiveTrackIndex();
		const illusi_track = queue_track(track_index ?? undefined);
		if (track_index === undefined || track_index === null || track_index === 0) {
			EverythingPlayer.seekTo(illusi_track?.meta?.begdur ?? 0);
			updated_metadata_mutex = false;
			return;
		}
		if (illusi_track !== undefined && is_in_restart_threshold(illusi_track, progress.position)) {
			EverythingPlayer.seekTo(illusi_track.meta?.begdur ?? 0);
			updated_metadata_mutex = false;
			return;
		}
		await EverythingPlayer.skipToPrevious();
	} catch (error) { alert_trackplayer_error({ error: error as Error }); }
}

let skip_chain: Promise<void> = Promise.resolve();

export async function track_player_next(): Promise<void> {
	const run = skip_chain.then(async () => {
		try {
			await EverythingPlayer.skipToNext();
		} catch (error) { alert_trackplayer_error({ error: error as Error }); }
	});
	skip_chain = run.catch(() => { });
	return run;
}

let handling_playback_error = false;
let playback_error_uid: string | undefined;
let playback_error_count = 0;

async function replace_native_track(index: number, react_native_track: EPTrack) {
	await run_native_queue_mutation(async () => {
		EverythingPlayer.remove(index);
		EverythingPlayer.add(react_native_track, index);
		await EverythingPlayer.skip(index);
	});
}

const PLAYBACK_RECOVERY_TIMEOUT_MS = milliseconds_of({ seconds: 8 });
const PLAYBACK_RECOVERY_POLL_MS = milliseconds_of({ milliseconds: 500 });

async function wait_for_playback_recovery(): Promise<boolean> {
	const deadline = Date.now() + PLAYBACK_RECOVERY_TIMEOUT_MS;
	await new Promise(resolve => setTimeout(resolve, PLAYBACK_RECOVERY_POLL_MS));
	while (Date.now() < deadline) {
		const { state } = EverythingPlayer.getPlaybackState();
		if (state === State.Error || state === State.None || state === State.Stopped) return false;
		if (state === State.Playing || state === State.Ready || state === State.Paused
			|| state === State.Buffering || state === State.Ended) {
			playback_error_count = 0;
			return true;
		}
		await new Promise(resolve => setTimeout(resolve, PLAYBACK_RECOVERY_POLL_MS));
	}
	return false;
}

export async function track_player_on_error(data: { error: string }) {
	const error_msg = `TP: ${data.error}`;
	GLOBALS.global_var.bottom_alert(error_msg, 'WARN');
	if (handling_playback_error) return;
	handling_playback_error = true;
	try {
		const index = EverythingPlayer.getActiveTrackIndex();
		if (index === null || index === undefined) return;
		const illusi_track = queue_track(index);
		if (illusi_track === undefined) return;

		if (playback_error_uid !== illusi_track.uid) {
			playback_error_uid = illusi_track.uid;
			playback_error_count = 0;
		}
		playback_error_count++;

		if (playback_error_count <= Constants.trackplayer_max_retries) {
			try {
				EverythingPlayer.retry();
				if (await wait_for_playback_recovery()) return;
			} catch (_) { }
			const react_native_track = await illusive_track_to_track_player_track(illusi_track)
				.catch((error: Error) => { catch_log(error); return 'skip' as const; });
			if (react_native_track !== 'skip') {
				await replace_native_track(index, react_native_track);
				if (await wait_for_playback_recovery()) return;
			}
		}
		await delete_track_from_player_queue(illusi_track, index);
	} finally {
		handling_playback_error = false;
	}
}

export async function playback_service() {
	EverythingPlayer.addEventListener(Event.RemoteDuck, async (_) => { return; });
	EverythingPlayer.addEventListener(Event.PlaybackError, async (data) => {
		await track_player_on_error(reinterpret_cast<{ error: string }>(data)).catch(catch_log);
	});
	EverythingPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (data) => {
		try {
			if (data.index === undefined) return;
			const illusi_track = queue_track(data.index);
			updated_metadata_mutex = false;
			if (illusi_track === undefined) return;
			GLOBALS.global_var.playing_queue = [];

			await SQLRecentlyPlayed.insert_recently_played_track(illusi_track);
			await sample();
			await save_past_queue();
		} catch (error) { alert_trackplayer_error({ error: error as Error }); }
	});
	EverythingPlayer.addEventListener(Event.PlaybackProgressUpdated, async (data) => {
		try {
			const illusi_track = queue_track(data.track);
			if (illusi_track === undefined) return;

			if (is_in_reset_mutex_threshold(illusi_track, data.position)) {
				updated_metadata_mutex = false;
			} else if (is_in_metadata_update_threshold(illusi_track, data.position) && !updated_metadata_mutex) {
				updated_metadata_mutex = true;
				const current_track = await SQLTracks.track_from_uid(illusi_track.uid) as Track | undefined;
				if (current_track?.meta === undefined) {
					updated_metadata_mutex = false;
					return;
				}
				if (is_empty(current_track.meta.plays)) current_track.meta.plays = 0;
				current_track.meta.last_played_date = (new Date().toISOString() as ISOString);
				current_track.meta.plays++;
				await SQLTracks.update_track_meta_data(current_track.uid, current_track.meta);
				await SQLTrackPlays.insert_track_play(current_track.uid);
			}
		} catch (error) { updated_metadata_mutex = false; catch_log(error as Error); }
	});
	EverythingPlayer.addEventListener(Event.RemotePrevious, async () => { await track_player_previous(); });
	EverythingPlayer.addEventListener(Event.RemoteNext, async () => { await track_player_next(); });
	EverythingPlayer.addEventListener(Event.RemotePause, async () => { EverythingPlayer.pause(); });
	EverythingPlayer.addEventListener(Event.RemotePlay, async () => { EverythingPlayer.play(); });
	EverythingPlayer.addEventListener(Event.RemoteSeek, async (data) => { EverythingPlayer.seekTo(data.position); });
}
