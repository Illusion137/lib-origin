import fs from 'fs';
import { generror } from "../../../origin/src/utils/util";
import type { FileSystem, EncodingOpts, NoOverwriteOpts } from "./fs.base";

export const node_fs: FileSystem = {
    read_as_string: async(path: string, opts: EncodingOpts) => {
        try {
            return fs.readFileSync(path, opts).toString();
        } catch (error) {
            return generror("Failed to read file as string", {path, opts});
        }
    },
    read_directory: async(path: string) => {
        try {
            return fs.readdirSync(path);
        } catch (error) {
            return generror("Failed to read directory", {path});
        }
    },
    get_info: async(path: string) => {
        try {
            return fs.statSync(path);
        } catch (error) {
            return generror("Failed to get info", {path});
        }
    },
    write_file_as_string: async(path: string, contents: string, opts: EncodingOpts) => {
        try {
            return fs.writeFileSync(path, contents, opts);
        } catch (error) {
            return generror("Failed to write file", {path, opts, contents});
        }
    },
    move: async(from_path: string, to_path: string, opts: NoOverwriteOpts) => {
        try {
            return;
            // return fs.move({from: from_path, to: to_path});
        } catch (error) {
            return generror("Failed to move file/directory", {from_path, to_path, opts});
        }
    },
    copy: async(from_path: string, to_path: string, opts: NoOverwriteOpts) => {
        try {
            return fs.cpSync(from_path, to_path, {force: !opts.no_overwrite, recursive: true});
        } catch (error) {
            return generror("Failed to copy file/directory", {from_path, to_path, opts});
        }
    },
    make_directory: async(path: string) => {
        try {
            return fs.mkdirSync(path);
        } catch (error) {
            return generror("Failed to make directory", {path});
        }
    },
    remove: async(path: string) => {
        try {
            return fs.rmSync(path);
        } catch (error) {
            return generror("Failed to remove file/directory", {path});
        }
    },
};