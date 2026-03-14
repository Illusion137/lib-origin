import { spawn } from "child_process";
import { generror, generror_catch } from "@common/utils/error_util";
import type { SayPlatformBase } from "./base";
import { batch_requests, gen_uuid } from "@common/utils/util";

const DEFAULT_EXPORT_SPEED = 170;
const BATCH_SIZE = 2;

export const SayPlatformDarwin: SayPlatformBase = {
	get_voices: async () => {
		const all_data: string[] = [];
		await new Promise<void>((resolve) => {
			try {
				const cmd = spawn("say", ['-v', "?"], { windowsHide: true });
				cmd.stdout.on("data", (d) => {
					const data = d.toString();
					const regex = /^(([A-zÀ-ú]+)(\s\((Premium|Enhanced)\))?)/i;
					for (const line of data.split('\n')) {
						const match = regex.exec(line);
						if (!match) return;
						if (match.length < 2) return;
						all_data.push(match[1]);
					}
				});
				cmd.on('error', () => resolve());
				cmd.on('exit', () => resolve());
			} catch (_) {
				resolve();
			}
		});
		return all_data;
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
	export_batch: async (texts: { text: string; export_path: string }[], voice?: string, speed?: number, on_text_export?: (uuid: string, data: string) => any) => {
		const effective_speed = speed ?? DEFAULT_EXPORT_SPEED;
		return await batch_requests(
			texts.map(job => async () => {
				return new Promise((resolve) => {
					try {
						const args: string[] = ["-o", job.export_path];
						if (!voice) args.push(job.text);
						else args.push("-v", voice, job.text);
						args.push("-r", String(effective_speed));
						const cmd = spawn("say", args, { windowsHide: true });
						cmd.stderr.on("data", (data) => console.error(`[TTS ERROR] ${data}`));
						cmd.on("close", (code) => {
							const stamp = gen_uuid();
							on_text_export?.(stamp, stamp);
							code === 0 ? resolve(code) : resolve(generror("Failed to speak tts", { code }));
						});
					} catch (e) {
						const stamp = gen_uuid();
						on_text_export?.(stamp, stamp);
						resolve(generror_catch(e, "Failed to speak tts", { texts, voice, speed }));
					}
				});
			}),
			BATCH_SIZE
		);
	}
};
