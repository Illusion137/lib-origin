import type { FFMPEG } from "@native/ffmpeg/ffmpeg.base";
import { get_native_platform } from "@native/native_mode";

let ffmpeg_instance: FFMPEG;

export async function load_native_ffmpeg(): Promise<FFMPEG>{
	if (ffmpeg_instance) return ffmpeg_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native FFMPEG is NOT implemented");
			break;
		case "ELECTRON_RENDERER":
			try {
				ffmpeg_instance = (await import("../gen/electron/modules/ffmpeg.electron_renderer")).electron_renderer_ffmpeg;
			} catch (e) {}
			break;
		case "NODE":
			try {
				ffmpeg_instance = (await import("./ffmpeg.node")).node_ffmpeg;
			} catch (e) {}
			break;
		case "REACT_NATIVE":
			try {
				ffmpeg_instance = (await import("./ffmpeg.mobile")).mobile_ffmpeg;
			} catch (e) {}
			break;
	}
	return ffmpeg_instance;
}

export function ffmpeg(): FFMPEG {
	if (ffmpeg_instance) return ffmpeg_instance;
    console.error(new Error("Native Module [ffmpeg/FFMPEG] is NOT loaded"));
	return ffmpeg_instance;
}