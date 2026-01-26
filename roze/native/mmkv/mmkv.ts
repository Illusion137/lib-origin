import type { MMKVModule } from "@native/mmkv/mmkv.base";
import { get_native_platform } from "@native/native_mode";

let mmkv_instance: MMKVModule;

export async function load_native_mmkv(): Promise<MMKVModule>{
	if (mmkv_instance) return mmkv_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native MMKVModule is NOT implemented");
			break;
		case "NODE":
			try {
				mmkv_instance = (await import("./mmkv.node.ts")).node_mmkv;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				mmkv_instance = (await import("./mmkv.mobile.ts")).mobile_mmkv;
			} catch (e) { console.error(e); }
			break;
	}
	return mmkv_instance;
}

export function mmkv(): MMKVModule {
	if (mmkv_instance) return mmkv_instance;
    console.error(new Error("Native Module [mmkv/MMKVModule] is NOT loaded"));
	return mmkv_instance;
}