import type { GetAudioDuration } from "@native/get_audio_duration/get_audio_duration.base";
import { get_native_platform } from "@native/native_mode";

export let get_audio_duration: GetAudioDuration;
switch (get_native_platform()) {
	case "WEB":
		console.error("Web Native GetAudioDuration is NOT implemented");
		break;
	case "ELECTRON_RENDERER":
		try {
			get_audio_duration = require("../gen/modules/get_audio_duration.electron_renderer").electron_renderer_get_audio_duration;
		} catch (e) {}
		break;
	case "NODE":
		try {
			get_audio_duration = require("./get_audio_duration.node").node_get_audio_duration;
		} catch (e) {}
		break;
	case "REACT_NATIVE":
		try {
			get_audio_duration = require("./get_audio_duration.mobile").mobile_get_audio_duration;
		} catch (e) {}
		break;
}
