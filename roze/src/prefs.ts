import { base_load_map, create_mmkv, generic_load_prefs, generic_reset_prefs, generic_save_pref, type BasePref } from "../native/mmkv/mmkv";
import { CookieJar } from "../../origin/src/utils/cookie_util";

export namespace RozePrefs {
    export type PossibleThemes = keyof typeof themes;
    export const mmkv_module = create_mmkv({

    });

    export const prefs = {
        legacy_prefs:                          {default_value: "", current_value: "", type: "STRING"} as BasePref<string>,
        youtube_cookie_jar:                    {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as BasePref<CookieJar>,
        youtube_music_cookie_jar:              {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as BasePref<CookieJar>,
        soundcloud_cookie_jar:                 {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as BasePref<CookieJar>,
        spotify_cookie_jar:                    {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as BasePref<CookieJar>,
        amazon_music_cookie_jar:               {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as BasePref<CookieJar>,
        apple_music_cookie_jar:                {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as BasePref<CookieJar>,
        user_uuid:                             {default_value: user_uuid, current_value: user_uuid, type: "STRING"} as BasePref<string>,
        last_synced:                           {default_value: new Date(0), current_value: new Date(0), type: "DATE"} as BasePref<Date>,
        automatic_new_releases_last_refreshed: {default_value: new Date(0), current_value: new Date(0), type: "DATE"} as BasePref<Date>,
        new_releases_last_refreshed:           {default_value: new Date(0), current_value: new Date(0), type: "DATE"} as BasePref<Date>,
        discord_webhook_url:                   {default_value: '', current_value: '', type: "STRING"}       as BasePref<string>,
        latest_version:                        {default_value: "0.0.0", current_value: "0.0.0", type: "STRING"} as BasePref<string>,
        last_sleep_timer_ms:                   {default_value: 0, current_value: 0, type: "NUMBER"}                 as BasePref<number>,
        primary_color:                         {default_value: '#7400fe', current_value: '#7400fe', type: "STRING"}       as BasePref<HexColor>,
        theme:                                 {default_value: 'dark', current_value: 'dark', type: "STRING"}       as BasePref<PossibleThemes>,
        
        fuzzy_search_threshold:                {default_value: 50, current_value: 100, type: "NUMBER", range: {start: 0, end: 100}, show_in_settings: true, section: "Playlist", description: "The minimum confidence for Illusi's fuzzy-search  (0-100%)"}       as BasePref<number>,
        dev_mode:                              {default_value: false, current_value: false, type: "BOOLEAN", show_in_settings: true, show_in_type: "EXPERIMENTAL", section: "Other", description: "(Modification may require restart)"}  as BasePref<boolean>,
    };
    export type PrefOptions = keyof typeof prefs;

    export function get_pref<T extends PrefOptions>(pref_key: T): (typeof prefs)[T]['default_value'] { return prefs[pref_key].current_value; }

    export async function load_prefs() {
        generic_load_prefs<string & {}, PrefOptions>(mmkv_module, prefs, base_load_map);
    }
    export async function save_pref<T extends PrefOptions>(pref: T, value: (typeof prefs)[T]['default_value']) {
        generic_save_pref(mmkv_module, prefs, base_load_map);
    }
    export async function reset_prefs() {
        generic_reset_prefs(mmkv_module, []);
    }
};