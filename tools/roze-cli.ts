import * as fs from "fs";
import puppeteer, { HTTPResponse, Page } from "puppeteer-core";
import axios from "axios";
import { JSDOM } from "jsdom";
import { spawn } from "child_process";
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
import say from "say";
import getAudioDurationInSeconds from "get-audio-duration";
import * as fsExtra from "fs-extra";

const help_contents: string = 
green(`${gray(`--Roz powered by ${italic("The Origin Project")}--`)}

${magenta("roz")} ${cyan("<input>")} ${cyan("<options>")}                                                            Produces raw text file and audiobook from the given input 
${magenta("roz")} ${cyan("-lv")}                                                                          Lists the available downloaded voices 
Usage:

${magenta("roz")} ${blue("-i")} ${yellow("[webnovel|jnovel|pdf|text]")}                                                Sets input type
  ${magenta("roz")} ${blue("-i")} ${yellow("webnovel")} ${cyan("<web-novel-id>")} ${cyan("<range-start>")}${red("(1)")} ${cyan("<range-end>")}${red("(<range-start>)")}     Webnovel from https://ncode.syosetu.com/{web-novel-id}
  ${magenta("roz")} ${blue("-i")} ${yellow("jnovel")} ${cyan("<jnovel-embeded-link-start>")} ${cyan("<uuid-offset>")}${red("(0)")}                     JNovel from https://labs.j-novel.club/embed/... (must be logged into JNovel on Chrome)
  ${magenta("roz")} ${blue("-i")} ${yellow("pdf")} ${cyan("<pdf-file-path/url>")}                                                 PDF at {pdf-file-path}    
  ${magenta("roz")} ${blue("-i")} ${yellow("text")} ${cyan("<text-file-path/url>")}                                               Text file at {text-file-path}
  ${magenta("roz")} ${blue("-i")} ${yellow("docx")} ${cyan("<docx-file-path/url>")}                                               Text file at {text-file-path}

${magenta("roz")} ${cyan("<input>")} ${blue("-v")} ${cyan("<voice>")}                                                           Sets the voice for the audiobook
${magenta("roz")} ${cyan("<input>")} ${blue("-c")} ${cyan("<cover>")}                                                           Sets the cover image for the audiobook if not using JNovel Club
${magenta("roz")} ${cyan("<input>")} ${blue("-m")} ${cyan("<translation-map>")}                                                 Sets the translation-map file
${magenta("roz")} ${cyan("<input>")} ${blue("-a")} ${cyan("<audiobook?>")}                                                      Enables audiobook
${magenta("roz")} ${cyan("<input>")} ${blue("-h")} ${cyan("<hide-chapter-names?>")}                                             Hide chapter names when exporting audiobook
${magenta("roz")} ${cyan("<input>")} ${blue("-p")} ${cyan("<proxy?>")}                                                          Sets the use of WebNovel Proxy
${magenta("roz")} ${cyan("<input>")} ${blue("-t")} ${cyan("<translate?>")}                                                      Translate the Input?
${magenta("roz")} ${cyan("<input>")} ${blue("-e")} ${cyan("<chrome_executable_path>")}                                          Sets the chrome executable path`)



const options = {
    chrome_executable_path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    proxy: false,
    translate: false,
    audiobook: false,
    hide_chapter_names: false,
    cover: "temp/img/cover.jpg",
    translation_map_path: null,
    voice: null,
    speed: 1,
    pdf_margin: [0, 48],
    pdf_start: 0
};



const delay = async millis => new Promise((resolve, reject) => {
    setTimeout(_ => resolve(0), millis)
});



//Part 5 Volume 10
//https://ncode.syosetu.com/n4830bu/637/
// parse_webnovel("n4830bu", 636, 649); // Volume 10 LN

async function get_voices(): Promise<string[]> {
    let vlist: string[] = [];
    const promise = new Promise((resolve, reject) => {
        say.getInstalledVoices((err, voices) => {
        vlist = voices;
        resolve(0);
        });
    });
    await promise;
    return vlist;
}

async function build_audio(){
    const arg_list = [
        "-f", "concat",
        "-safe", "0",
        "-i", "temp/audio_list.txt", 
        "-c", "copy", 
        "out/merged.wav"
    ]
    const promise = new Promise((resolve, reject) => {
        const merge_audio = spawn("ffmpeg", arg_list, {'stdio': ['inherit', 'inherit', 'inherit']});
        merge_audio.on('close', (code) => {
            if(code == 0)
                log_info(`Merge-Audio closed with code ${code}`);
            else
                log_error(`Merge-Audio closed with code ${code}`);
            resolve(0);
        });
        merge_audio.on('exit', (code) => {
            if(code == 0)
                log_info(`Merge-Audio exited with code ${code}`);
            else
                log_error(`Merge-Audio exited with code ${code}`);
        }); 
        merge_audio.on('disconnect', () => {
            log_warn('Merge-Audio disconnected');
        }); 
        merge_audio.on('spawn', () => {
            log_info('Merging Audio')
        });
        merge_audio.on('message', (msg) => {
            log_info(msg.toString())
        });
    });
    await promise;
}
async function build_video(){
    const arg_list = [
        "-r", "1", 
        "-loop", "1", 
        "-i", options.cover,
        "-i", "out/merged.wav", 
        "-acodec", "copy", 
        "-r", "1", 
        "-shortest",
        "-vf", "scale=860:1223",
        "out/processed.flv"
    ]
    const promise = new Promise((resolve, reject) => {
        const merge_video = spawn("ffmpeg", arg_list, {'stdio': ['inherit', 'inherit', 'inherit']});
        merge_video.on('close', (code) => {
            if(code == 0)
                log_info(`Merge-Video closed with code ${code}`);
            else
                log_error(`Merge-Video closed with code ${code}`);
            resolve(0);
        });
        merge_video.on('exit', (code) => {
            if(code == 0)
                log_info(`Merge-Video exited with code ${code}`);
            else
                log_error(`Merge-Video exited with code ${code}`);
        }); 
        merge_video.on('disconnect', () => {
            log_warn('Merge-Video disconnected');
        }); 
        merge_video.on('spawn', () => {
            log_info('Merging Video')
        });
        merge_video.on('message', (msg) => {
            log_info(msg.toString())
        });
    });
    await promise;
}
async function rtxt_to_audiobook(content: string) {
    // fsExtra.emptyDirSync("temp/audio/");
    // fsExtra.emptyDirSync("temp/img/");
    // fsExtra.emptyDirSync("temp/docs/");
    const timestamps: TimestampedChapter[] = [];
    const ff_file_list: string[] = [];
    let current_durration = 0;
    let t = 0;
    log_info(`Total Chapters: ${content.split(chapter_break()).length}`)
    for (const chapter of content.split(chapter_break()) ) {
        const lines = chapter.split("\r\n");
        const title = lines[0];
        const ff_file_path = `temp/audio/${t++}.wav`;
        ff_file_list.push('file ../' + ff_file_path);

        timestamps.push({
            title: title,
            timestamp: timestamp_to_string(current_durration),
        });
        if(options.hide_chapter_names) 
            log_info(`Exporting Chapter ${t} -> ${italic(title.replace(/[^ ]/g, '*'))}`);
        else 
            log_info(`Exporting Chapter ${t} -> ${italic(title)}`);
        const promise = new Promise((resolve, reject) => {
            // console.log(chapter);
            say.export(
                chapter,
                options.voice,
                options.speed,
                ff_file_path,
                (err) => {
                    if (err) log_error(err);
                    resolve(0);
                },
            );
        });
        await promise;
        current_durration += await getAudioDurationInSeconds(ff_file_path, "C:\\ffmpeg\\bin\\ffprobe.exe");
    }

    const f_timestamps = timestamps
        .map((t) => `${t.title}: ${t.timestamp}`)
        .join("\r\n");
    fs.writeFileSync("out/timestamps.dat", f_timestamps);
    fs.writeFileSync("temp/audio_list.txt", ff_file_list.join('\r\n'));
    await build_audio();
    await build_video();
}

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
function log_warn(str: any) {
    console.log(yellow(`${bold("[WARN]:")} ${str}`));
}
function log_error(str: any) {
    console.log(red(`${bold("[ERROR]:")} ${str}`));
}
function log_input_error(error: string, slice_start = 6, slice_end = 11) {
    log_error(error);
    console.log(
        help_contents.split("\n").slice(slice_start, slice_end).join("\n"),
    );
}

async function __roze_cli_main__() { // TODDO: Add Epub Support
    const opts: string[][] = args_to_opts(process.argv);
    options.voice = (await get_voices())[0];

    if (opts.findIndex((opt) => opt[0] == "-t") != -1) options.translate = true;
    if (opts.findIndex((opt) => opt[0] == "-p") != -1) options.proxy = true;
    if (opts.findIndex((opt) => opt[0] == "-a") != -1) options.audiobook = true;
    if (opts.findIndex((opt) => opt[0] == "-h") != -1) options.hide_chapter_names = true;
    let hold = -1;
    if ((hold = opts.findIndex((opt) => opt[0] == "-v")) != -1) options.voice = opts[hold][1];
    if ((hold = opts.findIndex((opt) => opt[0] == "-c")) != -1) options.cover = opts[hold][1];
    if ((hold = opts.findIndex((opt) => opt[0] == "-m")) != -1) options.translation_map_path = opts[hold][1];
    
    if (opts.length == 0) {
        console.log(help_contents);
    } else if (opts[0][0] == "-lv") {
        say.getInstalledVoices((err, voices) => {
            console.log( green(bold("Installed Voices:\n") + italic(voices.join("\n"))) );
            console.log(bold(red(err)));
        });
        console.log(await get_voices());
    } else if (opts[0][0] == "-i") {
        fsExtra.emptyDirSync("temp/downloads/");
        // [webnovel|jnovel|pdf|text]
        if (opts[0].slice(1).length < 1) { log_input_error("<---- No Input Type provided ---->"); return; }

        const input_type = opts[0][1];
        const opt_in = opts[0].slice(1);

        let rtext_content: string;
        switch (input_type) {
            case "text": {
                if (opt_in.length < 2) { log_input_error("<---- Not enough arguments provided ---->", 10, 11); return; }
                rtext_content = await read_text(opt_in[1]);
                break;
            }
            case "docx": {
                if (opt_in.length < 2) { log_input_error("<---- Not enough arguments provided ---->", 11, 12); return; }
                rtext_content = await doc_path_to_rtxt(opt_in[1]);
                break;
            }
            case "pdf": {
                if (opt_in.length < 2) { log_input_error("<---- Not enough arguments provided ---->", 9, 10); return; }
                rtext_content = await parse_pdf(opt_in[1]);
                break;
            }
            case "webnovel": {
                if (opt_in.length < 2) { log_input_error("<---- Not enough arguments provided ---->", 7, 8); return; }

                const web_novel_id = opt_in[1];
                const range_start = parseInt(opt_in[2]);
                const range_end = parseInt(opt_in[3]);

                if (!/(\w|\d){5,}/.test(web_novel_id)) { log_input_error("<---- Invalid Web-Novel ID ---->", 7, 8); return; }
                if (range_start < -1) { log_input_error("<---- Range-Start must be >= 1 ---->", 7, 8); return; }
                if (range_end < -1) { log_input_error("<---- Range-End must be >= 1 ---->", 7, 8); return; }
                if (range_end < range_start) { log_input_error("<---- Range-End must be >= Range-Start ---->", 7, 8); return; }
                rtext_content = await parse_webnovel(web_novel_id, range_start, range_end);
                break;
            }
            case "jnovel": {
                if (opt_in.length < 2) { log_input_error("<---- Not enough arguments provided ---->", 8, 9); return; }
                rtext_content = await parse_jnovel(opt_in[1]); 
                break;
            }
            default:
                log_error(`Unknown input-type: "${italic(input_type)}"`);
                process.exit(1);
        }
        if (rtext_content != undefined) {
            log_info("Read Data");
            // fsExtra.emptyDirSync("out/");
            // log_info("Cleared Out Directory");
            if(options.translate){
                log_info("Translating");
                fs.writeFileSync("temp/docs/translate.roz.txt", rtext_content);
                // fs.writeFileSync("temp/docs/translate.roz.docx", await docx_buffer(rtxt_to_docx(rtext_content)));
            }
            else{
                rtext_content = rtext_content
                    .replace(/(”|“)/g, "\"")
                    .replace(/’/g, '\'')
                    .replace(/``/g, '"')
                    .replace(/ ?… ?/g, '...')
                    .replace(/ ?\.\.\. ?/g, '...')
                    .replace(/''/g, '"')
                    .replace(/\r\n\r\n\r\n\r\n/g, '\r\n\r\n');
                rtext_content = rtext_content.replace(/[^\x00-\x7FáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸ]+/g, ' ');

                if(options.translation_map_path) {
                    const translation_file = fs.readFileSync(options.translation_map_path, 'utf-8');
                    const translation_map = translation_file.split('\r\n').map(line => { return line.split(' -> ') });
                    for(const translation_mapping of translation_map){
                        if(translation_mapping[0] === '----') break;
                        const key = translation_mapping[0]
                        const value = translation_mapping[1];
                        const regex = new RegExp(key,'gi');
                        rtext_content = rtext_content.replace(regex, value);
                    }
                }
                fs.writeFileSync("out/processed.roz.txt", rtext_content);
                fs.writeFileSync("out/processed.roz.docx", await docx_buffer(rtxt_to_docx(rtext_content)));

                if(options.audiobook) {
                    await rtxt_to_audiobook(rtext_content);
                }
            }
        } else {
            log_error("Undefined RText-Content");
            process.exit(1);
        }
    }
}

__roze_cli_main__().then(() => {log_info("Finished :3"); process.exit()}).catch(e => log_error(e));
//ts-node main.ts -i webnovel n4830bu 652 668 -t