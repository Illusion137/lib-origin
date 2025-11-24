import { default_ffmpeg_stats, type DataCallback, type FFMPEG, type StatisticsCallback } from "@native/ffmpeg/ffmpeg.base";
import * as ffmpeg from 'ffmpeg-kit-react-native';

export const mobile_ffmpeg: FFMPEG = {
    execute_args: async(args: string[], statistics_callback?: StatisticsCallback, data_callback?: DataCallback) => {
        const start_time = Date.now();
        const stats = {...default_ffmpeg_stats};

        let resolve_retcode: (retcode: any) => void;
        const promise_to_retcode = new Promise<number>((resolve) => (resolve_retcode = resolve));

        const ffmpeg_result = await ffmpeg.FFmpegKit.executeWithArgumentsAsync(args, async (session) => {
            const retcode = (await session.getReturnCode()).getValue();
            resolve_retcode(retcode); // fulfill the promise here
        }, 
            (log) => {
                data_callback?.(log.getMessage().toString());
            }, 
            (fstats) => {
            stats.command_elapsed_ms = Date.now() - start_time;
            stats.frame = fstats.getVideoFrameNumber();
            stats.fps = fstats.getVideoFps();
            stats.q = fstats.getVideoQuality();
            stats.size = fstats.getSize();
            stats.time_seconds = (fstats.getTime() / 1000);
            stats.bitrate = fstats.getBitrate();
            stats.speed = fstats.getSpeed();
            statistics_callback?.(stats);
        });
        return {
            retcode: promise_to_retcode,
            session_id: ffmpeg_result.getSessionId()
        };
    }
};