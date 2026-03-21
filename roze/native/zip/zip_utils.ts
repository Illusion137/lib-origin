import type { PromiseResult, ResponseSuccess } from '@common/types';
import { zip } from './zip';
export class ZipFile {
    readonly #file_path: string;
    #entry_list: string[];
    constructor(file_path: string){
        this.#file_path = file_path;
        this.#entry_list = [];
    }
    public get count(): number {
        return this.#entry_list.length;
    }
    public get entry_list() {
        return this.#entry_list;
    }
    public async load_zip(): PromiseResult<ResponseSuccess> {
        const entry_list = await zip().list_entries(this.#file_path);
        if("error" in entry_list) return entry_list;
        this.#entry_list = entry_list;
        return { success: true };
    }
    public async read_file(entry: string): PromiseResult<Buffer> {
        return zip().stream_entry(this.#file_path, entry);
    }
    public async extract_all(destination_path: string): PromiseResult<boolean> {
        return zip().extract_all(this.#file_path, destination_path);
    }
};
