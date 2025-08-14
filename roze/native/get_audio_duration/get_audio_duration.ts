import type { GetAudioDuration } from "@native/get_audio_duration/get_audio_duration.base";
import { get_native_platform } from "@native/native_mode";

let get_audio_duration_instance: GetAudioDuration;

export async function load_native_get_audio_duration(): Promise<GetAudioDuration>{
    if (get_audio_duration_instance) return get_audio_duration_instance;
    switch (get_native_platform()) {
        case "WEB":
            console.error("Web Native get_audio_duration is NOT implemented");
            break;
        case "ELECTRON_RENDERER":
            try {
                // get_audio_duration_instance = (await import("../gen/electron/modules/get_audio_duration.electron_renderer")).electron_renderer_get_audio_duration;
            } catch (e) {}
            break;
        case "NODE":
            try {
                get_audio_duration_instance = (await import("./get_audio_duration.node")).node_get_audio_duration;
            } catch (e) {}
            break;
        case "REACT_NATIVE":
            try {
                get_audio_duration_instance = (await import("./get_audio_duration.mobile")).mobile_get_audio_duration;
            } catch (e) {}
            break;
    }
    return get_audio_duration_instance;
}

export function get_audio_duration(): GetAudioDuration {
    if (get_audio_duration_instance) return get_audio_duration_instance;
    console.error(new Error("Native Module [get_audio_duration/GetAudioDuration] is NOT loaded"));
    return get_audio_duration_instance;
}