import {
    green,
    cyan,
    yellow,
    red,
    blue,
    italic,
    gray,
    bold,
    magenta,
} from "colors";
import { generate_new_uid } from "@common/utils/util";
import { Syosetu } from "@roze/syosetu";
import { TimeLog } from "@common/time_log";
import type { RozSourceFileType } from "@roze/types/roz";
import type { VoiceBank } from "@native/voice_synth/voice_synth.base";
import { generate_translation_map, run_translation_map_roz } from "@roze/utils";
import { fs, load_native_fs } from "@native/fs/fs";
import { load_native_ffmpeg } from "@native/ffmpeg/ffmpeg";
import { load_native_get_audio_duration } from "@native/get_audio_duration/get_audio_duration";
import { load_native_voice_synth, voice_synth } from "@native/voice_synth/voice_synth";
import { generror } from "@common/utils/error_util";
import { FileParser } from "@roze/file";
import type Roz from "@roze/types/roz";
import type { PromiseResult } from "@common/types";
import { AudiobookGen } from "@roze/audiobook_gen";
import ora, { type Ora } from 'ora';
import path from "path";

const help_contents: string =
green(`${gray(`--Roze powered by ${italic("The Origin Project")}--`)}

${magenta("roz")} ${cyan("<input>")} ${cyan("<options>")}                                                            Produces raw text file and audiobook from the given input 
${magenta("roz")} ${cyan("-lv")}                                                                          Lists the available downloaded voices 
Usage:

${magenta("roz")} ${blue("-i")} ${yellow("[syosetu|jnovel|pdf|text|roz|witchcult_translations]")}                                                Sets input type
  ${magenta("roz")} ${blue("-i")} ${yellow("syosetu")} ${cyan("<web-novel-id>")} ${cyan("<range-start>")}${red("(1)")} ${cyan("<range-end>")}${red("(<range-start>)")}     Webnovel from https://ncode.syosetu.com/{web-novel-id}
  ${magenta("roz")} ${blue("-i")} ${yellow("jnovel")} ${cyan("<jnovel-embeded-link-start>")} ${cyan("<uuid-offset>")}${red("(0)")}                     JNovel from https://labs.j-novel.club/embed/... (must be logged into JNovel on Chrome)
  ${magenta("roz")} ${blue("-i")} ${yellow("pdf")} ${cyan("<pdf-file-path/url>")}                                                 PDF at {pdf-file-path}    
  ${magenta("roz")} ${blue("-i")} ${yellow("txt")} ${cyan("<text-file-path/url>")}                                               Text file at {text-file-path}
  ${magenta("roz")} ${blue("-i")} ${yellow("docx")} ${cyan("<docx-file-path/url>")}                                               Text file at {text-file-path}
  ${magenta("roz")} ${blue("-i")} ${yellow("roz")} ${cyan("<roz-file-path/url>")}                                               Roz file at {text-file-path}
  ${magenta("roz")} ${blue("-i")} ${yellow("witchcult_translations")}                                                            NO_DETAIL

${magenta("roz")} ${cyan("<input>")} ${blue("-v")} ${cyan("<voice>")}                                                           Sets the voice for the audiobook
${magenta("roz")} ${cyan("<input>")} ${blue("-c")} ${cyan("<cover>")}                                                           Sets the cover image for the audiobook if not using JNovel Club
${magenta("roz")} ${cyan("<input>")} ${blue("-m")} ${cyan("<translation-map>")}                                                 Sets the translation-map file
${magenta("roz")} ${cyan("<input>")} ${blue("-a")} ${cyan("<audiobook?>")}                                                      Enables audiobook
${magenta("roz")} ${cyan("<input>")} ${blue("-h")} ${cyan("<hide-chapter-names?>")}                                             Hide chapter names when exporting audiobook
${magenta("roz")} ${cyan("<input>")} ${blue("-p")} ${cyan("<proxy?>")}                                                          Sets the use of WebNovel Proxy
${magenta("roz")} ${cyan("<input>")} ${blue("-t")} ${cyan("<translate?>")}                                                      Translate the Input?
${magenta("roz")} ${cyan("<input>")} ${blue("-e")} ${cyan("<chrome_executable_path>")}                                          Sets the chrome executable path`)

const HELP_TABLE = {
    "__START__": 6,
    "SYOSETU": 7,
    "JNOVEL": 8,
    "PDF": 9,
    "TEXT": 10,
    "DOCX": 11,
    "ROZ": 12,
    "WITCHCULT": 13,
    "__END__": 14,
} as const;

const MIN_ARGS_TABLE: Record<RozSourceFileType, number> = {
    TXT: 1,
    PDF: 1,
    JNOVEL: 1,
    WITCHCULT: 1,
    SYOSETU: 3,
    EPUB: 1,
    DOCX: 1,
    FILEBASE: 1
};

const input_source_file_type_table: Record<string, RozSourceFileType> = {
    "text": "TXT",
    "pdf": "PDF",
    "jnovel": "JNOVEL",
    "witchcult_translations": "WITCHCULT",
    "webnovel": "SYOSETU",
    "epub": "EPUB",
    "docx": "DOCX",
    "roz": "FILEBASE"
} as const;

const options = {
    chrome_executable_path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    proxy: false,
    translate: false,
    audiobook: false,
    hide_chapter_names: false,
    cover: "temp/img/cover.jpg",
    translation_map_path: "",
    voice: {id: "", language: "", name: "", quality: ""} as VoiceBank,
    text_to_speach_speed: 1,
    pdf_margin: [0, 48],
    pdf_start: 0
};

//Part 5 Volume 10
//https://ncode.syosetu.com/n4830bu/637/
// parse_webnovel("n4830bu", 636, 649); // Volume 10 LN

function args_to_opts(argv: string[]) {
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
    log_error('<---- ' + error + ' ---->');
    if(help_key === "__START__"){
        console.log(help_contents.split("\n").slice(HELP_TABLE.__START__, HELP_TABLE.__END__).join("\n"));
    }
    else console.log(help_contents.split("\n").slice(HELP_TABLE[help_key], HELP_TABLE[help_key] + 1).join("\n"));
}
function spinner_result(spinner: Ora, result: unknown){
    if(typeof result === "object" && result !== null && "error" in result) spinner.fail();
    else spinner.succeed();
}

async function get_roz(source_file_type: RozSourceFileType, input_options: string[]): PromiseResult<Roz>{
    const no_roz: Roz = {} as never;
    if(input_options.length < MIN_ARGS_TABLE[source_file_type]){
        log_input_error(`Not enough arguments provided for ${source_file_type}`, "__START__"); return no_roz;
    }
    switch (source_file_type) {
        case "TXT": {
            return await FileParser.parse_txt(input_options[0], generate_new_uid(input_options[0]), {download_to_directory: process.cwd()});
        }
        case "DOCX": {
            return generror("Docx is currently not supported");
        }
        case "PDF": {
            const pdf_loading_text = `Loading PDF at ${path.resolve(input_options[0])}`;
            const spinner = ora({text: pdf_loading_text, color: "yellow"}).start();
            const pdf_result = await FileParser.parse_pdf(input_options[0], {
                download_to_directory: process.cwd(),
                paragraph_gap: "autodetect",
                margin_cutoff_header: "autodetect",
                margin_cutoff_footer: "autodetect",
                on_pdf_load_progress: async(progress) => {
                    if (progress.loaded/progress.total < 1)
                        spinner.text = pdf_loading_text + green(` ${(progress.loaded/progress.total) * 100}%`);
                    else spinner.text = "Parsing PDF to Roz";
                }});
            spinner_result(spinner, pdf_result);
            return pdf_result;
        }
        case "SYOSETU": {
            const web_novel_id = input_options[0];
            const range_start = parseInt(input_options[1]);
            const range_end = parseInt(input_options[2]);

            if (!/(\w|\d){5,}/.test(web_novel_id)) { log_input_error("Invalid Web-Novel ID", "SYOSETU"); return no_roz; }
            if (range_start < -1) { log_input_error("Range-Start must be >= 1", "SYOSETU"); return no_roz; }
            if (range_end < -1) { log_input_error("Range-End must be >= 1", "SYOSETU"); return no_roz; }
            if (range_end < range_start) { log_input_error("Range-End must be >= Range-Start", "SYOSETU"); return no_roz; }
            const webnovel_contents =  await Syosetu.webnovel_chapter_contents_range(web_novel_id, {range_start, range_end, translate_contents: options.translate});
            return Syosetu.webnovel_chapters_contents_to_roz(webnovel_contents);
        }
        case "JNOVEL": {
            return generror("JNOVEL is currently not supported");
            // return await JNovel.reader_volume({legacy_id: input_options[0]});
        }
        case "EPUB": {
            return await FileParser.parse_epub(input_options[0], {download_to_directory: process.cwd()});
        }
        case "WITCHCULT": {
            return generror("WITCHCULT is currently not supported");
        }
        case "FILEBASE": {
            return generror("FILEBASE is currently not supported");
        }
        default:
            log_error(`Unknown input-type: "${italic(source_file_type)}"`);
            process.exit(1);
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
    if (opts.findIndex((opt) => opt[0] == "-h") != -1) options.hide_chapter_names = true;
    let hold_index = -1;
    if ((hold_index = opts.findIndex((opt) => opt[0] == "-v")) !== -1) options.voice = voice_list[Number(opts[hold_index][1])];
    if ((hold_index = opts.findIndex((opt) => opt[0] == "-c")) !== -1) options.cover = opts[hold_index][1];
    if ((hold_index = opts.findIndex((opt) => opt[0] == "-m")) !== -1) options.translation_map_path = opts[hold_index][1];
    
    if (opts.length == 0) {
        console.log(help_contents);
    } else if (opts[0][0] == "-lv") {
        console.log( green(bold("Installed Voices:\n") + italic(voice_list.map((v, i) => `[${i}] ${v.name}`).join("\n"))) );
    } else if (opts[0][0] == "-i") {
        const input_type = input_source_file_type_table[opts[0][1]];
        const opt_in = opts[0].slice(2);

        const roz = await get_roz(input_type, opt_in);
        if("error" in roz) {
            log_error("Couldn't get Roz-data");
            console.error(roz);
            process.exit(1);
        }
        log_info(`Source File: ${roz.source_file}`);
        console.log(cyan("Roz Info: "), {...roz, cover: roz.cover ? "{ BASE64_ENCODED_DATA }" : roz.cover});

        if(options.translation_map_path) {
            const translation_map_file_contents = await fs().read_as_string(options.translation_map_path, {encoding: 'utf8'});
            if(typeof translation_map_file_contents === "object"){
                log_error("translation_map_file_path has error or doesn't exist");
                process.exit(1);
            }
            const translation_map = generate_translation_map(translation_map_file_contents);
            run_translation_map_roz(roz, translation_map);
        }

        if(options.audiobook) {
            await AudiobookGen.roz_full_audio(roz, {}, {rate: options.text_to_speach_speed, voice_bank: options.voice}, "CLEAN_FILES");
        }
    }
}

TimeLog.log_fn_async(
    cyan("FINSIHED ROZE-CLI PROCESS"), 
    async() => await __roze_cli_main__().catch(console.error))
.catch(console.error);
//ts-node main.ts -i webnovel n4830bu 652 668 -t