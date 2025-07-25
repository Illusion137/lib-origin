import type { MMKVModule, MMKVModuleOpts } from "@native/mmkv/mmkv.base";
import mmkv from 'nodejs-mmkv';

export class node_mmkv implements MMKVModule {
    mmkv_module: mmkv.MMKVModule;
    
    constructor(opts: Readonly<MMKVModuleOpts>){
        this.mmkv_module = new mmkv.MMKVModule({
            id: opts.id,
            rootDir: opts.path,
            multiProcess: opts.multi_process,
            cryptKey: opts.encryption_key,
        });
    }
    set_string(key: string, value: string){
        this.mmkv_module.setString(key, value);
        return value;
    }
    get_string(key: string){
        return this.mmkv_module.getString(key);
    };
    set_boolean(key: string, value: boolean){
        this.mmkv_module.setBoolean(key, value);
        return value;
    };
    get_boolean(key: string){
        return this.mmkv_module.getBoolean(key);
    };
    set_number(key: string, value: number){
        this.mmkv_module.setNumber(key, value);
        return value;
    };
    get_number(key: string){
        return this.mmkv_module.getNumber(key);
    };
    contains_key(key: string){
        return this.mmkv_module.containsKey(key) ?? false;
    };
    get_keys(){
        return this.mmkv_module.getKeys() ?? [];
    };
    remove_key(key: string){
        return this.mmkv_module.removeKey(key);
    }
    clear_memory_cache(){
        return this.mmkv_module.clearMemoryCache();
    }
    clear_all(){
        return this.mmkv_module.clearAll();
    }
}