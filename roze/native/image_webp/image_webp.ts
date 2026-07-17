import type { ImageWebp } from "@native/image_webp/image_webp.base";
import { get_native_platform } from "@native/native_mode";

let image_webp_instance: ImageWebp;

export async function load_native_image_webp(): Promise<ImageWebp> {
	if (image_webp_instance) return image_webp_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native ImageWebp is NOT implemented");
			break;
		case "NODE":
			try {
				image_webp_instance = (await import("./image_webp.node.ts")).node_image_webp;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				image_webp_instance = (await import("./image_webp.mobile.ts")).mobile_image_webp;
			} catch (e) { console.error(e); }
			break;
	}
	return image_webp_instance;
}

export function image_webp(): ImageWebp {
	if (image_webp_instance) return image_webp_instance;
	console.error(new Error("Native Module [image_webp/ImageWebp] is NOT loaded"));
	return image_webp_instance;
}
