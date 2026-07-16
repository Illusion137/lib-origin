import { load_native_fs } from "@native/fs/fs";
import { load_native_ffmpeg } from "@native/ffmpeg/ffmpeg";
import { load_native_get_audio_duration } from "@native/get_audio_duration/get_audio_duration";
import { load_native_voice_synth } from "@native/voice_synth/voice_synth";
import { load_native_zip } from "@native/zip/zip";
import { load_native_image_size } from "@native/image_size/image_size";
import { concact_audio_files } from "@native/ffmpeg/ffmpeg_utils";
import { FileParser } from "@roze/file";
import { AudiobookGen } from "@roze/audiobook_gen";
import { prepare_text_for_tts } from "@roze/utils";
import { Constants } from "@roze/constants";
import type { RozChapterContents } from "@roze/types/roz";
import { writeFileSync } from "fs";
import pathlib from "path";

// Benchmark the epub -> roz -> audiobook pipeline (same flow as roze-cli -a).
// Usage: npx tsx tools/roze_benchmark.ts <epub-path> [--chapters N] [--out <roz-json-path>] [--results <json-path>]

const SUBSTANTIVE_MIN_CONTENTS = 3;
const SUBSTANTIVE_MIN_CHARS = 500;
const TTS_RATE = 170; // say's default wpm; the CLI's default VoiceOptions rate of 1 would hit `say -r 1`

interface ChapterStats {
    index: number;
    title: string;
    total_contents: number;
    synth_contents: number;
    synth_chars: number;
    substantive: boolean;
    wall_seconds: number;
    audio_seconds: number;
    sec_per_paragraph: number;
    error?: string;
}

function arg_value(flag: string): string | undefined {
    const i = process.argv.indexOf(flag);
    return i !== -1 ? process.argv[i + 1] : undefined;
}

function synth_texts(chapter: RozChapterContents): string[] {
    return chapter.contents
        .filter(content => !AudiobookGen.skip_content_types[content.type])
        .map(content => prepare_text_for_tts(content.content))
        .filter(text => text.trim().length > 0);
}

function fmt(seconds: number): string {
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = Math.round(seconds % 60);
    return h > 0 ? `${h}h${m}m${s}s` : `${m}m${s}s`;
}

async function __roze_benchmark_main__() {
    const epub_path = process.argv[2];
    if (!epub_path) throw new Error("Usage: npx tsx tools/roze_benchmark.ts <epub-path> [--chapters N]");
    const chapter_limit = arg_value("--chapters") ? Number(arg_value("--chapters")) : undefined;
    const epub_dir = pathlib.dirname(pathlib.resolve(epub_path));
    const out_roz_path = arg_value("--out") ?? pathlib.join(epub_dir, pathlib.basename(epub_path, ".epub").replace(/\s+/g, "_").toLowerCase() + ".roz.json");
    const results_path = arg_value("--results") ?? pathlib.join(epub_dir, "roze_benchmark_results.json");

    await load_native_fs();
    await load_native_ffmpeg();
    await load_native_get_audio_duration();
    await load_native_voice_synth();
    await load_native_zip();
    await load_native_image_size();

    const t_parse_start = performance.now();
    const roz = await FileParser.parse_epub(epub_path, {});
    if ("error" in roz) throw new Error("Failed to parse epub: " + JSON.stringify(roz));
    const parse_seconds = (performance.now() - t_parse_start) / 1000;

    writeFileSync(out_roz_path, JSON.stringify(roz));
    console.log(`[PARSE] ${roz.title} — ${roz.chapters.length} chapters in ${fmt(parse_seconds)}; roz written to ${out_roz_path}`);

    const chapters = chapter_limit ? roz.chapters.slice(0, chapter_limit) : roz.chapters;
    const stats: ChapterStats[] = [];
    const finished_chapters: RozChapterContents[] = [];
    const paragraph_deltas: number[] = [];

    const t_gen_start = performance.now();
    for (const [index, chapter] of chapters.entries()) {
        const texts = synth_texts(chapter);
        const synth_chars = texts.reduce((p, c) => p + c.length, 0);
        const substantive = texts.length >= SUBSTANTIVE_MIN_CONTENTS && synth_chars >= SUBSTANTIVE_MIN_CHARS;

        let last_export = performance.now();
        const t0 = performance.now();
        const result = await AudiobookGen.roz_chapter_to_audiobook(chapter, {}, {
            on_chapter_content_export: () => {
                const now = performance.now();
                paragraph_deltas.push((now - last_export) / 1000);
                last_export = now;
            }
        }, { rate: TTS_RATE });
        const wall_seconds = (performance.now() - t0) / 1000;

        if ("error" in result) {
            stats.push({ index, title: chapter.chapter.title ?? "", total_contents: chapter.contents.length, synth_contents: texts.length, synth_chars, substantive, wall_seconds, audio_seconds: 0, sec_per_paragraph: 0, error: JSON.stringify(result.error ?? result) });
            console.log(`[CH ${index + 1}/${chapters.length}] FAILED "${chapter.chapter.title}" after ${fmt(wall_seconds)}`);
            continue;
        }
        finished_chapters.push(result);
        const audio_seconds = result.chapter.duration ?? 0;
        stats.push({ index, title: chapter.chapter.title ?? "", total_contents: chapter.contents.length, synth_contents: texts.length, synth_chars, substantive, wall_seconds, audio_seconds, sec_per_paragraph: texts.length > 0 ? wall_seconds / texts.length : 0 });
        console.log(`[CH ${index + 1}/${chapters.length}] "${chapter.chapter.title}" — ${texts.length} paragraphs, ${fmt(wall_seconds)} wall, ${fmt(audio_seconds)} audio${substantive ? "" : " (not substantive)"}`);
    }
    const synth_wall_seconds = (performance.now() - t_gen_start) / 1000;

    const chapter_audio_paths = finished_chapters.map(chapter => chapter.chapter.audio_path).filter((audio_path): audio_path is string => audio_path !== undefined);
    const t_concat_start = performance.now();
    const full_concat = chapter_audio_paths.length > 0 ? await concact_audio_files(chapter_audio_paths, Constants.TTS_DEFAULT_FILE_EXTENSION, "COPY", "CLEAN_FILES") : undefined;
    const concat_seconds = (performance.now() - t_concat_start) / 1000;
    const total_wall_seconds = synth_wall_seconds + concat_seconds;

    const ok = stats.filter(stat => !stat.error);
    const substantive_stats = ok.filter(stat => stat.substantive);
    const total_paragraphs = ok.reduce((p, c) => p + c.synth_contents, 0);
    const total_audio_seconds = ok.reduce((p, c) => p + c.audio_seconds, 0);
    const summary = {
        epub: epub_path,
        title: roz.title,
        voice: "system default (say)",
        rate_wpm: TTS_RATE,
        parse_seconds,
        chapters_generated: ok.length,
        chapters_failed: stats.length - ok.length,
        substantive_chapters: substantive_stats.length,
        total_paragraphs,
        total_audio_seconds,
        synth_wall_seconds,
        final_concat_seconds: concat_seconds,
        total_wall_seconds,
        avg_seconds_per_paragraph: total_paragraphs > 0 ? synth_wall_seconds / total_paragraphs : 0,
        median_paragraph_delta_seconds: paragraph_deltas.length > 0 ? [...paragraph_deltas].sort((a, b) => a - b)[Math.floor(paragraph_deltas.length / 2)] : 0,
        avg_seconds_per_substantive_chapter: substantive_stats.length > 0 ? substantive_stats.reduce((p, c) => p + c.wall_seconds, 0) / substantive_stats.length : 0,
        realtime_factor: total_wall_seconds > 0 ? total_audio_seconds / total_wall_seconds : 0,
        final_audio_path: full_concat?.out_file_path,
        chapter_limit: chapter_limit ?? null,
        chapters: stats
    };
    writeFileSync(results_path, JSON.stringify(summary, null, 2));
    writeFileSync(out_roz_path, JSON.stringify({ ...roz, chapters: chapter_limit ? roz.chapters : finished_chapters }));

    console.log(`\n===== BENCHMARK SUMMARY =====`);
    console.log(`Parse epub -> roz:            ${fmt(parse_seconds)}`);
    console.log(`Paragraphs synthesized:       ${total_paragraphs}`);
    console.log(`Avg per paragraph:            ${summary.avg_seconds_per_paragraph.toFixed(3)}s (median delta ${summary.median_paragraph_delta_seconds.toFixed(3)}s)`);
    console.log(`Substantive chapters:         ${substantive_stats.length}/${stats.length}`);
    console.log(`Avg per substantive chapter:  ${fmt(summary.avg_seconds_per_substantive_chapter)}`);
    console.log(`Synthesis wall time:          ${fmt(synth_wall_seconds)}`);
    console.log(`Final concat:                 ${fmt(concat_seconds)}`);
    console.log(`WHOLE BOOK wall time:         ${fmt(total_wall_seconds)}`);
    console.log(`Audio produced:               ${fmt(total_audio_seconds)} (${summary.realtime_factor.toFixed(1)}x realtime)`);
    console.log(`Final audio: ${full_concat?.out_file_path}`);
    console.log(`Results JSON: ${results_path}`);
}

__roze_benchmark_main__().catch((e) => { console.error(e); process.exit(1); });
