import type { ResponseError } from "../../../origin/src/utils/types";
import { VoiceSynthConstants } from "./voice_synth_constants";
import type { VoiceOptions, VoiceOptionsExport, VoiceSynth } from "./voice_synth.base";
import tts from 'react-native-tts-export';

function voice_synth_mobile_init(){
    const errors: ResponseError[] = [];
    tts.setDefaultRate(VoiceSynthConstants.default_mobile_speach_rate).catch(e => errors.push({error: e}));
    tts.setIgnoreSilentSwitch('ignore').catch(e => errors.push({error: e}));
    // tts.setDefaultEngine("").catch(e => errors.push({error: e}));
}
voice_synth_mobile_init();

export const mobile_voice_synth: VoiceSynth = {
    get_voices: async() => {
        return (await tts.voices()).map(voice => (
            {
                id: voice.id, 
                language: voice.language, 
                name: voice.name, 
                quality: String(voice.quality), 
                installed: !(voice.notInstalled ?? true)
            }
        ));
    },
    speak: async(text: string, opts: VoiceOptions) => {
        return tts.speak(text, {
            rate: opts.rate ?? VoiceSynthConstants.default_mobile_speach_rate, 
            iosVoiceId: opts.voice_bank?.id ?? "", 
            androidParams: {} as never
        }) as string;
    },
    speak_export: async(text: string, opts: VoiceOptionsExport) => {
        return await tts.export(text, {
            overwrite: true, 
            filename: opts.file_path, 
            rate: opts.rate ?? VoiceSynthConstants.default_mobile_speach_rate, 
            iosVoiceId: opts.voice_bank?.id ?? "", 
            androidParams: {} as never
        });
    }
}