import type { FFMPEG } from "./ffmpeg.base";
import { get_native_platform } from "../native_mode";
import { fs, gen_temp_file_name, use_temp_file } from "../fs/fs";
import type { FileExtension } from "../../../common/types";
import type { DurationImage } from "../../src/types/types";

export let ffmpeg: FFMPEG;
switch(get_native_platform()){
    case "WEB": throw new Error("Web Native FFMPEG is NOT implemented");
    case "NODE": try {ffmpeg = require("./ffmpeg.node").node_ffmpeg;} catch(e) {} break;
    case "REACT_NATIVE": try {ffmpeg = require("./ffmpeg.mobile").mobile_ffmpeg;} catch(e) {} break;
}

export async function generate_static_video_with_audio(cover_path: string, audio_path: string, extension: FileExtension){
    const out_file_path = fs.temp_directory(gen_temp_file_name() + extension);
    const arg_list = [
        "-r", "1", 
        "-loop", "1", 
        "-i", cover_path,
        "-i", audio_path, 
        "-acodec", "copy", 
        "-r", "1", 
        "-shortest",
        "-vf", "scale=860:1223",
        out_file_path
    ];
    await ffmpeg.execute_args(arg_list);
    return out_file_path;
}

export async function combine_audio_and_video(video_path: string, audio_path: string, extension: FileExtension, clean_temp_files: boolean){
    const combined_video_out_path = fs.temp_directory(gen_temp_file_name() + extension);
    const arg_list = [
        "-i", video_path,
        "-i", audio_path,
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        combined_video_out_path
    ];
    await ffmpeg.execute_args(arg_list);
    if(clean_temp_files){
        await fs.remove(video_path);
        await fs.remove(audio_path);
    }
    return combined_video_out_path;
}

export async function generate_dynamic_video_with_audio(duration_images: DurationImage[], audio_path: string, extension: FileExtension, clean_temp_files: boolean){
    const image_list_file_contents = duration_images.map(duration_image => `file ${duration_image.image_path.replace(/\\/g, '/')}\nduration ${duration_image.duration}`).join('\n');
    const temp_video_generated_path = fs.temp_directory(gen_temp_file_name() + extension);
    await use_temp_file(image_list_file_contents, ".txt", {encoding: "utf8"}, async(temp_images_list_file_path) => {
        const arg_list = [
            "-f", "concat",
            "-safe", "0",
            "-i", temp_images_list_file_path,
            "-vsync", "vfr",
            temp_video_generated_path
        ];
        await ffmpeg.execute_args(arg_list);
    });
    await combine_audio_and_video(temp_video_generated_path, audio_path, extension, clean_temp_files);
    if(clean_temp_files){
        for(const { image_path } of duration_images){
            await fs.remove(image_path);
        }
    }
}

export async function concact_audio_files(file_paths: string[], extension: FileExtension, clean_temp_files: boolean){
    const audio_list_file_contents = file_paths.map(file_path => `file ${file_path.replace(/\\/g, '/')}`).join('\n');
    const out_file_path = fs.temp_directory(gen_temp_file_name() + extension);
    await use_temp_file(audio_list_file_contents, ".txt", {encoding: "utf8"}, async(temp_audio_list_file_path) => {
        const arg_list = [
            "-f", "concat",
            "-safe", "0",
            "-i", temp_audio_list_file_path, 
            "-c", "copy", 
            out_file_path
        ];
        await ffmpeg.execute_args(arg_list);
    });
    if(clean_temp_files){
        for(const file_path of file_paths){
            await fs.remove(file_path);
        }
    }
    return out_file_path;
}

export async function compress_audio_to_aac(audio_file_path: string){
    const aac_file_extension: FileExtension = ".aac";
    const out_file_path = fs.temp_directory(gen_temp_file_name() + aac_file_extension);
    const arg_list = [
        "-f", "concat",
        "-safe", "0",
        "-i", audio_file_path, 
        "-c", "copy", 
        out_file_path
    ];
    await ffmpeg.execute_args(arg_list);
    return out_file_path;
}