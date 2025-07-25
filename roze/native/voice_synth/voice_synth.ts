import type { VoiceSynth } from "@native/voice_synth/voice_synth.base";
import { get_native_platform } from "@native/native_mode";

// Install more voices for windows with https://github.com/gexgd0419/NaturalVoiceSAPIAdapter
export let voice_synth: VoiceSynth;
switch(get_native_platform()){
    case "WEB": throw new Error("Web Native VoiceSynth is NOT implemented");
    case "NODE": try {voice_synth = require("./voice_synth.node").node_voice_synth;} catch(e) {} break;
    case "REACT_NATIVE": try {voice_synth = require("./voice_synth.mobile").mobile_voice_synth;} catch(e) {} break;
}