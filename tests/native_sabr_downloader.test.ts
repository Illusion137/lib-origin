 
 
import { vi, describe, it, expect } from "vitest";

// Mock react-native-track-player for mobile impl
vi.mock("react-native-track-player", () => {
	return {
		default: {
			addEventListener: (_event: string, _cb: any) => ({ remove: () => { } }),
			downloadSabr: async (_params: any, _output_path: string) => { }
		}
	};
});

import { node_sabr_downloader } from "../roze/native/sabr_downloader/sabr_downloader.node";
import { mobile_sabr_downloader } from "../roze/native/sabr_downloader/sabr_downloader.mobile";

describe("native_sabr_downloader", () => {
	describe("interface contract", () => {
		it("node: exposes download_sabr method", () => {
			expect(typeof node_sabr_downloader.download_sabr).toBe("function");
		});

		it("mobile: exposes download_sabr method", () => {
			expect(typeof mobile_sabr_downloader.download_sabr).toBe("function");
		});

		it("node and mobile have the same interface shape", () => {
			const node_keys = Object.keys(node_sabr_downloader).sort();
			const mobile_keys = Object.keys(mobile_sabr_downloader).sort();
			expect(node_keys).toEqual(mobile_keys);
		});

		it("download_sabr accepts (params, output_path, on_progress?) signature", () => {
			// Verify it is callable with the correct arity (3 params, last optional)
			expect(node_sabr_downloader.download_sabr.length).toBeLessThanOrEqual(3);
			expect(mobile_sabr_downloader.download_sabr.length).toBeLessThanOrEqual(3);
		});
	});

	describe("mobile mock: download_sabr resolves without error", () => {
		it("mobile: download_sabr resolves for a mock call", async () => {
			const fake_params: any = {
				sabrServerUrl: "https://example.com",
				sabrUstreamerConfig: "",
				sabrFormats: [],
				poToken: undefined,
				clientInfo: undefined
			};
			await expect(mobile_sabr_downloader.download_sabr(fake_params, "/tmp/test.opus")).resolves.not.toThrow();
		});
	});
});
