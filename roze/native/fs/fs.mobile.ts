import { generror_catch } from "@common/utils/error_util";
import { gen_uuid } from "@common/utils/util";
import type { FileSystem, EncodingOpts, NoOverwriteOpts } from "@native/fs/fs.base";
import * as expo_fs from "expo-file-system/legacy";
import path_lib from "path";

function join_uri(base: string, ...paths: string[]): string {
	if (paths.length === 0) return base;
	const sep = base.endsWith('/') ? '' : '/';
	return base + sep + paths.join('/');
}

export const mobile_fs: FileSystem = {
	temp_directory: async (...paths: string[]) => join_uri(expo_fs.cacheDirectory!, ...paths),
	document_directory: async (...paths: string[]) => join_uri(expo_fs.documentDirectory!, ...paths),
	read_as_string: async (path: string, opts: EncodingOpts) => {
		try {
			return await expo_fs.readAsStringAsync(path, opts);
		} catch (error) {
			return generror_catch(error, "Failed to read file as string", "MEDIUM", { path, opts });
		}
	},
	read_directory: async (path: string) => {
		try {
			return await expo_fs.readDirectoryAsync(path);
		} catch (error) {
			return generror_catch(error, "Failed to read directory", "MEDIUM", { path });
		}
	},
	get_info: async (path: string) => {
		try {
			const stats = await expo_fs.getInfoAsync(path);
			if (stats.exists) {
				return {
					exists: stats.exists,
					file_modified_ms: stats.modificationTime * 1000,
					is_directory: stats.isDirectory,
					uri: stats.uri
				};
			}
			return {
				exists: false,
				file_modified_ms: 0,
				is_directory: false,
				uri: stats.uri
			};
		} catch (_) {
			return {
				exists: false,
				file_modified_ms: 0,
				is_directory: false,
				uri: path
			};
		}
	},
	write_file_as_string: async (path: string, contents: string, opts: EncodingOpts) => {
		try {
			await expo_fs.writeAsStringAsync(path, contents, opts);
			return;
		} catch (error) {
			return generror_catch(error, "Failed to write file", "MEDIUM", { path, opts, contents });
		}
	},
	move: async (from_path: string, to_path: string, opts: NoOverwriteOpts) => {
		try {
			return await expo_fs.moveAsync({ from: from_path, to: to_path });
		} catch (error) {
			return generror_catch(error, "Failed to move file/directory", "MEDIUM", { from_path, to_path, opts });
		}
	},
	copy: async (from_path: string, to_path: string, opts: NoOverwriteOpts) => {
		try {
			return await expo_fs.copyAsync({ from: from_path, to: to_path });
		} catch (error) {
			return generror_catch(error, "Failed to copy file/directory", "MEDIUM", { from_path, to_path, opts });
		}
	},
	make_directory: async (path: string) => {
		try {
			return await expo_fs.makeDirectoryAsync(path);
		} catch (error) {
			return generror_catch(error, "Failed to make directory", "MEDIUM", { path });
		}
	},
	remove: async (path: string) => {
		try {
			return await expo_fs.deleteAsync(path, { idempotent: true });
		} catch (error) {
			return generror_catch(error, "Failed to remove file/directory", "MEDIUM", { path });
		}
	},
	download_to_file: async (uri: string, to_path?: string) => {
		try {
			if (!to_path) to_path = path_lib.join(expo_fs.cacheDirectory!, gen_uuid() + ".tmp");
			await expo_fs.downloadAsync(uri, to_path, {});
			return to_path;
		} catch (error) {
			return generror_catch(error, "Failed to download_to_file", "MEDIUM", { uri, to_path });
		}
	}
};
