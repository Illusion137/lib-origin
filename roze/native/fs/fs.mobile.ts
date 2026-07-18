import { generror, generror_catch } from "@common/utils/error_util";
import { gen_uuid } from "@common/utils/util";
import type { DownloadSavable, FileSystem, EncodingOpts, NoOverwriteOpts, ResumableDownloadOpts } from "@native/fs/fs.base";
import * as expo_fs from "expo-file-system/legacy";
import { File, Paths } from "expo-file-system";
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
			return generror_catch(error, "Failed to read file as string", "LOW", { path, opts });
		}
	},
	read_as_buffer: async (path: string) => {
		try {
			const base64 = await expo_fs.readAsStringAsync(path, {encoding: "base64"});
			const uint8_array = Uint8Array.fromBase64(base64);
			return uint8_array.buffer as ArrayBuffer;
		} catch (error) {
			return generror_catch(error, "Failed to read file as string", "MEDIUM", { path });
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
			const path_info = Paths.info(path);
			if (!path_info.exists) {
				return { exists: false, file_modified_ms: 0, is_directory: false, uri: path };
			}
			const is_directory = path_info.isDirectory ?? false;
			let file_modified_ms = 0;
			if (!is_directory) {
				try {
					file_modified_ms = new File(path).info().modificationTime ?? 0;
				} catch {}
			}
			return { exists: true, file_modified_ms, is_directory, uri: path };
		} catch (_) {
			return { exists: false, file_modified_ms: 0, is_directory: false, uri: path };
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
	download_to_file: async (uri: string, to_path?: string, headers?: Record<string, string>) => {
		try {
			if (!to_path) to_path = path_lib.join(expo_fs.cacheDirectory!, gen_uuid() + ".tmp");
			await expo_fs.downloadAsync(uri, to_path, headers ? { headers } : {});
			return to_path;
		} catch (error) {
			return generror_catch(error, "Failed to download_to_file", "MEDIUM", { uri, to_path });
		}
	},
	download_resumable: (opts: ResumableDownloadOpts) => {
		const download_options = opts.headers ? { headers: opts.headers } : {};
		const task = expo_fs.createDownloadResumable(
			opts.uri,
			opts.to_path,
			download_options,
			(p) => opts.on_progress?.(p.totalBytesWritten, p.totalBytesExpectedToWrite),
			opts.resume_data
		);
		let last_savable: DownloadSavable = { url: opts.uri, to_path: opts.to_path, headers: opts.headers, resume_data: opts.resume_data };
		return {
			start: async () => {
				try {
					const result = opts.resume_data ? await task.resumeAsync() : await task.downloadAsync();
					if (!result) return generror("Resumable download returned no result", "MEDIUM", { uri: opts.uri, to_path: opts.to_path });
					return result.uri;
				} catch (error) {
					return generror_catch(error, "Failed resumable download", "MEDIUM", { uri: opts.uri, to_path: opts.to_path });
				}
			},
			pause: async () => {
				try {
					const state = await task.pauseAsync();
					last_savable = { url: state.url, to_path: state.fileUri, headers: opts.headers, resume_data: state.resumeData ?? undefined };
					return state.resumeData ?? undefined;
				} catch {
					return undefined;
				}
			},
			savable: () => {
				try {
					const s = task.savable();
					last_savable = { url: s.url, to_path: s.fileUri, headers: opts.headers, resume_data: s.resumeData ?? undefined };
				} catch { /* keep last known savable */ }
				return last_savable;
			}
		};
	}
};
