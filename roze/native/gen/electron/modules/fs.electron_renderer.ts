import type { FileSystem } from "@native/fs/fs.base";
import { reinterpret_cast } from "@common/cast";
import { electron_window } from "@native/electron_window";

export const electron_renderer_fs = reinterpret_cast<FileSystem>(electron_window.context);
