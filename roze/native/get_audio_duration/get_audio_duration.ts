import type { GetAudioDuration } from "./get_audio_duration.base";
import { get_native_platform } from "../native_mode";

export let get_audio_duration: GetAudioDuration;
switch(get_native_platform()){
    case "WEB": throw new Error("Web Native GetAudioDuration is NOT implemented");
    case "NODE": try {get_audio_duration = require("./get_audio_duration.node").node_get_audio_duration;} catch(e) {} break;
    case "REACT_NATIVE": try {get_audio_duration = require("./get_audio_duration.mobile").mobile_get_audio_duration;} catch(e) {} break;
}