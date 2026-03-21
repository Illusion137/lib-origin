import fs from "fs/promises";
import fs_sync from "fs";
import os from "os";
import path_lib from "path";
import { gen_uuid } from "@common/utils/util";
import { Readable } from "stream";
import type { FileSystem, EncodingOpts, NoOverwriteOpts } from "@native/fs/fs.base";
import type { ReadableStream } from "stream/web";
import { finished } from "stream/promises";
import { generror_catch } from "@common/utils/error_util";

export const node_fs: FileSystem = {
	temp_directory: async (...paths: string[]) => path_lib.join(os.tmpdir(), ...paths),
	document_directory: async (...paths: string[]) => path_lib.join(os.homedir(), ...paths),
	read_as_string: async (path: string, opts: EncodingOpts) => {
		try {
			return (await fs.readFile(path, opts)).toString();
		} catch (error) {
			return generror_catch(error, "Failed to read file as string", "MEDIUM", { path, opts });
		}
	},
	read_directory: async (path: string) => {
		try {
			return await fs.readdir(path);
		} catch (error) {
			return generror_catch(error, "Failed to read directory", "MEDIUM", { path });
		}
	},
	get_info: async (path: string) => {
		try {
			const stats = await fs.stat(path);
			return {
				exists: true,
				file_modified_ms: stats.mtime.getTime(),
				is_directory: stats.isDirectory(),
				uri: path
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
			await fs.writeFile(path, contents, opts);
			return;
		} catch (error) {
			return generror_catch(error, "Failed to write file", "MEDIUM", { path, opts, contents: contents.slice(0, 50) });
		}
	},
	move: async (from_path: string, to_path: string, opts: NoOverwriteOpts) => {
		try {
			return await fs.rename(from_path, to_path);
		} catch (error) {
			return generror_catch(error, "Failed to move file/directory", "MEDIUM", { from_path, to_path, opts });
		}
	},
	copy: async (from_path: string, to_path: string, opts: NoOverwriteOpts) => {
		try {
			return await fs.cp(from_path, to_path, { force: !opts.no_overwrite, recursive: true });
		} catch (error) {
			return generror_catch(error, "Failed to copy file/directory", "MEDIUM", { from_path, to_path, opts });
		}
	},
	make_directory: async (path: string) => {
		try {
			return await fs.mkdir(path);
		} catch (error) {
			return generror_catch(error, "Failed to make directory", "MEDIUM", { path });
		}
	},
	remove: async (path: string) => {
		try {
			return fs.rm(path);
		} catch (error) {
			return generror_catch(error, "Failed to remove file/directory", "MEDIUM", { path });
		}
	},
	download_to_file: async (uri: string, to_path?: string) => {
		try {
			if (!to_path) to_path = path_lib.join(os.tmpdir(), gen_uuid() + ".tmp");

			const response = await fetch(uri);

			if (!response.ok || response.body === null) {
				throw new Error(`Failed to download file: ${response.statusText}`);
			}

			const body = Readable.fromWeb(response.body as ReadableStream);
			const file_stream = fs_sync.createWriteStream(to_path);

			await finished(body.pipe(file_stream));
			return to_path;
		} catch (error) {
			return generror_catch(error, "Failed to download_to_file", "MEDIUM", { uri, to_path });
		}
	}
};
