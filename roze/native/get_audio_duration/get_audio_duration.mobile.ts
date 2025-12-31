import type { GetAudioDuration } from "@native/get_audio_duration/get_audio_duration.base";
import { createAudioPlayer } from 'expo-audio';

export const mobile_get_audio_duration: GetAudioDuration = {
    get_audio_duration: async(path: string) => {
        const sound_temp = createAudioPlayer({uri: path});
        if(sound_temp.isLoaded) {
            const duration_seconds = sound_temp.duration ?? 0;
            sound_temp.release();
            return duration_seconds;
        }

        return new Promise<number>((resolve) => {
            const listener = sound_temp.addListener("playbackStatusUpdate", (status) => {
                if(sound_temp.isLoaded) {
                    const duration_seconds = status.duration ?? 0;
                    sound_temp.release();
                    listener.remove();
                    resolve(duration_seconds);
                }
            });
        })
    }
};