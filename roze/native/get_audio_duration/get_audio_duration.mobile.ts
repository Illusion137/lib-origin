import type { GetAudioDuration } from "./get_audio_duration.base";
import { Audio } from 'expo-av';

export const mobile_get_audio_duration: GetAudioDuration = {
    get_audio_duration: async(path: string) => {
        const sound_temp = new Audio.Sound();
        await sound_temp.loadAsync({ uri: path });
        const meta_data = await sound_temp.getStatusAsync();
        await sound_temp.unloadAsync();
        if (!meta_data.isLoaded) return -1;
        if(meta_data.durationMillis === undefined) return -1;
        return Math.round(meta_data.durationMillis / 1000);
    }
};