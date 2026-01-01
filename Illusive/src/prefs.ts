import { CookieJar } from "@common/utils/cookie_util";
import type { HexColor, LinkerLink, Track } from '@illusive/types';
import { gen_uuid } from '@common/utils/util';
import { base_load_map, base_save_map, generic_load_prefs, generic_reset_prefs, generic_save_pref, type BasePref, type BasePrefLoadMap, type BasePrefSaveMap, type BasePrefTypes } from '@native/mmkv/mmkv_utils';
import { fs } from '@native/fs/fs';
import type { MMKVModule } from '@native/mmkv/mmkv.base';
import { Constants } from "./constants";
import { load_native_mmkv, mmkv } from "@native/mmkv/mmkv";
import { force_json_parse_array } from "@common/utils/parse_util";

export namespace Prefs {
    export type OtherPrefTypes = "BIAS"|"LINKER_LINKS"|"PAST_QUEUE";

    export type PossibleThemes = keyof typeof themes;

    export async function load_mmkv_module(){
        await load_native_mmkv();
        await mmkv().load_mmkv({
            id: 'illusi.illusion.com',
            path: await fs().document_directory(".illusi", "ipref.mmkv")
        });
    }

    const user_uuid = gen_uuid();

    export const equalizer_presets = {
        "Default": [0, 0, 0, 0, 0, 0],
        "Bass Boost": [6, 4, 2, 0, -2, -4],
        "Treble Boost": [-2, -1, 0, 2, 4, 6],
        "Vocal Boost": [-2, -1, 1, 3, 4, 2],
        "Loudness": [5, 3, 1, 0, 2, 4],
        "Rock": [4, 2, 1, 1, 3, 5],
        "Pop": [-1, 1, 3, 4, 2, 1],
        "Classical": [0, 1, 2, 1, 0, 2],
        "Jazz": [2, 2, 1, 0, 2, 3],
        "Electronic": [5, 3, 0, 1, 4, 6],
        "Hip-Hop": [6, 4, 2, 0, 1, -1],
        "Acoustic": [-1, 0, 2, 3, 2, 1],
        "Dance": [5, 3, 0, 2, 4, 5],
        "Podcast": [-3, -2, 1, 3, 4, 3],
        "Movie": [4, 2, 0, 2, 3, 4]
    } as const;
    export type EqualizerPreset = keyof typeof equalizer_presets;
    interface PastQueue { index: number; tracks: Track[]; }

    export const default_track_shuffle_bias = {
        total_plays: 0,
        too_long_duration: 0,
        too_short_duration: 0,
        last_played: 0,
        recent_add_date: 0,
        is_downloaded: 0,
        has_thumbnail_dl: 0,
        has_lyrics_dl: 0,
        plays_from_artist: 0,
        plays_from_album: 0,
        plays_in_past_month: 0,
        explicit: 0,
        no_explicit: 0
    };
    type Bias = typeof default_track_shuffle_bias;

    export const prefs = {
        legacy_prefs:                          {default_value: "", current_value: "", type: "STRING"} as BasePref<string, OtherPrefTypes>,
        youtube_cookie_jar:                    {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as BasePref<CookieJar, OtherPrefTypes>,
        youtube_music_cookie_jar:              {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as BasePref<CookieJar, OtherPrefTypes>,
        soundcloud_cookie_jar:                 {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as BasePref<CookieJar, OtherPrefTypes>,
        spotify_cookie_jar:                    {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as BasePref<CookieJar, OtherPrefTypes>,
        amazon_music_cookie_jar:               {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as BasePref<CookieJar, OtherPrefTypes>,
        apple_music_cookie_jar:                {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as BasePref<CookieJar, OtherPrefTypes>,
        bandlab_cookie_jar:                    {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as BasePref<CookieJar, OtherPrefTypes>,
        user_uuid:                             {default_value: user_uuid, current_value: user_uuid, type: "STRING"} as BasePref<string, OtherPrefTypes>,
        last_synced:                           {default_value: new Date(0), current_value: new Date(0), type: "DATE"} as BasePref<Date, OtherPrefTypes>,
        automatic_new_releases_last_refreshed: {default_value: new Date(0), current_value: new Date(0), type: "DATE"} as BasePref<Date, OtherPrefTypes>,
        new_releases_last_refreshed:           {default_value: new Date(0), current_value: new Date(0), type: "DATE"} as BasePref<Date, OtherPrefTypes>,
        discord_webhook_url:                   {default_value: '', current_value: '', type: "STRING"}       as BasePref<string, OtherPrefTypes>,
        latest_version:                        {default_value: "16.2.5", current_value: "16.2.5", type: "STRING"} as BasePref<string, OtherPrefTypes>,
        database_version:                        {default_value: "17.2.0", current_value: "17.2.0", type: "STRING"} as BasePref<string, OtherPrefTypes>,
        recent_searches:                       {default_value: [], current_value: [], type: "STRING_ARRAY"}         as BasePref<string[], OtherPrefTypes>,
        equalizer_preset:                      {default_value: "Default", current_value: "Default", type: "STRING"} as BasePref<EqualizerPreset, OtherPrefTypes>,
        crossfade:                             {default_value: 0, current_value: 0, type: "NUMBER"}         as BasePref<number, OtherPrefTypes>,
        past_queue:                            {default_value: {index: 0, tracks: []}, current_value: {index: 0, tracks: []}, type: "PAST_QUEUE"} as BasePref<PastQueue, OtherPrefTypes>,
        last_sleep_timer_ms:                   {default_value: 0, current_value: 0, type: "NUMBER"}                 as BasePref<number, OtherPrefTypes>,
        linker_links:                          {default_value: [], current_value: [], type: "LINKER_LINKS"} as BasePref<LinkerLink[], OtherPrefTypes>,
        primary_color:                         {default_value: '#7400fe', current_value: '#7400fe', type: "STRING"}       as BasePref<HexColor, OtherPrefTypes>,
        theme:                                 {default_value: 'dark', current_value: 'dark', type: "STRING"}       as BasePref<PossibleThemes, OtherPrefTypes>,
        track_shuffle_bias:                    {default_value: default_track_shuffle_bias, current_value: default_track_shuffle_bias, type: "BIAS"}       as BasePref<Bias, OtherPrefTypes>,
        
        default_playlist_max_size:             {default_value: 200, current_value: 200, type: "NUMBER", visible: true, section: "Playlist"}       as BasePref<number, OtherPrefTypes>,
        recently_played_max_size:              {default_value: 100, current_value: 100, type: "NUMBER", visible: true, section: "Playlist"}       as BasePref<number, OtherPrefTypes>,
        fuzzy_search_threshold:                {default_value: 50, current_value: 100, type: "NUMBER", range: {start: 0, end: 100}, visible: true, section: "Playlist", description: "The minimum confidence for Illusi's fuzzy-search  (0-100%)"}       as BasePref<number, OtherPrefTypes>,
        default_to_strict_search:              {default_value: false, current_value: false, type: "BOOLEAN", visible: true, section: "Interactions", description: "Your searches will default to the strict-search over fuzzy-search"} as BasePref<boolean, OtherPrefTypes>,
        new_releases_hide_unknowns:            {default_value: false, current_value: false, type: "BOOLEAN", visible: true, section: "Visual", description: "Hide all artists you've never seen in New-Releases"} as BasePref<boolean, OtherPrefTypes>,
        compact_playlists:                     {default_value: false, current_value: false, type: "BOOLEAN", visible: true, section: "Visual", description: "Your playlists in the 'Playlists' screen will become smaller"} as BasePref<boolean, OtherPrefTypes>,
        album_track_tinting:                   {default_value: false, current_value: false, type: "BOOLEAN", visible: true, section: "Visual", description: "Tints all tracks in a album a different color so that it is easier to differentiate"}  as BasePref<boolean, OtherPrefTypes>,
        only_play_downloaded:                  {default_value: false, current_value: false, type: "BOOLEAN", visible: true, section: "Interactions", description: "Only play downloaded tracks (except searched ones)"}  as BasePref<boolean, OtherPrefTypes>,
        always_shuffle:                        {default_value: true, current_value: true, type: "BOOLEAN", visible: true, section: "Interactions", description: "Always shuffle user-made playlists and library"}    as BasePref<boolean, OtherPrefTypes> ,
        play_without_popup:                    {default_value: false, current_value: false, type: "BOOLEAN", visible: true, section: "Interactions", description: "Prevents Audioplayer from popping up when playing a new queue"} as BasePref<boolean, OtherPrefTypes>,
        auto_download:                         {default_value: false, current_value: false, type: "BOOLEAN", visible: true, section: "Automation", description: "Download track media whenever added to library"}  as BasePref<boolean, OtherPrefTypes>,
        auto_cache_thumbnails:                 {default_value: false, current_value: false, type: "BOOLEAN", visible: true, section: "Automation", description: "Download track thumbnail whenever added to library"}  as BasePref<boolean, OtherPrefTypes>,
        auto_cache_lyrics:                     {default_value: false, current_value: false, type: "BOOLEAN", visible: true, section: "Automation", description: "Download track lyrics whenever added to library"}  as BasePref<boolean, OtherPrefTypes>,
        expensive_wifi_only:                   {default_value: true, current_value: true, type: "BOOLEAN", visible: true, section: "Data", description: "Many expensive network based operations will only happen on WiFi"}    as BasePref<boolean, OtherPrefTypes>,
        warmup_youtube:                   {default_value: false, current_value: false, type: "BOOLEAN", visible: true, section: "Data", description: "Load YouTube Client on startup"}    as BasePref<boolean, OtherPrefTypes>,
        warmup_soundcloud:                   {default_value: false, current_value: false, type: "BOOLEAN", visible: true, section: "Data", description: "Load Soundcloud Client on startup"}    as BasePref<boolean, OtherPrefTypes>,
        
        // Settings that have a chance of breaking things; use with caution; all disabled by default
        enable_linker:                         {default_value: false, current_value: false, type: "BOOLEAN", visible: true, show_type: "EXPERIMENTAL", section: "Automation"}  as BasePref<boolean, OtherPrefTypes>,
        enable_sampler:                        {default_value: false, current_value: false, type: "BOOLEAN", visible: true, show_type: "EXPERIMENTAL", section: "Automation"}  as BasePref<boolean, OtherPrefTypes>,
        fastpack:                              {default_value: false, current_value: false, type: "BOOLEAN", visible: true, show_type: "EXPERIMENTAL", section: "Automation"}  as BasePref<boolean, OtherPrefTypes>,
        quick_fixer_upper:                     {default_value: false, current_value: false, type: "BOOLEAN", visible: true, show_type: "EXPERIMENTAL", section: "Automation", description: "May slow down app; only use when necessary"}  as BasePref<boolean, OtherPrefTypes>,
        use_cookies_on_download:               {default_value: false, current_value: false, type: "BOOLEAN", visible: true, show_type: "EXPERIMENTAL", section: "Data"}  as BasePref<boolean, OtherPrefTypes>,
        use_cookies_on_search:                 {default_value: false, current_value: false, type: "BOOLEAN", visible: true, show_type: "EXPERIMENTAL", section: "Data"}  as BasePref<boolean, OtherPrefTypes>,
        use_cookies_on_artist:                 {default_value: false, current_value: false, type: "BOOLEAN", visible: true, show_type: "EXPERIMENTAL", section: "Data"}  as BasePref<boolean, OtherPrefTypes>,
        dev_mode:                              {default_value: false, current_value: false, type: "BOOLEAN", visible: true, show_type: "EXPERIMENTAL", section: "Other", description: "(Modification may require restart)"}  as BasePref<boolean, OtherPrefTypes>,
    };
    export type PrefOptions = keyof typeof prefs;
    const user_uuid_key: PrefOptions = "user_uuid";

    export function get_pref<T extends PrefOptions>(pref_key: T): (typeof prefs)[T]['default_value'] { return prefs[pref_key].current_value; }

    export const illusi_pref_load_map: BasePrefLoadMap<BasePrefTypes | OtherPrefTypes, unknown> = {
        ...base_load_map,
        LINKER_LINKS: async(mod: MMKVModule, pref_key: string) => force_json_parse_array(await mod.get_string(pref_key) ?? "[]"),
        PAST_QUEUE: async(mod: MMKVModule, pref_key: string) => force_json_parse_array(await mod.get_string(pref_key) ?? '{"index":0,"tracks":[]}'),
        BIAS: async(mod: MMKVModule, pref_key: string) => force_json_parse_array(await mod.get_string(pref_key) ?? JSON.stringify(default_track_shuffle_bias)),
    };
    export const illusi_pref_save_map: BasePrefSaveMap<BasePrefTypes | OtherPrefTypes, unknown> = {
        ...base_save_map,
        LINKER_LINKS: async(mod: MMKVModule, pref_key: string, value: unknown) => await mod.set_string(pref_key, JSON.stringify(value as string[])),
        PAST_QUEUE: async(mod: MMKVModule, pref_key: string, value: unknown) => await mod.set_string(pref_key, JSON.stringify(value as PastQueue)),
        BIAS: async(mod: MMKVModule, pref_key: string, value: unknown) => await mod.set_string(pref_key, JSON.stringify(value as Bias))
    };

    export async function load_prefs() {
        const storage_user_uuid = await mmkv().get_string(user_uuid_key);
        if(storage_user_uuid === null) await mmkv().set_string(user_uuid_key, user_uuid);
        await generic_load_prefs<OtherPrefTypes, PrefOptions>(mmkv(), prefs, illusi_pref_load_map);
    }
    export async function save_pref<T extends PrefOptions>(pref_key: T, value: (typeof prefs)[T]['default_value']) {
        await generic_save_pref<OtherPrefTypes, PrefOptions>(mmkv(), prefs, pref_key, value, illusi_pref_save_map);
    }
    export async function reset_prefs() {
        await generic_reset_prefs(mmkv(), [user_uuid_key], load_prefs);
    }

    export interface Theme {
        dark: boolean;
        colors: {
            primary: string;
            secondary: string;
            background: string;
            primary_dark: string;
            card: string;
            title: string;
            text: string;
            subtext: string;
            deeptext: string;
            border: string;
            notification: string;
            shelf: string;
            tabInactive: string;
            line: string;
            searchInput: string;
            searchPlaceholder: string;
            inactive: string;
            red: string;
            green: string;
            orange: string;
            playingSong: string;
            playScreen: string;
            track: string;
            highlightPressColor: string;
            black: string;
        }
    }

    export const light_theme: Theme = {
        dark: false,
        colors: {
            primary: get_pref('primary_color'),
            secondary: '#c957c9',
            background: '#ffffff',
            primary_dark: '#1a184f',
            card: '#fefcff',
            title: '#0c0522',
            text: '#0c0522',
            subtext: '#474266',
            deeptext: '#606060',
            border: '#222222',
            notification: '#1313ff',
            shelf: '#ffffff',
            tabInactive: '#b5b2e9',
            line: '#303040',
            searchInput: '#e4e4e4',
            searchPlaceholder: '#8080a0',
            inactive: '#b5b2e9',
            red: '#FF0000',
            green: '#00FF00',
            orange: '#FF7F50',
            playingSong: '#f1efff',
            playScreen: '#f1efff',
            track: '#fefcff',
            highlightPressColor: '#aa99ee',
            black: "#000000"
        },
    }

    export const dark_theme: Theme = {
        dark: true,
        colors: {
            primary: get_pref('primary_color'),
            secondary: '#fc00c9',
            background: '#0d1016',
            primary_dark: '#1a184f',
            card: '#131213',
            title: '#d0d0d0',
            text: '#ffffff',
            subtext: '#8c939d',
            deeptext: '#606060',
            border: '#222222',
            notification: '#1313ff',
            shelf: '#161B22',
            tabInactive: '#cad1d8',
            line: '#303040',
            searchInput: '#404254',
            searchPlaceholder: '#8080a0',
            inactive: '#8080a0',
            red: '#FF0000',
            green: '#00FF00',
            orange: '#FF7F50',
            playingSong: '#141722',
            playScreen: '#141722',
            track: '#141722',
            highlightPressColor: '#aa99ee',
            black: "#000000"
        },
    }

    export const oled_theme: Theme = {
        dark: true,
        colors: {
            primary: get_pref('primary_color'),
            secondary: '#fc00c9',
            background: '#000000',
            primary_dark: '#1a184f',
            card: '#000000',
            title: '#d0d0d0',
            text: '#ffffff',
            subtext: '#8c939d',
            deeptext: '#606060',
            border: '#222222',
            notification: '#1313ff',
            shelf: '#000000',
            tabInactive: '#cad1d8',
            line: '#303040',
            searchInput: '#404254',
            searchPlaceholder: '#8080a0',
            inactive: '#8080a0',
            red: '#FF0000',
            green: '#00FF00',
            orange: '#FF7F50',
            playingSong: '#000000',
            playScreen: '#000000',
            track: '#000000',
            highlightPressColor: '#aa99ee',
            black: "#000000"
        },
    }

    const themes = {
        light: light_theme,
        dark: dark_theme,
        oled: oled_theme
    }

    export async function try_remove_from_recent_searches(query: string) {
        const recent_searches: string[] = get_pref('recent_searches');
        const recent_search_index = recent_searches.findIndex(search => search === query);
        if(recent_search_index !== -1) {
            recent_searches.splice(recent_search_index, 1);
        }
        await save_pref('recent_searches', recent_searches);
        return recent_searches;
    }
    export async function add_to_recent_searches(query: string) {
        let recent_searches = await try_remove_from_recent_searches(query);
		      recent_searches.unshift(query);
        recent_searches = recent_searches.slice(0, Constants.recent_search_limit);
        await save_pref('recent_searches', recent_searches);
        return recent_searches;
    }

    export function snake_case_to_plain_text(text: string) {
        text = text.replace(/_/g,' ')
        const words = text.split(" ");
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].slice(1);
        }
        return words.join(" ");
    }
    export async function set_settings_number(key: PrefOptions, value: number) {
        await save_pref(key, value);
    }
    export async function set_settings_toggle(key: PrefOptions, value: boolean) {
        await save_pref(key, value);
    }

    export function pref_set_theme(set_theme: (_: Theme) => void){
        const theme = get_theme(get_pref('theme'));
        set_theme(
            {
                dark: theme.dark,
                colors: {
                    ...theme.colors,
                    primary: get_pref('primary_color')
                }
            }
        );
    }
    export function get_theme(key: PossibleThemes) {
        const fallback_theme = dark_theme;
        if(key in themes) return themes[key];
        return fallback_theme;
    }
    export function all_themes() {
        return Object.keys(themes);
    }
    export interface PrimaryColorDetails {color: HexColor, icon: string, name: string}
    export const possible_primary_colors: PrimaryColorDetails[] = [
        {color: '#7400fe', icon: '🔮', name: 'Illusi'},
        {color: '#FFFAFA', icon: '❄️', name: 'Snow'},
        {color: '#FFCCFF', icon: '🌔', name: 'Moon'},
        {color: '#FF007F', icon: '🌹', name: 'Rose'},
        {color: '#FF69B4', icon: '🌸', name: 'Hot'},
        {color: '#14f727', icon: '📗', name: 'Science'},
        {color: '#FF7F50', icon: '🪸', name: 'Coral'},
        {color: '#EB6123', icon: '🎃', name: "Halloween"},
        {color: '#4B0082', icon: '🫐', name: 'Indigo'},
        {color: '#E6E6FA', icon: '💠', name: 'Lavender'},
        {color: '#00FA9A', icon: '🍃', name: 'Spring'},
        {color: '#87CEEB', icon: '🌌', name: 'Sky'},
        {color: '#FF0000', icon: '🏢', name: 'YouTube'},
        {color: '#1ED760', icon: '🏢', name: 'Spotify'},
        {color: '#0077C1', icon: '🏢', name: 'Amazon'},
        {color: '#FC3C44', icon: '🏢', name: 'Apple'},
        {color: '#FF7700', icon: '🏢', name: 'SoundCloud'},
    ];
}
