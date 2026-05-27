import {
    HybridAutoPlay,
    GridTemplate,
    ListTemplate,
    type GridButton,
    type Section,
    type HeaderActions,
} from '@iternio/react-native-auto-play';
import type { GlyphName } from '@iternio/react-native-auto-play/src/types/Glyphmap';
import { is_empty } from '@common/utils/util';
import { catch_log } from '@common/utils/error_util';
import { breadcrumb } from '@common/sentry_error_handler';
import { Prefs } from '@illusive/prefs';
import { SQLPlaylists } from '@illusive/sql/sql_playlists';
import { SQLfs } from '@illusive/sql/sql_fs';
import { resolved_artwork } from '@illusive/artwork';
import { default_compact_playlists } from '@illusive/default_playlists';
import { artist_string } from '@illusive/illusive_utils';
import { play, play_shuffle, sprinkle_into_queue } from '@illusive/illusi/src/play';
import type { Artwork, CompactPlaylistData, Track } from '@illusive/types';

type PlayMode = 'shuffle' | 'in_order' | 'mix_queue';
type GridAutoImage = GridButton<GridTemplate>['image'];

const CARPLAY_FROM = "CarPlay";
const ROOT_TITLE = "Illusi";
const GRID_MAX_BUTTONS = 8;
const LIST_MAX_ROWS = 50;
const PINNED_PLAYLIST_ORDER = ['Recently Added', 'My Library', 'Recently Played', 'Most Played'] as const;
const FALLBACK_GLYPH: GlyphName = 'library_music';

function play_mode_label(mode: PlayMode): string {
    switch (mode) {
        case 'shuffle': return 'Shuffle';
        case 'in_order': return 'In Order';
        case 'mix_queue': return 'Mix In';
    }
}

function next_play_mode(mode: PlayMode): PlayMode {
    switch (mode) {
        case 'shuffle': return 'in_order';
        case 'in_order': return 'mix_queue';
        case 'mix_queue': return 'shuffle';
    }
}

function current_play_mode(): PlayMode {
    return Prefs.get_pref('carplay_play_mode') as PlayMode;
}

async function play_tracks_with_mode(tracks: Track[], from: string, mode: PlayMode): Promise<void> {
    if (tracks.length === 0) return;
    switch (mode) {
        case 'shuffle':  await play_shuffle(tracks, from); return;
        case 'in_order': await play(tracks[0], from, () => tracks); return;
        case 'mix_queue': await sprinkle_into_queue(tracks); return;
    }
}

export async function carplay_artwork(four_track: Track[], thumbnail_uri?: string): Promise<Artwork | null> {
    if (!is_empty(thumbnail_uri)) {
        const uri = thumbnail_uri!;
        const resolved = uri.startsWith('http') ? uri : SQLfs.custom_thumbnail_directory(uri);
        return resolved_artwork(resolved);
    }
    return resolved_artwork(four_track[0]?.playback?.artwork);
}

function artwork_to_uri(artwork: Artwork | null): string | null {
    if (artwork === null) return null;
    if (typeof artwork === 'string') return artwork;
    if (typeof artwork === 'object' && 'uri' in artwork && typeof artwork.uri === 'string') return artwork.uri;
    return null;
}

function image_source_from_uri(uri: string | null): { uri: string } | null {
    if (uri === null) return null;
    return { uri: uri.startsWith('/') ? `file://${uri}` : uri };
}

function glyph_for_playlist(title: string): GlyphName {
    switch (title) {
        case 'My Library':       return 'library_music';
        case 'Recently Added':   return 'new_releases';
        case 'Recently Played':  return 'history';
        case 'Most Played':      return 'trending_up';
        case 'Least Played':     return 'trending_down';
        case 'Past Queue':       return 'queue_music';
        case 'Imported':         return 'file_download_done';
        case 'Downloaded':       return 'download';
        default:                 return FALLBACK_GLYPH;
    }
}

async function playlist_image(playlist: CompactPlaylistData): Promise<GridAutoImage> {
    const artwork = await carplay_artwork(playlist.four_track ?? [], playlist.thumbnail_uri).catch(() => null);
    const source = image_source_from_uri(artwork_to_uri(artwork));
    if (source !== null) return { type: 'asset', image: source };
    return { type: 'glyph', name: glyph_for_playlist(playlist.title) };
}

function track_subtitle(track: Track): string {
    const artists = artist_string(track);
    const album = track.album?.name;
    if (!is_empty(album) && !is_empty(artists)) return `${artists} — ${album}`;
    if (!is_empty(artists)) return artists;
    if (!is_empty(album)) return album!;
    return '';
}

function tracks_sections(tracks: Track[]): Section<ListTemplate> {
    const visible = tracks.slice(0, LIST_MAX_ROWS);
    return [
        {
            type: 'default',
            title: 'Quick Play',
            items: [
                {
                    type: 'default',
                    title: { text: 'Play All' },
                    image: { type: 'glyph', name: 'play_circle' },
                    onPress: () => {
                        breadcrumb('carplay', 'quick_play.play_all', { count: tracks.length });
                        play_tracks_with_mode(tracks, CARPLAY_FROM, 'in_order').catch(catch_log);
                    },
                },
                {
                    type: 'default',
                    title: { text: 'Shuffle' },
                    image: { type: 'glyph', name: 'shuffle' },
                    onPress: () => {
                        breadcrumb('carplay', 'quick_play.shuffle', { count: tracks.length });
                        play_tracks_with_mode(tracks, CARPLAY_FROM, 'shuffle').catch(catch_log);
                    },
                },
                {
                    type: 'default',
                    title: { text: 'Mix Into Queue' },
                    image: { type: 'glyph', name: 'queue_music' },
                    enabled: tracks.length > 0,
                    onPress: () => {
                        breadcrumb('carplay', 'quick_play.mix_queue', { count: tracks.length });
                        play_tracks_with_mode(tracks, CARPLAY_FROM, 'mix_queue').catch(catch_log);
                    },
                },
            ],
        },
        {
            type: 'default',
            title: `Tracks (${tracks.length})`,
            items: visible.map((track, index) => ({
                type: 'default' as const,
                title: { text: track.title },
                detailedText: { text: track_subtitle(track) },
                image: { type: 'glyph', name: 'music_note' },
                onPress: () => {
                    const ordered = tracks.slice(index);
                    breadcrumb('carplay', 'track.tap', { title: track.title, index, queue_size: ordered.length });
                    play(ordered[0], CARPLAY_FROM, () => ordered).catch(catch_log);
                },
            })),
        },
    ];
}

async function open_playlist(playlist: CompactPlaylistData): Promise<void> {
    breadcrumb('carplay', 'playlist.open', { title: playlist.title, type: playlist.type });
    const tracks = await playlist.track_callback();
    breadcrumb('carplay', 'playlist.tracks_loaded', { title: playlist.title, count: tracks.length });
    const list = new ListTemplate({
        title: { text: playlist.title },
        sections: tracks_sections(tracks),
    });
    await list.push();
}

let grid_template: GridTemplate | null = null;
let is_initialized = false;
let remove_connect_listener: (() => void) | null = null;
let remove_disconnect_listener: (() => void) | null = null;

async function build_playlist_button(playlist: CompactPlaylistData): Promise<GridButton<GridTemplate>> {
    const image = await playlist_image(playlist);
    return {
        title: { text: playlist.title },
        image,
        onPress: () => { open_playlist(playlist).catch(catch_log); },
    };
}

function more_playlists_button(overflow: CompactPlaylistData[]): GridButton<GridTemplate> {
    return {
        title: { text: 'More Playlists' },
        image: { type: 'glyph', name: 'playlist_play' },
        onPress: () => {
            const list = new ListTemplate({
                title: { text: 'All Playlists' },
                sections: {
                    type: 'default',
                    items: overflow.map(playlist => ({
                        type: 'default' as const,
                        title: { text: playlist.title },
                        detailedText: { text: `${playlist.track_count} tracks` },
                        image: { type: 'glyph', name: glyph_for_playlist(playlist.title) },
                        browsable: true,
                        onPress: () => { open_playlist(playlist).catch(catch_log); },
                    })),
                },
            });
            list.push().catch(catch_log);
        },
    };
}

async function build_grid_buttons(playlists: CompactPlaylistData[]): Promise<GridButton<GridTemplate>[]> {
    if (playlists.length <= GRID_MAX_BUTTONS) {
        return Promise.all(playlists.map(build_playlist_button));
    }
    const visible = playlists.slice(0, GRID_MAX_BUTTONS - 1);
    const overflow = playlists.slice(GRID_MAX_BUTTONS - 1);
    const buttons = await Promise.all(visible.map(build_playlist_button));
    buttons.push(more_playlists_button(overflow));
    return buttons;
}

function header_actions(playlists: CompactPlaylistData[], mode: PlayMode): HeaderActions<GridTemplate> {
    const mode_button = {
        type: 'text',
        title: play_mode_label(mode),
        onPress: () => cycle_play_mode(playlists),
    } as const;
    const shuffle_button = {
        type: 'image',
        image: { type: 'glyph', name: 'shuffle' },
        onPress: () => shuffle_all_libraries(playlists),
    } as const;
    return {
        ios: { trailingNavigationBarButtons: [mode_button, shuffle_button] },
        android: { endHeaderActions: [mode_button] },
    };
}

function cycle_play_mode(playlists: CompactPlaylistData[]): void {
    const next = next_play_mode(current_play_mode());
    breadcrumb('carplay', 'cycle_play_mode', { next });
    Prefs.save_pref('carplay_play_mode', next).catch(catch_log);
    grid_template?.setHeaderActions(header_actions(playlists, next)).catch(catch_log);
}

function shuffle_all_libraries(playlists: CompactPlaylistData[]): void {
    const library = playlists.find(p => p.type === 'LIBRARY') ?? playlists[0];
    if (library === undefined) return;
    breadcrumb('carplay', 'shuffle_all', { source: library.title });
    library.track_callback()
        .then(async tracks => { await play_tracks_with_mode(tracks, CARPLAY_FROM, 'shuffle'); })
        .catch(catch_log);
}

async function gather_playlists(): Promise<CompactPlaylistData[]> {
    const [default_cp, user_cp] = await Promise.all([
        default_compact_playlists(),
        SQLPlaylists.compact_playlists(),
    ]);

    const by_title = new Map(default_cp.map(p => [p.title, p]));
    const pinned = PINNED_PLAYLIST_ORDER
        .map(name => by_title.get(name))
        .filter((p): p is CompactPlaylistData => p !== undefined);

    const pinned_titles = new Set(pinned.map(p => p.title));
    const remaining_defaults = default_cp.filter(p => !pinned_titles.has(p.title));

    return [...pinned, ...remaining_defaults, ...user_cp];
}

async function build_root(): Promise<void> {
    const playlists = await gather_playlists();
    const mode = current_play_mode();
    breadcrumb('carplay', 'build_root.start', { playlist_count: playlists.length, mode });
    const buttons = await build_grid_buttons(playlists);

    grid_template = new GridTemplate({
        title: { text: ROOT_TITLE },
        buttons,
        headerActions: header_actions(playlists, mode),
    });
    await grid_template.setRootTemplate();
    breadcrumb('carplay', 'build_root.done', { button_count: buttons.length });
}

function on_connect(): void {
    breadcrumb('carplay', 'didConnect');
    build_root().catch(catch_log);
}

function on_disconnect(): void {
    breadcrumb('carplay', 'didDisconnect');
    grid_template = null;
}

export namespace CarPlayService {
    export function init(): void {
        if (is_initialized) return;
        is_initialized = true;
        breadcrumb('carplay', 'service.init', { already_connected: HybridAutoPlay.isConnected() });
        remove_connect_listener = HybridAutoPlay.addListener('didConnect', on_connect);
        remove_disconnect_listener = HybridAutoPlay.addListener('didDisconnect', on_disconnect);
        if (HybridAutoPlay.isConnected()) on_connect();
    }

    export function destroy(): void {
        breadcrumb('carplay', 'service.destroy');
        remove_connect_listener?.();
        remove_disconnect_listener?.();
        remove_connect_listener = null;
        remove_disconnect_listener = null;
        grid_template = null;
        is_initialized = false;
    }

    export function refresh(): void {
        if (!is_initialized || !HybridAutoPlay.isConnected()) return;
        breadcrumb('carplay', 'service.refresh');
        build_root().catch(catch_log);
    }
}
