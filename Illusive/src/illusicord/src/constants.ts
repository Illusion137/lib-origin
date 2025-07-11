import type { PlayerOptions } from "./types";

export namespace Constants {
    export const DEFAULT_PLAYER_OPTIONS: PlayerOptions = {
        volume: 100,
        deafenOnJoin: false,
        leaveOnEmpty: true,
        leaveOnEnd: true,
        leaveOnStop: true,
        timeout: 1,
        yt_quality: "18",
        localAddress: ''
    }
    export const SETTINGS_PREFIX = '!';
};