/* eslint-disable @typescript-eslint/consistent-type-imports */
import { vi, describe, it, expect } from "vitest";
import { execSync } from "child_process";

// Check if ffmpeg is available
let HAS_FFMPEG = false;
try {
	execSync("ffmpeg -version 2>/dev/null", { stdio: "pipe" });
	HAS_FFMPEG = true;
} catch {}

// Mock ffmpeg-kit-react-native for mobile impl
vi.mock("ffmpeg-kit-react-native", () => {
	const { spawn } = require("child_process");

	class MockReturnCode {
		constructor(private code: number) {}
		getValue() { return this.code; }
	}

	class MockSession {
		private _args: string[];
		private _retcode = 0;
		private _output = "";
		constructor(args: string[]) { this._args = args; }
		async getReturnCode() { return new MockReturnCode(this._retcode); }
		async getOutput() { return this._output; }
		getSessionId() { return Math.floor(Math.random() * 10000); }
		_run(completeCallback: (s: MockSession) => void, logCallback: (l: any) => void) {
			const proc = spawn("ffmpeg", this._args);
			const logs: string[] = [];
			proc.stderr?.on("data", (d: Buffer) => {
				const msg = d.toString();
				logs.push(msg);
				logCallback({ getMessage: () => msg });
			});
			proc.on("close", (code: number) => {
				this._retcode = code ?? 1;
				this._output = logs.join("");
				completeCallback(this);
			});
		}
	}

	return {
		FFmpegKit: {
			executeWithArgumentsAsync: async (
				args: string[],
				completeCallback: (s: MockSession) => void,
				logCallback: (l: any) => void,
				_statsCallback: (s: any) => void
			) => {
				const session = new MockSession(args);
				session._run(completeCallback, logCallback);
				return session;
			}
		}
	};
});

import { node_ffmpeg } from "../roze/native/ffmpeg/ffmpeg.node";
import { mobile_ffmpeg } from "../roze/native/ffmpeg/ffmpeg.mobile";

describe("native_ffmpeg", () => {
	it("node and mobile both expose execute_args", () => {
		expect(typeof node_ffmpeg.execute_args).toBe("function");
		expect(typeof mobile_ffmpeg.execute_args).toBe("function");
	});

	it("node: execute_args -version returns retcode 0", async () => {
		if (!HAS_FFMPEG) {
			console.log("[Skip] ffmpeg not available");
			return;
		}
		const result = await node_ffmpeg.execute_args(["-version"]);
		expect(result).toHaveProperty("retcode");
		expect(result).toHaveProperty("session_id");
		expect(result).toHaveProperty("logs");
		const code = await result.retcode;
		expect(code).toBe(0);
	}, 15000);

	it("mobile: execute_args -version returns retcode 0", async () => {
		if (!HAS_FFMPEG) {
			console.log("[Skip] ffmpeg not available");
			return;
		}
		const result = await mobile_ffmpeg.execute_args(["-version"]);
		expect(result).toHaveProperty("retcode");
		expect(result).toHaveProperty("session_id");
		const code = await result.retcode;
		expect(code).toBe(0);
	}, 15000);

	it("node and mobile return same retcode for -version", async () => {
		if (!HAS_FFMPEG) {
			console.log("[Skip] ffmpeg not available");
			return;
		}
		const [node_result, mobile_result] = await Promise.all([
			node_ffmpeg.execute_args(["-version"]),
			mobile_ffmpeg.execute_args(["-version"])
		]);
		const [node_code, mobile_code] = await Promise.all([node_result.retcode, mobile_result.retcode]);
		expect(node_code).toEqual(mobile_code);
	}, 15000);
});
