import { ffprobe, load_native_ffprobe } from "@native/ffprobe/ffprobe";
import type { GetAudioDuration } from "@native/get_audio_duration/get_audio_duration.base";

export const mobile_get_audio_duration: GetAudioDuration = {
    get_audio_duration: async (path: string) => {
        await load_native_ffprobe();
        const session = await ffprobe().execute_args(
            ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', path],
            () => { return }
        );
        ;
        if (await session.retcode !== 0) {
            return -1.0;
        }
        const output = await session.logs();
        return parseFloat(output);
    }
};