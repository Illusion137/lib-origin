import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { fs } from "@native/fs/fs";
import { ffmpeg } from "@native/ffmpeg/ffmpeg";
import { miscnative } from "@native/miscnative/miscnative";
import { sqlite } from "@native/sqlite/sqlite";
import { mmkv } from "@native/mmkv/mmkv";
import { asset_loader } from "@native/asset_loader/asset_loader";

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
	ipcMain.handle("execute_args", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof ffmpeg)>["execute_args"]>) => await ffmpeg().execute_args(...args));
	ipcMain.handle("keep_mobile_awake", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof miscnative)>["keep_mobile_awake"]>) => await miscnative().keep_mobile_awake(...args));
	ipcMain.handle("create_database_connection", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof sqlite)>["create_database_connection"]>) => await sqlite().create_database_connection(...args));
	ipcMain.handle("create_database_handle", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof sqlite)>["create_database_handle"]>) => await sqlite().create_database_handle(...args));
	ipcMain.handle("db_execute", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof sqlite)>["db_execute"]>) => await sqlite().db_execute(...args));
	ipcMain.handle("load_mmkv", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof mmkv)>["load_mmkv"]>) => await mmkv().load_mmkv(...args));
	ipcMain.handle("set_string", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof mmkv)>["set_string"]>) => await mmkv().set_string(...args));
	ipcMain.handle("get_string", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof mmkv)>["get_string"]>) => await mmkv().get_string(...args));
	ipcMain.handle("set_boolean", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof mmkv)>["set_boolean"]>) => await mmkv().set_boolean(...args));
	ipcMain.handle("get_boolean", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof mmkv)>["get_boolean"]>) => await mmkv().get_boolean(...args));
	ipcMain.handle("set_number", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof mmkv)>["set_number"]>) => await mmkv().set_number(...args));
	ipcMain.handle("get_number", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof mmkv)>["get_number"]>) => await mmkv().get_number(...args));
	ipcMain.handle("contains_key", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof mmkv)>["contains_key"]>) => await mmkv().contains_key(...args));
	ipcMain.handle("get_keys", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof mmkv)>["get_keys"]>) => await mmkv().get_keys(...args));
	ipcMain.handle("remove_key", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof mmkv)>["remove_key"]>) => await mmkv().remove_key(...args));
	ipcMain.handle("clear_memory_cache", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof mmkv)>["clear_memory_cache"]>) => await mmkv().clear_memory_cache(...args));
	ipcMain.handle("clear_all", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof mmkv)>["clear_all"]>) => await mmkv().clear_all(...args));
	ipcMain.handle("get_asset", async (_: IpcMainInvokeEvent, ...args: Parameters<ReturnType<(typeof asset_loader)>["get_asset"]>) => await asset_loader().get_asset(...args));
}