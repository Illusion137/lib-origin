import type { VoiceSynth } from "@native/voice_synth/voice_synth.base";
import { get_native_platform } from "@native/native_mode";

// Install more voices for windows with https://github.com/gexgd0419/NaturalVoiceSAPIAdapter
let voice_synth_instance: VoiceSynth;

export async function load_native_voice_synth(): Promise<VoiceSynth>{
    if (voice_synth_instance) return voice_synth_instance;
    switch (get_native_platform()) {
        case "WEB":
            console.error("Web Native VoiceSynth is NOT implemented");
            break;
        case "NODE":
            try {
                voice_synth_instance = (await import("./voice_synth.node.ts")).node_voice_synth;
            } catch (e) { console.error(e); }
            break;
        case "REACT_NATIVE":
            try {
                voice_synth_instance = (await import("./voice_synth.mobile.ts")).mobile_voice_synth;
            } catch (e) { console.error(e); }
            break;
    }
    return voice_synth_instance;
}

export function voice_synth(): VoiceSynth {
    if (voice_synth_instance) return voice_synth_instance;
    console.error(new Error("Native Module [voice_synth/VoiceSynth] is NOT loaded"));
    return voice_synth_instance;
}