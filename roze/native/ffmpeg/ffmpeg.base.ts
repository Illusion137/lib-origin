export interface FFMPEGReturn {
    retcode: Promise<number>;
    session_id: number;
}
export type FFMPEGSizeType = "unknown"|"KiB";
export type FFMPEGBitrateType = "unknown"|"kbits/s";
export interface FFMPEGStatistics {
    command_elapsed_ms: number;
    frame: number;
    fps: number;
    q: number;
    size: number;
    size_type: FFMPEGSizeType;
    time_seconds: number;
    bitrate: number;
    bitrate_type: FFMPEGBitrateType;
    speed: number;
}
export type StatisticsCallback = (stats: FFMPEGStatistics) => void;
export type DataCallback = (data: string) => void;
export interface FFMPEG {
    execute_args: (args: string[], statistics_callback?: StatisticsCallback, data_callback?: DataCallback) => Promise<FFMPEGReturn>;
}

export const default_ffmpeg_stats: FFMPEGStatistics = {
    command_elapsed_ms: -1,
    frame: -1,
    fps: -1,
    q: -1,
    size: -1,
    size_type: "unknown",
    time_seconds: -1,
    bitrate: -1,
    bitrate_type: "unknown",
    speed: -1
};