import TrackPlayer, { Event } from 'react-native-track-player';
import type { EventPayloadByEvent } from 'react-native-track-player';
import { type GridButton, type ListSection, type GridTemplate, type ListTemplate, type TabBarTemplate, CarPlay } from 'react-native-carplay';
import { Prefs } from '@illusive/prefs';
import { GLOBALS } from '@illusive/globals';
import { SQLPlaylists } from '@illusive/sql/sql_playlists';
import { default_compact_playlists } from '@illusive/default_playlists';
import type { Artwork, CompactPlaylistData, Track } from '@illusive/types';
import { is_empty, shuffle_array } from '@common/utils/util';
import { insert_track_into_player_queue, on_modify_track_player_queue } from '@illusive/track_player_service';
import { SQLTracks } from '@illusive/sql/sql_tracks';
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

interface LyricsSection {
    header: string | null;
    lines: string[];
}

let grid_template: GridTemplate | null;
let list_template: ListTemplate | null;
let tab_template: TabBarTemplate | null;
let current_lyric_sections: LyricsSection[] = [];
let current_lyric_section_idx = 0;
let tp_subscriptions: ReturnType<typeof TrackPlayer.addEventListener>[] = [];
let is_initialized = false;

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

    switch(mode){
        case "shuffle": {
            await play_shuffle(tracks, carplay_title);
            break;
        }
        case "in_order": {
            await play(tracks[0], carplay_title, () => tracks);
            break;
        }
        case "mix_queue": {
            await sprinkle_into_queue(tracks);
            break;
        }
    }
}

function build_player_sections(track: Track | null): ListSection[] {
    const now_playing_item = track
        ? [{
            text: track.title,
            detailText: track.artists?.map((a: { name: string }) => a.name).join(', ') ?? '',
            image: (() => {
                const art = track.playback?.artwork;
                if (!art) return undefined;
                if (typeof art === 'string') return { uri: art };
                if (typeof art === 'number') return art;
                return art;
            })(),
            isPlaying: GLOBALS.global_var.is_playing,
        }]
        : [{ text: 'Nothing playing', detailText: '' }];

    const sections: ListSection[] = [
        { header: 'Now Playing', items: now_playing_item },
    ];
    return sections;
}

async function refresh_player_tab(): Promise<void> {
    if (!list_template) return;
    const idx = await TrackPlayer.getActiveTrackIndex().catch(() => undefined);
    const track = idx !== undefined ? GLOBALS.global_var.playing_tracks[idx] ?? null : null;

    // Load lyrics if changed
    if (track && !is_empty(track.lyrics_uri)) {
        const raw = await SQLTracks.read_track_lyrics(track).catch(() => undefined);
        if (typeof raw === 'string') {
            current_lyric_sections = parse_lyric_sections(raw);
        } else {
            current_lyric_sections = [];
        }
    } else {
        current_lyric_sections = [];
    }
    current_lyric_section_idx = 0;

    list_template.updateSections(build_player_sections(track, current_lyric_sections, 0));
}

// ─── Grid template ────────────────────────────────────────────────────────────

async function build_grid_buttons(playlists: CompactPlaylistData[]): Promise<GridButton[]> {
    const buttons: GridButton[] = [];
    for (const playlist of playlists) {
        const artwork_uri = await carplay_artwork(
            playlist.four_track ?? [],
            (playlist as { thumbnail_uri?: string }).thumbnail_uri,
        ).catch(() => null);

        const image = artwork_uri && /^https?:\/\//.test(artwork_uri)
            ? { uri: artwork_uri }
            : undefined;

        const button: GridButton = {
            id: playlist.title,
            titleVariants: [playlist.title, playlist.title.slice(0, 15)],
        };
        if (image) button.image = image;
        buttons.push(button);
    }
    return buttons;
}

async function build_grid_template(playlists: CompactPlaylistData[], mode: PlayMode): Promise<GridTemplate> {
    const buttons = await build_grid_buttons(playlists);
    const GridTemplateCls = getGridTemplate();
    return new GridTemplateCls({
        id: 'illusi-grid',
        title: 'Illusi',
        tabTitle: 'Playlists',
        tabSystemImageName: 'music.note.list',
        buttons,
        trailingNavigationBarButtons: [
            { id: 'play_mode', type: 'text', title: play_mode_label(mode) },
        ],
        onButtonPressed: ({ id }) => {
            const playlist = playlists.find(p => p.title === id);
            if (playlist) play_playlist(playlist).catch(catch_log);
        },
        onBarButtonPressed: ({ id }) => {
            if (id === 'play_mode') cycle_play_mode(playlists);
        },
    });
}

function cycle_play_mode(playlists: CompactPlaylistData[]): void {
    const current = Prefs.get_pref('carplay_play_mode') as PlayMode;
    const next = next_play_mode(current);
    Prefs.save_pref('carplay_play_mode', next).catch(catch_log);

    // Rebuild grid with new mode label
    build_grid_template(playlists, next).then(new_grid => {
        if (!tab_template) return;
        grid_template = new_grid;
        tab_template.updateTemplates({
            templates: [new_grid, list_template!],
            title: tab_template.config.title,
            onTemplateSelect: tab_template.config.onTemplateSelect,
        });
    }).catch(catch_log);
}

// ─── Root builder ─────────────────────────────────────────────────────────────

async function build_root(): Promise<void> {
    // Fetch playlists: default playlists (skip "My Library") + user playlists
    const [default_cp, user_cp] = await Promise.all([
        default_compact_playlists(),
        SQLPlaylists.compact_playlists(),
    ]);
    // // default_compact_playlists returns My Library first — skip it
    const playlists: CompactPlaylistData[] = [
        ...default_cp.slice(1),
        ...user_cp,
    ];

    const mode = Prefs.get_pref('carplay_play_mode') as PlayMode;

    // Build Tab 1: Grid
    grid_template = await build_grid_template(playlists, mode);

    // // Build Tab 2: Player list
    // list_template = new (getListTemplate())({
    //     id: 'illusi-player',
    //     title: 'Player',
    //     tabTitle: 'Player',
    //     tabSystemImageName: 'play.circle',
    //     sections: build_player_sections(null, [], 0),
    //     emptyViewTitleVariants: ['Nothing Playing'],
    //     emptyViewSubtitleVariants: ['Play a playlist to see track info and lyrics here'],
    //     trailingNavigationBarButtons: [
    //         { id: 'prev', type: 'text', title: '⏮' },
    //         { id: 'next', type: 'text', title: '⏭' },
    //     ],
    //     onBarButtonPressed: ({ id }) => {
    //         if (id === 'prev') TrackPlayer.skipToPrevious().catch(catch_log);
    //         if (id === 'next') TrackPlayer.skipToNext().catch(catch_log);
    //     },
    //     onItemSelect: async () => { /* lyrics lines are non-interactive */ },
    // });

    // // Build root TabBar
    tab_template = new (getTabBarTemplate())({
        id: 'illusi-tabbar',
        templates: [grid_template, list_template],
        onTemplateSelect: () => { /* no-op */ },
    });

    CarPlay.setRootTemplate(tab_template, true);

    // Populate player tab with current state if already playing
    if (GLOBALS.global_var.is_playing) {
        await refresh_player_tab().catch(catch_log);
    }
}

// ─── TrackPlayer event subscriptions ─────────────────────────────────────────

function subscribe_to_track_player(): void {
    tp_subscriptions.push(
        TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, (_e: EventPayloadByEvent[Event.PlaybackActiveTrackChanged]) => {
            refresh_player_tab().catch(catch_log);
        }),
    );

    tp_subscriptions.push(
        TrackPlayer.addEventListener(Event.PlaybackState, (_e: EventPayloadByEvent[Event.PlaybackState]) => {
            // Refresh now-playing section's isPlaying flag
            refresh_player_tab().catch(catch_log);
        }),
    );
}

function unsubscribe_from_track_player(): void {
    tp_subscriptions.forEach(s => s.remove());
    tp_subscriptions = [];
}

// ─── Public API ───────────────────────────────────────────────────────────────

const on_connect = () => {
    build_root().catch(catch_log);
    subscribe_to_track_player();
};

const on_disconnect = () => {
    unsubscribe_from_track_player();
    grid_template = null;
    list_template = null;
    tab_template = null;
    current_lyric_sections = [];
    current_lyric_section_idx = 0;
};

export const CarPlayService = {
    init() {
        if (is_initialized) return;
        is_initialized = true;
        CarPlay.registerOnConnect(on_connect);
        CarPlay.registerOnDisconnect(on_disconnect);
        // In case CarPlay is already connected when init is called
        if (CarPlay.connected) on_connect();
    },

    destroy() {
        CarPlay.unregisterOnConnect(on_connect);
        CarPlay.unregisterOnDisconnect(on_disconnect);
        unsubscribe_from_track_player();
        is_initialized = false;
    },
};
