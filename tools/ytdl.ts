import { TimeLog } from "@common/time_log";
import { ffmpeg, load_native_ffmpeg } from "@native/ffmpeg/ffmpeg";
import * as Origin from "@origin/index";
import { green, red } from "colors";
import cli_progress from 'cli-progress';
import path from 'path';

const is_win = process.platform === "win32";
const output_folder = is_win ? "C:/Users/raygo/Music/ytdl/" : "/Users/illusion/ytdl_out/";
const url = process.argv[2];

async function ytdl_main__(){
    if(url === undefined){
        console.error(red("NO URL SPECIFIED"));
        return;
    }
    await load_native_ffmpeg();
    const av_result = await TimeLog.log_fn_async(
        green("FOUND MEDIA"),
        async() => await Origin.YouTubeDL.ytdl(url, {quality: '18', playerClients: ["WEB", "IOS", "ANDROID", "TV"]})
    );
    if("error" in av_result) {
        console.error(red("FAILED TO FIND MEDIA"))
        return;
    }
    const duration_seconds = (Number(av_result.av.approxDurationMs ?? 0)) / 1000;

    const args = [
        '-y',
        '-i',
        av_result.av.url,
        path.join(output_folder, `${av_result.info.videoDetails.title}.mp3`.replace(/\s/g, '_'))
    ];
    const progress_bar = new cli_progress.SingleBar({}, cli_progress.Presets.shades_classic);
    progress_bar.start(Math.floor(duration_seconds), 0);
    const ffmpeg_result = await ffmpeg().execute_args(args, (stats) => progress_bar.update(stats.time_seconds));
    await ffmpeg_result.retcode;
    progress_bar.stop();
}

TimeLog.log_fn_async(
    green("FINSIHED DONWLOADING MEDIA"), 
    async() => await ytdl_main__().catch(console.error))
.catch(console.error);