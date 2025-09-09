import type { MiscNative } from "@native/miscnative/miscnative.base";
import { reinterpret_cast } from "@common/cast";
import { electron_window } from "@native/electron_window";

export const electron_renderer_miscnative = reinterpret_cast<MiscNative>(electron_window.context);
