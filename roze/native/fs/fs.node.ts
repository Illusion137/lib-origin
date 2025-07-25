import fs from 'fs';
import os from 'os';
import path_lib from 'path';
import { gen_uuid } from "@common/utils/util";
import { Readable } from 'stream';
import type { FileSystem, EncodingOpts, NoOverwriteOpts } from "@native/fs/fs.base";
import type { ReadableStream } from 'stream/web';
import { finished } from 'stream/promises';
import { generror_catch } from '@common/utils/error_util';

export const node_fs: FileSystem = {
    temp_directory: (...paths: string[]) => path_lib.join(os.tmpdir(), ...paths),
    document_directory: (...paths: string[]) => path_lib.join(os.homedir(), ...paths),
    read_as_string: async(path: string, opts: EncodingOpts) => {
        try {
            return fs.readFileSync(path, opts).toString();
        } catch (error) {
            return generror_catch(error, "Failed to read file as string", {path, opts});
        }
    },
    read_directory: async(path: string) => {
        try {
            return fs.readdirSync(path);
        } catch (error) {
            return generror_catch(error, "Failed to read directory", {path});
        }
    },
    get_info: async(path: string) => {
        try {
            const stats = fs.statSync(path);
            return {
                exists: true,
                file_modified_ms: stats.mtime.getTime(),
                is_directory: stats.isDirectory(),
                uri: path
            }
        } catch (error) {
            return {
                exists: false,
                file_modified_ms: 0,
                is_directory: false,
                uri: path
            }
        }
    },
    write_file_as_string: async(path: string, contents: string, opts: EncodingOpts) => {
        try {
            fs.writeFileSync(path, contents, opts);
            return;
        } catch (error) {
            return generror_catch(error, "Failed to write file", {path, opts, contents});
        }
    },
    move: async(from_path: string, to_path: string, opts: NoOverwriteOpts) => {
        try {
            return fs.renameSync(from_path, to_path);
        } catch (error) {
            return generror_catch(error, "Failed to move file/directory", {from_path, to_path, opts});
        }
    },
    copy: async(from_path: string, to_path: string, opts: NoOverwriteOpts) => {
        try {
            return fs.cpSync(from_path, to_path, {force: !opts.no_overwrite, recursive: true});
        } catch (error) {
            return generror_catch(error, "Failed to copy file/directory", {from_path, to_path, opts});
        }
    },
    make_directory: async(path: string) => {
        try {
            return fs.mkdirSync(path);
        } catch (error) {
            return generror_catch(error, "Failed to make directory", {path});
        }
    },
    remove: async(path: string) => {
        try {
            return fs.rmSync(path);
        } catch (error) {
            return generror_catch(error, "Failed to remove file/directory", {path});
        }
    },
    download_to_file: async(uri: string, to_path?: string) => {
        try {
            if(!to_path) to_path = path_lib.join(os.tmpdir(), gen_uuid() + '.tmp');

            const response = await fetch(uri);

            if (!response.ok || response.body === null) {
                throw new Error(`Failed to download file: ${response.statusText}`);
            }

            const body = Readable.fromWeb(response.body as ReadableStream); 
            const file_stream = fs.createWriteStream(to_path);

            await finished(body.pipe(file_stream));
            return to_path;
        }
        catch(error){
            return generror_catch(error, "Failed to download_to_file", {uri, to_path});
        }
    }
};