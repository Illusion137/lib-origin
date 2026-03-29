import { HybridAutoPlay, GridTemplate } from '@iternio/react-native-auto-play';
import type { GridButton } from '@iternio/react-native-auto-play';
import { Prefs } from '@illusive/prefs';
import { SQLPlaylists } from '@illusive/sql/sql_playlists';
import { default_compact_playlists } from '@illusive/default_playlists';
import type { Artwork, CompactPlaylistData, Track } from '@illusive/types';
import { is_empty } from '@common/utils/util';
import { catch_log } from '@common/utils/error_util';
import { resolved_artwork } from '@illusive/artwork';
import { SQLfs } from '@illusive/sql/sql_fs';
import { play, play_shuffle, sprinkle_into_queue } from '@illusive/illusi/src/play';

export async function carplay_artwork(four_track: Track[], thumbnail_uri?: string): Promise<Artwork | null> {
    if (!is_empty(thumbnail_uri)) {
        const resolved_thumbnail_uri = thumbnail_uri!.includes('https:')
            ? thumbnail_uri!
            : SQLfs.custom_thumbnail_directory(thumbnail_uri!);
        return resolved_artwork(resolved_thumbnail_uri);
    }
    return resolved_artwork(four_track[0]?.playback?.artwork);
}

type PlayMode = 'shuffle' | 'in_order' | 'mix_queue';

let grid_template: GridTemplate | null = null;
let is_initialized = false;
let remove_connect_listener: (() => void) | null = null;
let remove_disconnect_listener: (() => void) | null = null;

function play_mode_label(mode: PlayMode): string {
    switch (mode) {
        case 'shuffle': return '🔀 Shuffle';
        case 'in_order': return '▶ In Order';
        case 'mix_queue': return '➕ Mix In';
    }
}

function next_play_mode(mode: PlayMode): PlayMode {
    switch (mode) {
        case 'shuffle': return 'in_order';
        case 'in_order': return 'mix_queue';
        case 'mix_queue': return 'shuffle';
    }
}

const carplay_title = "CarPlay";

async function play_playlist(playlist: CompactPlaylistData): Promise<void> {
    const mode = Prefs.get_pref('carplay_play_mode') as PlayMode;
    const tracks = await playlist.track_callback();
    if (tracks.length === 0) return;

    switch (mode) {
        case 'shuffle': {
            await play_shuffle(tracks, carplay_title);
            break;
        }
        case 'in_order': {
            await play(tracks[0], carplay_title, () => tracks);
            break;
        }
        case 'mix_queue': {
            await sprinkle_into_queue(tracks);
            break;
        }
    }
}

// ─── Grid template ────────────────────────────────────────────────────────────

async function build_grid_buttons(playlists: CompactPlaylistData[]): Promise<GridButton<GridTemplate>[]> {
    const buttons: GridButton<GridTemplate>[] = [];
    for (const playlist of playlists) {
        const artwork = await carplay_artwork(
            playlist.four_track ?? [],
            (playlist as { thumbnail_uri?: string }).thumbnail_uri,
        ).catch(() => null);
        const artwork_url = typeof artwork === 'string' && /^https?:\/\//.test(artwork) ? artwork : null;

        const button: GridButton<GridTemplate> = {
            title: { text: playlist.title },
            image: artwork_url
                ? { type: 'asset', image: { uri: artwork_url } }
                : { type: 'glyph', name: 'library_music' },
            onPress: () => { play_playlist(playlist).catch(catch_log); },
        };
        buttons.push(button);
    }
    return buttons;
}

async function build_grid_template(playlists: CompactPlaylistData[], mode: PlayMode): Promise<GridTemplate> {
    const buttons = await build_grid_buttons(playlists);
    return new GridTemplate({
        title: { text: 'Illusi' },
        buttons,
        headerActions: {
            ios: {
                trailingNavigationBarButtons: [
                    { type: 'text', title: play_mode_label(mode), onPress: () => cycle_play_mode(playlists) },
                ],
            },
        },
    });
}

function cycle_play_mode(playlists: CompactPlaylistData[]): void {
    const current = Prefs.get_pref('carplay_play_mode') as PlayMode;
    const next = next_play_mode(current);
    Prefs.save_pref('carplay_play_mode', next).catch(catch_log);

    build_grid_template(playlists, next).then(new_grid => {
        grid_template = new_grid;
        new_grid.setRootTemplate().catch(catch_log);
    }).catch(catch_log);
}

// ─── Root builder ─────────────────────────────────────────────────────────────

async function build_root(): Promise<void> {
    const [default_cp, user_cp] = await Promise.all([
        default_compact_playlists(),
        SQLPlaylists.compact_playlists(),
    ]);
    // default_compact_playlists returns My Library first — skip it
    const playlists: CompactPlaylistData[] = [
        ...default_cp.slice(1),
        ...user_cp,
    ];

    const mode = Prefs.get_pref('carplay_play_mode') as PlayMode;
    grid_template = await build_grid_template(playlists, mode);
    await grid_template.setRootTemplate();
}

// ─── Public API ───────────────────────────────────────────────────────────────

const on_connect = () => {
    build_root().catch(catch_log);
};

const on_disconnect = () => {
    grid_template = null;
};

export const CarPlayService = {
    init() {
        if (is_initialized) return;
        is_initialized = true;
        remove_connect_listener = HybridAutoPlay.addListener('didConnect', on_connect);
        remove_disconnect_listener = HybridAutoPlay.addListener('didDisconnect', on_disconnect);
        if (HybridAutoPlay.isConnected()) on_connect();
    },

    destroy() {
        remove_connect_listener?.();
        remove_disconnect_listener?.();
        remove_connect_listener = null;
        remove_disconnect_listener = null;
        grid_template = null;
        is_initialized = false;
    },
};
