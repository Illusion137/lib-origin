export interface MMKVModuleOpts {
    id?: string;
    path?: string;
    multi_process?: boolean;
    encryption_key?: string;
}
export interface MMKVModule {
    load_mmkv: (opts: Readonly<MMKVModuleOpts>) => Promise<void>;
    set_string: (key: string, value: string) => Promise<string>;
    get_string: (key: string) => Promise<string | undefined>;
    set_boolean: (key: string, value: boolean) => Promise<boolean>;
    get_boolean: (key: string) => Promise<boolean | undefined>;
    set_number: (key: string, value: number) => Promise<number>;
    get_number: (key: string) => Promise<number | undefined>;

    contains_key: (key: string) => Promise<boolean>;
    get_keys: () => Promise<string[]>;
    remove_key: (key: string) => Promise<void>;
    clear_memory_cache: () => Promise<void>;
    clear_all: () => Promise<void>;
}