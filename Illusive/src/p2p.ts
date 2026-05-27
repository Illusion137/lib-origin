import { createPTP, type PeerInfo, type PTP } from "react-native-ptp";
import TrackPlayer, { Event, State } from "react-native-track-player";
import { GLOBALS } from "./globals";
import { Prefs } from "./prefs";
import type { Track } from "./types";

type SyncCmd =
    | { cmd: 'play';  position: number; execute_at: number }
    | { cmd: 'pause'; execute_at: number }
    | { cmd: 'seek';  position: number; execute_at: number }
    | { cmd: 'track'; track_uid: string; position: number; execute_at: number }
    | { cmd: 'state'; track_uid: string; position: number; is_playing: boolean; execute_at: number }
    | { cmd: 'ping';  sent_at: number }
    | { cmd: 'pong';  sent_at: number }
    | { cmd: 'track_info'; title: string; artists_str: string; artwork_url?: string;
        youtube_id?: string; youtubemusic_id?: string; soundcloud_id?: number;
        spotify_id?: string; soundcloud_permalink?: string;
        position: number; is_playing: boolean; execute_at: number }

export type { PeerInfo };
export type TrackInfoCmd = Extract<SyncCmd, { cmd: 'track_info' }>;

export namespace P2P {
    const SERVICE_NAME = "illusi-p2p";

    let ptp_instance: PTP | null = null;
    let role: 'host' | 'guest' | 'idle' = 'idle';
    // One-way latency estimate in ms, updated via ping-pong on each connection
    let rtt = 80;
    let connected_peers: string[] = [];
    const discovered_peers = new Map<string, PeerInfo>();
    // peer_id → PeerInfo for peers who sent an invitation (host side)
    const invited_peers = new Map<string, PeerInfo>();
    let pending_timers: ReturnType<typeof setTimeout>[] = [];
    let listener_removers: (() => void)[] = [];
    // Debounce: don't re-broadcast the same play/pause state twice in a row
    let last_broadcast_state: State | null = null;
    let track_info_callback: ((info: TrackInfoCmd) => void) | null = null;

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

    function schedule(fn: () => void, execute_at: number) {
        const delay = Math.max(0, execute_at - Date.now());
        pending_timers.push(setTimeout(fn, delay));
    }

    function clear_pending() {
        pending_timers.forEach(clearTimeout);
        pending_timers = [];
    }

    // Target wall-clock time for a command to execute on the guest
    function target(extra_ms = 0): number {
        return Date.now() + rtt + extra_ms;
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
        last_broadcast_state = null;

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
                connected_peers.push(peer_id);
                const peer = invited_peers.get(peer_id) ?? { peerId: peer_id, displayName: '', discoveryInfo: {} };
                opts.on_guest_connected?.(peer);
                send(peer_id, { cmd: 'ping', sent_at: Date.now() });
                void sync_state_to_peer(peer_id);
            } else if (state === 'notConnected') {
                connected_peers = connected_peers.filter(id => id !== peer_id);
                invited_peers.delete(peer_id);
                opts.on_guest_disconnected?.(peer_id);
            }
        };

        ptp().onMessageReceived = (peer_id, raw) => handle_message(peer_id, raw);
        ptp().startAdvertising(SERVICE_NAME, { name: Prefs.get_pref('p2p_name') });
        register_host_listeners();
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
                connected_peers.push(peer_id);
            } else if (state === 'notConnected') {
                connected_peers = connected_peers.filter(id => id !== peer_id);
                clear_pending();
            }
        };

        ptp().onMessageReceived = (peer_id, raw) => handle_message(peer_id, raw);
        ptp().startBrowsing(SERVICE_NAME);
    }

    /** Send a connection invitation to a discovered peer (guest side). */
    export function invite(peer_id: string) {
        ptp().invitePeer(peer_id, '', 30);
    }

    /** Peers visible to the browser before any connection is made. */
    export function get_discovered_peers(): PeerInfo[] {
        return [...discovered_peers.values()];
    }

    /**
     * Call this whenever the host seeks so guests stay in sync.
     * Hook into wherever TrackPlayer.seekTo() is called in the app UI.
     */
    export function on_seek(position: number) {
        if (role !== 'host' || connected_peers.length === 0) return;
        broadcast_cmd({ cmd: 'seek', position, execute_at: target() });
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
            execute_at: target(),
        });
    }

    /** Tear down the session, stop advertising/browsing, clean up listeners. */
    export function disconnect() {
        clear_pending();
        listener_removers.forEach(r => r());
        listener_removers = [];
        connected_peers = [];
        discovered_peers.clear();
        invited_peers.clear();
        role = 'idle';
        last_broadcast_state = null;
        track_info_callback = null;
        ptp_instance?.destroy();
        ptp_instance = null;
    }

    export function is_connected(): boolean {
        return connected_peers.length > 0;
    }

    export function get_role(): 'host' | 'guest' | 'idle' {
        return role;
    }

    // ─── Host internals ────────────────────────────────────────────

    async function sync_state_to_peer(peer_id: string) {
        try {
            const index = await TrackPlayer.getActiveTrackIndex();
            if (index === undefined) return;
            const track = GLOBALS.global_var.playing_tracks[index];
            if (!track) return;
            const progress = await TrackPlayer.getProgress();
            const { state } = await TrackPlayer.getPlaybackState();
            send(peer_id, {
                cmd: 'state',
                track_uid: track.uid,
                position: progress.position,
                is_playing: state === State.Playing,
                execute_at: target(100),
            });
        } catch (_) {}
    }

    function register_host_listeners() {
        listener_removers.forEach(r => r());
        listener_removers = [];

        const state_sub = TrackPlayer.addEventListener(Event.PlaybackState, async ({ state }) => {
            if (role !== 'host' || connected_peers.length === 0) return;
            if (state !== State.Playing && state !== State.Paused) return;
            if (state === last_broadcast_state) return;
            last_broadcast_state = state;
            try {
                const progress = await TrackPlayer.getProgress();
                if (state === State.Playing) {
                    broadcast_cmd({ cmd: 'play', position: progress.position, execute_at: target() });
                } else {
                    broadcast_cmd({ cmd: 'pause', execute_at: target() });
                }
            } catch (_) {}
        });

        const track_sub = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async ({ index }) => {
            if (role !== 'host' || connected_peers.length === 0 || index === undefined) return;
            try {
                const track = GLOBALS.global_var.playing_tracks[index];
                if (!track) return;
                const progress = await TrackPlayer.getProgress();
                last_broadcast_state = null;
                // Extra 200ms buffer on track change so guests have time to load
                broadcast_cmd({ cmd: 'track', track_uid: track.uid, position: progress.position, execute_at: target(200) });
            } catch (_) {}
        });

        listener_removers.push(() => state_sub.remove(), () => track_sub.remove());
    }

    // ─── Message handler (both roles) ──────────────────────────────

    function handle_message(peer_id: string, raw: string) {
        try {
            const msg = JSON.parse(raw) as SyncCmd;
            switch (msg.cmd) {
                case 'ping':
                    send(peer_id, { cmd: 'pong', sent_at: msg.sent_at });
                    break;

                case 'pong':
                    // Full RTT / 2 = one-way latency estimate; floor at 20ms
                    rtt = Math.max(20, Math.round((Date.now() - msg.sent_at) / 2));
                    break;

                case 'play':
                    if (role !== 'guest') break;
                    clear_pending();
                    schedule(async () => {
                        try { await TrackPlayer.seekTo(msg.position); await TrackPlayer.play(); } catch (_) {}
                    }, msg.execute_at);
                    break;

                case 'pause':
                    if (role !== 'guest') break;
                    clear_pending();
                    schedule(async () => TrackPlayer.pause().catch(() => {}), msg.execute_at);
                    break;

                case 'seek':
                    if (role !== 'guest') break;
                    clear_pending();
                    schedule(async () => TrackPlayer.seekTo(msg.position).catch(() => {}), msg.execute_at);
                    break;

                case 'track':
                    if (role !== 'guest') break;
                    clear_pending();
                    handle_track_change(msg.track_uid, msg.position, msg.execute_at);
                    break;

                case 'state':
                    if (role !== 'guest') break;
                    handle_state_sync(msg.track_uid, msg.position, msg.is_playing, msg.execute_at);
                    break;

                case 'track_info':
                    if (role !== 'guest') break;
                    track_info_callback?.(msg);
                    break;
            }
        } catch (_) {}
    }

    // Guest: host changed to a new track mid-session
    function handle_track_change(track_uid: string, position: number, execute_at: number) {
        const track = GLOBALS.global_var.sql_tracks.find(t => t.uid === track_uid);
        if (!track) return;
        schedule(() => {
            GLOBALS.global_var.play_tracks(track, [track], 'p2p');
            // Give TrackPlayer ~600ms to load before seeking
            setTimeout(async () => TrackPlayer.seekTo(position).catch(() => {}), 600);
        }, execute_at);
    }

    // Guest: initial state sync when first connecting to a host
    function handle_state_sync(track_uid: string, position: number, is_playing: boolean, execute_at: number) {
        const track = GLOBALS.global_var.sql_tracks.find(t => t.uid === track_uid);
        if (!track) return;
        // Adjust position forward to account for: host continuing to play + ~600ms load time
        const compensation_secs = (is_playing ? rtt / 1000 : 0) + 0.6;
        const adjusted_position = is_playing ? position + compensation_secs : position;
        GLOBALS.global_var.play_tracks(track, [track], 'p2p');
        setTimeout(async () => {
            try {
                await TrackPlayer.seekTo(adjusted_position);
                if (is_playing) await TrackPlayer.play();
                else await TrackPlayer.pause();
            } catch (_) {}
        }, 600);
        void execute_at; // consumed by play_tracks timing above
    }
}
