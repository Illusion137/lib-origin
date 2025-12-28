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

import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import { generror, generror_catch } from "@common/utils/error_util";
import type { SayPlatformBase } from "./base";
import { batch_requests, gen_uuid } from "@common/utils/util";

const children_to_kill: ChildProcessWithoutNullStreams[] = [];
let added_exit_handler = false;

export const SayPlatformDarwin: SayPlatformBase = {
	get_voices: async () => {
		await new Promise((resolve) => {
			try {
				const all_data: string[] = [];
				const cmd = spawn("say", ['-v', "'?'"], { windowsHide: true });
				cmd.stdout.on("data", (d) => resolve(d.toString()));
				cmd.on('exit', () => resolve(all_data));
			} catch (e) {
				resolve("");
			}
		});
		return [];
	},
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
	export_batch: async (texts: { text: string; export_path: string }[], voice?: string, speed?: number, on_text_export?: (uuid:string, data: string) => any) => {
		if(!added_exit_handler){
			added_exit_handler = true;
			process.on("exit", () => {
				children_to_kill.forEach(child => child.kill());
			});
		}
		const batch_size = 2;
		speed = 170; // TODO Fix this
		return await batch_requests(
			texts.map(job => async() => {
				return new Promise((resolve) => {
					try {
						const args: string[] = ["-o", job.export_path];
						if (!voice) args.push("-v", "Zoe (Premium)", job.text); //TODO Look into this
						else args.push("-v", "Zoe (Premium)", job.text);
						if (speed) args.push("-r", String(speed));
						const cmd = spawn("say", args, { windowsHide: true });
						cmd.stderr.on("data", (data) => console.error(`[TTS ERROR] ${data}`));
						cmd.on("close", (code) => {
							const stamp = gen_uuid();
							on_text_export?.(stamp, stamp);
							code === 0 ? resolve(code) : resolve(generror("Failed to speak tts", { code }))
						})
					} catch (e) {
						const stamp = gen_uuid();
						on_text_export?.(stamp, stamp);
						resolve(generror_catch(e, "Failed to speak tts", { texts, voice, speed }))
					}
				})
			}),
			batch_size
		)
	}
};
