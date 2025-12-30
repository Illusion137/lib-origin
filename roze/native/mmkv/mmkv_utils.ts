import type { MMKVModule } from "@native/mmkv/mmkv.base";
import { CookieJar } from "@common/utils/cookie_util";
import { try_json_parse } from "@common/utils/parse_util";
import { reinterpret_cast } from "@common/cast";

export type BasePrefTypes = "NUMBER" | "BOOLEAN" | "STRING" | "STRING_ARRAY" | "NUMBER_ARRAY" | "STRING_OPTIONS" | "COOKIE_JAR" | "DATE";
export interface BasePref<TValue, TType extends string = ""> {
    current_value: TValue;
    readonly default_value: TValue;
    readonly type: BasePrefTypes | TType;
    readonly show_type?: string;
    readonly visible?: boolean;
    readonly section?: string;
    readonly description?: string;
    readonly range?: { start: number; end: number };
    readonly options?: TValue[];
}
export type BasePrefsRecord<TKeys extends string, TValue, TType extends string> = Record<TKeys, BasePref<TValue, TType>>;
export type BasePrefLoadMap<TType extends string, TValue> = Record<BasePrefTypes | TType, (mmkv_module: MMKVModule, pref_key: string) => Promise<TValue>>;
export type BasePrefSaveMap<TType extends string, TValue> = Record<BasePrefTypes | TType, (mmkv_module: MMKVModule, pref_key: string, value: TValue) => Promise<unknown>>;

export function generic_get_pref<TPrefsValue, TType extends string, TPrefs extends Record<string, BasePref<TPrefsValue, TType>>, TKeys extends keyof TPrefs>(prefs: TPrefs, pref_key: TKeys): TPrefs[TKeys]["default_value"] {
    return prefs[pref_key].current_value;
}

export const base_load_map: BasePrefLoadMap<BasePrefTypes, unknown> = {
    NUMBER: async(mmkv_module: MMKVModule, pref_key: string) => await mmkv_module.get_number(pref_key),
    BOOLEAN: async(mmkv_module: MMKVModule, pref_key: string) => await mmkv_module.get_boolean(pref_key),
    STRING: async(mmkv_module: MMKVModule, pref_key: string) => await mmkv_module.get_string(pref_key),
    STRING_ARRAY: async(mmkv_module: MMKVModule, pref_key: string) => reinterpret_cast<string[]>(try_json_parse<string[]>(await mmkv_module.get_string(pref_key) ?? "[]")),
    NUMBER_ARRAY: async(mmkv_module: MMKVModule, pref_key: string) => reinterpret_cast<string[]>(try_json_parse<number[]>(await mmkv_module.get_string(pref_key) ?? "[]")),
    STRING_OPTIONS: async(mmkv_module: MMKVModule, pref_key: string) => await mmkv_module.get_string(pref_key),
    COOKIE_JAR: async(mmkv_module: MMKVModule, pref_key: string) => CookieJar.fromString(await mmkv_module.get_string(pref_key) ?? ""),
    DATE: async(mmkv_module: MMKVModule, pref_key: string) => new Date(await mmkv_module.get_string(pref_key) ?? 0)
};
export async function generic_load_prefs<TType extends string, TKeys extends string>(mmkv_module: MMKVModule, prefs: BasePrefsRecord<TKeys, unknown, TType>, load_map: BasePrefLoadMap<BasePrefTypes | TType, unknown>) {
    const keys = Object.keys(prefs) as (keyof typeof prefs)[];
    const all_keys = await mmkv_module.get_keys();
    for (const key of keys) {
        const load_function = load_map[prefs[key].type];
        if (all_keys.includes(key) && load_function) prefs[key].current_value = await load_function(mmkv_module, key);
        else if (all_keys.includes(key)) console.error(`UNKNOWN LOAD PREF[KEY] TYPE "${prefs[key].type}"`);
        else prefs[key].current_value = prefs[key].default_value;
    }
}

export const base_save_map: BasePrefSaveMap<BasePrefTypes, unknown> = {
    NUMBER: async(mmkv_module: MMKVModule, pref_key: string, value: unknown) => await mmkv_module.set_number(pref_key, value as number),
    BOOLEAN: async(mmkv_module: MMKVModule, pref_key: string, value: unknown) => await mmkv_module.set_boolean(pref_key, value as boolean),
    STRING: async(mmkv_module: MMKVModule, pref_key: string, value: unknown) => await mmkv_module.set_string(pref_key, value as string),
    STRING_ARRAY: async(mmkv_module: MMKVModule, pref_key: string, value: unknown) => await mmkv_module.set_string(pref_key, JSON.stringify(value as string[])),
    NUMBER_ARRAY: async(mmkv_module: MMKVModule, pref_key: string, value: unknown) => await mmkv_module.set_string(pref_key, JSON.stringify(value as number[])),
    STRING_OPTIONS: async(mmkv_module: MMKVModule, pref_key: string, value: unknown) => await mmkv_module.set_string(pref_key, value as string),
    COOKIE_JAR: async(mmkv_module: MMKVModule, pref_key: string, value: unknown) => await mmkv_module.set_string(pref_key, (value as CookieJar).toString()),
    DATE: async(mmkv_module: MMKVModule, pref_key: string, value: unknown) => await mmkv_module.set_string(pref_key, (value as Date).toISOString())
};
export async function generic_save_pref<TType extends string, TKeys extends string>(mmkv_module: MMKVModule, prefs: BasePrefsRecord<TKeys, unknown, TType>, pref_key: TKeys, value: (typeof prefs)[TKeys]["default_value"], save_map: BasePrefSaveMap<TType, unknown>) {
    const save_function = save_map[prefs[pref_key].type];
    if (save_function) {
        prefs[pref_key].current_value = value;
        await save_function(mmkv_module, pref_key, value);
    }
    else console.error(`UNKNOWN SAVE PREF[KEY] TYPE "${prefs[pref_key].type}"`);
}

export async function generic_reset_prefs(mmkv_module: MMKVModule, keep_prefs: string[], load_prefs: () => void) {
    const keys = (await mmkv_module
        .get_keys())
        .filter((key) => !keep_prefs.includes(key));
    for(const key of keys){
        await mmkv_module.remove_key(key);
    }
    load_prefs();
}
