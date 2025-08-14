import { default_ffmpeg_stats, type FFMPEG, type StatisticsCallback } from "@native/ffmpeg/ffmpeg.base";
import ffmpeg from 'ffmpeg-kit-react-native';

export const mobile_ffmpeg: FFMPEG = {
    execute_args: async(args: string[], statistics_callback?: StatisticsCallback) => {
        const start_time = new Date().getTime();
        const stats = {...default_ffmpeg_stats};

        const ffmpeg_result = await ffmpeg.FFmpegKit.executeWithArgumentsAsync(args, undefined, undefined, (fstats) => {
            stats.command_elapsed_ms = new Date().getTime() - start_time;
            stats.frame = fstats.getVideoFrameNumber();
            stats.fps = fstats.getVideoFps();
            stats.q = fstats.getVideoQuality();
            stats.size = fstats.getSize();
            stats.time_seconds = fstats.getTime();
            stats.bitrate = fstats.getBitrate();
            stats.speed = fstats.getSpeed();
            statistics_callback?.(stats);
        });
        return {
            retcode: (async() => (await ffmpeg_result.getReturnCode()).getValue())(),
            session_id: ffmpeg_result.getSessionId()
        };
    }
};