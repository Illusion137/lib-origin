import type { SQLite } from "@native/sqlite/sqlite.base";
import { reinterpret_cast } from "@common/cast";
import { electron_window } from "@native/electron_window";

export const electron_renderer_sqlite = reinterpret_cast<SQLite>(electron_window.context);
