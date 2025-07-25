import type { PromiseResult, ResponseError } from '@common/types';

export interface NoOverwriteOpts {
    no_overwrite?: boolean;
}
export type EncodingTypes = "utf8"|"base64";
export interface EncodingOpts {
    encoding?: EncodingTypes;
}
export interface FileInfo {
    exists: boolean;
    is_directory: boolean;
    file_modified_ms: number;
    uri: string;
}
export interface FileSystem {
    temp_directory: (...paths: string[]) => string;
    document_directory: (...paths: string[]) => string;
    read_as_string: (path: string, opts: EncodingOpts) => Promise<string|ResponseError>;
    read_directory: (path: string) => Promise<string[]|ResponseError>;
    get_info: (path: string) => Promise<FileInfo>;
    write_file_as_string: (path: string, contents: string, opts: EncodingOpts) => PromiseResult<undefined>;
    move: (from_path: string, to_path: string, opts: NoOverwriteOpts) => Promise<unknown>;
    copy: (from_path: string, to_path: string, opts: NoOverwriteOpts) => Promise<unknown>;
    make_directory: (path: string) => Promise<unknown>;
    remove: (path: string) => Promise<unknown>;
    download_to_file: (uri: string, to_path?: string) => PromiseResult<string>
}