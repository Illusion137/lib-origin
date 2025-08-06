import { reinterpret_cast } from "@common/cast";
import type { ElectronWindow } from "./gen/electron/preload_type";

export const electron_window = reinterpret_cast<ElectronWindow>(window);
