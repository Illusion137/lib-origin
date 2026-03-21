import { get_native_platform } from "@native/native_mode";
import type { Zip } from "@native/zip/zip.base";

let zip_instance: Zip;

export async function load_native_zip(): Promise<Zip>{
	if (zip_instance) return zip_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native Zip is NOT implemented");
			break;
		case "NODE":
			try {
				zip_instance = (await import("./zip.node.ts")).node_zip;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				zip_instance = (await import("./zip.mobile.ts")).mobile_zip;
			} catch (e) { console.error(e); }
			break;
	}
	return zip_instance;
}
export function zip(): Zip {
	if (zip_instance) return zip_instance;
    console.error(new Error("Native Module [zip/Zip] is NOT loaded"));
	return zip_instance;
}
