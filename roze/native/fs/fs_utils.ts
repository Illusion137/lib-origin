import { gen_uuid } from "@common/utils/util";
import { fs } from "./fs";
import type { FileExtension } from "@common/types";
import type { EncodingOpts } from "./fs.base";

export type CleanTempFiles = "NO_CLEAN"|"CLEAN_FILES";

export async function gen_temp_file_name(prefix?: string): Promise<string> {
	return (prefix ?? "") + gen_uuid();
}

export const registered_session_temp_file_paths: string[] = [];
export type RegisterAsTemp = "REGISTER"|"NO_REGISTER";
export async function get_temp_file_path(file_extension: FileExtension, register_as_temp: RegisterAsTemp, name?: string): Promise<string> {
	const file_path = await fs().temp_directory((name ?? (await gen_temp_file_name())) + file_extension);
    if(register_as_temp === "REGISTER") registered_session_temp_file_paths.push(file_path);
    return file_path;
}

export async function use_temp_file_keep(file_contents: string, file_extension: FileExtension, opts: EncodingOpts) {
	const temp_file_path = await get_temp_file_path(file_extension, "NO_REGISTER");
	await fs().write_file_as_string(temp_file_path, file_contents, opts);
	return temp_file_path;
}

export async function use_temp_file<T>(file_contents: string, file_extension: FileExtension, opts: EncodingOpts, on_file_created: (temp_file_path: string) => Promise<T>): Promise<T> {
	const temp_file_path = await use_temp_file_keep(file_contents, file_extension, opts);
	const result = await on_file_created(temp_file_path);
	await fs().remove(temp_file_path);
    return result;
}
