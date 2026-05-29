import type { RawToPng } from "@native/raw_to_png/raw_to_png.base";
import { get_native_platform } from "@native/native_mode";

let raw_to_png_instance: RawToPng;

export async function load_native_raw_to_png(): Promise<RawToPng> {
	if (raw_to_png_instance) return raw_to_png_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native RawToPng is NOT implemented");
			break;
		case "NODE":
			try {
				raw_to_png_instance = (await import("./raw_to_png.node.ts")).node_raw_to_png;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				raw_to_png_instance = (await import("./raw_to_png.mobile.ts")).mobile_raw_to_png;
			} catch (e) { console.error(e); }
			break;
	}
	return raw_to_png_instance;
}

export function raw_to_png_native(): RawToPng {
	if (raw_to_png_instance) return raw_to_png_instance;
	console.error(new Error("Native Module [raw_to_png/RawToPng] is NOT loaded"));
	return raw_to_png_instance;
}
