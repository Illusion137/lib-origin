// import SayPlatformBase from "./base";

// const BASE_SPEED = 175;
// const COMMAND = "say";

// export default class SayPlatformDarwin extends SayPlatformBase {
// 	constructor() {
// 		super();
// 		this.base_speed = BASE_SPEED;
// 	}

// 	buildSpeakCommand({ text, voice, speed }) {
// 		const args = [];
// 		const pipedData = "";
// 		const options = {};

// 		if (!voice) {
// 			args.push(text);
// 		} else {
// 			args.push("-v", voice, text);
// 		}

// 		if (speed) {
// 			args.push("-r", this.convertSpeed(speed));
// 		}

// 		return { command: COMMAND, args, pipedData, options };
// 	}

// 	buildExportCommand({ text, voice, speed, filename }) {
// 		const args = [];
// 		const pipedData = "";
// 		const options = {};

// 		if (!voice) {
// 			args.push(text);
// 		} else {
// 			args.push("-v", voice, text);
// 		}

// 		if (speed) {
// 			args.push("-r", this.convertSpeed(speed));
// 		}

// 		if (filename) {
// 			args.push("-o", filename, "--data-format=LEF32@32000");
// 		}

// 		return { command: COMMAND, args, pipedData, options };
// 	}

// 	runStopCommand() {
// 		this.child.stdin.pause();
// 		this.child.kill();
// 	}

// 	getVoices() {
// 		throw new Error(`say.export(): does not support platform ${this.platform}`);
// 	}
// }

import { spawn } from "child_process";
import { generror, generror_catch } from "@common/utils/error_util";
import type { SayPlatformBase } from "./base";
import type { PromiseResult } from "@common/types";

export const SayPlatformDarwin: SayPlatformBase = {
	get_voices: async () => [],
	speak: async (text: string, voice?: string, speed?: number) => {
		return new Promise((resolve) => {
			try {
				const args: string[] = [];
				if (!voice) args.push(text);
				else args.push("-v", voice, text);
				if (speed) args.push("-r", String(speed));
				const cmd = spawn("say", args, { windowsHide: true });
				cmd.stdin.end(text);
				cmd.stdout.on("data", (data) => console.log(`[TTS] ${data}`));
				cmd.stderr.on("data", (data) => console.error(`[TTS ERROR] ${data}`));
				cmd.on("close", (code) => (code === 0 ? resolve(code) : generror("Failed to speak tts", { code })));
			} catch (e) {
				resolve(generror_catch(e, "Failed to speak tts", { text, voice, speed }));
			}
		});
	},
	export_batch: async (texts: { text: string; export_path: string }[], voice?: string, speed?: number) => {
		return await Promise.all(
			texts.map<PromiseResult<number>>(async(job) =>
                new Promise((resolve) => {
                    try {
                        const args: string[] = ["-o", job.export_path];
                        if (!voice) args.push(job.text);
                        else args.push("-v", voice, job.text);
                        if (speed) args.push("-r", String(speed));
                        const cmd = spawn("say", args, { windowsHide: true });
                        cmd.stdout.on("data", (data) => console.log(`[TTS] ${data}`));
                        cmd.stderr.on("data", (data) => console.error(`[TTS ERROR] ${data}`));
                        cmd.on("close", (code) => (code === 0 ? resolve(code) : generror("Failed to speak tts", { code })));
                    } catch (e) {
                        resolve(generror_catch(e, "Failed to speak tts", { texts, voice, speed }));
                    }
                })
			)
		);
	}
};
