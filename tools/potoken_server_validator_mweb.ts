import 'dotenv/config';
import { TimeLog } from "@common/time_log";
import { red, green } from "colors";
import cli_progress from 'cli-progress';
import path from 'path';
import { YouTubeDL } from "@origin/youtube_dl/index";
import { ffmpeg, load_native_ffmpeg } from "@native/ffmpeg/ffmpeg";
import { gen_uuid, milliseconds_of } from "@common/utils/util";
import { load_native_potoken } from '@native/potoken/potoken';
import express from 'express';
import { wait } from '@common/utils/timed_util';
import { ClientType } from 'youtubei.js';
const app = express();
app.use(express.json());
const port = 3000;

const is_win = process.platform === "win32";
const output_folder = is_win ? "C:/Users/raygo/Music/ytdl/" : "/Users/illusion/ytdl_out/";

interface PoToken {po_token: string, placeholder_po_token: string};

async function download(video_id: string, po_token: PoToken){
    await load_native_potoken();
    await load_native_ffmpeg();

    const client = await YouTubeDL.get_innertube_client(ClientType.MWEB);

    const gvs_po_token = po_token.po_token;

    const mweb_params = await TimeLog.log_fn_async(
        green("RESOLVED STREAMING DATA"),
        async () => await YouTubeDL.get_streaming_data(video_id)
    );

    const adaptive_formats = mweb_params.streaming_data?.adaptive_formats ?? [];
    console.log(green(`Adaptive formats count: ${adaptive_formats.length}`));
    const audio_format = adaptive_formats.find(f => f.itag === 140);
    if (audio_format === undefined) {
        console.error(red(`itag 140 not found. itags: ${adaptive_formats.map(f => f.itag).join(', ')}`));
        return;
    }
    console.log(green(`Found itag=${audio_format.itag} mimeType=${audio_format.mime_type} bitrate=${audio_format.bitrate}`));

    let media_url = await audio_format.decipher(client.session.player);
    media_url += `${media_url.includes('?') ? '&' : '?'}pot=${encodeURIComponent(gvs_po_token)}`;
    console.log(green(`Media URL: ${media_url.substring(0, 80)}...`));
    console.log(green(`User-Agent used: ${client.session.user_agent}`));

    const user_agent = client.session.user_agent ?? '';
    const cookie = client.session.cookie;
    let header_str = 'Origin: https://www.youtube.com\r\nReferer: https://www.youtube.com/\r\n';
    if (cookie) header_str += `Cookie: ${cookie}\r\n`;
    console.log(green(`User-Agent: ${user_agent}`));
    console.log(green(`Cookie present: ${!!cookie}`));

    const title = video_id.replace(/[^a-zA-Z0-9]/g, '_');
    const output_path = path.join(output_folder, `${gen_uuid()}_${title}.m4a`);

    const progress_bar = new cli_progress.SingleBar({}, cli_progress.Presets.shades_classic);
    progress_bar.start(100, 0);

    const ffmpeg_result = await ffmpeg().execute_args([
        '-y',
        '-user_agent', user_agent,
        '-headers', header_str,
        '-i', media_url,
        '-vn',
        '-c:a', 'aac',
        '-b:a', '128k',
        output_path,
    ], (statistics) => {
        if (mweb_params.streaming_data?.adaptive_formats && audio_format.approx_duration_ms) {
            progress_bar.update(Math.floor((statistics.time_seconds / (audio_format.approx_duration_ms / 1000)) * 100));
        }
    });

    const retcode = await ffmpeg_result.retcode;
    progress_bar.update(100);
    progress_bar.stop();
    if (retcode !== 0) {
        console.error(red(`FFMPEG failed (retcode ${retcode}):\n${await ffmpeg_result.logs()}`));
        return;
    }
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