import * as Origin from "@origin/";
import { spawn } from 'child_process';

const output_folder = "/Users/illusion/ytdl_out/";
const url = process.argv[2];

Origin.YouTubeDL.ytdl(url, {quality: '18', playerClients: ["WEB", "IOS", "ANDROID", "TV"]}).then(av_result => {
    const args = [
        '-y',
        '-i',
        av_result.av.url,
        `${output_folder}${av_result.info.videoDetails.title}.mp3`.replace(/\s/g, '_')
    ]
    const ffproc = spawn('ffmpeg', args);
    ffproc.stdout.on('data', function(data) {
        console.log(data);
    });
    
    ffproc.stderr.setEncoding("utf8")
    ffproc.stderr.on('data', function(data) {
        console.log(data);
    });
    
    ffproc.on('close', function() {
        console.log('finished');
    });
    
}).catch((e: unknown) => { console.error(e); });