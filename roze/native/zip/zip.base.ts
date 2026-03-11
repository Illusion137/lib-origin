import type { PromiseResult } from "@common/types";

export interface Zip {
    list_entries: (file_path: string) => PromiseResult<string[]>;
    stream_entry: (file_path: string, entry: string) => PromiseResult<Buffer>;
    extract_all: (file_path: string, destination_path: string) => PromiseResult<boolean>;
    create_zip: (source_path: string, destination_path: string) => PromiseResult<boolean>;
}
