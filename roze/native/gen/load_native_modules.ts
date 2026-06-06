import { load_native_fs } from "@native/fs/fs";
import { load_native_ffmpeg } from "@native/ffmpeg/ffmpeg";
import { load_native_miscnative } from "@native/miscnative/miscnative";
import { load_native_mmkv } from "@native/mmkv/mmkv";
import { load_native_get_audio_duration } from "@native/get_audio_duration/get_audio_duration";
import { load_native_sabr_downloader } from "@native/sabr_downloader/sabr_downloader";
import { load_native_potoken } from "@native/potoken/potoken";
import { load_native_zip } from "@native/zip/zip";
import { load_native_ffprobe } from "@native/ffprobe/ffprobe";
import { load_native_jseval } from "@native/jseval/jseval";
import { load_native_document_picker } from "@native/document_picker/document_picker";
import { load_native_sqlite } from "@native/sqlite/sqlite";
import { load_native_image_size } from "@native/image_size/image_size";
import { load_native_pdf_reader } from "@native/pdf_reader/pdf_reader";
import { load_native_raw_to_png } from "@native/raw_to_png/raw_to_png";
import { load_native_docx_converter } from "@native/docx_converter/docx_converter";
import { load_native_voice_synth } from "@native/voice_synth/voice_synth";

export async function load_native_modules() {
	await Promise.all([
		load_native_fs(),
		load_native_ffmpeg(),
		load_native_miscnative(),
		load_native_mmkv(),
		load_native_get_audio_duration(),
		load_native_sabr_downloader(),
		load_native_potoken(),
		load_native_zip(),
		load_native_ffprobe(),
		load_native_jseval(),
		load_native_document_picker(),
		load_native_sqlite(),
		load_native_image_size(),
		load_native_pdf_reader(),
		load_native_raw_to_png(),
		load_native_docx_converter(),
		load_native_voice_synth()
	]);
}