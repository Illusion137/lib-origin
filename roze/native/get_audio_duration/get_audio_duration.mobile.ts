import type { GetAudioDuration } from "@native/get_audio_duration/get_audio_duration.base";
import { createAudioPlayer } from 'expo-audio';

export const mobile_get_audio_duration: GetAudioDuration = {
    get_audio_duration: async(path: string) => {
        const sound_temp = createAudioPlayer(path);
        const duration_seconds = sound_temp.duration;
        sound_temp.release();
        return Math.round(duration_seconds);
    }
};