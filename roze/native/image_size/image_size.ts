import type { ImageSize } from "@native/image_size/image_size.base";
import { get_native_platform } from "@native/native_mode";

let image_size_instance: ImageSize;

export async function load_native_image_size(): Promise<ImageSize> {
	if (image_size_instance) return image_size_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native ImageSize is NOT implemented");
			break;
		case "NODE":
			try {
				image_size_instance = (await import("./image_size.node.ts")).node_image_size_module;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				image_size_instance = (await import("./image_size.mobile.ts")).mobile_image_size_module;
			} catch (e) { console.error(e); }
			break;
	}
	return image_size_instance;
}

export function image_size(): ImageSize {
	if (image_size_instance) return image_size_instance;
	console.error(new Error("Native Module [image_size/ImageSize] is NOT loaded"));
	return image_size_instance;
}
