/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { vi, describe, it, expect, beforeAll, afterAll } from "vitest";
import { JSDOM } from "jsdom";
import * as fs from "fs";
import * as path from "path";
import Innertube, { Constants, Platform } from "youtubei.js";
import { buildSabrFormat } from "googlevideo/utils";

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

// Import target modules after mocks
import { mobile_potoken, PoTokenWebView, WEBVIEW_INJECTED_JS, _webview_ref, _pending } from "../roze/native/potoken/potoken.mobile";
import { node_sabr_downloader } from "../roze/native/sabr_downloader/sabr_downloader.node";

describe("PoToken Integration (Headless)", () => {
	let innertube: Innertube;
	let jsdom: JSDOM;
	let webviewOnMessage: (event: any) => void;

	const VIDEO_ID = "wf4kRfGzflo";

	beforeAll(async () => {
		// Shim for youtubei.js decipher
		Platform.shim.eval = async (data: any, env: any) => {
			const properties: string[] = [];
			if (env.n) properties.push(`n: exportedVars.nFunction("${env.n}")`);
			if (env.sig) properties.push(`sig: exportedVars.sigFunction("${env.sig}")`);
			const code = `${data.output}\nreturn { ${properties.join(", ")} }`;
			// eslint-disable-next-line @typescript-eslint/no-implied-eval
			return new Function(code)();
		};

		// Initialize Innertube
		console.log("[Test] Initializing Innertube...");
		innertube = await Innertube.create();
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
		const componentTree: any = PoTokenWebView();
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

		// Set up the _webview_ref mock
		const mockWebView = {
			postMessage: (dataStr: string) => {
				console.log("[RN] Sending message to WebView:", dataStr.substring(0, 100));
				// When mobile_potoken sends a message to WebView:
				// We dispatch it to JSDOM window
				try {
					const event = new jsdom.window.MessageEvent("message", {
						data: dataStr,
						origin: "https://www.youtube.com" // Match expected origin?
					});
					jsdom.window.dispatchEvent(event);
				} catch (e) {
					console.error("[Test] Error dispatching message to JSDOM:", e);
				}
			},
			injectJavaScript: () => {},
			requestFocus: () => {},
			goBack: () => {},
			goForward: () => {},
			reload: () => {},
			stopLoading: () => {}
		};

		const onRef = componentTree.props.children.ref;
		onRef(mockWebView);

		// Inject the BotGuard logic script
		const scriptEl = jsdom.window.document.createElement("script");
		scriptEl.textContent = WEBVIEW_INJECTED_JS;
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
		const videoInfo = await innertube.getInfo(VIDEO_ID);
		const streamingData = videoInfo.streaming_data;

		if (!streamingData) throw new Error("No streaming data found");

		const sabrServerUrl = await innertube.session.player?.decipher(streamingData.server_abr_streaming_url);
		const playerConfig = videoInfo.player_config;
		const sabrUstreamerConfig = playerConfig?.media_common_config.media_ustreamer_request_config?.video_playback_ustreamer_config;

		if (!sabrServerUrl) throw new Error("No SABR server URL found");
		if (!sabrUstreamerConfig) throw new Error("No SABR ustreamer config found");

		// 3. Download using node_sabr_downloader
		const outputDir = path.join(__dirname, "temp_downloads");
		if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

		const outputPath = path.join(outputDir, `test_${VIDEO_ID}.opus`); // SABR usually audio

		// Cleanup previous
		if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

		console.log(`Downloading to ${outputPath}...`);

		const sabrFormats = streamingData.adaptive_formats.map((f: any) => buildSabrFormat(f));

		const ctx = innertube.session.context.client;
		const clientName = parseInt((Constants.CLIENT_NAME_IDS as Record<string, string>)[ctx.clientName] ?? "1");
		const clientInfo = { clientName, clientVersion: ctx.clientVersion };

		await node_sabr_downloader.download_sabr(
			{
				sabrServerUrl,
				sabrUstreamerConfig,
				sabrFormats: sabrFormats as any,
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
