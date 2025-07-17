import type { MMKVModule, MMKVModuleOpts } from "./mmkv.base";
import { get_native_platform } from "../native_mode";
import { CookieJar } from "../../../origin/src/utils/cookie_util";

let mmkv: any;
switch(get_native_platform()){
    case "WEB": throw new Error("Web Native MMKV is NOT implemented");
    case "NODE": try {mmkv = require("./mmkv.node").node_mmkv;} catch(e) {} break;
    case "REACT_NATIVE": try {mmkv = require("./mmkv.mobile").mobile_mmkv;} catch(e) {} break;
}
export function create_mmkv(opts: Readonly<MMKVModuleOpts>): MMKVModule{
    return new mmkv(opts);
}

export type BasePrefTypes = "NUMBER" | "BOOLEAN" | "STRING" | "STRING_ARRAY" | "NUMBER_ARRAY" | "STRING_OPTIONS" | "COOKIE_JAR" | "DATE" ;
export interface BasePref<TValue, TType extends string = "">
{
    readonly default_value: TValue
    current_value: TValue;
    readonly type: BasePrefTypes|TType;
    readonly section?: string;
    readonly description?: string;
    readonly range?: {"start": number, "end": number};
    readonly options?: TValue[];
};
export type BasePrefs<TKeys extends string, TValue, TType extends string> = Record<TKeys, BasePref<TValue, TType>>;
export type BasePrefLoadMap<TType extends string, TValue> = Record<BasePrefTypes|TType, (mmkv_module: MMKVModule, pref_key: string) => TValue>;
export type BasePrefSaveMap<TType extends string, TValue> = Record<BasePrefTypes|TType, (mmkv_module: MMKVModule, pref_key: string, value: TValue) => void>;

export function generic_get_pref<TPrefsValue, TType extends string, TPrefs extends Record<string, BasePref<TPrefsValue, TType>>, TKeys extends keyof TPrefs>(prefs: TPrefs, pref_key: TKeys): TPrefs[TKeys]['default_value'] {
    return prefs[pref_key].current_value;
}

export const base_load_map: BasePrefLoadMap<BasePrefTypes, unknown> = {
    NUMBER: (mmkv_module: MMKVModule, pref_key: string) => mmkv_module.get_number(pref_key),
    BOOLEAN: (mmkv_module: MMKVModule, pref_key: string) => mmkv_module.get_boolean(pref_key),
    STRING: (mmkv_module: MMKVModule, pref_key: string) => mmkv_module.get_string(pref_key),
    STRING_ARRAY: (mmkv_module: MMKVModule, pref_key: string) => JSON.parse(mmkv_module.get_string(pref_key) ?? "[]"),
    NUMBER_ARRAY: (mmkv_module: MMKVModule, pref_key: string) => JSON.parse(mmkv_module.get_string(pref_key) ?? "[]"),
    STRING_OPTIONS: (mmkv_module: MMKVModule, pref_key: string) => mmkv_module.get_string(pref_key),
    COOKIE_JAR: (mmkv_module: MMKVModule, pref_key: string) => CookieJar.fromString(mmkv_module.get_string(pref_key) ?? ""),
    DATE: (mmkv_module: MMKVModule, pref_key: string) => new Date(mmkv_module.get_string(pref_key) ?? 0)
};
export function generic_load_prefs<TType extends string, TKeys extends string>(mmkv_module: MMKVModule, prefs: BasePrefs<TKeys, unknown, TType>, load_map: BasePrefLoadMap<BasePrefTypes|TType, unknown>) {
    const keys = Object.keys(prefs) as (keyof typeof prefs)[];
    const all_keys = mmkv_module.get_keys();
    for(const key of keys) {
        const load_function = load_map[prefs[key].type];
        if(all_keys.includes(key) && load_function)
            prefs[key].current_value = load_function(mmkv_module, key);
        else if(all_keys.includes(key)) console.error(`UNKNOWN LOAD PREF[KEY] TYPE "${prefs[key].type}"`);
        else prefs[key].current_value = prefs[key].default_value;
    }
}

export const base_save_map: BasePrefSaveMap<BasePrefTypes, unknown> = {
    NUMBER:(mmkv_module: MMKVModule, pref_key: string, value: unknown) => mmkv_module.set_number(pref_key, value as number),
    BOOLEAN:(mmkv_module: MMKVModule, pref_key: string, value: unknown) => mmkv_module.set_boolean(pref_key, value as boolean),
    STRING:(mmkv_module: MMKVModule, pref_key: string, value: unknown) => mmkv_module.set_string(pref_key, value as string),
    STRING_ARRAY:(mmkv_module: MMKVModule, pref_key: string, value: unknown) => mmkv_module.set_string(pref_key, JSON.stringify(value as string[])),
    NUMBER_ARRAY:(mmkv_module: MMKVModule, pref_key: string, value: unknown) => mmkv_module.set_string(pref_key, JSON.stringify(value as number[])),
    STRING_OPTIONS:(mmkv_module: MMKVModule, pref_key: string, value: unknown) => mmkv_module.set_string(pref_key, (value as string)),
    COOKIE_JAR:(mmkv_module: MMKVModule, pref_key: string, value: unknown) => mmkv_module.set_string(pref_key, (value as CookieJar).toString()),
    DATE:(mmkv_module: MMKVModule, pref_key: string, value: unknown) => mmkv_module.set_string(pref_key, (value as Date).toISOString())
};
export function generic_save_pref<T extends string>(mmkv_module: MMKVModule, prefs: Record<T, BasePref<unknown, BasePrefTypes|TType>>, pref_key: T, value: (typeof prefs)[T]['default_value'], save_map: BasePrefSaveMap<TType, unknown>) {
    const save_function = save_map[prefs[key].type];
    if(save_function) prefs[pref_key].current_value = save_function(mmkv_module, pref_key, value);
    else console.error(`UNKNOWN SAVE PREF[KEY] TYPE "${prefs[key].type}"`);
}

export function generic_reset_prefs(mmkv_module: MMKVModule, keep_prefs: string[]) {
    mmkv_module.get_keys().filter(key => !keep_prefs.includes(key)).forEach(key => mmkv_module.remove_key(key));
    load_prefs();
}