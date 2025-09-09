import type { MMKVModule } from "@native/mmkv/mmkv.base";
import { get_native_platform } from "@native/native_mode";

let mmkv_instance: MMKVModule;

export async function load_native_mmkv(): Promise<MMKVModule>{
	if (mmkv_instance) return mmkv_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native MMKVModule is NOT implemented");
			break;
		case "ELECTRON_RENDERER":
			try {
				mmkv_instance = (await import("../gen/electron/modules/mmkv.electron_renderer")).electron_renderer_mmkv;
			} catch (e) {}
			break;
		case "NODE":
			try {
				mmkv_instance = (await import("./mmkv.node")).node_mmkv;
			} catch (e) {}
			break;
		case "REACT_NATIVE":
			try {
				mmkv_instance = (await import("./mmkv.mobile")).mobile_mmkv;
			} catch (e) {}
			break;
	}
	return mmkv_instance;
}

export function mmkv(): MMKVModule {
	if (mmkv_instance) return mmkv_instance;
    console.error(new Error("Native Module [mmkv/MMKVModule] is NOT loaded"));
	return mmkv_instance;
}