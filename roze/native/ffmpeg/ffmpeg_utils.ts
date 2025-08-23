import { ffmpeg } from "@native/ffmpeg/ffmpeg";
import { fs } from "@native/fs/fs";
import type { FileExtension } from "@common/types";
import type { DurationImage } from "@roze/types/types";
import { gen_temp_file_name, get_temp_file_path as gen_temp_file_path, use_temp_file, type CleanTempFiles } from "@native/fs/fs_utils";
import type { DataCallback, StatisticsCallback } from "./ffmpeg.base";

function clean_temp_file_paths(content: string){
    return content.replaceAll("\\", "/")
}

export async function generate_static_video_with_audio(cover_path: string, audio_path: string, extension: FileExtension, ffmpeg_statistics_callback?: StatisticsCallback, ffmpeg_data_callback?: DataCallback) {
	const out_file_path = await fs().temp_directory((await gen_temp_file_name()) + extension);
	const arg_list = ["-r", "1", "-loop", "1", "-i", cover_path, "-i", audio_path, "-acodec", "copy", "-r", "1", "-shortest", "-vf", "scale=860:1223", out_file_path];
	const ffmpeg_result = await ffmpeg().execute_args(arg_list, ffmpeg_statistics_callback, ffmpeg_data_callback);
	return {out_file_path, retcode: await ffmpeg_result.retcode};
}

export async function combine_audio_and_video(video_path: string, audio_path: string, extension: FileExtension, clean_temp_files: CleanTempFiles, ffmpeg_statistics_callback?: StatisticsCallback, ffmpeg_data_callback?: DataCallback) {
	const combined_video_out_path = await fs().temp_directory((await gen_temp_file_name()) + extension);
	const arg_list = ["-i", video_path, "-i", audio_path, "-c:v", "copy", "-c:a", "aac", "-shortest", combined_video_out_path];
	const ffmpeg_result = await ffmpeg().execute_args(arg_list, ffmpeg_statistics_callback, ffmpeg_data_callback);
    await ffmpeg_result.retcode;
	if (clean_temp_files === "CLEAN_FILES") {
		await fs().remove(video_path);
		await fs().remove(audio_path);
	}
	return {combined_video_out_path, retcode: await ffmpeg_result.retcode};
}

export async function generate_dynamic_video_with_audio(duration_images: DurationImage[], audio_path: string, srt_path: string|undefined, extension: FileExtension, clean_temp_files: CleanTempFiles, ffmpeg_statistics_callback?: StatisticsCallback, ffmpeg_data_callback?: DataCallback) {
    for(const duration_image of duration_images){
        const new_image_temp_file_path = await gen_temp_file_path(".png" , "REGISTER");
        const duration_image_ffmpeg_result = await ffmpeg().execute_args(['-y', '-i', duration_image.image_path, '-vf', 'scale=860:1224', new_image_temp_file_path]);
        await duration_image_ffmpeg_result.retcode;
        if (clean_temp_files === "CLEAN_FILES") await fs().remove(duration_image.image_path);
        duration_image.image_path = new_image_temp_file_path;
    }
    const image_list_file_contents = duration_images.map((duration_image) => `file ${duration_image.image_path.replace(/\\/g, "/")}\nduration ${duration_image.duration}`).join("\n") + `\nfile ${duration_images[duration_images.length - 1].image_path.replace(/\\/g, "/")}`;
	const temp_video_generated_path = await fs().temp_directory((await gen_temp_file_name()) + extension);
	const retcode = await use_temp_file(clean_temp_file_paths(image_list_file_contents), ".txt", { encoding: "utf8" }, async (temp_images_list_file_path) => {
        const arg_list = srt_path ? ['-y', "-f", "concat", "-safe", "0", "-i", temp_images_list_file_path, "-i", audio_path, "-i", srt_path, "-c:s", "mov_text", "-acodec", "copy", "-shortest", '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-fps_mode', 'vfr', '-preset', 'veryfast', '-crf', '23', '-movflags', '+faststart', temp_video_generated_path]
            : ['-y', "-f", "concat", "-safe", "0", "-i", temp_images_list_file_path, "-i", audio_path, "-acodec", "copy", "-r", "1", "-shortest", temp_video_generated_path];
		const ffmpeg_result = await ffmpeg().execute_args(arg_list, ffmpeg_statistics_callback, ffmpeg_data_callback);
        return await ffmpeg_result.retcode;
	});
	if (clean_temp_files === "CLEAN_FILES") {
        await fs().remove(audio_path);
		for (const { image_path } of duration_images) {
			await fs().remove(image_path);
		}
	}
    return {retcode, out_file_path: temp_video_generated_path};
}

export async function concact_audio_files(file_paths: string[], extension: FileExtension, copy: "COPY"|"POTENTIAL_RE_ENCODE", clean_temp_files: CleanTempFiles, ffmpeg_statistics_callback?: StatisticsCallback, ffmpeg_data_callback?: DataCallback) {
	const audio_list_file_contents = file_paths.map((file_path) => `file ${file_path.replace(/\\/g, "/")}`).join("\n");
	const out_file_path = await fs().temp_directory((await gen_temp_file_name()) + extension);
	const retcode = await use_temp_file(clean_temp_file_paths(audio_list_file_contents), ".txt", { encoding: "utf8" }, async (temp_audio_list_file_path) => {
		const arg_list = extension === ".aac" && copy === "POTENTIAL_RE_ENCODE" ? ["-f", "concat", "-safe", "0", "-i", temp_audio_list_file_path, "-c:a", "aac", "-b:a", "128k", out_file_path] :
            ["-f", "concat", "-safe", "0", "-i", temp_audio_list_file_path, "-c", "copy", out_file_path];
		const ffmpeg_result = await ffmpeg().execute_args(arg_list, ffmpeg_statistics_callback, ffmpeg_data_callback);
        return await ffmpeg_result.retcode;
	});
	if (clean_temp_files === "CLEAN_FILES") {
		for (const file_path of file_paths) {
			await fs().remove(file_path);
		}
	}
	return {retcode, out_file_path};
}

export async function compress_audio_to_aac(audio_file_path: string, ffmpeg_statistics_callback?: StatisticsCallback, ffmpeg_data_callback?: DataCallback) {
	const aac_file_extension: FileExtension = ".aac";
	const out_file_path = await fs().temp_directory((await gen_temp_file_name()) + aac_file_extension);
	const arg_list = ["-f", "concat", "-safe", "0", "-i", audio_file_path, "-c", "copy", out_file_path];
	await ffmpeg().execute_args(arg_list, ffmpeg_statistics_callback, ffmpeg_data_callback);
	return out_file_path;
}
