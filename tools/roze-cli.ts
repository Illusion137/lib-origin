import { green, cyan, yellow, red, blue, italic, gray, bold, magenta } from "colors";
import { extract_file_extension, generate_new_uid, milliseconds_of } from "@common/utils/util";
import { Syosetu } from "@roze/syosetu";
import { TimeLog } from "@common/time_log";
import type { RozSourceFileType } from "@roze/types/roz";
import type { VoiceBank } from "@native/voice_synth/voice_synth.base";
import { generate_translation_map, run_translation_map_roz, save_base64_image_to_file } from "@roze/utils";
import { fs, load_native_fs } from "@native/fs/fs";
import { load_native_ffmpeg } from "@native/ffmpeg/ffmpeg";
import { load_native_get_audio_duration } from "@native/get_audio_duration/get_audio_duration";
import { load_native_voice_synth, voice_synth } from "@native/voice_synth/voice_synth";
import { generror } from "@common/utils/error_util";
import { FileParser } from "@roze/file";
import type Roz from "@roze/types/roz";
import type { PromiseResult } from "@common/types";
import { AudiobookGen } from "@roze/audiobook_gen";
import ora, { type Ora } from "ora";
import cliprogress from "cli-progress";
import path from "path";
import { FSCache } from "@common/fs_cache";
import { registered_session_temp_file_paths } from "@native/fs/fs_utils";
import { rmSync } from "fs";
import { JNovel } from "@roze/jnovel";
import { Constants } from "@roze/constants";
import { WitchcultTranslations } from "@roze/witchcult_translations";
import devnull from 'dev-null';


const help_contents: string = green(`${gray(`--Roze powered by ${italic("The Origin Project")}--`)}

${magenta("roz")} ${cyan("<input>")} ${cyan("<options>")}                                                            Produces raw text file and audiobook from the given input 
${magenta("roz")} ${cyan("-lv")}                                                                          Lists the available downloaded voices 
Usage:

${magenta("roz")} ${blue("-i")} ${yellow("[syosetu|jnovel|pdf|text|roz|witchcult_translations|folder]")}                      Sets input type
  ${magenta("roz")} ${blue("-i")} ${yellow("syosetu")} ${cyan("<web-novel-id>")} ${cyan("<range-start>")}${red("(1)")} ${cyan("<range-end>")}${red("(<range-start>)")}      Webnovel from https://ncode.syosetu.com/{web-novel-id}
  ${magenta("roz")} ${blue("-i")} ${yellow("jnovel")} ${cyan("<jnovel-embeded-link-start>")} ${cyan("<uuid-offset>")}${red("(0)")}                     JNovel from https://labs.j-novel.club/embed/... (must be logged into JNovel on Chrome)
  ${magenta("roz")} ${blue("-i")} ${yellow("pdf")} ${cyan("<pdf-file-path/url>")}                                                 PDF at {pdf-file-path}    
  ${magenta("roz")} ${blue("-i")} ${yellow("txt")} ${cyan("<text-file-path/url>")}                                                Text file at {text-file-path}
  ${magenta("roz")} ${blue("-i")} ${yellow("docx")} ${cyan("<docx-file-path/url>")}                                               Docx file at {docx-file-path}
  ${magenta("roz")} ${blue("-i")} ${yellow("roz")} ${cyan("<roz-file-path/url>")}                                                 Roz file at {roz-file-path}
  ${magenta("roz")} ${blue("-i")} ${yellow("witchcult_translations")} ${cyan("<witchcult_translations-url>")}                     NO_DETAIL

${magenta("roz")} ${cyan("<input>")} ${blue("-v")} ${cyan("<voice>")}                                                           Sets the voice for the audiobook
${magenta("roz")} ${cyan("<input>")} ${blue("-l")} ${cyan("<cover?>")}                                                          Outputs cover file
${magenta("roz")} ${cyan("<input>")} ${blue("-c")} ${cyan("<cache?>")}                                                          Enables cache
${magenta("roz")} ${cyan("<input>")} ${blue("-s")} ${cyan("<srt?>")}                                                            Enables srt
${magenta("roz")} ${cyan("<input>")} ${blue("-y")} ${cyan("<youtube-chapters?>")}                                               Enables YouTube Chapters
${magenta("roz")} ${cyan("<input>")} ${blue("-d")} ${cyan("<clear-cache?>")}                                                    Clears cache
${magenta("roz")} ${cyan("<input>")} ${blue("-m")} ${cyan("<translation-map>")}                                                 Sets the translation-map file
${magenta("roz")} ${cyan("<input>")} ${blue("-a")} ${cyan("<audiobook?>")}                                                      Enables audiobook
${magenta("roz")} ${cyan("<input>")} ${blue("-b")} ${cyan("<audiovideobook?>")}                                                 Enables audiovideobook
${magenta("roz")} ${cyan("<input>")} ${blue("-h")} ${cyan("<hide-chapter-names?>")}                                             Hide chapter names when exporting audiobook
${magenta("roz")} ${cyan("<input>")} ${blue("-p")} ${cyan("<proxy?>")}                                                          Sets the use of WebNovel Proxy
${magenta("roz")} ${cyan("<input>")} ${blue("-z")} ${cyan("<size-mode?>")}                                                      Takes longer to encode audiobook by ~1.37x but with a ~2.66x size decrease
${magenta("roz")} ${cyan("<input>")} ${blue("-t")} ${cyan("<translate?>")}                                                      Translate the Input?
${magenta("roz")} ${cyan("<input>")} ${blue("-n")} ${cyan("<debug-mode?>")}                                                     Debug Mode?
${magenta("roz")} ${cyan("<input>")} ${blue("-o")} ${cyan("<output>")}                                                          Output data to file
${magenta("roz")} ${cyan("<input>")} ${blue("-q")} ${cyan("<no-progress-bar>")}                                                 No progress bar?
${magenta("roz")} ${cyan("<input>")} ${blue("-e")} ${cyan("<chrome_executable_path>")}                                          Sets the chrome executable path`);

const HELP_TABLE = {
	__START__: 6,
	SYOSETU: 7,
	JNOVEL: 8,
	PDF: 9,
	TEXT: 10,
	DOCX: 11,
	ROZ: 12,
	WITCHCULT: 13,
	__END__: 14
} as const;

const MIN_ARGS_TABLE: Record<RozSourceFileType, number> = {
	TXT: 1,
	PDF: 1,
	JNOVEL: 1,
	WITCHCULT: 1,
	SYOSETU: 1,
	EPUB: 1,
	DOCX: 1,
	FILEBASE: 1,
	FOLDER: 0
};

const input_source_file_type_table: Record<string, RozSourceFileType> = {
	text: "TXT",
	pdf: "PDF",
	jnovel: "JNOVEL",
	witchcult_translations: "WITCHCULT",
	syosetu: "SYOSETU",
	epub: "EPUB",
	docx: "DOCX",
	roz: "FILEBASE",
	folder: "FOLDER"
} as const;

const file_extension_to_source_file_type_table: Record<string, RozSourceFileType> = {
	".epub": "EPUB",
	".docx": "DOCX",
	".roz": "FILEBASE",
	".roz.json": "FILEBASE",
	".pdf": "PDF",
	".txt": "TXT"
}

const options = {
	chrome_executable_path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
	proxy: false,
	translate: false,
	cover: false,
	audiobook: false,
	audiovideobook: false,
	hide_chapter_names: false,
	cache: false,
	clear_cache: false,
	srt: false,
	youtube_chapters: false,
	size_mode: false,
	debug: false,
	translation_map_path: "",
	voice: { id: "", language: "", name: "", quality: "" } as VoiceBank,
	text_to_speach_speed: 1,
	pdf_margin: [0, 48],
	pdf_start: 0,
	output_to: "",
	no_progress_bar: false
};

//Part 5 Volume 10
//https://ncode.syosetu.com/n4830bu/637/
// parse_webnovel("n4830bu", 636, 649); // Volume 10 LN

function args_to_opts(argv: string[]) {
	argv = argv.filter((arg) => arg).flat();
	const opts: string[][] = [];
	for (let i = 2, o = -1; i < argv.length; i++)
		if (argv[i][0].startsWith("-")) {
			opts.push([argv[i]]);
			o++;
		} else opts[o].push(argv[i]);
	return opts;
}
function log_info(str: any) {
	console.log(cyan(`${bold("[INFO]:")} ${str}`));
}
function log_error(str: any) {
	console.log(red(`${bold("[ERROR]:")} ${str}`));
}
function log_input_error(error: string, help_key: keyof typeof HELP_TABLE) {
	log_error("<---- " + error + " ---->");
	if (help_key === "__START__") {
		console.log(help_contents.split("\n").slice(HELP_TABLE.__START__, HELP_TABLE.__END__).join("\n"));
	} else
		console.log(
			help_contents
				.split("\n")
				.slice(HELP_TABLE[help_key], HELP_TABLE[help_key] + 1)
				.join("\n")
		);
}
function spinner_result(spinner: Ora, result: unknown) {
	if (typeof result === "object" && result !== null && "error" in result) spinner.fail();
	else spinner.succeed();
}

async function get_roz(source_file_type: RozSourceFileType, input_options: string[]): PromiseResult<Roz> {
	const no_roz: Roz = generror("No Roz", { source_file_type, input_options }) as never;
	if (input_options.length < MIN_ARGS_TABLE[source_file_type]) {
		log_input_error(`Not enough arguments provided for ${source_file_type}`, "__START__");
		return no_roz;
	}
	switch (source_file_type) {
		case "TXT": {
			const text_loading_text = `Loading Text-File at ${path.resolve(input_options[0])}`;
			const spinner = ora({ text: text_loading_text, color: "yellow" }).start();
			const text_result = await FileParser.parse_txt(input_options[0], generate_new_uid(input_options[0]), { download_to_directory: process.cwd() });
			spinner_result(spinner, text_result);
			return text_result;
		}
		case "DOCX": {
			return FileParser.parse_docx(input_options[0], { download_to_directory: process.cwd() });
		}
		case "PDF": {
			const pdf_loading_text = `Loading PDF at ${path.resolve(input_options[0])}`;
			const spinner = ora({ text: pdf_loading_text, color: "yellow" }).start();
			const pdf_result = await FileParser.parse_pdf(input_options[0], {
				download_to_directory: process.cwd(),
				paragraph_gap: "autodetect",
				margin_cutoff_header: "autodetect",
				margin_cutoff_footer: "autodetect",
				on_pdf_load_progress: async (progress) => {
					if (progress.loaded / progress.total < 1) spinner.text = pdf_loading_text + green(` ${(progress.loaded / progress.total) * 100}%`);
					else spinner.text = "Parsing PDF to Roz";
				}
			});
			spinner_result(spinner, pdf_result);
			return pdf_result;
		}
		case "SYOSETU": {
			const syosetu_progress_bar = new cliprogress.SingleBar({ stopOnComplete: true }, cliprogress.Presets.shades_classic);

			const web_novel_id = input_options[0];
			const range_start = input_options[1] ? Number(input_options[1]) : 1;
			const range_end = input_options[2] ? Number(input_options[2]) : range_start;

			if (!/(\w|\d){5,}/.test(web_novel_id)) {
				log_input_error("Invalid Web-Novel ID", "SYOSETU");
				return no_roz;
			}
			if (range_start < -1) {
				log_input_error("Range-Start must be >= 1", "SYOSETU");
				return no_roz;
			}
			if (range_end < -1) {
				log_input_error("Range-End must be >= 1", "SYOSETU");
				return no_roz;
			}
			if (range_end < range_start) {
				log_input_error("Range-End must be >= Range-Start", "SYOSETU");
				return no_roz;
			}
			syosetu_progress_bar.start(range_end - range_start + 1, 0);

			const webnovel_contents = await Syosetu.webnovel_chapter_contents_range(web_novel_id, {
				range_start,
				range_end,
				translate_contents: options.translate,
				on_chapter_parse: () => {
					syosetu_progress_bar.increment();
				}
			});

			return Syosetu.webnovel_chapters_contents_to_roz(webnovel_contents);
		}
		case "JNOVEL": {
			const jnovel_progress_bar = new cliprogress.SingleBar({ stopOnComplete: true }, cliprogress.Presets.shades_classic);
			jnovel_progress_bar.start(2, 0);
			const jnovel_contents = await JNovel.reader_volume({
				legacy_id: input_options[0],
				on_uuid_count: (count) => jnovel_progress_bar.setTotal(count),
				on_reader_complete: () => jnovel_progress_bar.increment()
			});
			if ("error" in jnovel_contents) return jnovel_contents;
			return JNovel.readers_to_roz(jnovel_contents);
		}
		case "EPUB": {
			return await FileParser.parse_epub(input_options[0], { download_to_directory: process.cwd() });
		}
		case "WITCHCULT": {
			const witchcult_progress_bar = new cliprogress.SingleBar({ stopOnComplete: true }, cliprogress.Presets.shades_classic);
			witchcult_progress_bar.start(2, 0);
			return await WitchcultTranslations.arcno_to_roz(0, {
				on_chapter_fetch: () => { return }
			});
		}
		case "FILEBASE": {
			return FileParser.parse_roz(input_options[0], { download_to_directory: process.cwd() });
		}
		case "FOLDER":
		default:
			log_error(`Unknown input-type: "${italic(source_file_type)}"`);
			process.exit(1);
	}
}

async function single_roz(input_type: RozSourceFileType, opt_in: string[]) {
	const cache_payload = "ROZ: " + JSON.stringify(opt_in);
	const cache_result = options.cache ? await FSCache.check_cache<Roz>(cache_payload, milliseconds_of({ hours: 1 }), {}) : undefined;
	if (cache_result !== undefined && !options.clear_cache) log_info(`Reading cache data...`);
	if (options.clear_cache) {
		log_info(`Clearing cache data...`);
		await FSCache.clear_cache(cache_payload, {});
	}

	const roz = cache_result ? cache_result : await get_roz(input_type, opt_in);
	if ("error" in roz) {
		log_error("Couldn't get Roz-data");
		console.error(roz);
		process.exit(1);
	}
	log_info(`Source File: ${roz.source_file}`);
	console.log(cyan("Roz Info: "), { ...roz, chapters: `{JSON_ENCODED ${roz.chapters.length} CHAPTERS}`, cover: roz.cover ? "{ BASE64_ENCODED_DATA }" : roz.cover });
	// await fs().write_file_as_string("./example.roz.json", JSON.stringify(roz), {});

	if (options.cache && cache_result === undefined) {
		log_info(`Writing data to cache...`);
		await FSCache.insert_cache(cache_payload, roz, {});
	}
	if (options.translation_map_path) {
		const translation_map_file_contents = await fs().read_as_string(options.translation_map_path, { encoding: "utf8" });
		if (typeof translation_map_file_contents === "object") {
			log_error("translation_map_file_path has error or doesn't exist");
			process.exit(1);
		}
		const translation_map = generate_translation_map(translation_map_file_contents);
		run_translation_map_roz(roz, translation_map);
	}

	if (options.cover && roz.cover) {
		const cover_path = await save_base64_image_to_file(roz.cover, undefined, "NO_REGISTER");
		await fs().move(cover_path.path, options.output_to + extract_file_extension(cover_path.path), {});
		log_info("Writing cover...");
	}

	if (options.audiobook || options.audiovideobook) {
		// roz.chapters = roz.chapters.slice(0,5);
		const audiobook_progress_multibar = new cliprogress.MultiBar(
			{
				clearOnComplete: false,
				stopOnComplete: true,
				hideCursor: true,
				stream: options.no_progress_bar ? devnull : undefined,
				format: ` ${cyan("{bar}")} | {chapter_name} | {value}/{total} | ETA: {eta}s | Elapsed: {duration}s`,
			},
			cliprogress.Presets.shades_grey
		);
		const hidden_text = "[HIDDEN]";
		const chapter_title_max_length = Math.max(...roz.chapters.map((chapter) => (chapter.chapter.title ?? "").length));
		const audiobook_progress_bars = roz.chapters.map((chapter) => ({
			chapter,
			bar: audiobook_progress_multibar.create(chapter.contents.length, 0, {
				chapter_name: options.hide_chapter_names ? hidden_text : (chapter.chapter.title ?? "").padEnd(chapter_title_max_length)
			}, {
				stream: options.no_progress_bar ? devnull : undefined
			})
		}));
		const ffmpeg_merge_bar = new cliprogress.SingleBar(
			{
				clearOnComplete: false,
				stopOnComplete: false,
				hideCursor: true,
				stream: options.no_progress_bar ? devnull : undefined,
				format: `${green(" {bar}")} | ${"FFMPEG Merge".padEnd(chapter_title_max_length)} | {percentage}% | ETA: {eta}s | Speed: {speed}x | Elapsed: {duration}s`
			},
			cliprogress.Presets.shades_grey
		);
		const audiobook_result = options.audiobook
			? await AudiobookGen.roz_full_audio(
				roz,
				{
					srt_subtitles: options.srt,
					youtube_chapters: options.youtube_chapters,
					size_mode: options.size_mode
				},
				{
					on_chapter_content_skip(roz_chapter) {
						audiobook_progress_bars.find((bar) => bar.chapter.chapter.uuid === roz_chapter.chapter.uuid)?.bar.increment();
					},
					on_chapter_content_export(roz_chapter) {
						audiobook_progress_bars.find((bar) => bar.chapter.chapter.uuid === roz_chapter.chapter.uuid)?.bar.increment();
					},
				},
				{ rate: options.text_to_speach_speed, voice_bank: options.voice },
				options.debug ? "NO_CLEAN" : "CLEAN_FILES"
			)
			: await AudiobookGen.roz_audio_data_to_dynamic_mp4(
				roz,
				{
					srt_subtitles: options.srt,
					youtube_chapters: options.youtube_chapters,
					size_mode: options.size_mode
				},
				{
					on_chapter_content_skip(roz_chapter) {
						audiobook_progress_bars.find((bar) => bar.chapter.chapter.uuid === roz_chapter.chapter.uuid)?.bar.increment();
					},
					on_chapter_content_export(roz_chapter) {
						audiobook_progress_bars.find((bar) => bar.chapter.chapter.uuid === roz_chapter.chapter.uuid)?.bar.increment();
					},
					on_full_audio_complete(complete_full_audio) {
						audiobook_progress_multibar.stop();
						ffmpeg_merge_bar.start(Math.floor(complete_full_audio.roz.chapters.map((c) => c.chapter.duration ?? 0).reduce((p, c) => p + c, 0)), 0, { speed: 0 });
					},
					on_ffmpeg_stats(stats) {
						ffmpeg_merge_bar.update(stats.time_seconds, { speed: stats.speed });
					},
					on_ffmpeg_data(data) {
						if (!options.debug) return;
						console.log("DATA:", data, '\n');
					}
				},
				{ rate: options.text_to_speach_speed, voice_bank: options.voice },
				options.debug ? "NO_CLEAN" : "CLEAN_FILES"
			);
		audiobook_progress_multibar.stop();
		ffmpeg_merge_bar.stop();
		if ("error" in audiobook_result) {
			log_error("Couldn't get full_audio");
			console.error(audiobook_result);
			process.exit(1);
		}
		const full_audio = "full_audio" in audiobook_result ? audiobook_result.full_audio : audiobook_result;
		console.log(`Result: ${magenta(String(audiobook_result.ffmpeg_gen_result.retcode))} :: ${green(audiobook_result.ffmpeg_gen_result.out_file_path)}`);
		if (options.output_to && !("error" in audiobook_result)) {
			log_info(`Moving ${audiobook_result.ffmpeg_gen_result.out_file_path} to ${options.output_to}`);
			await fs().move(audiobook_result.ffmpeg_gen_result.out_file_path, options.output_to, {});
			if (options.srt && full_audio.srt_file_path) await fs().copy(full_audio.srt_file_path, options.output_to + '.srt', {});
			if (options.youtube_chapters && full_audio.youtube_chapters_file_path) await fs().copy(full_audio.youtube_chapters_file_path, options.output_to + '.ytc', {});
		}
	}
}

async function __roze_cli_main__() {
	await load_native_fs();
	await load_native_ffmpeg();
	await load_native_get_audio_duration();
	await load_native_voice_synth();

	const opts: string[][] = args_to_opts(process.argv);
	const voice_list = await voice_synth().get_voices();
	options.voice = voice_list[0];

	if (opts.findIndex((opt) => opt[0] == "-t") != -1) options.translate = true;
	if (opts.findIndex((opt) => opt[0] == "-p") != -1) options.proxy = true;
	if (opts.findIndex((opt) => opt[0] == "-a") != -1) options.audiobook = true;
	if (opts.findIndex((opt) => opt[0] == "-b") != -1) options.audiovideobook = true;
	if (opts.findIndex((opt) => opt[0] == "-h") != -1) options.hide_chapter_names = true;
	if (opts.findIndex((opt) => opt[0] == "-c") != -1) options.cache = true;
	if (opts.findIndex((opt) => opt[0] == "-d") != -1) options.clear_cache = true;
	if (opts.findIndex((opt) => opt[0] == "-s") != -1) options.srt = true;
	if (opts.findIndex((opt) => opt[0] == "-y") != -1) options.youtube_chapters = true;
	if (opts.findIndex((opt) => opt[0] == "-z") != -1) options.size_mode = true;
	if (opts.findIndex((opt) => opt[0] == "-l") != -1) options.cover = true;
	if (opts.findIndex((opt) => opt[0] == "-n") != -1) options.debug = true;
	if (opts.findIndex((opt) => opt[0] == "-q") != -1) options.no_progress_bar = true;
	let hold_index = -1;
	if ((hold_index = opts.findIndex((opt) => opt[0] == "-v")) !== -1) options.voice = voice_list[Number(opts[hold_index][1])];
	if ((hold_index = opts.findIndex((opt) => opt[0] == "-r")) !== -1) options.text_to_speach_speed = Number(opts[hold_index][1]);
	if ((hold_index = opts.findIndex((opt) => opt[0] == "-m")) !== -1) options.translation_map_path = opts[hold_index][1];
	if ((hold_index = opts.findIndex((opt) => opt[0] == "-o")) !== -1) options.output_to = opts[hold_index][1];

	log_info("Options:");
	console.log({ options });

	if (opts.length == 0) {
		console.log(help_contents);
	} else if (opts[0][0] == "-lv") {
		console.log(green(bold("Installed Voices:\n") + italic(voice_list.map((v, i) => `[${i}] ${v.name}`).join("\n"))));
	} else if (opts[0][0] == "-i") {
		const input_type = input_source_file_type_table[opts[0][1]];
		if (input_type === "FOLDER") {
			const directory_contents = await fs().read_directory(process.cwd());
			if ("error" in directory_contents) {
				log_error("Couldn't read directory contents");
				console.error(directory_contents);
				process.exit(1);
			}
			for (const file_path of directory_contents) {
				const opt_in = [file_path];
				const extension = extract_file_extension(file_path, "none")
				options.output_to = file_path + (options.audiovideobook ? ".mp4" : Constants.TTS_DEFAULT_FILE_EXTENSION);
				const source = file_extension_to_source_file_type_table[extension];
				if (source === undefined) {
					log_info(`Skipping ${file_path}...`);
					continue;
				}
				log_info(`Loading ${file_path} as ${source}`);
				await single_roz(source, opt_in);
			}
		}
		else await single_roz(input_type, opts[0].slice(2));
	}
}

TimeLog.log_fn_async(cyan("FINSIHED ROZE-CLI PROCESS"), async () => await __roze_cli_main__().catch(console.error)).catch(console.error);
//ts-node main.ts -i webnovel n4830bu 652 668 -t

process.on("SIGINT", function () {
	if (registered_session_temp_file_paths.length === 0) process.exit();

	const cleanup_bar = new cliprogress.SingleBar(
		{
			clearOnComplete: false,
			stopOnComplete: true,
			hideCursor: true,
			format: `${yellow(" {bar}")} | Cleanup | {percentage}% | ETA: {eta}s | {file} | Elapsed: {duration}s`
		},
		cliprogress.Presets.shades_grey
	);
	cleanup_bar.start(registered_session_temp_file_paths.length, 0, { file: registered_session_temp_file_paths[0] });

	registered_session_temp_file_paths.forEach((file_path) => {
		cleanup_bar.increment(1, { file: file_path });
		try {
			rmSync(file_path);
		} catch (_) { }
	});

	cleanup_bar.stop();
	process.exit();
});
