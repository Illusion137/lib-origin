import 'dotenv/config';
import { TimeLog } from "@common/time_log";
import { red, green } from "colors";
import cli_progress from 'cli-progress';
import path from 'path';
import { YouTubeDL } from "@origin/youtube_dl/index";
import { load_native_sabr_downloader, sabr_downloader } from "@native/sabr_downloader/sabr_downloader";
import { gen_uuid, milliseconds_of } from "@common/utils/util";
import { load_native_potoken } from '@native/potoken/potoken';
import express from 'express';
import { wait } from '@common/utils/timed_util';
const app = express();
app.use(express.json());
const port = 3000;

const is_win = process.platform === "win32";
const output_folder = is_win ? "C:/Users/raygo/Music/ytdl/" : "/Users/illusion/ytdl_out/";

interface PoToken {po_token: string, placeholder_po_token: string};

async function download(video_id: string, po_token: PoToken){
    await load_native_potoken();
    await load_native_sabr_downloader();

    YouTubeDL.inject_potoken(video_id, po_token.po_token);
    const sabr_params = await TimeLog.log_fn_async(
        green("RESOLVED SABR URL"),
        async () => await YouTubeDL.resolve_sabr_info(video_id)
    );
    if ("error" in sabr_params) {
        console.error(red("FAILED TO RESOLVE SABR URL"), sabr_params.error);
        return;
    }
    sabr_params.placeholder_po_token = po_token.placeholder_po_token;

    const title = video_id.replace(/[^a-zA-Z0-9]/g, '_');
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
    console.log(green(`FEXP: ${new URL(sabr_params.sabrServerUrl).searchParams.get("fexp")}`));
    console.log(green(`Ustreamer config length: ${sabr_params.sabrUstreamerConfig.length}`));
    console.log(green(`ClientInfo: clientName=${sabr_params.clientInfo?.clientName} version=${sabr_params.clientInfo?.clientVersion}`));
    console.log(green(`Cookie present: ${!!sabr_params.cookie}`))

    const progress_bar = new cli_progress.SingleBar({}, cli_progress.Presets.shades_classic);
    progress_bar.start(100, 0);

    await sabr_downloader().download_sabr(
        {
            content_binding: video_id,
            sabrServerUrl: sabr_params.sabrServerUrl,
            sabrUstreamerConfig: sabr_params.sabrUstreamerConfig,
            sabrFormats,
            clientInfo: sabr_params.clientInfo,
            cookie: sabr_params.cookie,
            placeholder_po_token: sabr_params.placeholder_po_token
        },
        output_path,
        (progress) => progress_bar.update(Math.floor(progress * 100))
    );

    progress_bar.update(100);
    progress_bar.stop();
    console.log(green(`Saved to: ${output_path}`));
    return 0;
}

app.get('/validate_potoken/:id', async (req, res) => {
    const video_id = req.params.id;
    const po_token = req.body as PoToken;
    console.log(req.body);
    console.log(video_id);
    if(req.body === undefined || !("po_token" in req.body)){
        res.status(400).send("BAD");
        return;
    }

    const race = await Promise.race([
        download(video_id, po_token),
        wait(milliseconds_of({seconds: 20}))
    ])
    if(race === 0) {
        res.status(200).send("GOOD");
        return;
    }
    res.status(401).send("FAILED");
});

app.listen(port, () => {
    console.log(`PoTokenServerValidator app listening on port ${port}`);
});