import type { AssetLoader } from "@native/asset_loader/asset_loader.base";
import { get_native_platform } from "@native/native_mode";

let asset_loader_instance: AssetLoader;

export async function load_native_asset_loader(): Promise<AssetLoader>{
	if (asset_loader_instance) return asset_loader_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native AssetLoader is NOT implemented");
			break;
		case "ELECTRON_RENDERER":
			try {
				asset_loader_instance = (await import("../gen/electron/modules/asset_loader.electron_renderer")).electron_renderer_asset_loader;
			} catch (e) {}
			break;
		case "NODE":
			try {
				asset_loader_instance = (await import("./asset_loader.node")).node_asset_loader;
			} catch (e) {}
			break;
		case "REACT_NATIVE":
			try {
				asset_loader_instance = (await import("./asset_loader.mobile")).mobile_asset_loader;
			} catch (e) {}
			break;
	}
	return asset_loader_instance;
}

export function asset_loader(): AssetLoader {
	if (asset_loader_instance) return asset_loader_instance;
    console.error(new Error("Native Module [asset_loader/AssetLoader] is NOT loaded"));
	return asset_loader_instance;
}