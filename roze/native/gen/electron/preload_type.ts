import type { ElectronAPI } from "@electron-toolkit/preload";
import type { fs } from "@native/fs/fs";

export interface ElectronPreloadContext {
	temp_directory: (...args: Parameters<ReturnType<(typeof fs)>["temp_directory"]>) => Promise<ReturnType<ReturnType<(typeof fs)>["temp_directory"]>>;
	document_directory: (...args: Parameters<ReturnType<(typeof fs)>["document_directory"]>) => Promise<ReturnType<ReturnType<(typeof fs)>["document_directory"]>>;
	read_as_string: (...args: Parameters<ReturnType<(typeof fs)>["read_as_string"]>) => Promise<ReturnType<ReturnType<(typeof fs)>["read_as_string"]>>;
	read_directory: (...args: Parameters<ReturnType<(typeof fs)>["read_directory"]>) => Promise<ReturnType<ReturnType<(typeof fs)>["read_directory"]>>;
	get_info: (...args: Parameters<ReturnType<(typeof fs)>["get_info"]>) => Promise<ReturnType<ReturnType<(typeof fs)>["get_info"]>>;
	write_file_as_string: (...args: Parameters<ReturnType<(typeof fs)>["write_file_as_string"]>) => Promise<ReturnType<ReturnType<(typeof fs)>["write_file_as_string"]>>;
	move: (...args: Parameters<ReturnType<(typeof fs)>["move"]>) => Promise<ReturnType<ReturnType<(typeof fs)>["move"]>>;
	copy: (...args: Parameters<ReturnType<(typeof fs)>["copy"]>) => Promise<ReturnType<ReturnType<(typeof fs)>["copy"]>>;
	make_directory: (...args: Parameters<ReturnType<(typeof fs)>["make_directory"]>) => Promise<ReturnType<ReturnType<(typeof fs)>["make_directory"]>>;
	remove: (...args: Parameters<ReturnType<(typeof fs)>["remove"]>) => Promise<ReturnType<ReturnType<(typeof fs)>["remove"]>>;
	download_to_file: (...args: Parameters<ReturnType<(typeof fs)>["download_to_file"]>) => Promise<ReturnType<ReturnType<(typeof fs)>["download_to_file"]>>;
};
export type ElectronWindow = typeof Window & {
	electron: ElectronAPI;
	context: ElectronPreloadContext;
};