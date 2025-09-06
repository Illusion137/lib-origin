import type { FFMPEG } from "@native/ffmpeg/ffmpeg.base";
import { reinterpret_cast } from "@common/cast";
import { electron_window } from "@native/electron_window";

export const electron_renderer_ffmpeg = reinterpret_cast<FFMPEG>(electron_window.context);
