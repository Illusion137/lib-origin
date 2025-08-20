import type { PromiseResult, ResponseError } from "@common/types";

export type OnTextExport = (uuid: string, data: string) => any;
export interface SayPlatformBase {
    get_voices: () => PromiseResult<string[]>;
    speak: (text: string, voice?: string, speed?: number) => PromiseResult<number>;
    // export: (text: string, voice?: string, speed?: number, file_path?: string) => PromiseResult<number>
    export_batch: (texts: {text: string, export_path: string}[], voice?: string, speed?: number, on_text_export?: OnTextExport) => PromiseResult<number>|Promise<(number|ResponseError)[]>
}

// export default class SayPlatformBase {
//     child: null|ReturnType<typeof spawn>;
//     base_speed: number;
// 	constructor() {
// 		this.child = null;
// 		this.base_speed = 0;
// 	}

// 	/**
// 	 * Uses system libraries to speak text via the speakers.
// 	 *
// 	 * @param {string} text Text to be spoken
// 	 * @param {string|null} voice Name of voice to be spoken with
// 	 * @param {number|null} speed Speed of text (e.g. 1.0 for normal, 0.5 half, 2.0 double)
// 	 * @param {Function|null} callback A callback of type function(err) to return.
// 	 */
// 	speak(text: string, voice?: string, speed?: number, callback?: errorCallback) {
// 		if (typeof callback !== "function") {
// 			callback = () => { return };
// 		}

// 		callback = once(callback);

// 		let { command, args, pipedData, options } = this.buildSpeakCommand({ text, voice, speed });

// 		this.child = spawn(command, args, options);

// 		this.child.stdin?.setDefaultEncoding("ascii");
// 		this.child.stderr?.setEncoding("ascii");

// 		if (pipedData) {
// 			this.child.stdin.end(pipedData);
// 		}

// 		this.child.stderr.once("data", (data) => {
// 			// we can't stop execution from this function
// 			callback(new Error(data));
// 		});

// 		this.child.addListener("exit", (code, signal) => {
// 			if (code === null || signal !== null) {
// 				return callback(new Error(`say.speak(): could not talk, had an error [code: ${code}] [signal: ${signal}]`));
// 			}

// 			this.child = null;

// 			callback(null);
// 		});
// 	}

// 	/**
// 	 * Uses system libraries to speak text via the speakers.
// 	 *
// 	 * @param {string} text Text to be spoken
// 	 * @param {string|null} voice Name of voice to be spoken with
// 	 * @param {number|null} speed Speed of text (e.g. 1.0 for normal, 0.5 half, 2.0 double)
// 	 * @param {string} filename Path to file to write audio to, e.g. "greeting.wav"
// 	 * @param {Function|null} callback A callback of type function(err) to return.
// 	 */
// 	export(text: string, voice?: string, speed?: number, filePath?: string, callback?: errorCallback) {
// 		if (typeof callback !== "function") {
// 			callback = () => {};
// 		}

// 		callback = once(callback);

// 		if (!text) {
// 			return setImmediate(() => {
// 				callback(new TypeError("say.export(): must provide text parameter"));
// 			});
// 		}

// 		if (!filename) {
// 			return setImmediate(() => {
// 				callback(new TypeError("say.export(): must provide filename parameter"));
// 			});
// 		}

// 		try {
// 			var { command, args, pipedData, options } = this.buildExportCommand({ text, voice, speed, filename });
// 		} catch (error) {
// 			return setImmediate(() => {
// 				callback(error);
// 			});
// 		}

// 		this.child = spawn(command, args, options);

// 		this.child.stdin.setEncoding("ascii");
// 		this.child.stderr.setEncoding("ascii");

// 		if (pipedData) {
// 			this.child.stdin.end(pipedData);
// 		}

// 		this.child.stderr.once("data", (data) => {
// 			// we can't stop execution from this function
// 			callback(new Error(data));
// 		});

// 		this.child.addListener("exit", (code, signal) => {
// 			if (code === null || signal !== null) {
// 				return callback(new Error(`say.export(): could not talk, had an error [code: ${code}] [signal: ${signal}]`));
// 			}

// 			this.child = null;

// 			callback(null);
// 		});
// 	}

// 	/**
// 	 * Stops currently playing audio. There will be unexpected results if multiple audios are being played at once
// 	 *
// 	 * TODO: If two messages are being spoken simultaneously, childD points to new instance, no way to kill previous
// 	 *
// 	 * @param {Function|null} callback A callback of type function(err) to return.
// 	 */
// 	stop(callback) {
// 		if (typeof callback !== "function") {
// 			callback = () => {};
// 		}

// 		callback = once(callback);

// 		if (!this.child) {
// 			return setImmediate(() => {
// 				callback(new Error("say.stop(): no speech to kill"));
// 			});
// 		}

// 		this.runStopCommand();

// 		this.child = null;

// 		callback(null);
// 	}

// 	convertSpeed(speed) {
// 		return Math.ceil(this.base_speed * speed);
// 	}

// 	/**
// 	 * Get Installed voices on system
// 	 * @param {Function} callback A callback of type function(err,voices) to return.
// 	 */
// 	getInstalledVoices(callback: errorCallback) {
// 		if (typeof callback !== "function") {
// 			callback = () => {};
// 		}
// 		callback = once(callback);

// 		let { command, args } = this.get_voices();
// 		var voices = [];
// 		this.child = spawn(command, args);

// 		this.child.stdin.setEncoding("ascii");
// 		this.child.stderr.setEncoding("ascii");

// 		this.child.stderr.once("data", (data) => {
// 			// we can't stop execution from this function
// 			callback(new Error(data));
// 		});
// 		this.child.stdout.on("data", function (data) {
// 			voices += data;
// 		});

// 		this.child.addListener("exit", (code, signal) => {
// 			if (code === null || signal !== null) {
// 				return callback(new Error(`say.getInstalledVoices(): could not get installed voices, had an error [code: ${code}] [signal: ${signal}]`));
// 			}
// 			if (voices.length > 0) {
// 				voices = voices.split("\r\n");
// 				voices = voices[voices.length - 1] === "" ? voices.slice(0, voices.length - 1) : voices;
// 			}
// 			this.child = null;

// 			callback(null, voices);
// 		});

// 		this.child.stdin.end();
// 	}
// }