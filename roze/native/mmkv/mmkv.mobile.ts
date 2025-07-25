import type { MMKVModule, MMKVModuleOpts } from "@native/mmkv/mmkv.base";
import mmkv, { Mode } from 'react-native-mmkv';

export class mobile_mmkv implements MMKVModule {
    mmkv_module: mmkv.MMKV;
    
    constructor(opts: Readonly<MMKVModuleOpts>){
        this.mmkv_module = new mmkv.MMKV({
            id: opts.id,
            path: opts.path,
            mode: opts.multi_process ? Mode.MULTI_PROCESS : Mode.SINGLE_PROCESS,
            encryptionKey: opts.encryption_key
        });
    }
    set_string(key: string, value: string) {
        this.mmkv_module.set(key, value);
        return value;
    }
    get_string(key: string){
        return this.mmkv_module.getString(key);
    };
    set_boolean(key: string, value: boolean){
        this.mmkv_module.set(key, value);
        return value;
    };
    get_boolean(key: string){
        return this.mmkv_module.getBoolean(key);
    };
    set_number(key: string, value: number){
        this.mmkv_module.set(key, value);
        return value;
    };
    get_number(key: string){
        return this.mmkv_module.getNumber(key);
    };
    contains_key(key: string){
        return this.mmkv_module.contains(key);
    };
    get_keys(){
        return this.mmkv_module.getAllKeys();
    };
    remove_key(key: string){
        return this.mmkv_module.delete(key);
    }
    clear_memory_cache(){
        return this.mmkv_module.clearAll();
    }
    clear_all(){
        return this.mmkv_module.clearAll();
    }
}
// export const mobile_mmkv: MMKVModule = {
// }