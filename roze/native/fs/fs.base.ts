import type { ResponseError } from '../../../origin/src/utils/types';

export interface NoOverwriteOpts {
    no_overwrite?: boolean;
}
export type EncodingTypes = "utf8"|"base64";
export interface EncodingOpts {
    encoding?: EncodingTypes;
}
export interface FileSystem {
    read_as_string: (path: string, opts: EncodingOpts) => Promise<string|ResponseError>;
    read_directory: (path: string) => Promise<string[]|ResponseError>;
    get_info: (path: string) => Promise<unknown>;
    write_file_as_string: (path: string, contents: string, opts: EncodingOpts) => Promise<unknown>;
    move: (from_path: string, to_path: string, opts: NoOverwriteOpts) => Promise<unknown>;
    copy: (from_path: string, to_path: string, opts: NoOverwriteOpts) => Promise<unknown>;
    make_directory: (path: string) => Promise<unknown>;
    remove: (path: string) => Promise<unknown>;
}