import type { AssetLoader } from "@native/asset_loader/asset_loader.base";
import { reinterpret_cast } from "@common/cast";
import { electron_window } from "@native/electron_window";

export const electron_renderer_asset_loader = reinterpret_cast<AssetLoader>(electron_window.context);
