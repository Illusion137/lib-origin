import type { FFMPEG } from "@native/ffmpeg/ffmpeg.base";
import ffmpeg from 'ffmpeg-kit-react-native';

export const mobile_ffmpeg: FFMPEG = {
    execute_args: async(args: string[]) => {
        await ffmpeg.FFmpegKit.executeWithArgumentsAsync(args);
    }
};