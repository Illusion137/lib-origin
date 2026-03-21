import { spawn } from "child_process";
import type { DataCallback, FFPROBE } from "@native/ffprobe/ffprobe.base";

export const node_ffprobe: FFPROBE = {
    execute_args: async (args: string[], data_callback?: DataCallback) => {
        const ffprobe_spawn = spawn("ffprobe", args);
        const ffprobe_cmd_instance = new Promise<number>((resolve, _) => {
            ffprobe_spawn.stderr?.on('data', (data) => {
                const output: string = data.toString();
                data_callback?.(output);
            })
            ffprobe_spawn.on('close', (code) => resolve(code ?? 1));
            ffprobe_spawn.on('exit', (code) => resolve(code ?? 1));
        });

        // TODO update logs
        return {
            retcode: ffprobe_cmd_instance,
            session_id: ffprobe_spawn.pid ?? -1,
            logs: async () => ""
        };
    }
};