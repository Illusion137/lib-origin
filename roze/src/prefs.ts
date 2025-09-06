import { base_load_map, base_save_map, create_mmkv, generic_load_prefs, generic_reset_prefs, generic_save_pref, type BasePref } from "@native/mmkv/mmkv_utils";
import { CookieJar } from "@common/utils/cookie_util";
import { fs } from "@native/fs/fs";
import { gen_uuid } from "@common/utils/util";
import type { MMKVModule } from "@native/mmkv/mmkv.base";

export namespace RozePrefs {
    export type OtherPrefTypes = string & {};
    export type PossibleThemes = keyof typeof themes;
    const roze_mmkv_path = fs().document_directory(".roz");
    export let mmkv_module: MMKVModule; 

    export async function load_mmkv_module(){
        mmkv_module = create_mmkv({
            id: 'roze.illusion.com',
            path: await roze_mmkv_path
        });
    }

    const user_uuid = gen_uuid();

    export const prefs = {
        theme:                                 {default_value: 'dark', current_value: 'dark', type: "STRING"}       as BasePref<PossibleThemes>,
        user_uuid:                             {default_value: user_uuid, current_value: user_uuid, type: "STRING"} as BasePref<string>,
        jnovel_cookie_jar:                     {default_value: new CookieJar([]), current_value: new CookieJar([]), type: "COOKIE_JAR"} as BasePref<CookieJar>,
        latest_version:                        {default_value: "0.0.0", current_value: "0.0.0", type: "STRING"} as BasePref<string>,
        
        last_synced:                           {default_value: new Date(0), current_value: new Date(0), type: "DATE"} as BasePref<Date>,
        automatic_new_releases_last_refreshed: {default_value: new Date(0), current_value: new Date(0), type: "DATE"} as BasePref<Date>,
        new_releases_last_refreshed:           {default_value: new Date(0), current_value: new Date(0), type: "DATE"} as BasePref<Date>,
        discord_webhook_url:                   {default_value: '', current_value: '', type: "STRING"}       as BasePref<string>,
        last_sleep_timer_ms:                   {default_value: 0, current_value: 0, type: "NUMBER"}                 as BasePref<number>,
    };
    export type PrefOptions = keyof typeof prefs;
    const user_uuid_key: PrefOptions = "user_uuid";

    export function get_pref<T extends PrefOptions>(pref_key: T): (typeof prefs)[T]['default_value'] { return prefs[pref_key].current_value; }

    export function load_prefs() {
        const storage_user_uuid = mmkv_module.get_string(user_uuid_key);
        if(storage_user_uuid === null) mmkv_module.set_string(user_uuid_key, user_uuid);
        generic_load_prefs<OtherPrefTypes, PrefOptions>(mmkv_module, prefs, base_load_map);
    }
    export function save_pref<T extends PrefOptions>(pref_key: T, value: (typeof prefs)[T]['default_value']) {
        generic_save_pref<OtherPrefTypes, PrefOptions>(mmkv_module, prefs, pref_key, value, base_save_map);
    }
    export function reset_prefs() {
        generic_reset_prefs(mmkv_module, [user_uuid_key], load_prefs);
    }

    const themes = {
        light: {},
        dark: {},
        oled: {}
    }
};