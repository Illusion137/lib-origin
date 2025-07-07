import { Constants } from "../constants";
import type { VoiceBank, VoiceOptions, VoiceOptionsExport, VoiceSynth } from "./voice_synth_base";
import tts from 'say';

export const VoiceSynthMobile: VoiceSynth = {
    get_voices: async() => {
        return await new Promise((resolve) => {
            tts.getInstalledVoices((_: any, voices: string[]) => {
                const voice_banks: VoiceBank[] = (voices ?? []).map(voice => ({id: voice, language: 'en', name: voice, quality: '', installed: true}));
                resolve(voice_banks);
            });
        })
    },
    speak: async(text: string, opts: VoiceOptions) => {
        tts.speak(text, opts.voice_bank?.id ?? "", opts.rate ?? Constants.default_node_speach_rate);
    },
    speak_export: async(text: string, opts: VoiceOptionsExport) => {
        tts.export(text, opts.voice_bank?.id ?? "", opts.rate ?? Constants.default_node_speach_rate, opts.file_path);
    }
}