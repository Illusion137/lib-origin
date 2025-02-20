import AsyncStorage from '@react-native-async-storage/async-storage';
import * as uuid from "react-native-uuid";
import { CookieJar } from "../../origin/src/utils/cookie_util";
import { Constants } from './constants';
import * as LegacyPrefs from './illusi/src/legacy/1307/legacy_prefs';
import { HexColor, LinkerLink } from './types';

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
        latest_version:                        {default_value: "0.0.0", current_value: "0.0.0", type: "STRING"} as Pref<string>,
        recent_searches:                       {default_value: [], current_value: [], type: "STRING_ARRAY"}         as Pref<string[]>,
        last_sleep_timer_ms:                   {default_value: 0, current_value: 0, type: "NUMBER"}                 as Pref<number>,
        linker_links:                          {default_value: [], current_value: [], type: "LINKER_LINKS"} as Pref<LinkerLink[]>,
        primary_color:                         {default_value: '#7400fe', current_value: '#7400fe', type: "STRING"}       as Pref<HexColor>,
        theme:                                 {default_value: 'dark', current_value: 'dark', type: "STRING"}       as Pref<PossibleThemes>,
        
        // Usually one-time settings that you'd forget about
        recent_search_limit:                   {default_value: 20, current_value: 20, type: "NUMBER", range: {start: 1, end: 30}, show_in_settings: true, show_in_type: "MISC", section: "Search"}  as Pref<number>,
        soundcloud_playlist_limit:             {default_value: 20, current_value: 20, type: "NUMBER", show_in_settings: true, show_in_type: "MISC", section: "Playlist"}                              as Pref<number>,
        spotify_playlist_limit:                {default_value: 100, current_value: 100, type: "NUMBER", show_in_settings: true, show_in_type: "MISC", section: "Playlist"}                            as Pref<number>,
        tracks_per_sample:                     {default_value: 3, current_value: 3, type: "NUMBER", range: {start: 1, end: 10}, show_in_settings: true, show_in_type: "MISC", section: "Automation", description: "The number of tracks to sample when Illusi automatically checks for unavailable songs, even if downloaded. This check could happen randomly every song; If expensive_wifi_only then this action only occurs when on wifi"}  as Pref<number>,
        playlist_cache_seconds:                {default_value: Constants.playlist_cache_duration_seconds, current_value: Constants.playlist_cache_duration_seconds, type: "NUMBER", show_in_settings: true, show_in_type: "MISC", section: "Playlist"} as Pref<number>,
        edit_mode_disables_playing:            {default_value: true, current_value: true, type: "BOOLEAN", show_in_settings: true, show_in_type: "MISC", description: "If-Enabled; When you are in an edit-mode you can't click on a track", section: "Interactions"} as Pref<boolean>,
        full_queue_disables_playing:           {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "MISC", description: "If-Enabled; If your pushed-queue isn't empty then you can't click on a track", section: "Interactions"} as Pref<boolean>,
        show_track_duration:                   {default_value: true, current_value: true, type: "BOOLEAN", show_in_settings: true, show_in_type: "MISC", section: "Visual"}    as Pref<boolean>,
        use_cookies_on_download:               {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "MISC", section: "Data"}  as Pref<boolean>,
        use_cookies_on_search:                 {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "MISC", section: "Data"}  as Pref<boolean>,
        compact_playlists:                     {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "MISC", description: "If-Enabled; Your playlists in the 'Playlist' screen will become smaller", section: "Visual"} as Pref<boolean>,
        share_as_original:                     {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "MISC", description: "If-Enabled; When sharing a track if downloaded it'll still share the song from the original source", section: "Interactions"} as Pref<boolean>,
        prioritize_youtube_thumbnail:          {default_value: true, current_value: true, type: "BOOLEAN", show_in_settings: true, show_in_type: "MISC", section: "Visual"}    as Pref<boolean>,
        alt_titles:                            {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "MISC", section: "Visual"}  as Pref<boolean>,
        simple_tags:                           {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "MISC", section: "Visual"}  as Pref<boolean>,
        simple_errors:                         {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "MISC", section: "Visual"}  as Pref<boolean>,
        hide_batch_undownloader:               {default_value: true, current_value: true, type: "BOOLEAN", show_in_settings: true, show_in_type: "MISC", section: "Visual", description: "If-Enabled; won't show Batch Un-Downloader in extras page (Modification may require restart)"}  as Pref<boolean>,
        keep_prefs:                            {default_value: true, current_value: true, type: "BOOLEAN", show_in_settings: true, show_in_type: "MISC", description: "If-Enabled; If you clear-all-data then you'll keep your preferences", section: "Other"} as Pref<boolean>,
        hide_errors:                           {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "MISC", section: "Visual"}  as Pref<boolean>,
        hide_trackplayer_errors:               {default_value: true, current_value: true, type: "BOOLEAN", show_in_settings: true, show_in_type: "MISC", section: "Visual"}    as Pref<boolean>,

        // More frequently changed settings
        default_playlist_max_size:             {default_value: 200, current_value: 200, type: "NUMBER", show_in_settings: true, section: "Playlist"}       as Pref<number>,
        recently_played_max_size:              {default_value: 100, current_value: 100, type: "NUMBER", show_in_settings: true, section: "Playlist"}       as Pref<number>,
        download_queue_max_length:             {default_value: 5, current_value: 5, type: "NUMBER", range: {start: 1, end: 10}, show_in_settings: true, section: "Automation"} as Pref<number>,
        auto_cache_thumbnails:                 {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Automation"}  as Pref<boolean>,
        only_play_downloaded:                  {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Interactions"}  as Pref<boolean>,
        auto_download:                         {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Automation"}  as Pref<boolean>,
        always_shuffle:                        {default_value: true, current_value: true, type: "BOOLEAN", show_in_settings: true, section: "Interactions"}    as Pref<boolean> ,
        get_account_playlists_in_get_playlist: {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Automation"}  as Pref<boolean>,
        play_no_popup:                         {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, description: "If-Enabled; When clicking on a track if you already are playing music, the player won't popup", section: "Audioplayer"} as Pref<boolean>,
        expensive_wifi_only:                   {default_value: true, current_value: true, type: "BOOLEAN", show_in_settings: true, section: "Data"}    as Pref<boolean>,
        prefer_youtube_music:                  {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Data"}  as Pref<boolean>,
        prefer_soundcloud:                     {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Data"}  as Pref<boolean>,
        force_explicit_conversion:             {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Automation"}  as Pref<boolean>,
        can_redownload:                        {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Interactions"}  as Pref<boolean>,
        can_redownload_batch:                  {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Interactions"}  as Pref<boolean>,
        playlist_inheritance_preview:          {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, section: "Visual", description: "If-Enabled; The Playlists tab will show all your inheritance in your playlists; Slightly slower performance when opening Playlists tab"}  as Pref<boolean>,

        // Settings that have a chance of breaking things; use with caution; all disabled by default
        enable_linker:                         {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "EXPERIMENTAL", section: "Automation"}  as Pref<boolean>,
        enable_sampler:                        {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "EXPERIMENTAL", section: "Automation"}  as Pref<boolean>,
        add_from_modal:                        {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "EXPERIMENTAL", section: "Other"}  as Pref<boolean>,
        keep_soundcloud_alive:                 {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "EXPERIMENTAL", section: "Automation"}  as Pref<boolean>,
        fastpack:                              {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "EXPERIMENTAL", section: "Automation"}  as Pref<boolean>,
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
                    case "STRING":       prefs[key].current_value = (await AsyncStorage.getItem(key))!; break;
                    case "BOOLEAN":      prefs[key].current_value = await AsyncStorage.getItem(key) === "true" ? true : false; break;
                    case "NUMBER":       prefs[key].current_value = parseInt((await AsyncStorage.getItem(key))!); break;
                    case "COOKIE_JAR":   prefs[key].current_value = CookieJar.fromString((await AsyncStorage.getItem(key))!); break;
                    case "STRING_ARRAY": prefs[key].current_value = JSON.parse((await AsyncStorage.getItem(key))!); break;
                    case "LINKER_LINKS": prefs[key].current_value = JSON.parse((await AsyncStorage.getItem(key))!); break;
                }
            else prefs[key].current_value = prefs[key].default_value;
        }
    }
    
    export async function save_pref<T extends PrefOptions>(pref: T, value: (typeof prefs)[T]['default_value']) {
        switch(prefs[pref].type) {
            case "STRING":       await AsyncStorage.setItem(pref, value as string); break;
            case "BOOLEAN":      await AsyncStorage.setItem(pref, JSON.stringify(value)); break;
            case "NUMBER":       await AsyncStorage.setItem(pref, JSON.stringify(value)); break;
            case "COOKIE_JAR":   await AsyncStorage.setItem(pref, (value as CookieJar).toString()); break;
            case "STRING_ARRAY": await AsyncStorage.setItem(pref, JSON.stringify(value)); break;
            case "LINKER_LINKS": await AsyncStorage.setItem(pref, JSON.stringify(value)); break;
        }
        await load_prefs();
    }
    export async function reset_prefs() {
        const keys = (Object.keys(prefs) as PrefOptions[]).filter(opt => opt !== user_uuid_key);
        await AsyncStorage.multiRemove(keys);
        await load_prefs();
    }

    export async function try_remove_from_recent_searches(query: string) {
        const recent_searches: string[] = Prefs.get_pref('recent_searches');
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
        recent_searches = recent_searches.slice(0, get_pref('recent_search_limit'));
        await save_pref('recent_searches', recent_searches);
        return recent_searches;
    }

    export function snake_case_to_plain_text(text: string) {
        text = text.replace(/_/g,' ')
        const words = text.split(" ");
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substr(1);
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
            primary: Prefs.get_pref('primary_color'),
            secondary: '#fc00c9',
            background: '#eeeeee',
            primary_dark: '#1a184f',
            card: '#f2f2f2',
            title: '#000000',
            text: '#000000',
            subtext: '#60676e',
            deeptext: '#606060',
            border: '#222222',
            notification: '#1313ff',
            shelf: '#c0bad6',
            tabInactive: '#5b5b78',
            line: '#303040',
            searchInput: '#b7a1d4',
            searchPlaceholder: '#8080a0',
            inactive: '#5b5b78',
            red: '#FF0000',
            green: '#00FF00',
            orange: '#FF7F50',
            playingSong: '#7a71ab',
            playScreen: '#7a71ab',
            track: '#d0cae6',
            highlightPressColor: '#bbaaff',
            black: "#000000"
        },
    }

    export const dark_theme: Theme = {
        dark: true,
        colors: {
            primary: Prefs.get_pref('primary_color'),
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
            primary: Prefs.get_pref('primary_color'),
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
    export function pref_set_theme(set_theme: (_: Prefs.Theme) => void){
        const theme = Prefs.get_theme(Prefs.get_pref('theme'));
        set_theme(
            {
                dark: theme.dark,
                colors: {
                    ...theme.colors,
                    primary: Prefs.get_pref('primary_color')
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
    export type PrimaryColorDetails = {color: HexColor, icon: string, name: string};
    export const possible_primary_colors: PrimaryColorDetails[] = [
        {color: '#7400fe', icon: '🔮', name: 'Illusi'},
        {color: '#FFFAFA', icon: '🌹', name: 'Snow'},
        {color: '#FFCCFF', icon: '🌔', name: 'Moon'},
        {color: '#FF007F', icon: '🌹', name: 'Rose'},
        {color: '#14f727', icon: '📗', name: 'Science'},
        {color: '#FF69B4', icon: '🌸', name: 'Hot'},
        {color: '#FF7F50', icon: '🪸', name: 'Coral'},
        {color: '#4B0082', icon: '🫐', name: 'Indigo'},
        {color: '#E6E6FA', icon: '💠', name: 'Lavender'},
        {color: '#00FA9A', icon: '🍃', name: 'Spring'},
        {color: '#87CEEB', icon: '🌌', name: 'Sky'},
    ];
}
