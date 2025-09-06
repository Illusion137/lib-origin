import { load_native_fs } from "@native/fs/fs";
import { load_native_ffmpeg } from "@native/ffmpeg/ffmpeg";
import { load_native_miscnative } from "@native/miscnative/miscnative";
import { load_native_sqlite } from "@native/sqlite/sqlite";
import { load_native_mmkv } from "@native/mmkv/mmkv";
import { load_native_asset_loader } from "@native/asset_loader/asset_loader";

export async function load_native_modules(){
    await Promise.all([
        load_native_fs(),
        load_native_ffmpeg(),
        load_native_miscnative(),
        load_native_sqlite(),
        load_native_mmkv(),
        load_native_asset_loader(),
    ]);
}