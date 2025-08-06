import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { fs } from "@native/fs/fs";

export function load_ipc() {
	ipcMain.handle("temp_directory", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof fs)>["temp_directory"]>) => await fs().temp_directory(...args));
	ipcMain.handle("document_directory", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof fs)>["document_directory"]>) => await fs().document_directory(...args));
	ipcMain.handle("read_as_string", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof fs)>["read_as_string"]>) => await fs().read_as_string(...args));
	ipcMain.handle("read_directory", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof fs)>["read_directory"]>) => await fs().read_directory(...args));
	ipcMain.handle("get_info", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof fs)>["get_info"]>) => await fs().get_info(...args));
	ipcMain.handle("write_file_as_string", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof fs)>["write_file_as_string"]>) => await fs().write_file_as_string(...args));
	ipcMain.handle("move", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof fs)>["move"]>) => await fs().move(...args));
	ipcMain.handle("copy", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof fs)>["copy"]>) => await fs().copy(...args));
	ipcMain.handle("make_directory", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof fs)>["make_directory"]>) => await fs().make_directory(...args));
	ipcMain.handle("remove", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof fs)>["remove"]>) => await fs().remove(...args));
	ipcMain.handle("download_to_file", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof fs)>["download_to_file"]>) => await fs().download_to_file(...args));
}