import type { DataCallback, FFPROBE } from "@native/ffprobe/ffprobe.base";
import * as ffprobe from 'ffmpeg-kit-react-native';

export const mobile_ffprobe: FFPROBE = {
    execute_args: async (args: string[], data_callback?: DataCallback) => {
        let resolve_retcode: (retcode: any) => void;
        const promise_to_retcode = new Promise<number>((resolve) => (resolve_retcode = resolve));

        const ffprobe_result = await ffprobe.FFprobeKit.executeWithArgumentsAsync(args, async (session) => {
            const retcode = (await session.getReturnCode()).getValue();
            resolve_retcode(retcode); // fulfill the promise here
        },
            (log) => {
                data_callback?.(log.getMessage().toString());
            });
        return {
            retcode: promise_to_retcode,
            session_id: ffprobe_result.getSessionId(),
            logs: async () => await ffprobe_result.getOutput()
        };
    }
};