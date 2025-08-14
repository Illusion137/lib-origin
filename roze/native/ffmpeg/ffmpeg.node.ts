import { spawn } from "child_process";
import { parse_time } from "@common/utils/parse_util";
import { extract_string_undef } from "@common/utils/util";
import { default_ffmpeg_stats, type FFMPEG, type FFMPEGBitrateType, type FFMPEGSizeType, type FFMPEGStatistics, type StatisticsCallback } from "@native/ffmpeg/ffmpeg.base";

export const node_ffmpeg: FFMPEG = {
    execute_args: async(args: string[], statistics_callback?: StatisticsCallback) => {
        const start_time = new Date().getTime();
        const stats: FFMPEGStatistics = {...default_ffmpeg_stats};
        
        const ffmpeg_spawn = spawn("ffmpeg", args);
        const ffmpeg_cmd_instance = new Promise<number>((resolve, _) => {
            ffmpeg_spawn.stderr?.on('data', (data) => {
                const output: string = data.toString();
                stats.command_elapsed_ms = new Date().getTime() - start_time;
                stats.frame = Number(extract_string_undef(output, /frame=\s*([\d.]+)/) ?? stats.frame);
                stats.fps = Number(extract_string_undef(output, /fps=\s*([\d.]+)/) ?? stats.fps);
                stats.q = Number(extract_string_undef(output, /q=\s*([\d.]+)/) ?? stats.q);
                stats.size = Number(extract_string_undef(output, /size=\s*([\d.]+)/) ?? stats.size);
                stats.size_type = extract_string_undef(output, /size=\s*[\d.]+(.+?)\s/) as FFMPEGSizeType ?? "unknown";
                const time_extracted = extract_string_undef(output, /time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
                stats.time_seconds = time_extracted ? parse_time(time_extracted) : stats.time_seconds;
                stats.bitrate = Number(extract_string_undef(output, /bitrate=\s*([\d.]+)/) ?? stats.bitrate);
                stats.bitrate_type = extract_string_undef(output, /bitrate=\s*[\d.]+(.+?)\s/) as FFMPEGBitrateType ?? "unknown";
                stats.speed = Number(extract_string_undef(output, /speed=\s*([\d.]+)/) ?? stats.speed);
                statistics_callback?.(stats);
            })
            ffmpeg_spawn.on('close', (code) => resolve(code ?? 1));
            ffmpeg_spawn.on('exit', (code) => resolve(code ?? 1)); 
        });
        
        return {
            retcode: ffmpeg_cmd_instance,
            session_id: ffmpeg_spawn.pid ?? -1
        };
    }
};