import type { MiscNative } from "@native/miscnative/miscnative.base";
import { get_native_platform } from "@native/native_mode";

let miscnative_instance: MiscNative;

export async function load_native_miscnative(): Promise<MiscNative>{
	if (miscnative_instance) return miscnative_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native MiscNative is NOT implemented");
			break;
		case "NODE":
			try {
				miscnative_instance = (await import("./miscnative.node.ts")).node_miscnative;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				miscnative_instance = (await import("./miscnative.mobile.ts")).mobile_miscnative;
			} catch (e) { console.error(e); }
			break;
	}
	return miscnative_instance;
}

export function miscnative(): MiscNative {
	if (miscnative_instance) return miscnative_instance;
    console.error(new Error("Native Module [miscnative/MiscNative] is NOT loaded"));
	return miscnative_instance;
}