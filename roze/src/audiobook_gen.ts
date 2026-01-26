import { get_audio_duration } from "@native/get_audio_duration/get_audio_duration";
import { voice_synth } from "@native/voice_synth/voice_synth";
import { generate_srt_subtitles_contents, generate_youtube_chapters, prepare_text_for_tts, save_base64_image_to_file } from "@roze/utils";
import type Roz from "@roze/types/roz";
import type { VoiceOptions } from "@native/voice_synth/voice_synth.base";
import type { RozChapterContents, RozContent, RozContentType } from "@roze/types/roz";
import { get_temp_file_path, type CleanTempFiles } from "@native/fs/fs_utils";
import { concact_audio_files, generate_dynamic_video_with_audio, generate_static_video_with_audio } from "@native/ffmpeg/ffmpeg_utils";
import { is_empty } from "@common/utils/util";
import type { DurationImage } from "./types/types";
import path from "path-browserify";
import type { DataCallback, StatisticsCallback } from "@native/ffmpeg/ffmpeg.base";
import { fs } from "@native/fs/fs";
import { Constants } from "./constants";
import { generror } from "@common/utils/error_util";
import type { PromiseResult } from "@common/types";
import { reinterpret_cast } from '../../common/cast';

export namespace AudiobookGen {
    interface RozChapterToAudiobookCallbacks {
        on_chapter_content_skip?: (roz_chapter: RozChapterContents) => any;
        on_chapter_content_export?: (roz_chapter: RozChapterContents) => any;
        on_chapter_content_duration_check?: (roz_chapter: RozChapterContents, content_temp_file_path: string|undefined) => any;
        on_chapter_finish?: (roz_chapter: RozChapterContents, chapter_audio_file_path: string|undefined) => any;
    }
    interface RozToAudiobookCallbacks extends RozChapterToAudiobookCallbacks {
        on_full_audio_complete?: (full_audio: RozFullAudio) => any;
        on_ffmpeg_stats?: StatisticsCallback;
        on_ffmpeg_data?: DataCallback;
    }
    interface RozFullAudioOpts {
        size_mode?: boolean;
        srt_subtitles?: boolean; 
        youtube_chapters?: boolean;
    }
    export interface RozFullAudio {
        ffmpeg_gen_result: {
            retcode: number;
            out_file_path: string;
        }
        roz: Roz;
        srt_file_path: string|undefined;
        youtube_chapters_file_path: string|undefined;
    }
    export const skip_content_types: Record<RozContentType, boolean> = {
        TITLE: false,
        CHAPTER_TITLE: false,
        SECTION_TITLE: false,
        CHAPTER_SUBTITLE: false,
        HEADING: false,
        PARAGRAPH: false,
        IMAGE: true,
        LINE_BREAK: true,
        THEME_BREAK: true,
        TABLE_OF_CONTENTS_CHAPTER: true
    };

    export async function roz_chapter_to_audiobook(roz_chapter: RozChapterContents, opts: RozFullAudioOpts, callbacks: RozChapterToAudiobookCallbacks = {}, voice_options: VoiceOptions = {}, clean_temp_files: CleanTempFiles = "CLEAN_FILES"): PromiseResult<RozChapterContents>{
        const content_file_path_list: string[] = [];

        let total_duration = 0;
        const preped_content = (await Promise.all([...roz_chapter.contents.entries()]
            .filter(entry => !skip_content_types[entry[1].type])
            .map<Promise<[number, RozContent, string, string]>>(async(entry) => 
                (async() => [...entry, prepare_text_for_tts(entry[1].content), await get_temp_file_path(Constants.TTS_DEFAULT_FILE_EXTENSION, "REGISTER")])())
            ))
            .filter(entry => !is_empty(entry[2]));
        const missing_length = roz_chapter.contents.length - preped_content.length;
        for(let i = 0; i < missing_length; i++){
            callbacks.on_chapter_content_skip?.(roz_chapter);
            callbacks.on_chapter_content_duration_check?.(roz_chapter, undefined);
        }    
        if(preped_content.length === 0) return {
            ...roz_chapter,
            chapter: {
                ...roz_chapter.chapter,
                duration: total_duration,
                audio_path: undefined,
            }
        };
        
        await voice_synth().speak_export(preped_content.map(([_, __, prep_text, content_temp_file_path]) => ({text: prep_text, export_path: content_temp_file_path})), {
            ...voice_options,
            on_data: (uuid, data) => {
                data = data.replaceAll('\r\n', '\n');
                voice_options.on_data?.(uuid, data);
                data.split('\n').filter(line => line === uuid).forEach(() => {callbacks.on_chapter_content_export?.(roz_chapter);});
            }
        });
        
        for (const [_, roz_content, __, content_temp_file_path] of preped_content) {
            const content_duration = await get_audio_duration().get_audio_duration(content_temp_file_path);
            if(content_duration > 0) content_file_path_list.push(content_temp_file_path);
            else return generror("Missing content in audiobook generation", {roz_content, content_temp_file_path});
            roz_content.duration = content_duration;
            total_duration += content_duration;
            callbacks.on_chapter_content_duration_check?.(roz_chapter, content_temp_file_path);
        }

        const concat_audio_result = content_file_path_list.length === 0 ? undefined : await concact_audio_files(content_file_path_list, opts.size_mode ? ".aac" : Constants.TTS_DEFAULT_FILE_EXTENSION, "POTENTIAL_RE_ENCODE", clean_temp_files);
        callbacks.on_chapter_finish?.(roz_chapter, concat_audio_result?.out_file_path);

        return {
            ...roz_chapter,
            chapter: {
                ...roz_chapter.chapter,
                duration: total_duration,
                audio_path: concat_audio_result?.out_file_path,
            }
        };
    }
    export async function roz_full_audio(roz: Roz, opts: RozFullAudioOpts, callbacks: RozChapterToAudiobookCallbacks = {}, voice_options: VoiceOptions = {}, clean_temp_files: CleanTempFiles = "CLEAN_FILES"): PromiseResult<RozFullAudio>{
        const chapter_audiobooks = await Promise.all(roz.chapters.map(async(chapter) => roz_chapter_to_audiobook(chapter, opts, callbacks, voice_options)));
        const bad_audiobook = chapter_audiobooks.find(chapter => "error" in chapter);
        if(bad_audiobook) return bad_audiobook;
        roz.chapters = reinterpret_cast<typeof roz.chapters>(chapter_audiobooks);
        const ffmpeg_gen_result = await concact_audio_files(roz.chapters.filter(chapter => chapter?.chapter.audio_path !== undefined).map(chapter => chapter.chapter?.audio_path ?? ""), opts.size_mode ? ".aac" : Constants.TTS_DEFAULT_FILE_EXTENSION, "COPY", clean_temp_files);

        const temp_srt_file_path = opts.srt_subtitles ? await get_temp_file_path(".srt", "REGISTER") : undefined;
        const temp_srt_file_result = temp_srt_file_path ? await fs().write_file_as_string(temp_srt_file_path, generate_srt_subtitles_contents(roz.chapters), {encoding: 'utf8'}) : undefined;
        const srt_file_path = temp_srt_file_path === undefined || typeof temp_srt_file_result === "object" ? undefined : temp_srt_file_path;

        const temp_youtube_chapters_file_path = opts.youtube_chapters ? await get_temp_file_path(".ytc", "REGISTER") : undefined;
        const temp_youtube_chapters_file_result = temp_youtube_chapters_file_path ? await fs().write_file_as_string(temp_youtube_chapters_file_path, generate_youtube_chapters(roz.chapters), {encoding: 'utf8'}) : undefined;
        const youtube_chapters_file_path = temp_youtube_chapters_file_path === undefined || typeof temp_youtube_chapters_file_result === "object" ? undefined : temp_youtube_chapters_file_path;

        return {ffmpeg_gen_result, roz, srt_file_path, youtube_chapters_file_path};
    }
    export async function roz_to_chapter_full_audio(roz: Roz, opts: RozFullAudioOpts, callbacks: RozChapterToAudiobookCallbacks = {}, voice_options: VoiceOptions = {}){
        const chapter_audiobooks = await Promise.all(roz.chapters.map(async(chapter) => roz_chapter_to_audiobook(chapter, opts, callbacks, voice_options)));
        return chapter_audiobooks;
    }
    export async function roz_audio_data_to_static_flv(roz: Roz, callbacks: RozToAudiobookCallbacks = {}, voice_options: VoiceOptions = {}, clean_temp_files: CleanTempFiles = "CLEAN_FILES"){
        const full_audio = await roz_full_audio(roz, {}, callbacks, voice_options, clean_temp_files);
        if("error" in full_audio) return full_audio;
        const audiobook_video_path = await generate_static_video_with_audio(roz.cover ?? "", full_audio.ffmpeg_gen_result.out_file_path, ".flv");
        return {audiobook_video_path, full_audio};
    }

    function time_till_next_image(contents: RozContent[], init_i: number){
        const end_index = contents.slice(init_i + 1).findIndex(content => content.type === "IMAGE");
        const duration = contents.slice(init_i + 1, end_index === -1 ? undefined : init_i + 1 + end_index).map(content => content.duration).reduce((p, c) => p + c, 0);
        return {duration, image: contents[end_index]};
    }
    export async function roz_audio_data_to_dynamic_mp4(roz: Roz, opts: RozFullAudioOpts, callbacks: RozToAudiobookCallbacks = {}, voice_options: VoiceOptions = {}, clean_temp_files: CleanTempFiles = "CLEAN_FILES"){
        const full_audio = await roz_full_audio(roz, opts, callbacks, voice_options, clean_temp_files);
        if("error" in full_audio) return full_audio;
        callbacks.on_full_audio_complete?.(full_audio);
        const contents = full_audio.roz.chapters.map(chapter => chapter.contents).flat();

        const saved_cover_image = roz.cover !== null ? await save_base64_image_to_file(roz.cover, undefined, "REGISTER") : undefined;
        const initial_duration_image: DurationImage = saved_cover_image !== undefined && typeof saved_cover_image?.write_result !== "object" 
            ? {image_path: saved_cover_image.path, duration: time_till_next_image(contents, -1).duration}
            : time_till_next_image(contents, 0)?.image?.content !== undefined 
                ? {image_path: (await save_base64_image_to_file(time_till_next_image(contents, -1).image.content, undefined, "REGISTER")).path, duration: time_till_next_image(contents, -1).duration}
                : {image_path: path.resolve("../assets/no_cover.png"), duration: 0};

        const duration_images: DurationImage[] = [initial_duration_image];
        for(let i = 0; i < contents.length; i++){
            const content = contents[i];
            if(content.type !== "IMAGE") continue;
            let look_ahead_content = contents[i + 1];
            if(look_ahead_content?.type !== "IMAGE"){
                const ttni = time_till_next_image(contents, i);
                const saved_image = await save_base64_image_to_file(content.content, undefined, "REGISTER");
                if(typeof saved_image.write_result === "object") return saved_image.write_result;
                duration_images.push({
                    duration: Math.max(ttni.duration, 1),
                    image_path: saved_image.path
                });
            }
            else {
                const content_images = [content];
                let lookahead_distance = 1;
                do {
                    content_images.push(look_ahead_content);
                    look_ahead_content = contents[i + ++lookahead_distance];
                }
                while(look_ahead_content?.type === "IMAGE");
                lookahead_distance--;

                const ttni = time_till_next_image(contents, i + lookahead_distance);
                for(const content_image of content_images){
                    const saved_image = await save_base64_image_to_file(content_image.content, undefined, "REGISTER");
                    if(typeof saved_image.write_result === "object") return saved_image.write_result;
                    duration_images.push({
                        duration: Math.max(ttni.duration / content_images.length, 1),
                        image_path: saved_image.path
                    });
                }
                i += lookahead_distance;
            }
        }
        /*
            If single image then it'll last till next image [if cover !== null ? MAX(15 min) : INFINITY]
            If multiple images then it'll spread out till next image
        */

        const ffmpeg_gen_result = await generate_dynamic_video_with_audio(duration_images, full_audio.ffmpeg_gen_result.out_file_path, full_audio.srt_file_path, ".mp4", clean_temp_files, callbacks.on_ffmpeg_stats, callbacks.on_ffmpeg_data);
        return {ffmpeg_gen_result, full_audio};
    }
};