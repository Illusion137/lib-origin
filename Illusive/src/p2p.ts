import { createPTP, type PeerInfo, type PTP } from "react-native-ptp";
import TrackPlayer, { Event, State } from "react-native-track-player";
import * as Haptics from "expo-haptics";
import { GLOBALS } from "./globals";
import { Prefs } from "./prefs";
import { catch_ignore, catch_log } from "@common/utils/error_util";
import { is_empty } from "@common/utils/util";
import { illusive_track_to_track_player_track, on_modify_track_player_queue, subscribe_track_player_queue_modified } from "./track_player_service";
import type { Track } from "./types";

// ─────────────────────────────────────────────────────────────────────────
// SyncPlay v3 — clock-synchronized authoritative-timeline reconciler.
//
// Design in one sentence: the host is the single source of truth and
// continuously broadcasts ONE canonical `sync` message (track + position +
// play-state, stamped with the host's clock); guests do nothing but converge
// to it. That single mechanism transparently handles join, play, pause, seek,
// skip, natural track advance, drift, and buffering — there is no fragile
// multi-step handshake to get stuck in.
//
// Why the rewrite (the old v2 model's failure modes):
//   • Out of sync / late commands — commands carried an absolute wall-clock
//     `execute_at` from the HOST's clock that the guest re-based against its
//     OWN clock. Peer device clocks differ by seconds, so commands fired late
//     or instantly. v3 estimates clock offset (NTP-style) and never trusts a
//     raw foreign timestamp.
//   • "Doesn't auto-play when both ready" — v2 paused the host and waited for
//     every guest to ack a `prepare`, then sent a one-shot `play_at`; a single
//     lost ack/play_at left everyone stuck. v3's heartbeat re-asserts the
//     play-state every tick, so a guest that finishes loading is made to play
//     by the very next sync — guaranteed convergence, no handshake.
//   • "Each device plays a different song" — v2 let each device advance through
//     the queue independently (different crossfade/prefetch timing → different
//     tracks). v3 makes the host's track_uid authoritative every tick, so a
//     diverged guest is snapped onto the host's track immediately.
// ─────────────────────────────────────────────────────────────────────────

// Track JSON sent over the wire — strips local file URIs and per-device state.
// The receiving guest tries to match by uid against their library; if no local
// match it hydrates from the wire and the normal service-ID resolver streams it.
type WireTrack = Omit<Track,
    'media_uri' | 'thumbnail_uri' | 'lyrics_uri' | 'synced_lyrics_uri' |
    'playback' | 'downloading_data' | 'id'
>;

type SyncCmd =
    // Clock/latency probe. The original SENDER computes both RTT and the
    // responder's clock offset from the round trip (see handle ping/pong).
    | { cmd: 'ping'; t0: number }
    | { cmd: 'pong'; t0: number; t1: number }
    // THE canonical state. Host → all guests, on every change AND on a steady
    // heartbeat. `host_time` is the host's Date.now() at the moment `position`
    // was sampled; the guest converts it to local time via the measured clock
    // offset to compute how far the host has advanced since.
    | { cmd: 'sync'; seq: number; host_time: number; track_uid: string; position: number; is_playing: boolean }
    // Host → all guests: upcoming queue (active track first). Always sent right
    // before the `sync` that references a new track so the guest can resolve it.
    | { cmd: 'queue'; tracks: WireTrack[]; active_index: number }
    // Lightweight rich "now playing" card (host screen pushes every ~2s).
    | {
        cmd: 'track_info'; title: string; artists_str: string; artwork_url?: string;
        youtube_id?: string; youtubemusic_id?: string; soundcloud_id?: number;
        spotify_id?: string; soundcloud_permalink?: string;
        position: number; is_playing: boolean
    }
    // Host → all guests: permission flag update.
    | { cmd: 'permissions'; guest_can_control: boolean }
    // Guest → host: control requests (only honored when guests may control).
    | { cmd: 'req_play' }
    | { cmd: 'req_pause' }
    | { cmd: 'req_seek'; position: number }
    | { cmd: 'req_next' }
    | { cmd: 'req_prev' }
    // Guest → host: this device cannot play track_uid (PlaybackError, imported
    // track w/o local copy, no resolvable IDs). Host skips it for the whole room.
    | { cmd: 'unplayable'; track_uid: string }
    // Guest → host: please re-send queue + sync (used when the guest received a
    // sync for a track it can't resolve yet, e.g. it joined mid-stream).
    | { cmd: 'request_state' };

export type { PeerInfo };
export type TrackInfoCmd = Extract<SyncCmd, { cmd: 'track_info' }>;

export interface P2PStatus {
    role: 'host' | 'guest' | 'idle';
    connected: boolean;
    connected_peer_count: number;
    guest_can_control: boolean;
    // Host-side intent flag retained for API compat. The host never blocks on
    // guests in v3, so this is always false.
    waiting_for_guests: boolean;
    // Guest-side: true while actively switching/loading a new track. Drives the
    // transient control lockout in the player UI so guests can't spam controls
    // against a player mid-load. Host side is always false.
    loading: boolean;
}

export namespace P2P {
    const SERVICE_NAME = "illusi-p2p";
    // How many upcoming tracks to ship in a `queue` payload (keep PTP packet small)
    const QUEUE_PAYLOAD_LIMIT = 30;
    // Host heartbeat cadence — re-asserts canonical state for drift/state self-heal.
    const HEARTBEAT_MS = 1000;
    // Guest clock-sync probe cadence.
    const PING_MS = 5000;
    // Position drift past which the guest re-seeks WHILE PLAYING. Loose enough
    // to avoid constant micro-seeking (each seek can glitch a streaming track),
    // tight enough to stay imperceptibly in sync.
    const DRIFT_TOLERANCE_S = 0.5;
    // While PAUSED we never micro-seek (seeking a paused HLS stream rebuffers and
    // can glitch playback). We only follow a *deliberate* host scrub, i.e. a jump
    // larger than this. Normal pause never seeks; position re-syncs on resume.
    const PAUSED_SEEK_THRESHOLD_S = 1.5;
    // Upper clamp on "how long ago the host sampled this position". Guards
    // against a bad/early clock-offset estimate producing an absurd seek.
    const MAX_ELAPSED_S = 3.0;

    let ptp_instance: PTP | null = null;
    let role: 'host' | 'guest' | 'idle' = 'idle';
    let connected_peers: PeerInfo[] = [];
    const discovered_peers = new Map<string, PeerInfo>();
    // peer_id → PeerInfo for peers who sent an invitation (host side)
    const invited_peers = new Map<string, PeerInfo>();
    let listener_removers: (() => void)[] = [];
    let track_info_callback: ((info: TrackInfoCmd) => void) | null = null;
    // Status subscribers (floating indicator, screens, audio player controls)
    const status_listeners = new Set<(s: P2PStatus) => void>();

    // ─── Clock / latency state ─────────────────────────────────────
    // Round-trip estimate (ms) and, on the guest, the host's clock offset.
    let rtt = 80;
    // clock_offset = host_clock - guest_clock (ms). Added to a local timestamp
    // to estimate the host's current clock. Guest-only; smoothed across probes.
    let clock_offset = 0;
    let clock_offset_valid = false;

    // ─── Host state ────────────────────────────────────────────────
    let guest_can_control = true;
    // Monotonic sequence stamped on every `sync`. Lets guests discard stale /
    // out-of-order syncs (cheap insurance on top of the reliable transport).
    let sync_seq = 0;
    // The host's *intent* to be playing, tracked from play/pause events. Used to
    // fill `is_playing` while TrackPlayer is in a transient Loading/Buffering
    // state right after a track change (where the raw state lies).
    let host_play_intent = true;
    let heartbeat_interval: ReturnType<typeof setInterval> | null = null;
    let queue_unsub: (() => void) | null = null;
    let last_queue_payload_signature = '';
    // Track UIDs the host already skipped as unplayable, so a slow-arriving
    // `unplayable` doesn't trigger a second skip past a track we moved off of.
    const recent_unplayable_skip = new Set<string>();

    // ─── Guest state ───────────────────────────────────────────────
    let ping_interval: ReturnType<typeof setInterval> | null = null;
    // Highest sync seq we've accepted; anything older is ignored.
    let last_seq = -1;
    // Latest sync awaiting reconciliation (coalesced — only the newest matters).
    let pending_sync: Extract<SyncCmd, { cmd: 'sync' }> | null = null;
    // The most recent sync we fully reconciled, re-applied after a track load
    // finishes so a freshly-loaded guest doesn't wait for the next heartbeat.
    let last_reconciled_sync: Extract<SyncCmd, { cmd: 'sync' }> | null = null;
    // Serial execution chain — all guest-side TrackPlayer/queue mutations run
    // through this so reconciles and queue updates never interleave.
    let guest_chain: Promise<void> = Promise.resolve();
    // True while a track *switch* (load) is in flight; drives `loading` status.
    let guest_loading = false;
    // Throttle for request_state so a guest that briefly can't resolve a track
    // doesn't spam the host.
    let last_request_state_at = 0;

    // ─── PTP instance ──────────────────────────────────────────────

    function ptp(): PTP {
        if (ptp_instance) return ptp_instance;
        ptp_instance = createPTP();
        ptp_instance.onError = (err) => GLOBALS.global_var.bottom_alert(err, 'WARN');
        ptp_instance.initialize(Prefs.get_pref('p2p_name'));
        return ptp_instance;
    }

    function broadcast_cmd(msg: SyncCmd) {
        ptp_instance?.broadcastMessage(JSON.stringify(msg));
    }

    function send(peer_id: string, msg: SyncCmd) {
        ptp_instance?.sendMessage(peer_id, JSON.stringify(msg));
    }

    function strip_to_wire(t: Track): WireTrack {
        // Explicitly drop local-only fields so they don't bloat the payload or
        // mislead the guest into loading a non-existent local file.
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(t)) {
            if (k === 'media_uri' || k === 'thumbnail_uri' || k === 'lyrics_uri' ||
                k === 'synced_lyrics_uri' || k === 'playback' || k === 'downloading_data' ||
                k === 'id') continue;
            out[k] = v;
        }
        // Artwork may live only in playback.artwork (resolved at play time) which
        // we just stripped — promote a string artwork into artwork_url so the
        // guest still has a renderable image source.
        if (is_empty(out.artwork_url) && typeof t.playback?.artwork === 'string') {
            out.artwork_url = t.playback.artwork;
        }
        return out as WireTrack;
    }

    function emit_status() {
        const s = get_status();
        for (const l of status_listeners) {
            try { l(s); } catch { /* listener errors shouldn't break us */ }
        }
    }

    function haptic(type: 'success' | 'warn' | 'tap') {
        if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(catch_ignore);
        else if (type === 'warn') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(catch_ignore);
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(catch_ignore);
    }

    // ─── Public API ────────────────────────────────────────────────

    /**
     * Start hosting. Nearby guests can discover and join.
     * Auto-accepts invitations unless on_invitation_received is provided.
     */
    export function broadcast(opts: {
        on_invitation_received?: (peer: PeerInfo, accept: () => void, decline: () => void) => void;
        on_guest_connected?: (peer: PeerInfo) => void;
        on_guest_disconnected?: (peer_id: string) => void;
    } = {}) {
        role = 'host';
        last_queue_payload_signature = '';

        ptp().onInvitationReceived = (peer) => {
            invited_peers.set(peer.peerId, peer);
            if (opts.on_invitation_received) {
                opts.on_invitation_received(
                    peer,
                    () => ptp().acceptInvitation(peer.peerId),
                    () => { ptp().declineInvitation(peer.peerId); invited_peers.delete(peer.peerId); }
                );
            } else {
                ptp().acceptInvitation(peer.peerId);
            }
        };

        ptp().onConnectionStateChanged = (peer_id, state) => {
            if (state === 'connected') {
                const peer = invited_peers.get(peer_id) ?? { peerId: peer_id, displayName: '', discoveryInfo: {} };
                if (!connected_peers.some(p => p.peerId === peer_id)) {
                    connected_peers.push(peer);
                }
                opts.on_guest_connected?.(peer);
                haptic('success');
                send(peer_id, { cmd: 'permissions', guest_can_control });
                // Hand the new guest the current queue + canonical state. The
                // heartbeat (≤1s away) keeps them aligned from there on.
                void send_state_to_peer(peer_id);
                emit_status();
            } else if (state === 'notConnected') {
                connected_peers = connected_peers.filter(p => p.peerId !== peer_id);
                invited_peers.delete(peer_id);
                opts.on_guest_disconnected?.(peer_id);
                haptic('warn');
                emit_status();
            }
        };

        ptp().onMessageReceived = (peer_id, raw) => handle_message(peer_id, raw);
        ptp().startAdvertising(SERVICE_NAME, { name: Prefs.get_pref('p2p_name') });
        register_host_listeners();
        // Seed play-intent from the live state; events keep it current after this.
        TrackPlayer.getPlaybackState().then(({ state }) => { host_play_intent = state === State.Playing; }).catch(() => { });
        if (heartbeat_interval) clearInterval(heartbeat_interval);
        heartbeat_interval = setInterval(send_heartbeat, HEARTBEAT_MS);
        emit_status();
    }

    /**
     * Start browsing for nearby hosts.
     * Call invite() when the user picks a peer from the discovered list.
     */
    export function browse(opts: {
        on_peer_found?: (peer: PeerInfo) => void;
        on_peer_lost?: (peer_id: string) => void;
        on_track_info?: (info: TrackInfoCmd) => void;
    } = {}) {
        role = 'guest';
        discovered_peers.clear();
        track_info_callback = opts.on_track_info ?? null;
        reset_guest_sync_state();

        ptp().onPeerFound = (peer) => {
            discovered_peers.set(peer.peerId, peer);
            opts.on_peer_found?.(peer);
        };

        ptp().onPeerLost = (peer_id) => {
            discovered_peers.delete(peer_id);
            opts.on_peer_lost?.(peer_id);
        };

        ptp().onConnectionStateChanged = (peer_id, state) => {
            if (state === 'connected') {
                const peer = discovered_peers.get(peer_id) ?? { peerId: peer_id, displayName: '', discoveryInfo: {} };
                if (!connected_peers.some(p => p.peerId === peer_id)) {
                    connected_peers.push(peer);
                }
                haptic('success');
                // Measure clock offset + RTT immediately, then keep it fresh.
                send_ping();
                if (ping_interval) clearInterval(ping_interval);
                ping_interval = setInterval(send_ping, PING_MS);
                emit_status();
            } else if (state === 'notConnected') {
                connected_peers = connected_peers.filter(p => p.peerId !== peer_id);
                if (ping_interval) { clearInterval(ping_interval); ping_interval = null; }
                reset_guest_sync_state();
                haptic('warn');
                emit_status();
            }
        };

        ptp().onMessageReceived = (peer_id, raw) => handle_message(peer_id, raw);
        ptp().startBrowsing(SERVICE_NAME);
        register_guest_listeners();
        emit_status();
    }

    /** Send a connection invitation to a discovered peer (guest side). */
    export function invite(peer_id: string) {
        ptp().invitePeer(peer_id, '', 30);
    }

    /** Peers visible to the browser before any connection is made. */
    export function get_discovered_peers(): PeerInfo[] {
        return [...discovered_peers.values()];
    }

    export function get_connected_peers(): PeerInfo[] {
        return connected_peers.slice();
    }

    /**
     * Call this whenever the host seeks so guests snap immediately (instead of
     * waiting for the next heartbeat). Hook into wherever the host UI seeks.
     */
    export function on_seek(position: number) {
        if (role !== 'host' || connected_peers.length === 0) return;
        void broadcast_current_sync(position);
    }

    /** Broadcast encoded track info to all connected guests. Call from the host screen. */
    export function broadcast_track_info(track: Track, position: number, is_playing: boolean) {
        if (role !== 'host' || connected_peers.length === 0) return;
        const artwork = typeof track.playback?.artwork === 'string' ? track.playback.artwork : track.artwork_url;
        broadcast_cmd({
            cmd: 'track_info',
            title: track.title,
            artists_str: track.artists.map(a => a.name).join(', '),
            artwork_url: artwork,
            youtube_id: track.youtube_id,
            youtubemusic_id: track.youtubemusic_id,
            soundcloud_id: track.soundcloud_id,
            spotify_id: track.spotify_id,
            soundcloud_permalink: track.soundcloud_permalink,
            position,
            is_playing,
        });
    }

    /** Tear down the session, stop advertising/browsing, clean up listeners. */
    export function disconnect() {
        listener_removers.forEach(r => r());
        listener_removers = [];
        if (queue_unsub) { queue_unsub(); queue_unsub = null; }
        if (heartbeat_interval) { clearInterval(heartbeat_interval); heartbeat_interval = null; }
        if (ping_interval) { clearInterval(ping_interval); ping_interval = null; }
        reset_guest_sync_state();
        recent_unplayable_skip.clear();
        connected_peers = [];
        discovered_peers.clear();
        invited_peers.clear();
        role = 'idle';
        last_queue_payload_signature = '';
        track_info_callback = null;
        sync_seq = 0;
        host_play_intent = true;
        ptp_instance?.destroy();
        ptp_instance = null;
        emit_status();
    }

    export function is_connected(): boolean {
        return connected_peers.length > 0;
    }

    export function get_role(): 'host' | 'guest' | 'idle' {
        return role;
    }

    export function get_status(): P2PStatus {
        return {
            role,
            connected: connected_peers.length > 0,
            connected_peer_count: connected_peers.length,
            guest_can_control,
            waiting_for_guests: false,
            loading: role === 'guest' ? guest_loading : false,
        };
    }

    export function subscribe_status(listener: (s: P2PStatus) => void): () => void {
        status_listeners.add(listener);
        // emit current state immediately so subscribers don't have to query
        try { listener(get_status()); } catch { /* see emit_status */ }
        return () => { status_listeners.delete(listener); };
    }

    // ─── Permission API (host) / control requests (guest) ──────────

    export function set_guest_can_control(allow: boolean) {
        guest_can_control = allow;
        if (role === 'host') broadcast_cmd({ cmd: 'permissions', guest_can_control: allow });
        emit_status();
    }

    /** True if this device is allowed to control playback. Always true for host/idle. */
    export function can_control(): boolean {
        if (role !== 'guest') return true;
        return guest_can_control;
    }

    export function request_play() {
        if (role !== 'guest' || !guest_can_control) return;
        broadcast_cmd({ cmd: 'req_play' });
    }
    export function request_pause() {
        if (role !== 'guest' || !guest_can_control) return;
        broadcast_cmd({ cmd: 'req_pause' });
    }
    export function request_seek(position: number) {
        if (role !== 'guest' || !guest_can_control) return;
        broadcast_cmd({ cmd: 'req_seek', position });
    }
    export function request_next() {
        if (role !== 'guest' || !guest_can_control) return;
        broadcast_cmd({ cmd: 'req_next' });
    }
    export function request_prev() {
        if (role !== 'guest' || !guest_can_control) return;
        broadcast_cmd({ cmd: 'req_prev' });
    }

    // ─── Clock sync (guest pings, host replies) ────────────────────

    function send_ping() {
        if (role !== 'guest' || connected_peers.length === 0) return;
        broadcast_cmd({ cmd: 'ping', t0: Date.now() });
    }

    // NTP-style single round trip. With t0 = our send time, t1 = responder's
    // receive time, t2 = our receive time:
    //   rtt    = t2 - t0
    //   offset = t1 - (t0 + t2)/2   (responder_clock - our_clock)
    function handle_pong(t0: number, t1: number) {
        const t2 = Date.now();
        const sample_rtt = Math.max(0, t2 - t0);
        const sample_offset = t1 - (t0 + t2) / 2;
        // Exponential smoothing; seed on the first valid sample.
        if (!clock_offset_valid) {
            rtt = Math.max(20, Math.round(sample_rtt));
            clock_offset = sample_offset;
            clock_offset_valid = true;
        } else {
            rtt = Math.max(20, Math.round(0.7 * rtt + 0.3 * sample_rtt));
            clock_offset = 0.7 * clock_offset + 0.3 * sample_offset;
        }
    }

    // Estimate the host's clock "now" from our local clock.
    function host_now(): number {
        return Date.now() + clock_offset;
    }

    // ─── Host: build & broadcast canonical state ───────────────────

    // Snapshot TrackPlayer into a `sync` message. Returns null when there's
    // nothing syncable (no active track, or the active track is an imported
    // local-only track which guests can't resolve — we skip past it instead).
    // `position_override` lets a seek broadcast its exact target instead of
    // re-reading getProgress() (which races with an un-awaited seekTo in the UI).
    async function build_sync(position_override?: number): Promise<Extract<SyncCmd, { cmd: 'sync' }> | null> {
        const idx = await TrackPlayer.getActiveTrackIndex();
        if (idx === undefined) return null;
        const track = GLOBALS.global_var.playing_tracks[idx];
        if (!track) return null;
        if (!is_empty(track.imported_id)) {
            TrackPlayer.skipToNext().catch(() => { });
            return null;
        }
        const position = position_override ?? (await TrackPlayer.getProgress()).position;
        // is_playing is the host's tracked play/pause INTENT (maintained from the
        // Playing/Paused events), never a fresh getPlaybackState() read — a read
        // taken mid-transition (Ready/Buffering right after a pause) would lie.
        return {
            cmd: 'sync',
            seq: ++sync_seq,
            host_time: Date.now(),
            track_uid: track.uid,
            position,
            is_playing: host_play_intent,
        };
    }

    async function broadcast_current_sync(position_override?: number) {
        if (role !== 'host' || connected_peers.length === 0) return;
        try {
            const s = await build_sync(position_override);
            if (s) broadcast_cmd(s);
        } catch { /* transient */ }
    }

    async function send_heartbeat() {
        if (role !== 'host' || connected_peers.length === 0) return;
        try {
            const s = await build_sync();
            if (s) broadcast_cmd(s);
        } catch { /* transient */ }
    }

    // Bring a single (freshly-joined or recovering) peer fully up to date.
    async function send_state_to_peer(peer_id: string) {
        try {
            const idx = await TrackPlayer.getActiveTrackIndex();
            if (idx === undefined) return;
            const track = GLOBALS.global_var.playing_tracks[idx];
            if (!track) return;
            if (!is_empty(track.imported_id)) {
                TrackPlayer.skipToNext().catch(() => { });
                return;
            }
            send_queue_to_peer(peer_id, idx);
            const s = await build_sync();
            if (s) send(peer_id, s);
        } catch { /* transient */ }
    }

    function send_queue_to_peer(peer_id: string, active_index: number) {
        const tracks = GLOBALS.global_var.playing_tracks
            .slice(active_index, active_index + QUEUE_PAYLOAD_LIMIT)
            .map(strip_to_wire);
        send(peer_id, { cmd: 'queue', tracks, active_index: 0 });
    }

    function broadcast_queue() {
        if (role !== 'host' || connected_peers.length === 0) return;
        TrackPlayer.getActiveTrackIndex().then(active_index => {
            if (active_index === undefined) return;
            const tracks = GLOBALS.global_var.playing_tracks
                .slice(active_index, active_index + QUEUE_PAYLOAD_LIMIT)
                .map(strip_to_wire);
            // Avoid spamming identical queue updates (the queue-modified listener
            // can fire frequently as the lazy loader appends).
            const signature = tracks.map(t => t.uid).join(',');
            if (signature === last_queue_payload_signature) return;
            last_queue_payload_signature = signature;
            broadcast_cmd({ cmd: 'queue', tracks, active_index: 0 });
        }).catch(() => { });
    }

    function register_host_listeners() {
        listener_removers.forEach(r => r());
        listener_removers = [];

        // Play / pause → update intent and push canonical state immediately.
        const state_sub = TrackPlayer.addEventListener(Event.PlaybackState, async ({ state }) => {
            if (role !== 'host') return;
            if (state === State.Playing) host_play_intent = true;
            else if (state === State.Paused || state === State.Stopped ||
                state === State.Ended || state === State.Error) host_play_intent = false;
            if (connected_peers.length === 0) return;
            if (state === State.Playing || state === State.Paused ||
                state === State.Stopped || state === State.Ended) {
                await broadcast_current_sync();
            }
        });

        // Track change (user skip OR natural advance, treated identically) →
        // push the new queue, then the new canonical state. No host pause, no
        // waiting on guests; the heartbeat keeps catching everyone up.
        const track_sub = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
            const { index } = event;
            if (role !== 'host' || connected_peers.length === 0 || index === undefined) return;
            try {
                const track = GLOBALS.global_var.playing_tracks[index];
                if (!track) return;
                // Imported tracks are local-only (no service IDs/URLs) so guests
                // can't resolve them — skip past in sync mode. The skip fires
                // another track-change we'll re-evaluate.
                if (!is_empty(track.imported_id)) {
                    TrackPlayer.skipToNext().catch(() => { });
                    return;
                }
                broadcast_queue();
                await broadcast_current_sync();
            } catch { /* transient */ }
        });

        listener_removers.push(() => state_sub.remove(), () => track_sub.remove());

        // Queue mutations (add-to-queue, remove, reorder) → keep guests' upcoming aligned.
        queue_unsub = subscribe_track_player_queue_modified(broadcast_queue);
    }

    // ─── Message handler (both roles) ──────────────────────────────

    function handle_message(peer_id: string, raw: string) {
        try {
            const msg = JSON.parse(raw) as SyncCmd;
            switch (msg.cmd) {
                case 'ping':
                    // Reply with our receive time so the sender can compute offset.
                    send(peer_id, { cmd: 'pong', t0: msg.t0, t1: Date.now() });
                    break;

                case 'pong':
                    if (role === 'guest') handle_pong(msg.t0, msg.t1);
                    break;

                case 'sync':
                    if (role !== 'guest') break;
                    enqueue_reconcile(msg);
                    break;

                case 'queue':
                    if (role !== 'guest') break;
                    enqueue_queue(msg.tracks);
                    break;

                case 'track_info':
                    if (role !== 'guest') break;
                    track_info_callback?.(msg);
                    break;

                case 'permissions':
                    if (role !== 'guest') break;
                    guest_can_control = msg.guest_can_control;
                    emit_status();
                    break;

                case 'req_play':
                    if (role !== 'host' || !guest_can_control) break;
                    TrackPlayer.play().catch(() => { });
                    break;
                case 'req_pause':
                    if (role !== 'host' || !guest_can_control) break;
                    TrackPlayer.pause().catch(() => { });
                    break;
                case 'req_seek':
                    if (role !== 'host' || !guest_can_control) break;
                    TrackPlayer.seekTo(msg.position).catch(() => { });
                    void broadcast_current_sync(msg.position);
                    break;
                case 'req_next':
                    if (role !== 'host' || !guest_can_control) break;
                    TrackPlayer.skipToNext().catch(() => { });
                    break;
                case 'req_prev':
                    if (role !== 'host' || !guest_can_control) break;
                    TrackPlayer.skipToPrevious().catch(() => { });
                    break;

                case 'unplayable':
                    if (role !== 'host') break;
                    handle_unplayable(msg.track_uid).catch(catch_log);
                    break;

                case 'request_state':
                    if (role !== 'host') break;
                    void send_state_to_peer(peer_id);
                    break;
            }
        } catch { /* malformed packet */ }
    }

    // ─── Guest: serial op chain (reconciles + queue updates) ───────

    // All guest mutations are serialized so a reconcile never observes a
    // half-applied queue (and vice versa). Reconciles coalesce to the newest
    // pending sync, so a backlog from a slow track load collapses to one.
    function enqueue_reconcile(s: Extract<SyncCmd, { cmd: 'sync' }>) {
        if (s.seq <= last_seq) return; // stale / out of order
        last_seq = s.seq;
        pending_sync = s;
        guest_chain = guest_chain.then(async () => {
            const cur = pending_sync;
            if (!cur) return; // a prior task already handled the latest
            pending_sync = null;
            await reconcile(cur);
        }).catch(() => { });
    }

    function enqueue_queue(tracks: WireTrack[]) {
        guest_chain = guest_chain.then(async () => apply_queue_update(tracks)).catch(() => { });
    }

    function set_guest_loading(v: boolean) {
        if (guest_loading === v) return;
        guest_loading = v;
        emit_status();
    }

    function reset_guest_sync_state() {
        last_seq = -1;
        pending_sync = null;
        last_reconciled_sync = null;
        guest_loading = false;
        clock_offset = 0;
        clock_offset_valid = false;
        last_request_state_at = 0;
    }

    // Seconds the host has advanced since it stamped `host_time`, accounting for
    // transport latency AND clock skew. Clamped so a bad early estimate can't
    // fling the seek bar across the track.
    function elapsed_since(host_time: number): number {
        const raw_ms = clock_offset_valid
            ? host_now() - host_time
            : Math.min(rtt, 500); // pre-offset fallback: assume ~one transit
        return Math.min(MAX_ELAPSED_S, Math.max(0, raw_ms / 1000));
    }

    // The heart of the guest: converge to the host's canonical state.
    async function reconcile(sync: Extract<SyncCmd, { cmd: 'sync' }>) {
        if (role !== 'guest') return;
        try {
            let idx: number | undefined;
            try { idx = await TrackPlayer.getActiveTrackIndex(); } catch { /* no player yet */ }
            const current = idx !== undefined ? GLOBALS.global_var.playing_tracks[idx] : undefined;

            // Wrong track (or nothing loaded) → switch onto the host's track.
            if (current?.uid !== sync.track_uid) {
                await switch_to_track(sync);
                return;
            }

            // Same track → reconcile play-state and position.
            last_reconciled_sync = sync;
            const { state } = await TrackPlayer.getPlaybackState();
            const target_position = sync.position + (sync.is_playing ? elapsed_since(sync.host_time) : 0);

            // Buffering/Loading: a seek would be unreliable, but still honor a
            // host pause so the buffer doesn't finish and start blaring while the
            // host sits silent.
            if (state === State.Buffering || state === State.Loading) {
                if (!sync.is_playing) await TrackPlayer.pause().catch(() => { });
                return;
            }

            const my_is_playing = state === State.Playing;
            if (sync.is_playing && !my_is_playing) {
                // Resume: seek to the live host position, then play. (This is the
                // path that also re-aligns position after any pause.)
                await TrackPlayer.seekTo(target_position);
                await TrackPlayer.play();
            } else if (!sync.is_playing && my_is_playing) {
                // Pause: just pause. We deliberately do NOT seek here — seeking a
                // paused stream rebuffers/glitches, and resume re-syncs position.
                await TrackPlayer.pause();
            } else if (sync.is_playing) {
                // Both playing → correct ongoing drift.
                const my_progress = await TrackPlayer.getProgress();
                if (Math.abs(my_progress.position - target_position) > DRIFT_TOLERANCE_S) {
                    await TrackPlayer.seekTo(target_position);
                }
            } else {
                // Both paused → leave position alone (no per-tick seeking of a
                // paused stream). Only follow a deliberate host scrub.
                const my_progress = await TrackPlayer.getProgress();
                if (Math.abs(my_progress.position - sync.position) > PAUSED_SEEK_THRESHOLD_S) {
                    await TrackPlayer.seekTo(sync.position);
                }
            }
        } catch { /* TP transient */ }
    }

    // Make `sync.track_uid` the active track, then re-apply the sync so we land
    // playing at the right spot. Strategies, in order:
    //   1) Track is further in our synced queue → lazily load the gap + skip.
    //   2) TP exists but the track isn't queued → append + skip (keep history).
    //   3) Cold start (no TP) → play_tracks bootstrap, then re-attach the tail.
    //   4) Track not resolvable yet → ask the host to re-send state, bail.
    async function switch_to_track(sync: Extract<SyncCmd, { cmd: 'sync' }>) {
        set_guest_loading(true);
        try {
            const target_idx = GLOBALS.global_var.playing_tracks.findIndex(t => t.uid === sync.track_uid);
            let active_index: number | undefined;
            try { active_index = await TrackPlayer.getActiveTrackIndex(); } catch { /* no player */ }

            // The desired track isn't in our hydrated list at all → we can't
            // resolve it. Ask the host to re-send the queue (+ state).
            if (target_idx < 0) {
                request_state();
                return;
            }

            if (active_index !== undefined) {
                // (1) In our queue → lazily load up to it and skip.
                const r = await skip_in_queue(target_idx);
                if (r === 'unplayable') {
                    broadcast_cmd({ cmd: 'unplayable', track_uid: sync.track_uid });
                    return;
                }
                // 'fail' falls through to the cold-start bootstrap below.
                if (r === 'ok') {
                    await apply_play_state_after_load(sync);
                    return;
                }
            }

            // (3) Cold start (or skip failed) — bootstrap with a single track so
            // play_tracks doesn't shuffle, then re-attach the synced upcoming
            // tail so the lazy loader has something to prefetch.
            const target_track = GLOBALS.global_var.playing_tracks[target_idx];
            if (!target_track) { request_state(); return; }
            const existing = GLOBALS.global_var.playing_tracks.slice();
            GLOBALS.global_var.play_tracks(target_track, [target_track], 'SyncPlay');
            await new Promise(r => setTimeout(r, 1500));
            if (existing.length > target_idx + 1) {
                const tail = existing.slice(target_idx + 1);
                GLOBALS.global_var.playing_tracks = [target_track].concat(tail);
                on_modify_track_player_queue().catch(() => { });
            }
            await apply_play_state_after_load(sync);
        } catch { /* TP transient */ } finally {
            set_guest_loading(false);
        }
    }

    // After a track load completes, apply the freshest known play-state so the
    // guest doesn't sit idle until the next heartbeat. If a newer sync arrived
    // while we were loading, prefer it.
    async function apply_play_state_after_load(loaded_for: Extract<SyncCmd, { cmd: 'sync' }>) {
        const sync = (last_reconciled_sync && last_reconciled_sync.seq > loaded_for.seq)
            ? last_reconciled_sync
            : (pending_sync && pending_sync.seq > loaded_for.seq ? pending_sync : loaded_for);
        last_reconciled_sync = sync;
        try {
            const target_position = sync.position + (sync.is_playing ? elapsed_since(sync.host_time) : 0);
            await TrackPlayer.seekTo(target_position);
            if (sync.is_playing) await TrackPlayer.play();
            else await TrackPlayer.pause();
        } catch { /* TP transient */ }
    }

    function request_state() {
        const now = Date.now();
        if (now - last_request_state_at < 3000) return;
        last_request_state_at = now;
        broadcast_cmd({ cmd: 'request_state' });
    }

    // Ensure TrackPlayer's queue is loaded up to (and including) target_idx, then
    // skip there. 'unplayable' if the *target* can't be resolved; 'fail' for any
    // other error (caller falls back to a fresh bootstrap). TP queue indices stay
    // aligned with playing_tracks because the lazy loader only appends.
    async function skip_in_queue(target_idx: number): Promise<'ok' | 'unplayable' | 'fail'> {
        try {
            const tp_queue = await TrackPlayer.getQueue();
            for (let i = tp_queue.length; i <= target_idx; i++) {
                const t = GLOBALS.global_var.playing_tracks[i];
                if (!t) return 'fail';
                if (!t.playback) t.playback = { added: false, successful: false, artwork: t.artwork_url ?? 0 };
                t.playback.added = true;
                const rn = await illusive_track_to_track_player_track(t);
                if (rn === 'skip' || rn === null) {
                    const was_target = i === target_idx;
                    GLOBALS.global_var.playing_tracks.splice(i, 1);
                    if (was_target) return 'unplayable';
                    i--; target_idx--;
                    continue;
                }
                await TrackPlayer.add(rn);
                t.playback.successful = true;
            }
            await TrackPlayer.skip(target_idx);
            return 'ok';
        } catch {
            return 'fail';
        }
    }

    // ─── Guest: queue application ──────────────────────────────────

    // Replace upcoming queue with the host's. The active track is preserved when
    // it matches wire_tracks[0]; the lazy loader picks up the new upcoming
    // entries on the next progress tick. When the host has already moved past our
    // active track we DON'T touch the queue (a reconcile will switch us onto the
    // host's track first; the following queue broadcast then aligns).
    async function apply_queue_update(wire_tracks: WireTrack[]) {
        if (wire_tracks.length === 0) return;
        const hydrated = wire_tracks.map(w => resolve_wire(w).track);
        let idx: number | undefined;
        try { idx = await TrackPlayer.getActiveTrackIndex(); } catch { /* no player */ }

        if (idx === undefined) {
            GLOBALS.global_var.playing_tracks = hydrated;
            return;
        }
        const current = GLOBALS.global_var.playing_tracks[idx];
        if (current?.uid === hydrated[0]?.uid) {
            const head = GLOBALS.global_var.playing_tracks.slice(0, idx);
            // Keep our local active track (already wired up for playback) and
            // replace the upcoming entries with the host's.
            GLOBALS.global_var.playing_tracks = head.concat([current], hydrated.slice(1));
            on_modify_track_player_queue().catch(() => { });
        }
        // else: misaligned — leave as-is; reconcile handles the track switch and
        // the host re-broadcasts the queue once we're aligned.
    }

    // ─── Wire → Track resolution ───────────────────────────────────

    // Only treat a wire track as "local" on a strict uid match (shared synced
    // library, literally the same imported Track). A fuzzy service-ID match used
    // to (a) collapse distinct songs sharing an ID into duplicates and (b) play
    // the guest's local file when the host meant to stream — so we don't do it.
    function resolve_wire(wire: WireTrack): { track: Track; is_local: boolean } {
        if (!is_empty(wire.uid)) {
            const strict = GLOBALS.global_var.sql_tracks.find(t => t.uid === wire.uid);
            if (strict) {
                return {
                    track: {
                        ...strict,
                        playback: {
                            added: false,
                            successful: false,
                            artwork: strict.playback?.artwork ?? strict.artwork_url ?? 0,
                        },
                    },
                    is_local: true,
                };
            }
        }
        return { track: hydrate_wire_track(wire), is_local: false };
    }

    function hydrate_wire_track(wire: WireTrack): Track {
        return {
            ...wire,
            playback: {
                added: false,
                successful: false,
                artwork: wire.artwork_url ?? 0,
            },
        } as Track;
    }

    // ─── Unplayable (guest → host) ─────────────────────────────────
    async function handle_unplayable(track_uid: string) {
        try {
            if (recent_unplayable_skip.has(track_uid)) return;
            const idx = await TrackPlayer.getActiveTrackIndex();
            if (idx === undefined) return;
            const current = GLOBALS.global_var.playing_tracks[idx];
            if (current?.uid !== track_uid) return;
            recent_unplayable_skip.add(track_uid);
            setTimeout(() => recent_unplayable_skip.delete(track_uid), 60_000);
            await TrackPlayer.skipToNext();
        } catch { /* TP transient */ }
    }

    // ─── Guest-side TP listeners ───────────────────────────────────
    function register_guest_listeners() {
        listener_removers.forEach(r => r());
        listener_removers = [];
        // If our local TrackPlayer errors on a track, tell the host so it skips
        // the whole room past it and we converge again.
        const err_sub = TrackPlayer.addEventListener(Event.PlaybackError, async () => {
            try {
                const idx = await TrackPlayer.getActiveTrackIndex();
                if (idx === undefined) return;
                const t = GLOBALS.global_var.playing_tracks[idx];
                if (t) broadcast_cmd({ cmd: 'unplayable', track_uid: t.uid });
            } catch { /* ignore */ }
        });
        listener_removers.push(() => err_sub.remove());
    }
}
