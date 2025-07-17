import { VoiceSynthConstants } from "./voice_synth_constants";
import type { VoiceBank, VoiceOptions, VoiceOptionsExport, VoiceSynth } from "./voice_synth.base";
import tts from 'say';

export const node_voice_synth: VoiceSynth = {
    get_voices: async() => {
        return await new Promise((resolve) => {
            tts.getInstalledVoices((_: any, voices: string[]) => {
                const voice_banks: VoiceBank[] = (voices ?? []).map(voice => ({id: voice, language: 'en', name: voice, quality: '', installed: true}));
                resolve(voice_banks);
            });
        })
    },
    speak: async(text: string, opts: VoiceOptions) => {
        return await new Promise((resolve) => {
            tts.speak(text, opts.voice_bank?.id ?? "", opts.rate ?? VoiceSynthConstants.default_node_speach_rate, () => resolve(0));
        });
    },
    speak_export: async(text: string, opts: VoiceOptionsExport) => {
        return await new Promise((resolve) => {
            tts.export(text, opts.voice_bank?.id ?? "", opts.rate ?? VoiceSynthConstants.default_node_speach_rate, opts.file_path, () => resolve(0));
        });
    }
}