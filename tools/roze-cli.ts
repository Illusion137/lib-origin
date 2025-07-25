// import * as fs from "fs";
// import { spawn } from "child_process";
// import {
//     green,
//     cyan,
//     yellow,
//     red,
//     blue,
//     italic,
//     gray,
//     bold,
//     magenta,
// } from "colors";
// import say from "say";
// import * as fsExtra from "fs-extra";
// import type Roz from "../roze/src/types/roz";
// import type { RozSourceFileType } from "../roze/src/types/roz";
// import { generror, is_empty } from "../@origin/utils/util";
// import type { VoiceBank } from "../roze/native/voice_synth/voice_synth.base";
// import { FileParser } from "../roze/src/file";
// import type { PromiseResult } from "../@origin/utils/types";

// const help_contents: string =
// green(`${gray(`--Roze powered by ${italic("The Origin Project")}--`)}

// ${magenta("roz")} ${cyan("<input>")} ${cyan("<options>")}                                                            Produces raw text file and audiobook from the given input 
// ${magenta("roz")} ${cyan("-lv")}                                                                          Lists the available downloaded voices 
// Usage:

// ${magenta("roz")} ${blue("-i")} ${yellow("[syosetu|jnovel|pdf|text|roz|witchcult_translations]")}                                                Sets input type
//   ${magenta("roz")} ${blue("-i")} ${yellow("syosetu")} ${cyan("<web-novel-id>")} ${cyan("<range-start>")}${red("(1)")} ${cyan("<range-end>")}${red("(<range-start>)")}     Webnovel from https://ncode.syosetu.com/{web-novel-id}
//   ${magenta("roz")} ${blue("-i")} ${yellow("jnovel")} ${cyan("<jnovel-embeded-link-start>")} ${cyan("<uuid-offset>")}${red("(0)")}                     JNovel from https://labs.j-novel.club/embed/... (must be logged into JNovel on Chrome)
//   ${magenta("roz")} ${blue("-i")} ${yellow("pdf")} ${cyan("<pdf-file-path/url>")}                                                 PDF at {pdf-file-path}    
//   ${magenta("roz")} ${blue("-i")} ${yellow("txt")} ${cyan("<text-file-path/url>")}                                               Text file at {text-file-path}
//   ${magenta("roz")} ${blue("-i")} ${yellow("docx")} ${cyan("<docx-file-path/url>")}                                               Text file at {text-file-path}
//   ${magenta("roz")} ${blue("-i")} ${yellow("roz")} ${cyan("<roz-file-path/url>")}                                               Roz file at {text-file-path}
//   ${magenta("roz")} ${blue("-i")} ${yellow("witchcult_translations")}                                                            NO_DETAIL

// ${magenta("roz")} ${cyan("<input>")} ${blue("-v")} ${cyan("<voice>")}                                                           Sets the voice for the audiobook
// ${magenta("roz")} ${cyan("<input>")} ${blue("-c")} ${cyan("<cover>")}                                                           Sets the cover image for the audiobook if not using JNovel Club
// ${magenta("roz")} ${cyan("<input>")} ${blue("-m")} ${cyan("<translation-map>")}                                                 Sets the translation-map file
// ${magenta("roz")} ${cyan("<input>")} ${blue("-a")} ${cyan("<audiobook?>")}                                                      Enables audiobook
// ${magenta("roz")} ${cyan("<input>")} ${blue("-h")} ${cyan("<hide-chapter-names?>")}                                             Hide chapter names when exporting audiobook
// ${magenta("roz")} ${cyan("<input>")} ${blue("-p")} ${cyan("<proxy?>")}                                                          Sets the use of WebNovel Proxy
// ${magenta("roz")} ${cyan("<input>")} ${blue("-t")} ${cyan("<translate?>")}                                                      Translate the Input?
// ${magenta("roz")} ${cyan("<input>")} ${blue("-e")} ${cyan("<chrome_executable_path>")}                                          Sets the chrome executable path`)

// const HELP_TABLE = {
//     "__START__": 6,
//     "SYOSETU": 7,
//     "JNOVEL": 8,
//     "PDF": 9,
//     "TEXT": 10,
//     "DOCX": 11,
//     "ROZ": 12,
//     "WITCHCULT": 13,
//     "__END__": 14,
// } as const;

// const MIN_ARGS_TABLE: Record<RozSourceFileType, number> = {
//     TXT: 1,
//     PDF: 1,
//     JNOVEL: 1,
//     WITCHCULT: 1,
//     SYOSETU: 3,
//     EPUB: 1,
//     DOCX: 1,
//     FILEBASE: 1
// };

// const options = {
//     chrome_executable_path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
//     proxy: false,
//     translate: false,
//     audiobook: false,
//     hide_chapter_names: false,
//     cover: "temp/img/cover.jpg",
//     translation_map_path: null,
//     voice: null as VoiceBank,
//     speed: 1,
//     pdf_margin: [0, 48],
//     pdf_start: 0
// };

// //Part 5 Volume 10
// //https://ncode.syosetu.com/n4830bu/637/
// // parse_webnovel("n4830bu", 636, 649); // Volume 10 LN

// async function rtxt_to_audiobook(content: string) {
//     const timestamps: TimestampedChapter[] = [];
//     const ff_file_list: string[] = [];
//     let current_durration = 0;
//     let t = 0;
//     log_info(`Total Chapters: ${content.split(chapter_break()).length}`)
//     for (const chapter of content.split(chapter_break()) ) {
//         const lines = chapter.split("\r\n");
//         const title = lines[0];
//         const ff_file_path = `temp/audio/${t++}.wav`;
//         ff_file_list.push('file ../' + ff_file_path);

//         timestamps.push({
//             title: title,
//             timestamp: timestamp_to_string(current_durration),
//         });
//         if(options.hide_chapter_names) 
//             log_info(`Exporting Chapter ${t} -> ${italic(title.replace(/[^ ]/g, '*'))}`);
//         else 
//             log_info(`Exporting Chapter ${t} -> ${italic(title)}`);
//         const promise = new Promise((resolve, reject) => {
//             // console.log(chapter);
//             say.export(
//                 chapter,
//                 options.voice,
//                 options.speed,
//                 ff_file_path,
//                 (err) => {
//                     if (err) log_error(err);
//                     resolve(0);
//                 },
//             );
//         });
//         await promise;
//         current_durration += await getAudioDurationInSeconds(ff_file_path, "C:\\ffmpeg\\bin\\ffprobe.exe");
//     }

//     const f_timestamps = timestamps
//         .map((t) => `${t.title}: ${t.timestamp}`)
//         .join("\r\n");
//     fs.writeFileSync("out/timestamps.dat", f_timestamps);
//     fs.writeFileSync("temp/audio_list.txt", ff_file_list.join('\r\n'));
//     await build_audio();
//     await build_video();
// }

// function args_to_opts(argv: string[]) {
//     const opts: string[][] = [];
//     for (let i = 2, o = -1; i < argv.length; i++)
//         if (argv[i][0].startsWith("-")) {
//             opts.push([argv[i]]);
//             o++;
//         } else opts[o].push(argv[i]);
//     return opts;
// }
// function log_info(str: any) {
//     console.log(cyan(`${bold("[INFO]:")} ${str}`));
// }
// function log_warn(str: any) {
//     console.log(yellow(`${bold("[WARN]:")} ${str}`));
// }
// function log_error(str: any) {
//     console.log(red(`${bold("[ERROR]:")} ${str}`));
// }
// function log_input_error(error: string, help_key: keyof typeof HELP_TABLE) {
//     log_error('<---- ' + error + ' ---->');
//     if(help_key === "__START__"){
//         console.log(help_contents.split("\n").slice(HELP_TABLE.__START__, HELP_TABLE.__END__).join("\n"));
//     }
//     else console.log(help_contents.split("\n").slice(HELP_TABLE[help_key], HELP_TABLE[help_key] + 1).join("\n"));
// }

// async function get_roz(source_file_type: RozSourceFileType, input_options: string[]): PromiseResult<Roz>{
//     const no_roz: Roz = {} as never;
//     if(input_options.length < MIN_ARGS_TABLE[source_file_type]){
//         log_input_error(`Not enough arguments provided for ${source_file_type}`, "__START__"); return no_roz;
//     }
//     switch (source_file_type) {
//         case "TXT": {
//             return await FileParser.parse_txt(input_options[0]);
//         }
//         case "DOCX": {
//             return generror("Docx is currently not supported");
//             // return await doc_path_to_rtxt(input_options[0]);
//         }
//         case "PDF": {
//             return await FileParser.parse_pdf(input_options[0]);
//         }
//         case "SYOSETU": {
//             if (input_options.length < 2) { log_input_error("Not enough arguments provided", 7, 8); return no_roz; }

//             const web_novel_id = input_options[0];
//             const range_start = parseInt(input_options[1]);
//             const range_end = parseInt(input_options[2]);

//             if (!/(\w|\d){5,}/.test(web_novel_id)) { log_input_error("Invalid Web-Novel ID", "SYOSETU"); return no_roz; }
//             if (range_start < -1) { log_input_error("Range-Start must be >= 1", "SYOSETU"); return no_roz; }
//             if (range_end < -1) { log_input_error("Range-End must be >= 1", "SYOSETU"); return no_roz; }
//             if (range_end < range_start) { log_input_error("Range-End must be >= Range-Start", "SYOSETU"); return no_roz; }
//             return await parse_webnovel(web_novel_id, range_start, range_end);
//         }
//         case "JNOVEL": {
//             return await parse_jnovel(input_options[0]); 
//         }
//         case "EPUB": {
//             return await FileParser.parse_epub(input_options[0]);
//         }
//         case "WITCHCULT": {
//             return;
//         }
//         case "FILEBASE": {
//             return await FileParser.parse_epub(input_options[0]);
//             return;
//         }
//         default:
//             log_error(`Unknown input-type: "${italic(source_file_type)}"`);
//             process.exit(1);
//     }
// }

// async function __roze_cli_main__() { // TODDO: Add Epub Support
//     const opts: string[][] = args_to_opts(process.argv);
//     options.voice = (await get_voices())[0];

//     if (opts.findIndex((opt) => opt[0] == "-t") != -1) options.translate = true;
//     if (opts.findIndex((opt) => opt[0] == "-p") != -1) options.proxy = true;
//     if (opts.findIndex((opt) => opt[0] == "-a") != -1) options.audiobook = true;
//     if (opts.findIndex((opt) => opt[0] == "-h") != -1) options.hide_chapter_names = true;
//     let hold_index = -1;
//     if ((hold_index = opts.findIndex((opt) => opt[0] == "-v")) !== -1) options.voice = opts[hold_index][1];
//     if ((hold_index = opts.findIndex((opt) => opt[0] == "-c")) !== -1) options.cover = opts[hold_index][1];
//     if ((hold_index = opts.findIndex((opt) => opt[0] == "-m")) !== -1) options.translation_map_path = opts[hold_index][1];
    
//     if (opts.length == 0) {
//         console.log(help_contents);
//     } else if (opts[0][0] == "-lv") {
//         say.getInstalledVoices((err, voices) => {
//             console.log( green(bold("Installed Voices:\n") + italic(voices.join("\n"))) );
//             console.log(bold(red(err)));
//         });
//         console.log(await get_voices());
//     } else if (opts[0][0] == "-i") {
//         fsExtra.emptyDirSync("temp/downloads/");
//         // [webnovel|jnovel|pdf|text]
//         if (opts[0].slice(1).length < 1) { log_input_error("<---- No Input Type provided ---->"); return; }

//         const input_type = opts[0][1];
//         const opt_in = opts[0].slice(2);

//         let roz: Roz = get_roz();
//         if (!is_empty(roz)) {
//             log_info("Read Data");
//             // fsExtra.emptyDirSync("out/");
//             // log_info("Cleared Out Directory");
//             if(options.translate){
//                 log_info("Translating");
//                 fs.writeFileSync("temp/docs/translate.roz.txt", rtext_content);
//                 // fs.writeFileSync("temp/docs/translate.roz.docx", await docx_buffer(rtxt_to_docx(rtext_content)));
//             }
//             else{
//                 rtext_content = rtext_content
//                     .replace(/(”|“)/g, "\"")
//                     .replace(/’/g, '\'')
//                     .replace(/``/g, '"')
//                     .replace(/ ?… ?/g, '...')
//                     .replace(/ ?\.\.\. ?/g, '...')
//                     .replace(/''/g, '"')
//                     .replace(/\r\n\r\n\r\n\r\n/g, '\r\n\r\n');
//                 rtext_content = rtext_content.replace(/[^\x00-\x7FáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸ]+/g, ' ');

//                 if(options.translation_map_path) {
//                     const translation_file = fs.readFileSync(options.translation_map_path, 'utf-8');
//                     const translation_map = translation_file.split('\r\n').map(line => { return line.split(' -> ') });
//                     for(const translation_mapping of translation_map){
//                         if(translation_mapping[0] === '----') break;
//                         const key = translation_mapping[0]
//                         const value = translation_mapping[1];
//                         const regex = new RegExp(key,'gi');
//                         rtext_content = rtext_content.replace(regex, value);
//                     }
//                 }
//                 fs.writeFileSync("out/processed.roz.txt", rtext_content);
//                 fs.writeFileSync("out/processed.roz.docx", await docx_buffer(rtxt_to_docx(rtext_content)));

//                 if(options.audiobook) {
//                     await rtxt_to_audiobook(rtext_content);
//                 }
//             }
//         } else {
//             log_error("Undefined RText-Content");
//             process.exit(1);
//         }
//     }
// }

// __roze_cli_main__().then(() => {log_info("Finished :3"); process.exit()}).catch(e => log_error(e));
// //ts-node main.ts -i webnovel n4830bu 652 668 -t