import * as LegacyPrefs from './illusi/src/legacy/1307/legacy_prefs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CookieJar } from "../../origin/src/utils/cookie_util";
import * as uuid from "react-native-uuid";

export namespace Prefs {
    type PrefType = "COOKIE_JAR" | "DATE" | "NUMBER" | "BOOLEAN" | "STRING_ARRAY" | "STRING";
    export interface Pref<T> {
        default_value: T
        current_value: T
        type: PrefType
        show_in_settings?: boolean
        range?: {"start": number, "end": number}
        options?: string[]
    };
    const user_uuid = <string>uuid.default.v4();
    export const prefs = {
        "youtube_cookie_jar":                    {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as Pref<CookieJar>,
        "youtube_music_cookie_jar":              {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as Pref<CookieJar>,
        "soundcloud_cookie_jar":                 {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as Pref<CookieJar>,
        "spotify_cookie_jar":                    {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as Pref<CookieJar>,
        "amazon_music_cookie_jar":               {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as Pref<CookieJar>,
        "apple_music_cookie_jar":                {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as Pref<CookieJar>,
        "user_uuid":                             {default_value: user_uuid, current_value: user_uuid, type: "STRING"} as Pref<string>,
        "recent_searches":                       {default_value: [], current_value: [], type: "STRING_ARRAY"}         as Pref<string[]>,
        "last_sleep_timer_ms":                   {default_value: 0, current_value: 0, type: "NUMBER"}                 as Pref<number>,

        "default_playlist_max_size":             {default_value: 200, current_value: 200, type: "NUMBER", show_in_settings: true}       as Pref<number>,
        "recently_played_max_size":              {default_value: 100, current_value: 100, type: "NUMBER", show_in_settings: true}       as Pref<number>,
        "download_queue_max_length":             {default_value: 5, current_value: 5, type: "NUMBER", show_in_settings: true}           as Pref<number>,
        "recent_search_limit":                   {default_value: 20, current_value: 20, type: "NUMBER", show_in_settings: true}         as Pref<number>,
        "soundcloud_playlist_limit":             {default_value: 20, current_value: 20, type: "NUMBER", show_in_settings: true}         as Pref<number>,
        "spotify_playlist_limit":                {default_value: 100, current_value: 100, type: "NUMBER", show_in_settings: true}       as Pref<number>,
        "edit_mode_disables_playing":            {default_value: true, current_value: true, type: "BOOLEAN", show_in_settings: true}    as Pref<boolean>,
        "full_queue_disables_playing":           {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true}  as Pref<boolean>,
        "show_track_duration":                   {default_value: true, current_value: true, type: "BOOLEAN", show_in_settings: true}    as Pref<boolean>,
        "auto_cache_thumbnails":                 {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true}  as Pref<boolean>,
        "use_cookies_on_download":               {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true}  as Pref<boolean>,
        "use_cookies_on_search":                 {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true}  as Pref<boolean>,
        "only_play_downloaded":                  {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true}  as Pref<boolean>,
        "auto_download":                         {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true}  as Pref<boolean>,
        "disable_linker":                        {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true}  as Pref<boolean>,
        "always_shuffle":                        {default_value: true, current_value: true, type: "BOOLEAN", show_in_settings: true}    as Pref<boolean> ,
        "get_account_playlists_in_get_playlist": {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true}  as Pref<boolean>,
        "simple_tags":                           {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true}  as Pref<boolean>,
        "hide_errors":                           {default_value: true, current_value: true, type: "BOOLEAN", show_in_settings: true}    as Pref<boolean>,
        "keep_prefs":                            {default_value: true, current_value: true, type: "BOOLEAN", show_in_settings: true}    as Pref<boolean>,
        "dev_mode":                              {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true}  as Pref<boolean>,
    };
    const user_uuid_key: PrefOptions = "user_uuid";

    export async function load_legacy_prefs(legacy_prefs: typeof LegacyPrefs.prefs){
        await Promise.all([
            save_pref("youtube_cookie_jar",       CookieJar.fromString(legacy_prefs.external_services.youtube_cookies)),
            save_pref("youtube_music_cookie_jar", CookieJar.fromString(legacy_prefs.external_services.youtube_music_cookies)),
            save_pref("spotify_cookie_jar",       CookieJar.fromString(legacy_prefs.external_services.spotify_cookies)),
            save_pref("amazon_music_cookie_jar",  CookieJar.fromString(legacy_prefs.external_services.amazon_music_cookies)),
        ]);
        await LegacyPrefs.clear_prefs();
    }
    export type PrefOptions = keyof typeof prefs;
    export function get_pref<T extends PrefOptions>(pref_key: T): (typeof prefs)[T]['default_value'] { return prefs[pref_key].current_value; }

    export async function load_prefs(){
        const storage_user_uuid = await AsyncStorage.getItem(user_uuid_key);
        if(storage_user_uuid === null) await AsyncStorage.setItem(user_uuid_key, user_uuid);
        const keys: (keyof typeof prefs)[] = Object.keys(prefs) as (keyof typeof prefs)[];
        const all_keys = await AsyncStorage.getAllKeys();
        for(const key of keys){
            if(all_keys.includes(key))
                switch(prefs[key].type){
                    case "STRING":       prefs[key].current_value = (await AsyncStorage.getItem(key))!; break;
                    case "BOOLEAN":      prefs[key].current_value = await AsyncStorage.getItem(key) === "true" ? true : false; break;
                    case "NUMBER":       prefs[key].current_value = parseInt((await AsyncStorage.getItem(key))!); break;
                    case "COOKIE_JAR":   prefs[key].current_value = CookieJar.fromString((await AsyncStorage.getItem(key))!); break;
                    case "STRING_ARRAY": prefs[key].current_value = JSON.parse((await AsyncStorage.getItem(key))!); break;
                }
            else prefs[key].current_value = prefs[key].default_value;
        }
    }
    
    export async function save_pref<T extends PrefOptions>(pref: T, value: (typeof prefs)[T]['default_value']) {
        switch(prefs[pref].type){
            case "STRING":       await AsyncStorage.setItem(pref, <string>value); break;
            case "BOOLEAN":      await AsyncStorage.setItem(pref, String(value)); break;
            case "NUMBER":       await AsyncStorage.setItem(pref, String(value)); break;
            case "COOKIE_JAR":   await AsyncStorage.setItem(pref, (<CookieJar>value).toString()); break;
            case "STRING_ARRAY": await AsyncStorage.setItem(pref, JSON.stringify(value)); break;
        }
        await load_prefs();
    }
    export async function reset_prefs(){
        const keys = (<PrefOptions[]>Object.keys(prefs)).filter(opt => opt !== user_uuid_key);
        await AsyncStorage.multiRemove(keys);
        await load_prefs();
    }

    export const dark_theme = {
        dark: true,
        colors: {
            primary: '#7400fe',
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


    export async function try_remove_from_recent_searches(query: string){
        const recent_searches: string[] = Prefs.get_pref('recent_searches');
        const recent_search_index = recent_searches.findIndex(search => search === query);
        if(recent_search_index !== -1){
            recent_searches.splice(recent_search_index, 1);
        }
        await save_pref('recent_searches', recent_searches);
        return recent_searches;
    }
    export async function add_to_recent_searches(query: string){
        let recent_searches = await try_remove_from_recent_searches(query);
		recent_searches.unshift(query);
        recent_searches = recent_searches.slice(0, get_pref('recent_search_limit'));
        await save_pref('recent_searches', recent_searches);
        return recent_searches;
    }

    export function snake_case_to_plain_text(text: string){
        text = text.replace(/_/g,' ')
        const words = text.split(" ");
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substr(1);
        }
        return words.join(" ");
    }
    export async function set_settings_number(key: PrefOptions, value: number){
        await save_pref(key, value);
    }
    export async function set_settings_toggle(key: PrefOptions, value: boolean){
        await save_pref(key, value);
    }
    export async function set_settings_dropdown(){
        await AsyncStorage.setItem('Prefs', JSON.stringify(prefs));
    }
}
