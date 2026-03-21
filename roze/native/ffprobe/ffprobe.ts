import type { FFPROBE } from "@native/ffprobe/ffprobe.base";
import { get_native_platform } from "@native/native_mode";

let ffprobe_instance: FFPROBE;

export async function load_native_ffprobe(): Promise<FFPROBE> {
	if (ffprobe_instance) return ffprobe_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native FFPROBE is NOT implemented");
			break;
		case "NODE":
			try {
				ffprobe_instance = (await import("./ffprobe.node.ts")).node_ffprobe;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				ffprobe_instance = (await import("./ffprobe.mobile.ts")).mobile_ffprobe;
			} catch (e) { console.error(e); }
			break;
	}
	return ffprobe_instance;
}

export function ffprobe(): FFPROBE {
	if (ffprobe_instance) return ffprobe_instance;
	console.error(new Error("Native Module [ffprobe/FFPROBE] is NOT loaded"));
	return ffprobe_instance;
}