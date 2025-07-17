export interface MMKVModuleOpts {
    id: string;
    path: string;
    multi_process?: boolean;
    encryption_key?: string;
}
export interface MMKVModule {
    set_string: (key: string, value: string) => string;
    get_string: (key: string) => string | undefined;
    set_boolean: (key: string, value: boolean) => boolean;
    get_boolean: (key: string) => boolean | undefined;
    set_number: (key: string, value: number) => number;
    get_number: (key: string) => number | undefined;

    contains_key: (key: string) => boolean;
    get_keys: () => string[];
    remove_key: (key: string) => void;
    clear_memory_cache: () => void;
    clear_all: () => void;
}