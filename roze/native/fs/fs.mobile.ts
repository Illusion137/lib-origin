import { generror } from "../../../origin/src/utils/util";
import type { FileSystem, EncodingOpts, NoOverwriteOpts } from "./fs.base";
import expo_fs from 'expo-file-system';

export const mobile_fs: FileSystem = {
    read_as_string: async(path: string, opts: EncodingOpts) => {
        try {
            return await expo_fs.readAsStringAsync(path, opts);
        } catch (error) {
            return generror("Failed to read file as string", {path, opts});
        }
    },
    read_directory: async(path: string) => {
        try {
            return await expo_fs.readDirectoryAsync(path);
        } catch (error) {
            return generror("Failed to read directory", {path});
        }
    },
    get_info: async(path: string) => {
        try {
            return await expo_fs.getInfoAsync(path);
        } catch (error) {
            return generror("Failed to get info", {path});
        }
    },
    write_file_as_string: async(path: string, contents: string, opts: EncodingOpts) => {
        try {
            return await expo_fs.writeAsStringAsync(path, contents, opts);
        } catch (error) {
            return generror("Failed to write file", {path, opts, contents});
        }
    },
    move: async(from_path: string, to_path: string, opts: NoOverwriteOpts) => {
        try {
            return await expo_fs.moveAsync({from: from_path, to: to_path});
        } catch (error) {
            return generror("Failed to move file/directory", {from_path, to_path, opts});
        }
    },
    copy: async(from_path: string, to_path: string, opts: NoOverwriteOpts) => {
        try {
            return await expo_fs.copyAsync({from: from_path, to: to_path});
        } catch (error) {
            return generror("Failed to copy file/directory", {from_path, to_path, opts});
        }
    },
    make_directory: async(path: string) => {
        try {
            return await expo_fs.makeDirectoryAsync(path);
        } catch (error) {
            return generror("Failed to make directory", {path});
        }
    },
    remove: async(path: string) => {
        try {
            return await expo_fs.deleteAsync(path);
        } catch (error) {
            return generror("Failed to remove file/directory", {path});
        }
    },
};