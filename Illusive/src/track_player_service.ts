import type { AddTrack } from 'react-native-track-player';
import TrackPlayer, {
    AppKilledPlaybackBehavior,
    Capability,
    Event,
    RepeatMode,
    TrackType
}
    from 'react-native-track-player';
import { is_empty, recreate } from '@common/utils/util';
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
import { breadcrumb } from '@common/sentry_error_handler';
import { SQLTrackPlays } from './sql/sql_track_plays';
import { reinterpret_cast } from '@common/cast';
import { VibesSampler } from './vibes_sampler';
import { YouTubeDL } from '@origin/youtube_dl';
import type { SabrTokenCallbackReason } from '@native/sabr_downloader/sabr_downloader.base';
// import * as ImageManipulator from 'expo-image-manipulator';
// import { Image } from 'react-native';

export let trackplayer_has_been_setup = false;

// Tracks the content_binding of SABR tracks so a refreshed poToken can be minted for
// whichever one is currently active in TrackPlayer.
const sabr_content_binding_by_uid = new Map<string, string>();
// uid of whichever track is currently active, so a fetch that resolves after the user
// has already skipped away doesn't feed a stale track's token into the new active track.
let current_active_track_uid: string | undefined;
const sabr_po_token_refresh_in_flight = new Set<string>();

async function refresh_active_sabr_po_token(uid: string, content_binding: string) {
    if (sabr_po_token_refresh_in_flight.has(uid)) return;
    sabr_po_token_refresh_in_flight.add(uid);
    try {
        const result = await YouTubeDL.fetch_potoken(content_binding);
        if ("error" in result) throw result.error;
        // The active track may have changed while this fetch was in flight; only apply
        // the token if it's still the one that's actually playing.
        if (current_active_track_uid !== uid) return;
        await TrackPlayer.updatePlaybackPoToken(result.po_token);
    } catch (error) {
        catch_log(error as Error);
    } finally {
        sabr_po_token_refresh_in_flight.delete(uid);
    }
}

export async function setup_track_player(): Promise<boolean> {
    GLOBALS.global_var.past_playing_tracks = GLOBALS.global_var.playing_tracks.length === 0 ?
        GLOBALS.global_var.past_playing_tracks : GLOBALS.global_var.playing_tracks;
    let index = 0;
    try {
        index = await TrackPlayer.getActiveTrackIndex() ?? 0;
    } catch (_) { }
    GLOBALS.global_var.past_track_index = GLOBALS.global_var.playing_tracks.length === 0 ? GLOBALS.global_var.past_track_index : index;
    try {
        await TrackPlayer.getActiveTrackIndex();
    } catch (_) {
        await TrackPlayer.setupPlayer();
        trackplayer_has_been_setup = true;
        await TrackPlayer.updateOptions({
            android: {
                appKilledPlaybackBehavior:
                    AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            },
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
                Capability.SeekTo,
                Capability.PlayFromSearch,
            ],
            progressUpdateEventInterval: 1,
        });
        await TrackPlayer.setRepeatMode(RepeatMode.Off);
        await TrackPlayer.setEqualizer(Prefs.equalizer_presets[Prefs.get_pref('equalizer_preset')] as unknown as number[]);
        await TrackPlayer.setCrossFade(Prefs.get_pref('crossfade'));
        return true;
    }
    return true;
}

export async function save_past_queue() {
    const index = await TrackPlayer.getActiveTrackIndex();
    if (index === undefined) return;
    await Prefs.save_pref('past_queue', { index, tracks: GLOBALS.global_var.playing_tracks.map(track => ({ ...track, playback: undefined, downloading_data: undefined })) });
}

const queue_modified_listeners = new Set<() => void>();
export function subscribe_track_player_queue_modified(listener: () => void): () => void {
    queue_modified_listeners.add(listener);
    return () => { queue_modified_listeners.delete(listener); };
}

export async function on_modify_track_player_queue() {
    await save_past_queue();
    await check_push_next_track(await TrackPlayer.getActiveTrackIndex() ?? 0);
    for (const listener of queue_modified_listeners) {
        try { listener(); } catch { };
    }
}

export async function insert_track_into_player_queue(track_data: Track, plus_index: number) {
    if (!GLOBALS.global_var.is_playing) return;
    const track_index = await TrackPlayer.getActiveTrackIndex();
    if (track_index === null || track_index === undefined) return;
    const track = recreate(track_data);
    track.playback = {
        artwork: track.playback?.artwork ?? 0,
        added: false,
        successful: false
    };
    GLOBALS.global_var.playing_tracks.splice(track_index + plus_index, 0, track);
    GLOBALS.global_var.playing_queue.push(track.uid);
    await on_modify_track_player_queue();
}

let delete_track_chain: Promise<void> = Promise.resolve();

export async function delete_track_from_player_queue(track_data: Track, current_track_index: number): Promise<void> {
    const run = delete_track_chain.then(async () => delete_track_from_player_queue_impl(track_data, current_track_index));
    delete_track_chain = run.catch(catch_log);
    return run;
}

async function delete_track_from_player_queue_impl(track_data: Track | undefined, current_track_index: number) {
    if (track_data === undefined) return;
    const global_index = GLOBALS.global_var.playing_tracks.slice(current_track_index).findIndex(track => track.uid === track_data.uid);
    if (global_index !== -1) {
        const absolute_index = current_track_index + global_index;
        GLOBALS.global_var.playing_tracks.splice(absolute_index, 1);
        sabr_content_binding_by_uid.delete(track_data.uid);
        // TP queue is lazily loaded so indices may differ from playing_tracks — match by position relative to current.
        // Prefer the uid (carried on every track dict now); fall back to title for entries added before uid existed.
        const tp_queue = await TrackPlayer.getQueue();
        const tp_index = tp_queue.slice(current_track_index).findIndex(track => {
            const t = reinterpret_cast<{ uid?: string, title?: string }>(track);
            return t.uid !== undefined ? t.uid === track_data.uid : t.title === track_data.title;
        });
        // The queue can still shrink between getQueue() and remove() (e.g. TrackPlayer.reset()
        // from another screen); an out-of-bounds rejection only means the track is already gone
        if (tp_index !== -1) await TrackPlayer.remove([current_track_index + tp_index]).catch(catch_log);
    }
    await on_modify_track_player_queue();
}

// async function get_square_artwork(uri: string) {
//     const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
//         Image.getSize(uri, (w, h) => resolve({ width: w, height: h }), reject);
//     });

//     const size = Math.min(width, height);
//     const crop = {
//         originX: (width - size) / 2,
//         originY: (height - size) / 2,
//         width: size,
//         height: size,
//     };

//     const result = await ImageManipulator.ImageManipulator.manipulate(uri, 
//         // [
//             // { crop },
//             // { resize: { width: 512, height: 512 } }, // recommended size for lockscreen
//         // ]
//     );
//     result.crop().

//     return result.uri;
// }

export async function illusive_track_to_track_player_track(track: Track): Promise<AddTrack | 'skip'> {
    if (track === undefined) return 'skip';
    const url_data = await Illusive.get_download_url(SQLfs.document_directory(""), track, "18");
    if ("error" in url_data) {
        GLOBALS.global_var.bottom_alert("Failed to convert track to Illusive track", "WARN", url_data);
        if (url_data.error.message.includes("Video unavailable"))
            await SQLBackpack.add_to_backpack(track.uid);
        return 'skip';
    }
    if ("duration" in url_data && url_data.duration && !isNaN(url_data.duration) && is_empty(track.duration)) {
        track.duration = url_data.duration;
    }
    const nt_response = await handle_new_track_data(track, url_data);
    if (!("error" in nt_response)) track = nt_response;
    // Note: TrackPlayer will auto removed failed files, don't bother with checking if file exist
    const artwork = resolved_artwork(track.playback!.artwork);
    VibesSampler.predict_track_save_result(track).catch(catch_log);
    const artwork_payload = typeof artwork === "number" ? artwork : artwork.uri;
    breadcrumb('track-player', 'illusive_track_to_track_player_track', {
        title: track.title,
        artwork_type: typeof artwork_payload,
        artwork_uri: typeof artwork_payload === 'string' ? artwork_payload : null,
        artwork_scheme: typeof artwork_payload === 'string'
            ? (artwork_payload.startsWith('file:///') ? 'file:///'
                : artwork_payload.startsWith('file://') ? 'file://'
                    : artwork_payload.startsWith('file:/') ? 'file:/'
                        : artwork_payload.startsWith('http') ? 'http'
                            : 'other')
            : 'asset',
        has_thumbnail_uri: !is_empty(track.thumbnail_uri),
    });
    if (url_data.isSabr && url_data.content_binding) {
        sabr_content_binding_by_uid.set(track.uid, url_data.content_binding);
    }
    return {
        uid: track.uid,
        url: url_data.url,
        title: track.title,
        artist: artist_string(track),
        album: track.album?.name,
        duration: track.duration,
        artwork: artwork_payload,
        type: is_empty(track.soundcloud_id) ? TrackType.HLS : TrackType.HLS,
        headers: {},
        contentType: 'audio/mp4',
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
        ...(url_data.isSabr && {
            isSabr: url_data.isSabr,
            sabrServerUrl: url_data.sabrServerUrl,
            sabrUstreamerConfig: url_data.sabrUstreamerConfig,
            sabrFormats: (url_data.sabrFormats ?? []) as unknown as Record<string, unknown>[],
            poToken: url_data.placeholder_po_token,
        }),
    };
}

// -------- Metadata-first ("pending") track loading --------
// Tracks are pushed to the native queue immediately with metadata only, so skips land
// instantly; the playback url is fetched in the background and filled in via
// TrackPlayer.updateTrackUrl. While a pending track is active the native player waits
// in the loading state and starts the moment the url arrives.

// How long a url fetch may take before the pending track is dropped from the queue,
// so a hung fetch can't wedge playback on a loading spinner forever.
const URL_RESOLVE_TIMEOUT_MS = 30_000;

function pending_track_player_track(track: Track): AddTrack {
    const artwork = resolved_artwork(track.playback!.artwork);
    const artwork_payload = typeof artwork === "number" ? artwork : artwork.uri;
    return {
        uid: track.uid,
        title: track.title,
        artist: artist_string(track),
        album: track.album?.name,
        duration: track.duration,
        artwork: artwork_payload,
    };
}

// Index in the native queue of the still-url-less entry for this uid. Matching on
// "no url yet" keeps duplicate queue entries of the same track from resolving into
// the same native slot.
async function native_queue_index_of_pending(uid: string): Promise<number> {
    const tp_queue = await TrackPlayer.getQueue();
    return tp_queue.findIndex(tp_track => {
        const t = reinterpret_cast<{ uid?: string, url?: string }>(tp_track);
        return t.uid === uid && t.url === undefined;
    });
}

const url_resolution_in_flight = new Map<string, Promise<void>>();

async function resolve_pending_track_url(track: Track): Promise<void> {
    const existing = url_resolution_in_flight.get(track.uid);
    if (existing) return existing;
    const run = resolve_pending_track_url_impl(track)
        .finally(() => { url_resolution_in_flight.delete(track.uid); });
    url_resolution_in_flight.set(track.uid, run);
    return run;
}

async function resolve_pending_track_url_impl(track: Track): Promise<void> {
    let timeout_handle: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<'timeout'>(resolve => {
        timeout_handle = setTimeout(() => resolve('timeout'), URL_RESOLVE_TIMEOUT_MS);
    });
    const fetch_promise = illusive_track_to_track_player_track(track);
    // The timeout may win the race; don't leave the losing fetch as an unhandled rejection
    fetch_promise.catch(catch_log);
    const react_native_track = await Promise.race([fetch_promise, timeout])
        .finally(() => clearTimeout(timeout_handle));
    breadcrumb('track-player', 'resolve_pending_track_url', {
        title: track.title,
        result: typeof react_native_track === 'string' ? react_native_track : 'ok',
    });
    const native_index = await native_queue_index_of_pending(track.uid);
    // No url-less native entry means the track was deleted while fetching, or was never
    // actually pending (already has a url) — either way there is nothing to fill in or drop.
    if (native_index === -1) return;
    if (react_native_track === 'skip' || react_native_track === 'timeout') {
        if (react_native_track === 'timeout')
            GLOBALS.global_var.bottom_alert(`Timed out fetching playback url for "${track.title}"`, "WARN");
        // Drop the track so the queue keeps moving; if it was active, the native
        // player advances to the next entry on its own.
        const global_index = GLOBALS.global_var.playing_tracks.findIndex(t => t.uid === track.uid);
        if (global_index !== -1) GLOBALS.global_var.playing_tracks.splice(global_index, 1);
        sabr_content_binding_by_uid.delete(track.uid);
        await TrackPlayer.remove([native_index]).catch(catch_log);
        await on_modify_track_player_queue();
        return;
    }
    track.playback!.successful = true;
    await TrackPlayer.updateTrackUrl(native_index, react_native_track);
}

let updated_metadata_mutex = false;

export function get_x_threshold(playing_track: Track, threshold_percent: number) {
    const begdur = playing_track.meta?.begdur ?? 0;
    const enddur = playing_track.meta?.enddur ?? playing_track.duration;
    return ((begdur + ((enddur - begdur)) * threshold_percent) / playing_track.duration);
}
export function get_restart_threshold(playing_track: Track) {
    return get_x_threshold(playing_track, Constants.previous_restart_threshold);
}
export function is_in_restart_threshold(playing_track: Track, position: number) {
    return position / playing_track.duration >= get_restart_threshold(playing_track);
}
export function get_metadata_update_threshold(playing_track: Track) {
    return get_x_threshold(playing_track, Constants.update_track_threshold);
}
export function is_in_metadata_update_threshold(playing_track: Track, position: number) {
    return position / playing_track.duration >= get_metadata_update_threshold(playing_track);
}

export function get_reset_mutex_threshold(playing_track: Track) {
    return get_x_threshold(playing_track, Constants.reset_track_mutex_threshold);
}
export function is_in_reset_mutex_threshold(playing_track: Track, position: number) {
    return position / playing_track.duration <= get_reset_mutex_threshold(playing_track);
}

export async function track_player_previous() {
    try {
        const progress = await TrackPlayer.getProgress();
        const track_index = await TrackPlayer.getActiveTrackIndex();
        if (track_index === undefined || track_index === 0) {
            await TrackPlayer.seekTo(0);
            updated_metadata_mutex = false;
            return;
        }
        const illusi_track = GLOBALS.global_var.playing_tracks?.[track_index];
        if (is_in_restart_threshold(illusi_track, progress.position)) {
            await TrackPlayer.seekTo(illusi_track?.meta?.begdur ?? 0);
            updated_metadata_mutex = false;
            return;
        }
        await TrackPlayer.skipToPrevious();
    } catch (error) { alert_trackplayer_error({ error: error as Error }); }
}

// Native adds that are still crossing the bridge, so a skip issued mid-add can wait
// for the entry to exist instead of getting dropped.
const native_add_in_flight = new Map<string, Promise<void>>();

export async function check_push_next_track(queue_index: number) {
    const next_track_index = queue_index + 1;
    const next_illusi_track = GLOBALS.global_var.playing_tracks[next_track_index];
    if (!next_illusi_track || next_illusi_track.playback!.added || next_illusi_track.playback!.successful) return;
    next_illusi_track.playback!.added = true;

    // Push the track natively right away with metadata only — no waiting on the url
    // fetch — so navigating to it is instant. The url resolves in the background.
    const add_operation = (async () => {
        try {
            await TrackPlayer.add(pending_track_player_track(next_illusi_track), next_track_index);
        } catch (error) {
            next_illusi_track.playback!.added = false;
            GLOBALS.global_var.bottom_alert("Failed to add track to queue", "WARN", { error: error as Error });
            throw error;
        }
    })();
    native_add_in_flight.set(next_illusi_track.uid, add_operation);
    try {
        await add_operation;
    } catch (_) {
        return;
    } finally {
        native_add_in_flight.delete(next_illusi_track.uid);
    }
    resolve_pending_track_url(next_illusi_track).catch(catch_log);
}

// Skips are serialized so mashing "next" queues each press instead of losing the ones
// that arrive before the next native track exists.
let skip_chain: Promise<void> = Promise.resolve();

export async function track_player_next(): Promise<void> {
    const run = skip_chain.then(async () => {
        try {
            const track_index = await TrackPlayer.getActiveTrackIndex() ?? 0;
            const next_illusi_track = GLOBALS.global_var.playing_tracks[track_index + 1];
            if (next_illusi_track !== undefined) {
                // Make sure the next track exists natively (fast, metadata-only add) before skipping
                await check_push_next_track(track_index);
                const inflight_add = native_add_in_flight.get(next_illusi_track.uid);
                if (inflight_add) await inflight_add.catch(() => { });
            }
            await TrackPlayer.skipToNext();
        } catch (error) { alert_trackplayer_error({ error: error as Error }); }
    });
    skip_chain = run.catch(() => { });
    return run;
}

let handling_playback_error = false;

export async function track_player_on_error(data: { error: string }) {
    const error_msg = `TP: ${data.error}`;
    GLOBALS.global_var.bottom_alert(error_msg, "WARN");
    if (handling_playback_error) return;
    handling_playback_error = true;
    try {
        for (let i = 0; i < Constants.trackplayer_max_retries; i++) {
            try {
                await TrackPlayer.retry();
            } catch (_) {
                continue;
            }
            break;
        }
        const index = await TrackPlayer.getActiveTrackIndex();
        if (index === null || index === undefined) return;
        const illusi_track = GLOBALS.global_var.playing_tracks[index];
        // playing_tracks can be emptied (audiobook mode) or shifted by a concurrent delete
        if (illusi_track === undefined) return;
        await delete_track_from_player_queue(illusi_track, index);
    } finally {
        handling_playback_error = false;
    }
}

export async function playback_service() {
    TrackPlayer.addEventListener(Event.RemoteDuck, async (_) => { return });
    TrackPlayer.addEventListener(Event.PlaybackError, async (data) => {
        breadcrumb('track-player', 'PlaybackError', { data: data as unknown as Record<string, unknown> });
        await track_player_on_error(reinterpret_cast<{ error: string }>(data)).catch(catch_log);
    });
    TrackPlayer.addEventListener(Event.SabrRefreshPoToken, async (data: { outputPath?: string, reason: SabrTokenCallbackReason }) => {
        // outputPath present means this refresh is for a background SABR download, not active playback
        if (data.outputPath !== undefined) return;
        if (current_active_track_uid === undefined) return;
        const content_binding = sabr_content_binding_by_uid.get(current_active_track_uid);
        if (content_binding === undefined) return;
        await refresh_active_sabr_po_token(current_active_track_uid, content_binding);
    });
    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (data) => {
        try {
            if (data.index === undefined) return;
            const active = GLOBALS.global_var.playing_tracks[data.index];
            breadcrumb('track-player', 'PlaybackActiveTrackChanged', {
                index: data.index,
                title: active?.title,
                added: active?.playback?.added,
                successful: active?.playback?.successful,
            });
            updated_metadata_mutex = false;
            const illusi_track = GLOBALS.global_var.playing_tracks[data.index];
            // playing_tracks is emptied while the audiobook player owns TrackPlayer; bail so we don't crash or inject music tracks
            if (illusi_track === undefined) return;
            current_active_track_uid = illusi_track.uid;
            // The active track started with a placeholder poToken; swap in the real one the instant it's minted.
            const active_sabr_content_binding = sabr_content_binding_by_uid.get(illusi_track.uid);
            if (active_sabr_content_binding) refresh_active_sabr_po_token(illusi_track.uid, active_sabr_content_binding).catch(catch_log);
            if (illusi_track.meta?.begdur !== undefined) { await TrackPlayer.seekTo(illusi_track.meta.begdur); };
            GLOBALS.global_var.playing_queue = [];

            if (illusi_track.playback!.added && !illusi_track.playback!.successful) {
                // The url is still resolving: the native player holds in the loading state
                // and starts the instant updateTrackUrl lands. Just make sure a resolution
                // is actually in flight (e.g. after an earlier add failure reset the flags).
                resolve_pending_track_url(illusi_track).catch(catch_log);
            }

            await SQLRecentlyPlayed.insert_recently_played_track(GLOBALS.global_var.playing_tracks[data.index]);
            await sample();
            await save_past_queue();
        } catch (error) { alert_trackplayer_error({ error: error as Error }); }
    });
    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, async (data) => {
        try {
            const illusi_track = GLOBALS.global_var.playing_tracks[data.track];
            // no-op while the audiobook player owns TrackPlayer (music queue cleared)
            if (illusi_track === undefined) return;

            if (is_in_reset_mutex_threshold(illusi_track, data.position)) {
                updated_metadata_mutex = false;
            }
            else if (is_in_metadata_update_threshold(illusi_track, data.position) && !updated_metadata_mutex) {
                updated_metadata_mutex = true;
                const current_track = await SQLTracks.track_from_uid(GLOBALS.global_var.playing_tracks[data.track].uid) as Track;
                if (is_empty(current_track.meta!.plays)) current_track.meta!.plays = 0;
                current_track.meta!.last_played_date = (new Date().toISOString() as ISOString);
                current_track.meta!.plays++;
                await SQLTracks.update_track_meta_data(current_track.uid, current_track.meta!);
                await SQLTrackPlays.insert_track_play(current_track.uid);
            }
            if (illusi_track.meta?.enddur !== undefined && data.position >= illusi_track.meta?.enddur) await track_player_next();

            check_push_next_track(data.track).catch(catch_log);
        } catch (_) { }
    });
    TrackPlayer.addEventListener(Event.RemotePrevious, async () => { breadcrumb('track-player', 'RemotePrevious'); await track_player_previous(); });
    TrackPlayer.addEventListener(Event.RemoteNext, async () => { breadcrumb('track-player', 'RemoteNext'); await track_player_next(); });
    TrackPlayer.addEventListener(Event.RemotePause, async () => { breadcrumb('track-player', 'RemotePause'); await TrackPlayer.pause(); });
    TrackPlayer.addEventListener(Event.RemotePlay, async () => { breadcrumb('track-player', 'RemotePlay'); await TrackPlayer.play(); });
    TrackPlayer.addEventListener(Event.RemoteSeek, async (data) => { breadcrumb('track-player', 'RemoteSeek', { position: data.position }); await TrackPlayer.seekTo(data.position); });
}