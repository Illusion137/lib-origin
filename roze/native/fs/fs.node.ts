import fs from "fs/promises";
import fs_sync from "fs";
import os from "os";
import path_lib from "path";
import { gen_uuid } from "@common/utils/util";
import type { FileSystem, EncodingOpts, NoOverwriteOpts, ResumableDownloadOpts } from "@native/fs/fs.base";
import type { ReadableStream } from "stream/web";
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
	read_as_buffer: async (path: string) => {
		try {
			return (await fs.readFile(path)).buffer;
		} catch (error) {
			return generror_catch(error, "Failed to read file as string", "MEDIUM", { path });
		}
	},
	read_as_buffer_range: async (path: string, position: number, length: number) => {
		let handle: fs.FileHandle | undefined = undefined;
		try {
			handle = await fs.open(path, "r");
			const buffer = Buffer.allocUnsafe(length);
			const { bytesRead } = await handle.read(buffer, 0, length, position);
			return new Uint8Array(buffer.buffer, buffer.byteOffset, bytesRead);
		} catch (error) {
			return generror_catch(error, "Failed to read file range", "MEDIUM", { path, position, length });
		} finally {
			await handle?.close();
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
				size: stats.isDirectory() ? 0 : stats.size,
				uri: path
			};
		} catch (_) {
			return {
				exists: false,
				file_modified_ms: 0,
				is_directory: false,
				size: 0,
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

			// Read via the web-stream reader instead of Readable.fromWeb — in an
			// Electron renderer fetch returns Blink's ReadableStream, which node's
			// fromWeb rejects with ERR_INVALID_ARG_TYPE.
			const reader = (response.body as ReadableStream<Uint8Array>).getReader();
			const file_stream = fs_sync.createWriteStream(to_path);
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				if (!file_stream.write(value)) await new Promise((resolve) => file_stream.once("drain", resolve));
			}
			await new Promise<void>((resolve, reject) => file_stream.end(() => resolve()).once("error", reject));
			return to_path;
		} catch (error) {
			return generror_catch(error, "Failed to download_to_file", "MEDIUM", { uri, to_path });
		}
	},
	download_resumable: (opts: ResumableDownloadOpts) => ({
		start: async () => {
			const result = await node_fs.download_to_file(opts.uri, opts.to_path, opts.headers);
			if (typeof result === "string") opts.on_progress?.(1, 1);
			return result;
		},
		pause: async () => undefined,
		savable: () => ({ url: opts.uri, to_path: opts.to_path, headers: opts.headers })
	})
};
