import type { MMKVModule } from "@native/mmkv/mmkv.base";
import { reinterpret_cast } from "@common/cast";
import { electron_window } from "@native/electron_window";

export const electron_renderer_mmkv = reinterpret_cast<MMKVModule>(electron_window.context);
