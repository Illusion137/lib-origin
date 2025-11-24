import type { MiscNative } from "@native/miscnative/miscnative.base";
import { get_native_platform } from "@native/native_mode";

let miscnative_instance: MiscNative;

export async function load_native_miscnative(): Promise<MiscNative>{
	if (miscnative_instance) return miscnative_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native MiscNative is NOT implemented");
			break;
		case "ELECTRON_RENDERER":
			try {
				// miscnative_instance = (await import("../gen/electron/modules/miscnative.electron_renderer")).electron_renderer_miscnative;
			} catch (e) {}
			break;
		case "NODE":
			try {
				miscnative_instance = (await import("./miscnative.node")).node_miscnative;
			} catch (e) {}
			break;
		case "REACT_NATIVE":
			try {
				miscnative_instance = (await import("./miscnative.mobile")).mobile_miscnative;
			} catch (e) {}
			break;
	}
	return miscnative_instance;
}

export function miscnative(): MiscNative {
	if (miscnative_instance) return miscnative_instance;
    console.error(new Error("Native Module [miscnative/MiscNative] is NOT loaded"));
	return miscnative_instance;
}