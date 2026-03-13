import React, { useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import type { Innertube } from "youtubei.js";
import { BG } from "bgutils-js";
import type { PoTokenGenerator, PoTokenResult } from "./potoken.base";

interface BgChallengeData {
	interpreter_javascript: string | null;
	interpreter_url: string | null;
	program: string;
	global_name: string;
}

interface PendingRequest {
	resolve: (result: PoTokenResult) => void;
	reject: (error: Error) => void;
	timer: ReturnType<typeof setTimeout>;
}

const REQUEST_KEY = "O43z0dpjhgX20SCx4KAo";
const GOOG_API_KEY = "AIzaSyDyT5W0Jh49F30Pqqtyfdf7pDLFKLJoAnw";
const USER_AGENT = "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
const DEFAULT_TIMEOUT_MS = 30_000;

const WEBVIEW_INJECTED_JS = `
(function () {
    var REQUEST_KEY  = '${REQUEST_KEY}';
    var GOOG_API_KEY = '${GOOG_API_KEY}';

    function u8_to_base64(u8, base64url) {
        var binary = '';
        for (var i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
        var result = btoa(binary);
        if (base64url) {
            result = result.replace(/\\+/g, '-').replace(/\\//g, '_');
        }
        return result;
    }

    var b64_map = { '-': '+', '_': '/', '.': '=' };
    function base64_to_u8(b64) {
        var s = b64.replace(/[-_.]/g, function (m) { return b64_map[m]; });
        s = atob(s);
        var arr = new Uint8Array(s.length);
        for (var i = 0; i < s.length; i++) arr[i] = s.charCodeAt(i);
        return arr;
    }

    function post(msg) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }

    function build_url(endpoint_name) {
        return 'https://jnn-pa.googleapis.com/$rpc/google.internal.waa.v1.Waa/' + endpoint_name;
    }

    async function execute_botguard_and_mint(challenge_data, identifier) {
        // ─── Load interpreter script (before BotGuardClient.create) ─────
        var interpreter_js = challenge_data.interpreter_javascript;
        var interpreter_url = challenge_data.interpreter_url;

        if (interpreter_js) {
            new Function(interpreter_js)();
        } else if (interpreter_url) {
            var script_resp = await fetch(interpreter_url);
            var script_text = await script_resp.text();
            if (!script_text) throw new Error('Could not load VM');
            new Function(script_text)();
        } else {
            throw new Error('Could not load VM');
        }

        // ─── BG.BotGuardClient.create({ program, globalName, globalObj }) ───
        var vm = window[challenge_data.global_name];
        if (!vm) throw new Error('[BotGuardClient] VM not found on window.' + challenge_data.global_name);
        if (!vm.a) throw new Error('[BotGuardClient] VM.a init function not found');

        var vm_fns = {};
        var sync_snapshot_function = vm.a(
            challenge_data.program,
            function (async_snapshot_fn, shutdown_fn, pass_event_fn, check_camera_fn) {
                vm_fns.async_snapshot_function = async_snapshot_fn;
                vm_fns.shutdown_function = shutdown_fn;
                vm_fns.pass_event_function = pass_event_fn;
                vm_fns.check_camera_function = check_camera_fn;
            },
            true,
            undefined,
            function () {},
            [[], []]
        )[0];

        // ─── botguard.snapshot({ webPoSignalOutput }) ───────────────────
        // vm.a() calls vmFunctionsCallback ASYNCHRONOUSLY via an internal
        // background task. We must yield via setInterval (1ms ticks) to let
        // that task run before calling async_snapshot_function.
        var web_po_signal_output = [];
        var botguard_response = await new Promise(function (resolve, reject) {
            var poll_count = 0;
            var poll_id = setInterval(function () {
                if (vm_fns.async_snapshot_function) {
                    clearInterval(poll_id);
                    vm_fns.async_snapshot_function(
                        function (response) { resolve(response); },
                        [undefined, undefined, web_po_signal_output, undefined]
                    );
                } else if (poll_count >= 10000) {
                    clearInterval(poll_id);
                    reject(new Error('[BotGuardClient] async snapshot function not available after 10s'));
                }
                poll_count += 1;
            }, 1);
        });

        if (!botguard_response) throw new Error('[BotGuardClient] empty snapshot response');

        // ─── Fetch integrity token (buildURL('GenerateIT', true)) ───────
        var headers = {
            'content-type': 'application/json+protobuf',
            'x-goog-api-key': GOOG_API_KEY,
            'x-user-agent': 'grpc-web-javascript/0.1'
        };

        var it_resp = await fetch(build_url('GenerateIT'), {
            method: 'POST',
            headers: headers,
            body: JSON.stringify([REQUEST_KEY, botguard_response])
        });

        if (!it_resp.ok) throw new Error('[WebPoMinter] integrity token request failed: ' + it_resp.status);

        var it_json = await it_resp.json();
        if (typeof it_json[0] !== 'string')
            throw new Error('Could not get integrity token');

        var integrity_token = it_json[0];

        // ─── BG.WebPoMinter.create({ integrityToken }, webPoSignalOutput) ─
        var get_minter = web_po_signal_output[0];
        if (!get_minter) throw new Error('[WebPoMinter] PMD:Undefined');

        var mint_callback = await get_minter(base64_to_u8(integrity_token));
        if (typeof mint_callback !== 'function') throw new Error('[WebPoMinter] APF:Failed');

        // ─── minter.mintAsWebsafeString(identifier) ─────────────────────
        var result = await mint_callback(new TextEncoder().encode(identifier));
        if (!result) throw new Error('[WebPoMinter] YNJ:Undefined');
        if (!(result instanceof Uint8Array)) throw new Error('[WebPoMinter] ODM:Invalid');

        var po_token = u8_to_base64(result, true);
        if (po_token.length < 80)
            throw new Error('[WebPoMinter] token too short (' + po_token.length + ' chars)');

        return po_token;
    }

    window.addEventListener('message', function (event) {
        var data;
        try { data = JSON.parse(event.data); } catch (e) { return; }
        if (data.type !== 'MINT_PO_TOKEN') return;

        execute_botguard_and_mint(data.challenge_data, data.identifier)
            .then(function (po_token) {
                post({
                    type: 'PO_TOKEN_RESULT',
                    request_id: data.request_id,
                    po_token: po_token,
                    identifier: data.identifier
                });
            })
            .catch(function (err) {
                post({
                    type: 'PO_TOKEN_ERROR',
                    request_id: data.request_id,
                    error: err.message || String(err)
                });
            });
    });

    post({ type: 'WEBVIEW_READY' });
})();
true;
`;

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export let _webview_ref: WebView | null = null;
export let _is_ready = false;
export let _ready_promise: Promise<void> | null = null;
export let _ready_resolve: (() => void) | null = null;
export const _pending = new Map<string, PendingRequest>();
export let _request_counter = 0;

function reset_ready() {
	_is_ready = false;
	_ready_promise = new Promise<void>((resolve) => {
		_ready_resolve = resolve;
	});
}
reset_ready();

function handle_message(event: WebViewMessageEvent) {
	let data: any;
	try {
		data = JSON.parse(event.nativeEvent.data);
	} catch {
		return;
	}

	if (data.type === "WEBVIEW_READY") {
		_is_ready = true;
		_ready_resolve?.();
		return;
	}

	if (data.type === "PO_TOKEN_RESULT") {
		const req = _pending.get(data.request_id);
		if (req) {
			clearTimeout(req.timer);
			_pending.delete(data.request_id);
			let placeholder_po_token = "";
			try {
				placeholder_po_token = BG.PoToken.generatePlaceholder(data.identifier);
			} catch {
				/* identifier too long */
			}
			req.resolve({ po_token: data.po_token, placeholder_po_token, identifier: data.identifier, visitor_data: "" });
		}
		return;
	}

	if (data.type === "PO_TOKEN_ERROR") {
		const req = _pending.get(data.request_id);
		if (req) {
			clearTimeout(req.timer);
			_pending.delete(data.request_id);
			req.reject(new Error(data.error));
		}
		return;
	}
}

async function fetch_challenge_from_innertube(innertube: Innertube): Promise<BgChallengeData> {
	const challenge_response = await innertube.getAttestationChallenge("ENGAGEMENT_TYPE_UNBOUND");

	if (!challenge_response.bg_challenge) {
		throw new Error("Could not get challenge");
	}

	const bg_challenge = challenge_response.bg_challenge;

	const raw_url: string | null = bg_challenge.interpreter_url?.private_do_not_access_or_else_trusted_resource_url_wrapped_value ?? null;

	const interpreter_url = raw_url ? (raw_url.startsWith("http") ? raw_url : `https:${raw_url}`) : null;

	// Pre-fetch the BotGuard interpreter script from the React Native side rather than letting
	// the WebView fetch it. On iOS, WKWebView blocks cross-origin fetches to gstatic.com from
	// locally-loaded HTML (source={{ html, baseUrl }}), producing "Load failed" inside the VM.
	let interpreter_javascript: string | null = null;
	if (interpreter_url) {
		const resp = await fetch(interpreter_url);
		if (!resp.ok) throw new Error(`Failed to fetch BotGuard interpreter: ${resp.status}`);
		interpreter_javascript = await resp.text();
	}

	return {
		interpreter_javascript,
		interpreter_url: null,
		program: bg_challenge.program,
		global_name: bg_challenge.global_name
	};
}

async function mint_in_webview(challenge_data: BgChallengeData, identifier: string, timeout_ms: number): Promise<PoTokenResult> {
	if (!_webview_ref) {
		throw new Error("PoTokenWebView is not mounted. Add <PoTokenWebView /> to your component tree.");
	}

	const request_id = `pot_${++_request_counter}_${Date.now()}`;

	return new Promise<PoTokenResult>((resolve, reject) => {
		const timer = setTimeout(() => {
			_pending.delete(request_id);
			reject(new Error(`PO token generation timed out after ${timeout_ms}ms`));
		}, timeout_ms);

		_pending.set(request_id, { resolve, reject, timer });

		_webview_ref!.postMessage(
			JSON.stringify({
				type: "MINT_PO_TOKEN",
				request_id,
				challenge_data,
				identifier
			})
		);
	});
}

export const mobile_potoken: PoTokenGenerator = {
	generate_potoken: async (innertube: Innertube, content_binding?: string) => {
		try {
			const visitor_data = content_binding ?? "";

			if (!content_binding) {
				throw new Error("No content_binding provided Innertube session.");
			}

			if (!_is_ready) {
				if (!_ready_promise) reset_ready();
				await _ready_promise;
			}

			const challenge_data = await fetch_challenge_from_innertube(innertube);
			const result = await mint_in_webview(challenge_data, content_binding, DEFAULT_TIMEOUT_MS);

			return {
				...result,
				identifier: content_binding,
				visitor_data
			};
		} catch (error) {
			return { error: error instanceof Error ? error : new Error(String(error)) };
		}
	}
};

const WEBVIEW_ORIGIN_WHITELIST = ["*"];
const WEBVIEW_SOURCE = {
	html: '<!DOCTYPE html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title></title></head><body></body></html>',
	baseUrl: "https://www.youtube.com/"
};

export function PoTokenWebView() {
	const ref = useRef<WebView>(null);

	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	const on_ref = useCallback((instance: WebView | null) => {
		ref.current = instance;
		_webview_ref = instance;
		if (instance) reset_ready();
	}, []);

	return (
		<View style={styles.hidden} pointerEvents="none">
			<WebView
				ref={on_ref}
				originWhitelist={WEBVIEW_ORIGIN_WHITELIST}
				source={WEBVIEW_SOURCE}
				injectedJavaScript={WEBVIEW_INJECTED_JS}
				onMessage={handle_message}
				userAgent={USER_AGENT}
				javaScriptEnabled
				domStorageEnabled
				cacheEnabled={false}
				incognito
				style={styles.webview}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	hidden: {
		// Off-screen, not zero-size. BotGuard fingerprints window.innerWidth/innerHeight
		// and refuses to set up async_snapshot_function if the viewport is 0×0 or 1×1
		// (detects headless/bot environment). 390×844 matches a standard iPhone viewport.
		position: "absolute",
		top: -10000,
		left: 0,
		width: 390,
		height: 844,
		opacity: 0
	},
	webview: {
		flex: 1
	}
});
