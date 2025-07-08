import type { YTDLQuality } from "../../../../origin/src/youtube_dl/types";
import type { Track } from "../../types";

export interface PlayerOptions {
    leaveOnEnd?: boolean;
    leaveOnStop?: boolean;
    leaveOnEmpty?: boolean;
    deafenOnJoin?: boolean;
    timeout?: number;
    volume?: number;
    yt_quality?: YTDLQuality;
    localAddress?: string;
}
export enum RepeatMode {
    DISABLED = 0,
    SONG = 1,
    QUEUE = 2
}
export interface DiscordTrack extends Track {
    discord_playback_data: {
        is_first: boolean;
        seek_time: number;
        data?: any;
    }
}