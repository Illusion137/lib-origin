import { TimeLog } from "@common/time_log";
import { ffmpeg, load_native_ffmpeg } from "@native/ffmpeg/ffmpeg";
import { green, red } from "colors";
import cli_progress from 'cli-progress';
import path from 'path';

const is_win = process.platform === "win32";
const output_folder = is_win ? "C:/Users/raygo/Music/ytdl/" : "/Users/illusion/ytdl_out/";
const url = process.argv[2];
import { Innertube, UniversalCache } from 'youtubei.js';
import { gen_uuid } from "@common/utils/util";

async function ytdl_main__(){
    if(url === undefined){
        console.error(red("NO URL SPECIFIED"));
        return;
    }
    await load_native_ffmpeg();

    const innertube_client = await Innertube.create({
        cache: new UniversalCache(false),
        generate_session_locally: false,
        enable_session_cache: true,
        player_id: '0004de42'
    });
    const video_info = await innertube_client.getInfo(url, { client: 'ANDROID' });
    const av_result_url = await video_info.chooseFormat({}).decipher(innertube_client.session.player);

    // const av_result = await TimeLog.log_fn_async(
    //     green("FOUND MEDIA"),
    //     async() => await Origin.YouTubeDL.ytdl(url, {quality: '18', playerClients: ["WEB", "IOS", "ANDROID", "TV"]})
    // );
    // if("error" in av_result) {
    //     console.error(red("FAILED TO FIND MEDIA"))
    //     return;
    // }
    const duration_seconds = video_info.basic_info.duration ?? 0;
    const args: string[] = [
        '-y',
        '-i',
        av_result_url,
        path.join(output_folder, `${video_info.basic_info.title ?? gen_uuid()}.mp3`.replace(/\s/g, '_'))
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