import type { SabrDownloader } from "@native/sabr_downloader/sabr_downloader.base";
import { get_native_platform } from "@native/native_mode";

let sabr_downloader_instance: SabrDownloader;

export async function load_native_sabr_downloader(): Promise<SabrDownloader> {
	if (sabr_downloader_instance) return sabr_downloader_instance;
	switch (get_native_platform()) {
		case "NODE":
			try {
				sabr_downloader_instance = (await import("./sabr_downloader.node.ts")).node_sabr_downloader;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				sabr_downloader_instance = (await import("./sabr_downloader.mobile.ts")).mobile_sabr_downloader;
			} catch (e) { console.error(e); }
			break;
		case "WEB":
		default:
			console.error("SabrDownloader not implemented for this platform");
	}
	return sabr_downloader_instance;
}

export function sabr_downloader(): SabrDownloader {
	if (sabr_downloader_instance) return sabr_downloader_instance;
	console.error(new Error("Native Module [sabr_downloader/SabrDownloader] is NOT loaded"));
	return sabr_downloader_instance;
}
