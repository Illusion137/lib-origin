/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { vi, describe, it, expect, beforeAll, afterAll } from "vitest";
import { JSDOM } from "jsdom";
import * as fs from "fs";
import * as path from "path";
import * as child_process from "child_process";
import * as os from "os";
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
	WebView: () => null
}));

vi.mock("@native/native_mode", () => ({
	get_native_platform: () => "REACT_NATIVE"
}));

import { mobile_potoken } from "@native/potoken/potoken.mobile";
import { JSEvaluatorWebView, WEBVIEW_INJECTED_JS } from "@native/jseval/jseval.mobile";
import { load_native_jseval } from "@native/jseval/jseval";
import { YouTubeDL } from "@origin/youtube_dl";
import { load_native_fs } from "@native/fs/fs";

const SWIFT_AUDIO_EX_DIR = path.resolve("/Users/illusion/dev/RNTPvE/SwiftAudioEx");

describe("PoToken + Swift SABR Downloader Integration", () => {
	let innertube: Innertube;
	let jsdom: JSDOM;
	let webviewOnMessage: (event: any) => void;

	const VIDEO_ID = "wf4kRfGzflo";

	beforeAll(async () => {
		await load_native_jseval();
		await load_native_fs();

		console.log("[Test] Initializing Innertube...");
		innertube = await YouTubeDL.get_innertube_client();
		console.log("[Test] Innertube initialized.");

		// Initialize JSDOM to simulate WebView
		jsdom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
			url: "https://www.youtube.com/",
			runScripts: "dangerously",
			resources: "usable",
			pretendToBeVisual: true
		});

		(jsdom.window as any).console = console;

		const globalAny = global as any;
		jsdom.window.fetch = globalAny.fetch;
		jsdom.window.TextEncoder = TextEncoder;
		jsdom.window.btoa = btoa;
		jsdom.window.atob = atob;

		// Extract onMessage handler from JSEvaluatorWebView
		const componentTree: any = JSEvaluatorWebView({});
		const webviewProps = componentTree.props.children.props;
		webviewOnMessage = webviewProps.onMessage;

		if (!webviewOnMessage) {
			throw new Error("Could not extract onMessage handler from JSEvaluatorWebView");
		}

		(jsdom.window as any).ReactNativeWebView = {
			postMessage: (message: string) => {
				console.log("[JSDOM] Sending message back to RN:", message.substring(0, 100));
				if (webviewOnMessage) {
					webviewOnMessage({ nativeEvent: { data: message } });
				}
			}
		};

		const mockWebView = {
			postMessage: (dataStr: string) => {
				console.log("[RN] Sending message to WebView:", dataStr.substring(0, 100));
				try {
					const event = new jsdom.window.MessageEvent("message", {
						data: dataStr,
						origin: "https://www.youtube.com"
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

	it("should generate a valid PoToken and download via Swift SabrDownloader", async () => {
		// 1. Generate PoToken using mobile_potoken (simulated WebView)
		console.log("[Test] Generating PoToken...");
		const pot_result: any = await mobile_potoken.generate_potoken(innertube, VIDEO_ID);

		console.log("[Test] PoToken Result:", pot_result);

		if (pot_result.error) {
			console.error("[Test] PoToken generation failed:", pot_result.error);
			throw pot_result.error;
		}

		expect(pot_result.po_token).toBeDefined();
		expect(pot_result.visitor_data).toBeDefined();

		// 2. Resolve SABR params
		console.log("[Test] Resolving SABR URL...");
		const sabr_params = await YouTubeDL.resolve_sabr_url(VIDEO_ID);
		if ("error" in sabr_params) throw sabr_params.error;

		const ctx = innertube.session.context.client;
		const client_name = parseInt((Constants.CLIENT_NAME_IDS as Record<string, string>)[ctx.clientName] ?? "1");

		// 3. Build the JSON payload that SabrLiveTests expects
		const params_json = {
			sabrServerUrl: sabr_params.sabrServerUrl,
			sabrUstreamerConfig: sabr_params.sabrUstreamerConfig,
			poToken: pot_result.po_token,
			duration: sabr_params.duration,
			clientName: client_name,
			clientVersion: ctx.clientVersion,
			formats: sabr_params.sabrFormats
		};

		console.log("[Test] SABR params resolved. clientName:", client_name, "formats:", params_json.formats.length);

		// 4. Write params to a temp file so SABR_FETCH_CMD can serve them
		const tmp_dir = fs.mkdtempSync(path.join(os.tmpdir(), "sabr-swift-test-"));
		const params_file = path.join(tmp_dir, "sabr-params.json");
		fs.writeFileSync(params_file, JSON.stringify(params_json, null, 2));

		console.log("[Test] Params written to", params_file);
		console.log("[Test] Running swift test --filter SabrLiveTests...");

		// 5. Invoke swift test with SABR_FETCH_CMD pointing to the temp file
		try {
			const result = child_process.spawnSync("swift", ["test", "--filter", "SabrLiveTests"], {
				cwd: SWIFT_AUDIO_EX_DIR,
				env: {
					...process.env,
					SABR_FETCH_CMD: `cat ${params_file}`
				},
				encoding: "utf8",
				timeout: 120000
			});

			if (result.stdout) console.log("[swift test stdout]\n", result.stdout);
			if (result.stderr) console.log("[swift test stderr]\n", result.stderr);

			if (result.error) throw result.error;

			expect(result.status).toBe(0);
			console.log("[Test] Swift SABR tests passed.");
		} finally {
			fs.rmSync(tmp_dir, { recursive: true, force: true });
		}
	}, 300000); // 5 min — swift build + download
});
