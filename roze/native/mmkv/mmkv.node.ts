import type { MMKVModule, MMKVModuleOpts } from "@native/mmkv/mmkv.base";
import mmkv from 'nodejs-mmkv';
const __MMKV_MODULE__: any = mmkv;

let mmkv_module: mmkv.MMKVModule = {} as never;
export const node_mmkv: MMKVModule = {
    load_mmkv: async(opts: Readonly<MMKVModuleOpts>) => {
        mmkv_module = new __MMKV_MODULE__({
            id: opts.id,
            rootDir: opts.path,
            multiProcess: opts.multi_process,
            cryptKey: opts.encryption_key,
        });
    },
    set_string: async(key: string, value: string) => {
        mmkv_module.setString(key, value);
        return value;
    },
    get_string: async(key: string) => {
        return mmkv_module.getString(key);
    },
    set_boolean: async(key: string, value: boolean) => {
        mmkv_module.setBoolean(key, value);
        return value;
    },
    get_boolean: async(key: string) => {
        return mmkv_module.getBoolean(key);
    },
    set_number: async(key: string, value: number) => {
        mmkv_module.setNumber(key, value);
        return value;
    },
    get_number: async(key: string) => {
        return mmkv_module.getNumber(key);
    },
    contains_key: async(key: string) => {
        return mmkv_module.containsKey(key) ?? false;
    },
    get_keys: async() => {
        return mmkv_module.getKeys() ?? [];
    },
    remove_key: async(key: string) => {
        return mmkv_module.removeKey(key);
    },
    clear_memory_cache: async() => {
        return mmkv_module.clearMemoryCache();
    },
    clear_all: async() => {
        return mmkv_module.clearAll();
    }
}