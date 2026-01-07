import type { MMKVModule } from "@native/mmkv/mmkv.base";
import * as mmkv from 'react-native-mmkv';

let mmkv_module: mmkv.MMKV = {} as never;
export const mobile_mmkv: MMKVModule = {
    load_mmkv: async() => {
        mmkv_module = new mmkv.MMKV();
    },
    set_string: async(key: string, value: string) =>{
        mmkv_module.set(key, value);
        return value;
    },
    get_string: async(key: string)=>{
        return mmkv_module.getString(key);
    },
    set_boolean: async(key: string, value: boolean)=>{
        mmkv_module.set(key, value);
        return value;
    },
    get_boolean: async(key: string)=>{
        return mmkv_module.getBoolean(key);
    },
    set_number: async(key: string, value: number)=>{
        mmkv_module.set(key, value);
        return value;
    },
    get_number: async(key: string)=>{
        return mmkv_module.getNumber(key);
    },
    contains_key: async(key: string)=>{
        return mmkv_module.contains(key);
    },
    get_keys: async()=>{
        return mmkv_module.getAllKeys();
    },
    remove_key: async(key: string)=>{
        return mmkv_module.delete(key);
    },
    clear_memory_cache: async()=>{
        return mmkv_module.clearAll();
    },
    clear_all: async()=>{
        return mmkv_module.clearAll();
    }
}