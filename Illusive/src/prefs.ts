import AsyncStorage from '@react-native-async-storage/async-storage';
import * as uuid from "react-native-uuid";
import { CookieJar } from "@common/utils/cookie_util";
import { Constants } from '@illusive/constants';
import * as LegacyPrefs from '@illusive/illusi/src/legacy/1307/legacy_prefs';
import type { HexColor, LinkerLink } from '@illusive/types';

export namespace Prefs {
    export type PossibleThemes = keyof typeof themes;
    type PrefType = "COOKIE_JAR" | "DATE" | "NUMBER" | "BOOLEAN" | "STRING_ARRAY" | "STRING" | "LINKER_LINKS";
    type ShowInSettings = "MISC"|"EXPERIMENTAL";
    export interface Pref<T> {
        default_value: T
        current_value: T
        type: PrefType
        section?: "Audioplayer"|"Playlist"|"Search"|"Interactions"|"Visual"|"Automation"|"Data"|"Other"
        show_in_settings?: boolean
        range?: {"start": number, "end": number}
        options?: string[]
        description?: string
        show_in_type?: ShowInSettings
    };
    const user_uuid = uuid.default.v4();
    export const prefs = {
        legacy_prefs:                          {default_value: "", current_value: "", type: "STRING"} as Pref<string>,
        youtube_cookie_jar:                    {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as Pref<CookieJar>,
        youtube_music_cookie_jar:              {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as Pref<CookieJar>,
        soundcloud_cookie_jar:                 {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as Pref<CookieJar>,
        spotify_cookie_jar:                    {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as Pref<CookieJar>,
        amazon_music_cookie_jar:               {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as Pref<CookieJar>,
        apple_music_cookie_jar:                {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as Pref<CookieJar>,
        user_uuid:                             {default_value: user_uuid, current_value: user_uuid, type: "STRING"} as Pref<string>,
        last_synced:                           {default_value: new Date(0), current_value: new Date(0), type: "DATE"} as Pref<Date>,
        automatic_new_releases_last_refreshed: {default_value: new Date(0), current_value: new Date(0), type: "DATE"} as Pref<Date>,
        new_releases_last_refreshed:           {default_value: new Date(0), current_value: new Date(0), type: "DATE"} as Pref<Date>,
        discord_webhook_url:                   {default_value: '', current_value: '', type: "STRING"}       as Pref<string>,
        latest_version:                        {default_value: "0.0.0", current_value: "0.0.0", type: "STRING"} as Pref<string>,
        recent_searches:                       {default_value: [], current_value: [], type: "STRING_ARRAY"}         as Pref<string[]>,
        last_sleep_timer_ms:                   {default_value: 0, current_value: 0, type: "NUMBER"}                 as Pref<number>,
        linker_links:                          {default_value: [], current_value: [], type: "LINKER_LINKS"} as Pref<LinkerLink[]>,
        primary_color:                         {default_value: '#7400fe', current_value: '#7400fe', type: "STRING"}       as Pref<HexColor>,
        theme:                                 {default_value: 'dark', current_value: 'dark', type: "STRING"}       as Pref<PossibleThemes>,
        
        default_playlist_max_size:             {default_value: 200, current_value: 200, type: "NUMBER", show_in_settings: true, section: "Playlist"}       as Pref<number>,
        recently_played_max_size:              {default_value: 100, current_value: 100, type: "NUMBER", show_in_settings: true, section: "Playlist"}       as Pref<number>,
        fuzzy_search_threshold:                {default_value: 50, current_value: 100, type: "NUMBER", range: {start: 0, end: 100}, show_in_settings: true, section: "Playlist", description: "The minimum confidence for Illusi's fuzzy-search  (0-100%)"}       as Pref<number>,
        default_to_strict_search:              {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Interactions", description: "Your searches will default to the strict-search over fuzzy-search"} as Pref<boolean>,
        compact_playlists:                     {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Visual", description: "Your playlists in the 'Playlists' screen will become smaller"} as Pref<boolean>,
        album_track_tinting:                   {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Visual", description: "Tints all tracks in a album a different color so that it is easier to differentiate"}  as Pref<boolean>,
        only_play_downloaded:                  {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Interactions", description: "Only play downloaded tracks (except searched ones)"}  as Pref<boolean>,
        always_shuffle:                        {default_value: true, current_value: true, type: "BOOLEAN", show_in_settings: true, section: "Interactions", description: "Always shuffle user-made playlists and library"}    as Pref<boolean> ,
        play_without_popup:                    {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Interactions", description: "Prevents Audioplayer from popping up when playing a new queue"} as Pref<boolean>,
        auto_download:                         {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Automation", description: "Download track media whenever added to library"}  as Pref<boolean>,
        auto_cache_thumbnails:                 {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Automation", description: "Download track thumbnail whenever added to library"}  as Pref<boolean>,
        auto_cache_lyrics:                     {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Automation", description: "Download track lyrics whenever added to library"}  as Pref<boolean>,
        expensive_wifi_only:                   {default_value: true, current_value: true, type: "BOOLEAN", show_in_settings: true, section: "Data", description: "Many expensive network based operations will only happen on WiFi"}    as Pref<boolean>,
        
        // Settings that have a chance of breaking things; use with caution; all disabled by default
        enable_linker:                         {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "EXPERIMENTAL", section: "Automation"}  as Pref<boolean>,
        enable_sampler:                        {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "EXPERIMENTAL", section: "Automation"}  as Pref<boolean>,
        fastpack:                              {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "EXPERIMENTAL", section: "Automation"}  as Pref<boolean>,
        quick_fixer_upper:                     {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "EXPERIMENTAL", section: "Automation", description: "May slow down app; only use when necessary"}  as Pref<boolean>,
        force_youtube_18_quality:              {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "EXPERIMENTAL", section: "Automation", description: "May slow down app; only use when necessary"}  as Pref<boolean>,
        use_cookies_on_download:               {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "EXPERIMENTAL", section: "Data"}  as Pref<boolean>,
        use_cookies_on_search:                 {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "EXPERIMENTAL", section: "Data"}  as Pref<boolean>,
        use_cookies_on_artist:                 {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "EXPERIMENTAL", section: "Data"}  as Pref<boolean>,
        dev_mode:                              {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "EXPERIMENTAL", section: "Other", description: "(Modification may require restart)"}  as Pref<boolean>,
    };
    const user_uuid_key: PrefOptions = "user_uuid";

    export async function load_legacy_prefs(legacy_prefs: typeof LegacyPrefs.prefs) {
        await Promise.all([
            save_pref("youtube_cookie_jar",       CookieJar.fromString(legacy_prefs.external_services.youtube_cookies)),
            save_pref("youtube_music_cookie_jar", CookieJar.fromString(legacy_prefs.external_services.youtube_music_cookies)),
            save_pref("spotify_cookie_jar",       CookieJar.fromString(legacy_prefs.external_services.spotify_cookies)),
            save_pref("amazon_music_cookie_jar",  CookieJar.fromString(legacy_prefs.external_services.amazon_music_cookies)),
            save_pref("legacy_prefs",             JSON.stringify(legacy_prefs))
        ]);
        await LegacyPrefs.clear_prefs();
    }
    export type PrefOptions = keyof typeof prefs;
    export function get_pref<T extends PrefOptions>(pref_key: T): (typeof prefs)[T]['default_value'] { return prefs[pref_key].current_value; }

    export async function load_prefs() {
        const storage_user_uuid = await AsyncStorage.getItem(user_uuid_key);
        if(storage_user_uuid === null) await AsyncStorage.setItem(user_uuid_key, user_uuid);
        const keys: (keyof typeof prefs)[] = Object.keys(prefs) as (keyof typeof prefs)[];
        const all_keys = await AsyncStorage.getAllKeys();
        for(const key of keys) {
            if(all_keys.includes(key))
                switch(prefs[key].type) {
                    case "STRING":            prefs[key].current_value = (await AsyncStorage.getItem(key))!; break;
                    case "BOOLEAN":           prefs[key].current_value = await AsyncStorage.getItem(key) === "true" ? true : false; break;
                    case "NUMBER":            prefs[key].current_value = parseInt((await AsyncStorage.getItem(key))!); break;
                    case "DATE":              prefs[key].current_value = new Date( await AsyncStorage.getItem(key) as string ); break;
                    case "COOKIE_JAR":        prefs[key].current_value = CookieJar.fromString((await AsyncStorage.getItem(key))!); break;
                    case "STRING_ARRAY":      prefs[key].current_value = JSON.parse((await AsyncStorage.getItem(key))!); break;
                    case "LINKER_LINKS":      prefs[key].current_value = JSON.parse((await AsyncStorage.getItem(key))!); break;
                }
            else prefs[key].current_value = prefs[key].default_value;
        }
    }
    
    export async function save_pref<T extends PrefOptions>(pref: T, value: (typeof prefs)[T]['default_value']) {
        switch(prefs[pref].type) {
            case "STRING":            await AsyncStorage.setItem(pref, value as string); break;
            case "BOOLEAN":           await AsyncStorage.setItem(pref, JSON.stringify(value)); break;
            case "NUMBER":            await AsyncStorage.setItem(pref, JSON.stringify(value)); break;
            case "DATE":              await AsyncStorage.setItem(pref, (value as Date).toISOString()); break;
            case "COOKIE_JAR":        await AsyncStorage.setItem(pref, (value as CookieJar).toString()); break;
            case "STRING_ARRAY":      await AsyncStorage.setItem(pref, JSON.stringify(value)); break;
            case "LINKER_LINKS":      await AsyncStorage.setItem(pref, JSON.stringify(value)); break;
        }
        await load_prefs();
    }
    export async function reset_prefs() {
        const keys = (Object.keys(prefs) as PrefOptions[]).filter(opt => opt !== user_uuid_key);
        await AsyncStorage.multiRemove(keys);
        await load_prefs();
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
    export async function set_settings_dropdown() {
        await AsyncStorage.setItem('Prefs', JSON.stringify(prefs));
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
            secondary: '#4c4b00',
            background: '#f7f2f7',
            primary_dark: '#1a184f',
            card: '#fefcff',
            title: '#0c0522',
            text: '#0c0522',
            subtext: '#474266',
            deeptext: '#606060',
            border: '#222222',
            notification: '#1313ff',
            shelf: '#ffffff',
            tabInactive: '#5b5b78',
            line: '#303040',
            searchInput: '#e4e4e4',
            searchPlaceholder: '#8080a0',
            inactive: '#474266',
            red: '#82564f',
            green: '#436e57',
            orange: '#6b643b',
            playingSong: '#f1efff',
            playScreen: '#f1efff',
            track: '#fefcff',
            highlightPressColor: '#bbaaff',
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
            highlightPressColor: '#bbaaff',
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
            highlightPressColor: '#bbaaff',
            black: "#000000"
        },
    }

    const themes = {
        light: light_theme,
        dark: dark_theme,
        oled: oled_theme
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
