/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { vi, describe, it, expect, beforeAll, afterAll } from "vitest";
import { JSDOM } from "jsdom";
import * as fs from "fs";
import * as path from "path";
import Innertube, { Constants } from "youtubei.js";

// Mocks for React Native and WebView
vi.mock("react-native", () => ({
	Platform: { OS: "android" },
	StyleSheet: { create: (obj: any) => obj },
	View: (props: any) => props.children || null
}));

vi.mock("react", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react")>();
	return {
		...actual,
		useRef: (val: any) => ({ current: val }),
		useCallback: (fn: any) => fn
	};
});

vi.mock("react-native-webview", () => ({
	WebView: () => null // Dummy component
}));

vi.mock("@native/native_mode", () => ({
	get_native_platform: () => "REACT_NATIVE"
}));

import { mobile_potoken, PoTokenWebView, POTOKEN_INJECTED_JS } from "@native/potoken/potoken.mobile";
import { BGUTILS_BUNDLE_JS } from "@native/potoken/bgutils_bundle";
import { node_sabr_downloader } from "@native/sabr_downloader/sabr_downloader.node";
import { load_native_jseval } from "@native/jseval/jseval";
import { YouTubeDL } from "@origin/youtube_dl";
import { load_native_fs } from "@native/fs/fs";

describe("PoToken Integration (Headless)", () => {
	let innertube: Innertube;
	let jsdom: JSDOM;
	let webviewOnMessage: (event: any) => void;

	const VIDEO_ID = "wf4kRfGzflo";

	beforeAll(async () => {
		await load_native_jseval();
		await load_native_fs();

		// Initialize Innertube
		console.log("[Test] Initializing Innertube...");
		innertube = await YouTubeDL.get_innertube_client();
		console.log("[Test] Innertube initialized.");

		// Check connectivity
		console.log("[Test] Checking Innertube connectivity...");
		try {
			await innertube.getInfo(VIDEO_ID);
			console.log("[Test] Innertube connectivity OK.");
		} catch (e) {
			console.error("[Test] Innertube connectivity failed:", e);
			// Don't fail here, let the test fail if needed, but this gives info.
		}

		// Initialize JSDOM to simulate WebView
		jsdom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
			url: "https://www.youtube.com/",
			runScripts: "dangerously",
			resources: "usable",
			pretendToBeVisual: true
		});

		// Hook up console
		(jsdom.window as any).console = console;

		// Polyfills for JSDOM
		const globalAny = global as any;
		jsdom.window.fetch = globalAny.fetch; // Use Node's fetch
		jsdom.window.TextEncoder = TextEncoder;
		jsdom.window.btoa = btoa;
		jsdom.window.atob = atob;

		// Extract onMessage handler from PoTokenWebView
		const componentTree: any = PoTokenWebView({});
		const webviewProps = componentTree.props.children.props;
		webviewOnMessage = webviewProps.onMessage;

		if (!webviewOnMessage) {
			throw new Error("Could not extract onMessage handler from PoTokenWebView");
		} else {
			console.log("[Test] Successfully extracted onMessage handler");
		}

		// Shim window.ReactNativeWebView.postMessage
		(jsdom.window as any).ReactNativeWebView = {
			postMessage: (message: string) => {
				console.log("[JSDOM] Sending message back to RN:", message.substring(0, 100));
				// When JSDOM sends a message back, we forward it to the extracted onMessage handler
				if (webviewOnMessage) {
					webviewOnMessage({ nativeEvent: { data: message } });
				} else {
					console.error("[Test] webviewOnMessage is not set!");
				}
			}
		};

		// Inject bgutils bundle into JSDOM (mirrors what the WebView HTML source does)
		const bundleEl = jsdom.window.document.createElement("script");
		bundleEl.textContent = BGUTILS_BUNDLE_JS;
		jsdom.window.document.body.appendChild(bundleEl);

		// Set up the _potoken_webview_ref mock
		// injectJavaScript executes the pipeline script directly in JSDOM (mirrors native evaluateJavaScript)
		const mockWebView = {
			postMessage: (_dataStr: string) => {},
			injectJavaScript: (script: string) => {
				console.log("[RN] injectJavaScript called, script length:", script.length);
				try {
					const scriptEl = jsdom.window.document.createElement("script");
					scriptEl.textContent = script;
					jsdom.window.document.body.appendChild(scriptEl);
				} catch (e) {
					console.error("[Test] injectJavaScript error:", e);
				}
			},
			requestFocus: () => {},
			goBack: () => {},
			goForward: () => {},
			reload: () => {},
			stopLoading: () => {}
		};

		const onRef = componentTree.props.children.ref;
		onRef(mockWebView);

		// Inject POTOKEN_INJECTED_JS to trigger POTOKEN_READY (signals WebView is ready)
		const scriptEl = jsdom.window.document.createElement("script");
		scriptEl.textContent = POTOKEN_INJECTED_JS;
		jsdom.window.document.body.appendChild(scriptEl);
	}, 120000);

	afterAll(() => {
		// Cleanup
	});

	it("should generate a valid PoToken and download a file", async () => {
		// 1. Generate PoToken using mobile_potoken (simulated WebView)
		console.log("Generating PoToken...");
		const result: any = await mobile_potoken.generate_potoken(innertube, VIDEO_ID);

		console.log("PoToken Result:", result);

		if (result.error) {
			console.error("PoToken generation failed:", result.error);
			// If BotGuard fails in JSDOM (likely due to env checks), we might need to mock the success.
			// But let's see if it works or fails first.
			throw result.error;
		}

		expect(result.po_token).toBeDefined();
		expect(result.visitor_data).toBeDefined();

		// 2. Prepare for Download
		console.log("Fetching video info for download...");
		const sabr_params = await YouTubeDL.resolve_sabr_url(VIDEO_ID);
		if ("error" in sabr_params) throw sabr_params.error;
		// const videoInfo = await innertube.getInfo(VIDEO_ID);
		// const streamingData = videoInfo.streaming_data;

		// if (!streamingData) throw new Error("No streaming data found");

		// const sabrServerUrl = await innertube.session.player?.decipher(streamingData.server_abr_streaming_url);
		// const playerConfig = videoInfo.player_config;
		// const sabrUstreamerConfig = playerConfig?.media_common_config.media_ustreamer_request_config?.video_playback_ustreamer_config;

		// if (!sabrServerUrl) throw new Error("No SABR server URL found");
		// if (!sabrUstreamerConfig) throw new Error("No SABR ustreamer config found");

		// 3. Download using node_sabr_downloader
		const outputDir = path.join(__dirname, "temp_downloads");
		if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

		const outputPath = path.join(outputDir, `test_${VIDEO_ID}.opus`); // SABR usually audio

		// Cleanup previous
		if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

		console.log(`Downloading to ${outputPath}...`);

		const sabrFormats = sabr_params.sabrFormats;

		const ctx = innertube.session.context.client;
		const clientName = parseInt((Constants.CLIENT_NAME_IDS as Record<string, string>)[ctx.clientName] ?? "1");
		const clientInfo = { clientName, clientVersion: ctx.clientVersion };

		console.log(sabrFormats);

		await node_sabr_downloader.download_sabr(
			{
				sabrServerUrl: sabr_params.sabrServerUrl,
				sabrUstreamerConfig: sabr_params.sabrUstreamerConfig,
				sabrFormats: sabrFormats,
				poToken: result.po_token,
				placeholder_po_token: result.placeholder_po_token,
				clientInfo
			} as any,
			outputPath,
			(progress) => {
				console.log(`Progress: ${(progress * 100).toFixed(2)}%`);
			}
		);

		// 4. Verify
		expect(fs.existsSync(outputPath)).toBe(true);
		const stats = fs.statSync(outputPath);
		console.log(`Downloaded file size: ${stats.size} bytes`);
		expect(stats.size).toBeGreaterThan(1024); // Expect > 1KB

		// Cleanup
		fs.unlinkSync(outputPath);
		fs.rmSync(outputDir, { recursive: true });
	}, 120000); // 120s timeout
});
