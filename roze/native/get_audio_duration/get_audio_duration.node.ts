import type { GetAudioDuration } from "./get_audio_duration.base";
import getAudioDurationInSeconds from "get-audio-duration";

export const node_get_audio_duration: GetAudioDuration = {
    get_audio_duration: async(path: string) => {
        try {
            return await getAudioDurationInSeconds(path);
        } catch (error) {
            return -1;
        }
    }
};