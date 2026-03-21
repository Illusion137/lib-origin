import { load_native_fs } from "@native/fs/fs";
import { load_native_ffmpeg } from "@native/ffmpeg/ffmpeg";
import { load_native_miscnative } from "@native/miscnative/miscnative";
import { load_native_mmkv } from "@native/mmkv/mmkv";
import { load_native_get_audio_duration } from "@native/get_audio_duration/get_audio_duration";
import { load_native_sabr_downloader } from "@native/sabr_downloader/sabr_downloader";
import { load_native_potoken } from "@native/potoken/potoken";
import { load_native_zip } from "@native/zip/zip";

export async function load_native_modules() {
	await Promise.all([
		load_native_fs(),
		load_native_ffmpeg(),
		load_native_miscnative(),
		load_native_mmkv(),
		load_native_get_audio_duration(),
		load_native_sabr_downloader(),
		load_native_potoken(),
		load_native_zip()
	]);
}