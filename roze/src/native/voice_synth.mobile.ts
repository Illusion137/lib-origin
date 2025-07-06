import { ResponseError } from "../../../origin/src/utils/types";
import { Constants } from "../constants";
import { VoiceOptions, VoiceOptionsExport, VoiceSynth } from "./voice_synth_base";
import tts from 'react-native-tts-export';

export function voice_synth_mobile_init(){
    const errors: ResponseError[] = [];
    tts.setDefaultRate(Constants.default_mobile_speach_rate).catch(e => errors.push({error: e}));
    tts.setIgnoreSilentSwitch('ignore').catch(e => errors.push({error: e}));
    // tts.setDefaultEngine("").catch(e => errors.push({error: e}));
}

export const VoiceSynthMobile: VoiceSynth = {
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
            rate: opts.rate ?? Constants.default_mobile_speach_rate, 
            iosVoiceId: opts.voice_bank?.id ?? "", 
            androidParams: {} as never
        }) as string;
    },
    speak_export: async(text: string, opts: VoiceOptionsExport) => {
        return await tts.export(text, {
            overwrite: true, 
            filename: opts.file_path, 
            rate: opts.rate ?? Constants.default_mobile_speach_rate, 
            iosVoiceId: opts.voice_bank?.id ?? "", 
            androidParams: {} as never
        });
    }
}