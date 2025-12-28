import type { FileSystem } from "@native/fs/fs.base";
import { get_native_platform } from "@native/native_mode";

let fs_instance: FileSystem;

export async function load_native_fs(): Promise<FileSystem>{
	if (fs_instance) return fs_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native FileSystem is NOT implemented");
			break;
		case "ELECTRON_RENDERER":
			try {
				// fs_instance = (await import("../gen/electron/modules/fs.electron_renderer")).electron_renderer_fs;
			} catch (e) {}
			break;
		case "NODE":
			try {
				fs_instance = (await import("./fs.node.js")).node_fs;
			} catch (e) {}
			break;
		case "REACT_NATIVE":
			try {
				fs_instance = (await import("./fs.mobile.js")).mobile_fs;
			} catch (e) {}
			break;
	}
	return fs_instance;
}

export function fs(): FileSystem {
	if (fs_instance) return fs_instance;
    console.error(new Error("Native Module [fs/FileSystem] is NOT loaded"));
	return fs_instance;
}