/* eslint-disable @typescript-eslint/consistent-type-imports */
import { vi, describe, it, expect, beforeAll, afterAll } from "vitest";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";

// Mock expo-audio for mobile impl
vi.mock("expo-audio", () => {
	return {
		createAudioPlayer: (source: { uri: string }) => {
			// Approximate duration via ffprobe if available, else 1.0
			let dur = 1.0;
			try {
				const out = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${source.uri}" 2>/dev/null`).toString().trim();
				dur = parseFloat(out) || 1.0;
			} catch {}
			const listeners: Array<(s: any) => void> = [];
			const player = {
				isLoaded: false,
				duration: dur,
				release: () => {},
				addListener: (_event: string, cb: (s: any) => void) => {
					// Simulate async load
					setTimeout(() => {
						player.isLoaded = true;
						cb({ duration: dur });
					}, 10);
					const handle = { remove: () => {} };
					listeners.push(cb);
					return handle;
				}
			};
			return player;
		}
	};
});

import { node_get_audio_duration } from "../roze/native/get_audio_duration/get_audio_duration.node";
import { mobile_get_audio_duration } from "../roze/native/get_audio_duration/get_audio_duration.mobile";

const TEST_DIR = path.join(os.tmpdir(), "native_audio_test_" + Date.now());
let TEST_AUDIO_PATH: string;
let HAS_FFMPEG = false;
let HAS_TEST_AUDIO = false;

beforeAll(() => {
	fs.mkdirSync(TEST_DIR, { recursive: true });
	TEST_AUDIO_PATH = path.join(TEST_DIR, "test.wav");

	// Try to generate a short audio file with ffmpeg
	try {
		execSync(`ffmpeg -y -f lavfi -i "sine=frequency=440:duration=1" "${TEST_AUDIO_PATH}" 2>/dev/null`);
		HAS_FFMPEG = true;
		HAS_TEST_AUDIO = fs.existsSync(TEST_AUDIO_PATH) && fs.statSync(TEST_AUDIO_PATH).size > 0;
	} catch {
		HAS_FFMPEG = false;
	}
});

afterAll(() => {
	fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("native_get_audio_duration", () => {
	it("node: get_audio_duration returns 0 for non-existent file", async () => {
		const result = await node_get_audio_duration.get_audio_duration(path.join(TEST_DIR, "nonexistent.wav"));
		expect(typeof result).toBe("number");
		expect(result).toBe(0);
	});

	it("node: get_audio_duration returns a number > 0 for a valid audio file", async () => {
		if (!HAS_TEST_AUDIO) {
			console.log("[Skip] No ffmpeg available to generate test audio");
			return;
		}
		const result = await node_get_audio_duration.get_audio_duration(TEST_AUDIO_PATH);
		expect(typeof result).toBe("number");
		expect(result).toBeGreaterThan(0);
	}, 10000);

	it("mobile: get_audio_duration returns a number", async () => {
		if (!HAS_TEST_AUDIO) {
			console.log("[Skip] No ffmpeg available to generate test audio");
			return;
		}
		const result = await mobile_get_audio_duration.get_audio_duration(TEST_AUDIO_PATH);
		expect(typeof result).toBe("number");
	}, 10000);

	it("node and mobile interface: both expose get_audio_duration method", () => {
		expect(typeof node_get_audio_duration.get_audio_duration).toBe("function");
		expect(typeof mobile_get_audio_duration.get_audio_duration).toBe("function");
	});
});
