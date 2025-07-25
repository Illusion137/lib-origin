import type { FFMPEG } from "@native/ffmpeg/ffmpeg.base";
import { spawn } from "child_process";

export const node_ffmpeg: FFMPEG = {
    execute_args: async(args: string[]) => {
        const promise = new Promise((resolve, _) => {
            const merge_audio = spawn("ffmpeg", args, {'stdio': ['inherit', 'inherit', 'inherit']});
            merge_audio.on('close', (code) => {
                code;
                resolve(0);
            });
            merge_audio.on('exit', (code) => {
                code;
                resolve(0);
            }); 
            merge_audio.on('disconnect', () => resolve(0)); 
            merge_audio.on('spawn', () => {return});
            merge_audio.on('message', () => {return});
            merge_audio.on('exit', () => resolve(0));
        });
        await promise;
    }
};