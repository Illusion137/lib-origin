 
 
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { vi, describe, it, expect } from "vitest";

// Mock react-native-tts-export for mobile impl
vi.mock("react-native-tts-export", () => {
	const voices = [
		{ id: "com.apple.voice.compact.en-US.Samantha", name: "Samantha", language: "en-US", quality: 300, latency: 100, networkConnectionRequired: false, notInstalled: false },
		{ id: "com.apple.voice.enhanced.en-US.Evan", name: "Evan", language: "en-US", quality: 500, latency: 200, networkConnectionRequired: false, notInstalled: false }
	];
	return {
		default: {
			setDefaultRate: async () => { },
			setIgnoreSilentSwitch: async () => { },
			voices: async () => voices,
			speak: (_text: string, _opts: any) => "utterance-id-mock",
			export: async (_text: string, opts: any) => opts.filename
		}
	};
});

// Mock @lib/say/say for node voice synth
vi.mock("../roze/lib/say/say", () => ({
	default: {
		get_voices: async () => ["Samantha", "Alex"],
		speak: async () => 0,
		export_batch: async () => []
	}
}));

import { node_voice_synth } from "../roze/native/voice_synth/voice_synth.node";
import { mobile_voice_synth } from "../roze/native/voice_synth/voice_synth.mobile";

describe("native_voice_synth", () => {
	describe("get_voices", () => {
		it("node: get_voices returns an array", async () => {
			const voices = await node_voice_synth.get_voices();
			expect(Array.isArray(voices)).toBe(true);
		});

		it("node: each voice has id, name, language, quality, installed fields", async () => {
			const voices = await node_voice_synth.get_voices();
			if (voices.length > 0) {
				const v = voices[0];
				expect(v).toHaveProperty("id");
				expect(v).toHaveProperty("name");
				expect(v).toHaveProperty("language");
				expect(v).toHaveProperty("quality");
				expect(v).toHaveProperty("installed");
			}
		});

		it("mobile: get_voices returns an array", async () => {
			const voices = await mobile_voice_synth.get_voices();
			expect(Array.isArray(voices)).toBe(true);
			expect(voices.length).toBeGreaterThan(0);
		});

		it("mobile: each voice has required fields", async () => {
			const voices = await mobile_voice_synth.get_voices();
			const v = voices[0];
			expect(v).toHaveProperty("id");
			expect(v).toHaveProperty("name");
			expect(v).toHaveProperty("language");
			expect(v).toHaveProperty("installed");
		});
	});

	describe("speak", () => {
		it("node: speak resolves without throwing", async () => {
			await expect(node_voice_synth.speak("hello", {})).resolves.not.toThrow();
		});

		it("mobile: speak returns a value without throwing", async () => {
			await expect(mobile_voice_synth.speak("hello", {})).resolves.not.toThrow();
		});
	});

	describe("speak_export", () => {
		it("node: speak_export resolves", async () => {
			await expect(node_voice_synth.speak_export([{ text: "hi", export_path: "/tmp/test.aiff" }], {})).resolves.not.toThrow();
		});

		it("mobile: speak_export calls export for each text", async () => {
			const texts = [{ text: "hello", export_path: "/tmp/test_mobile.aiff" }];
			const result = await mobile_voice_synth.speak_export(texts, {});
			expect(result).toEqual(["/tmp/test_mobile.aiff"]);
		});
	});

	describe("interface parity", () => {
		it("node and mobile expose same methods", () => {
			const methods = ["get_voices", "speak", "speak_export"];
			for (const m of methods) {
				expect(typeof (node_voice_synth as any)[m]).toBe("function");
				expect(typeof (mobile_voice_synth as any)[m]).toBe("function");
			}
		});
	});
});
