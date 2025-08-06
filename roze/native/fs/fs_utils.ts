import { gen_uuid } from "@common/utils/util";
import { fs } from "./fs";
import type { FileExtension } from "@common/types";
import type { EncodingOpts } from "./fs.base";

export async function gen_temp_file_name(prefix?: string): Promise<string> {
	return (prefix ?? "") + gen_uuid();
}

export async function get_temp_file_path(file_extension: FileExtension): Promise<string> {
	return await fs().temp_directory((await gen_temp_file_name()) + file_extension);
}

export async function use_temp_file_keep(file_contents: string, file_extension: FileExtension, opts: EncodingOpts) {
	const temp_file_path = await get_temp_file_path(file_extension);
	await fs().write_file_as_string(temp_file_path, file_contents.replaceAll("\\", "/"), opts);
	return temp_file_path;
}

export async function use_temp_file(file_contents: string, file_extension: FileExtension, opts: EncodingOpts, on_file_created: (temp_file_path: string) => Promise<void>) {
	const temp_file_path = await use_temp_file_keep(file_contents, file_extension, opts);
	await on_file_created(temp_file_path);
	// TODO: look into cleanup
	await fs().remove(temp_file_path);
}
