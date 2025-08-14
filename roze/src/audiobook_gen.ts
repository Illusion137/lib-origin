import { get_audio_duration } from "@native/get_audio_duration/get_audio_duration";
import { voice_synth } from "@native/voice_synth/voice_synth";
import { prepare_text_for_tts } from "@roze/utils";
import { Constants } from "@roze/constants";
import type Roz from "@roze/types/roz";
import type { VoiceOptions } from "@native/voice_synth/voice_synth.base";
import type { RozChapterContents, RozContent, RozContentType } from "@roze/types/roz";
import { get_temp_file_path, type CleanTempFiles } from "@native/fs/fs_utils";
import { concact_audio_files, generate_static_video_with_audio } from "@native/ffmpeg/ffmpeg_utils";

export namespace AudiobookGen {
    interface RozChapterToAudiobookCallbacks {
        on_chapter_content?: (content: RozContent, progress: number) => any;
        on_chapter_content_export?: (content_temp_file_path: string) => any;
        on_chapter_finish?: (roz_chapter: RozChapterContents, chapter_audio_file_path: string) => any;
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
        THEME_BREAK: true
    };

    export async function roz_chapter_to_audiobook(roz_chapter: RozChapterContents, callbacks: RozChapterToAudiobookCallbacks = {}, voice_options: VoiceOptions = {}, clean_temp_files: CleanTempFiles = "CLEAN_FILES"){
        const content_file_path_list: string[] = [];

        let total_duration = 0;
        for (const [i, roz_content] of roz_chapter.contents.entries()) {
            callbacks.on_chapter_content?.(roz_content, i/roz_chapter.contents.length);
            if(skip_content_types[roz_content.type]) continue;
            const content_temp_file_path = await get_temp_file_path(Constants.TTS_DEFAULT_FILE_EXTENSION);
            content_file_path_list.push(content_temp_file_path);

            await voice_synth().speak_export(prepare_text_for_tts(roz_content.content), {...voice_options, file_path: content_temp_file_path});
            callbacks.on_chapter_content_export?.(content_temp_file_path);
            const content_duration = await get_audio_duration().get_audio_duration(content_temp_file_path);
            roz_content.duration = content_duration;
            total_duration += content_duration;
        }

        const chapter_audio_file_path = await concact_audio_files(content_file_path_list, Constants.TTS_DEFAULT_FILE_EXTENSION, clean_temp_files);
        callbacks.on_chapter_finish?.(roz_chapter, chapter_audio_file_path);

        return {
            duration: total_duration,
            chapter_audio_file_path,
            roz_chapter
        };
    }
    export async function roz_full_audio(roz: Roz, callbacks: RozChapterToAudiobookCallbacks = {}, voice_options: VoiceOptions = {}, clean_temp_files: CleanTempFiles = "CLEAN_FILES"){
        const chapter_audiobooks = await Promise.all(roz.content.map(async(chapter) => roz_chapter_to_audiobook(chapter, callbacks, voice_options)));
        const full_audio_file_path = await concact_audio_files(chapter_audiobooks.map(chapter => chapter.chapter_audio_file_path), Constants.TTS_DEFAULT_FILE_EXTENSION, clean_temp_files);
        return full_audio_file_path;
    }
    export async function roz_to_chapter_full_audio(roz: Roz, callbacks: RozChapterToAudiobookCallbacks = {}, voice_options: VoiceOptions = {}){
        const chapter_audiobooks = await Promise.all(roz.content.map(async(chapter) => roz_chapter_to_audiobook(chapter, callbacks, voice_options)));
        return chapter_audiobooks;
    }
    export async function roz_audio_data_to_static_flv(roz: Roz){
        const audio_path = await roz_full_audio(roz);
        const audiobook_video_path = await generate_static_video_with_audio(roz.cover ?? "", audio_path, ".flv");
        return audiobook_video_path;
    }
    export async function roz_audio_data_to_dynamic_flv(roz: Roz){
        const audio_path = await roz_full_audio(roz);
        // const audiobook_video_path = await generate_dynamic_video_with_audio(roz.cover ?? "", audio_path, ".flv");
        const audiobook_video_path = audio_path; // TODO IMPLEMENT THIS
        return audiobook_video_path;
    }
};