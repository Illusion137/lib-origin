import 'dotenv/config';
import { TimeLog } from "@common/time_log";
import { red, green } from "colors";
import cli_progress from 'cli-progress';
import path from 'path';
import { YouTubeDL } from "@origin/youtube_dl/index";
import { load_native_sabr_downloader, sabr_downloader } from "@native/sabr_downloader/sabr_downloader";
import { gen_uuid } from "@common/utils/util";
import { load_native_potoken } from '@native/potoken/potoken';

const is_win = process.platform === "win32";
const output_folder = is_win ? "C:/Users/raygo/Music/ytdl/" : "/Users/illusion/ytdl_out/";
const url = process.argv[2];

async function ytdl_main__() {
    if (url === undefined) {
        console.error(red("NO URL SPECIFIED"));
        return;
    }
    await load_native_potoken();
    await load_native_sabr_downloader();

    const sabr_params = await TimeLog.log_fn_async(
        green("RESOLVED SABR URL"),
        async () => await YouTubeDL.resolve_sabr_url(url)
    );

    if ("error" in sabr_params) {
        console.error(red("FAILED TO RESOLVE SABR URL"), sabr_params.error);
        return;
    }

    const title = url.replace(/[^a-zA-Z0-9]/g, '_');
    const output_path = path.join(output_folder, `${gen_uuid()}_${title}.m4a`);

    const sabrFormats = sabr_params.sabrFormats;
    console.log(green(`Formats count: ${sabrFormats.length}`));
    const audioFormats = sabrFormats.filter(f => f.mimeType?.includes('audio'));
    const videoFormats = sabrFormats.filter(f => f.mimeType?.includes('video'));
    console.log(green(`Audio formats: ${audioFormats.length}, Video formats: ${videoFormats.length}`));
    if (audioFormats.length > 0) {
        console.log(green(`Sample audio format: itag=${audioFormats[0].itag} mimeType=${audioFormats[0].mimeType} audioQuality=${audioFormats[0].audioQuality}`));
    }
    if (sabrFormats.length > 0 && audioFormats.length === 0) {
        console.log(red(`First format sample: ${JSON.stringify(sabrFormats[0])}`));
    }
    console.log(green(`SABR URL: ${sabr_params.sabrServerUrl.substring(0, 80)}...`));
    console.log(green(`Ustreamer config length: ${sabr_params.sabrUstreamerConfig.length}`));
    console.log(green(`PoToken length: ${sabr_params.poToken.length}`));
    console.log(green(`ClientInfo: clientName=${sabr_params.clientInfo?.clientName} version=${sabr_params.clientInfo?.clientVersion}`));
    console.log(green(`Cookie present: ${!!sabr_params.cookie}`))

    const duration_ms = sabr_params.sabrFormats?.[0]?.approxDurationMs ?? 0;
    const progress_bar = new cli_progress.SingleBar({}, cli_progress.Presets.shades_classic);
    progress_bar.start(100, 0);

    await sabr_downloader().download_sabr(
        {
            sabrServerUrl: sabr_params.sabrServerUrl,
            sabrUstreamerConfig: sabr_params.sabrUstreamerConfig,
            sabrFormats,
            poToken: sabr_params.poToken,
            clientInfo: sabr_params.clientInfo,
            cookie: sabr_params.cookie,
        },
        output_path,
        (progress) => progress_bar.update(Math.floor(progress * 100))
    );

    progress_bar.update(100);
    progress_bar.stop();
    console.log(green(`Saved to: ${output_path}`));
    void duration_ms;
}

TimeLog.log_fn_async(
    green("FINISHED DOWNLOADING MEDIA"),
    async () => await ytdl_main__().catch(console.error)
).catch(console.error);
