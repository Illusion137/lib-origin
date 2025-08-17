import { VoiceSynthConstants } from "@native/voice_synth/voice_synth_constants";
import type { VoiceBank, VoiceExportBatchTexts, VoiceOptions, VoiceOptionsExport, VoiceSynth } from "@native/voice_synth/voice_synth.base";
import tts from '@lib/say/say';

export const node_voice_synth: VoiceSynth = {
    get_voices: async() => {
        const voices = await tts.get_voices();
        if("error" in voices) return [];
        const voice_banks: VoiceBank[] = (voices ?? []).map(voice => ({id: voice, language: 'en', name: voice, quality: '', installed: true}));
        return voice_banks;
    },
    speak: async(text: string, opts: VoiceOptions) => {
        return await tts.speak(text, opts.voice_bank?.id ?? "", opts.rate ?? VoiceSynthConstants.default_node_speach_rate);
    },
    speak_export: async(texts: VoiceExportBatchTexts, opts: VoiceOptionsExport) => {
        return await tts.export_batch(texts, opts.voice_bank?.id ?? "", opts.rate ?? VoiceSynthConstants.default_node_speach_rate, opts.on_data);
    }
}