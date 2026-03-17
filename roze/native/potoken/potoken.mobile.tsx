import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import type { PoTokenGenerator, PoTokenResult } from "@native/potoken/potoken.base";
import { BGUTILS_BUNDLE_JS } from "@native/potoken/bgutils_bundle";
import { GOOG_API_KEY } from "bgutils-js";
import type { Innertube } from "youtubei.js";
import { generror } from "@common/utils/error_util";

const REQUEST_KEY = "O43z0dpjhgX20SCx4KAo";

interface PendingRequest {
	resolve: (result: PoTokenResult) => void;
	reject: (error: Error) => void;
	timer: ReturnType<typeof setTimeout>;
}

const WEBVIEW_ORIGIN_WHITELIST = ["*"];

export let _potoken_webview_ref: WebView | null = null;
export let _potoken_is_ready = false;
export let _potoken_ready_promise: Promise<void> | null = null;
export let _potoken_ready_resolve: (() => void) | null = null;
export const _potoken_pending = new Map<string, PendingRequest>();
export let _potoken_request_counter = 0;

function reset_ready() {
	_potoken_is_ready = false;
	_potoken_ready_promise = new Promise<void>((resolve) => {
		_potoken_ready_resolve = resolve;
	});
}
reset_ready();

function handle_potoken_message(event: WebViewMessageEvent) {
	let data: any;
	try {
		data = JSON.parse(event.nativeEvent.data);
	} catch {
		return;
	}

	if (data.type === "POTOKEN_READY") {
		_potoken_is_ready = true;
		_potoken_ready_resolve?.();
		return;
	}

	if (data.type === "POTOKEN_RESULT") {
		const req = _potoken_pending.get(data.request_id);
		if (req) {
			clearTimeout(req.timer);
			_potoken_pending.delete(data.request_id);
			req.resolve({
				po_token: data.po_token,
				placeholder_po_token: data.placeholder_po_token,
				visitor_data: data.visitor_data,
				identifier: data.visitor_data
			});
		}
		return;
	}

	if (data.type === "POTOKEN_ERROR") {
		const req = _potoken_pending.get(data.request_id);
		if (req) {
			clearTimeout(req.timer);
			_potoken_pending.delete(data.request_id);
			req.reject(new Error(data.error));
		}
		return;
	}
}

function build_potoken_page_html(bgutils_bundle: string): string {
	return `<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Security-Policy"
      content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;">

<script>
// ---------------------------------------------------------------------------
// Polyfill APIs BotGuard checks for. Missing any of these causes it to
// deliver asyncSnapshotFunction as undefined inside vmFunctionsCallback.
// ---------------------------------------------------------------------------
if (!window.matchMedia) {
    window.matchMedia = function(query) {
        return {
            matches: false, media: query, onchange: null,
            addListener: function() {}, removeListener: function() {},
            addEventListener: function() {}, removeEventListener: function() {},
            dispatchEvent: function() { return false; }
        };
    };
}
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(cb) { return setTimeout(cb, 16); };
    window.cancelAnimationFrame = function(id) { clearTimeout(id); };
}
if (window.HTMLCanvasElement) {
    var _origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type) {
        try { return _origGetContext ? _origGetContext.call(this, type) : null; } catch(e) { return null; }
    };
}
</script>

<script>${bgutils_bundle}</script>

<script>
var REQUEST_KEY = ${JSON.stringify(REQUEST_KEY)};

// Keep a direct reference to RN's postMessage bridge before anything can overwrite it.
var __rn_send = window.ReactNativeWebView
    ? window.ReactNativeWebView.postMessage.bind(window.ReactNativeWebView)
    : function(s) { window.postMessage(s, '*'); };

function send_to_rn(obj) {
    try { __rn_send(JSON.stringify(obj)); } catch(e) {}
}

// ---------------------------------------------------------------------------
// Core generation logic.
//
// KEY DIFFERENCES from previous attempts:
//
// 1. Use document.createElement('script') + appendChild to load the BotGuard
//    interpreter. This is the method explicitly recommended by LuanRT/BgUtils
//    for browser environments. new Function() does NOT give the VM the same
//    event-loop integration as a real <script> tag, which causes the async
//    function handoff to fail.
//
// 2. Bypass BotGuardClient entirely. BotGuardClient wraps vmFunctionsCallback
//    in a DeferredPromise that resolves on the FIRST call. BotGuard calls the
//    callback synchronously with (undefined, ...) to register the slot, then
//    calls it again asynchronously with real functions. Because DeferredPromise
//    resolves on the first call, asyncSnapshotFunction is always undefined.
//    We call vm.a() ourselves with a callback that ignores calls where
//    asyncSnapshotFunction is falsy.
//
// 3. Use WebPoMinter.create() from bgutils directly with the webPoSignalOutput
//    populated by BotGuard, avoiding any further abstraction issues.
// ---------------------------------------------------------------------------
async function generate_potoken(request_id, visitor_data, content_binding, interpreter_javascript, program, global_name, goog_api_key) {
    try {
        var BG = window.__bgutils__ ? window.__bgutils__.BG : null;
        if (!BG) throw new Error('bgutils BG object not found on window.__bgutils__');

        // -- Step 1: Inject the interpreter via a real <script> tag -------------
        // This is the browser-correct method per LuanRT/BgUtils docs.
        // Inline scripts appended via appendChild execute synchronously and give
        // the VM full, native access to the window event loop.
        var script_id = 'bg-interpreter-' + request_id;
        if (!document.getElementById(script_id)) {
            var script_el = document.createElement('script');
            script_el.type = 'text/javascript';
            script_el.id = script_id;
            script_el.textContent = interpreter_javascript;
            document.head.appendChild(script_el);
        }

        // -- Step 2: Wait for VM global to appear on window --------------------
        var vm = await new Promise(function(resolve, reject) {
            var attempts = 0;
            var interval = setInterval(function() {
                if (window[global_name]) {
                    clearInterval(interval);
                    resolve(window[global_name]);
                } else if (++attempts > 200) {
                    clearInterval(interval);
                    reject(new Error('BotGuard VM never registered on window. global_name=' + global_name));
                }
            }, 50);
        });

        if (!vm || !vm.a) throw new Error('VM found but vm.a is missing');

        // -- Step 3: Call vm.a() directly, bypassing BotGuardClient ------------
        // BotGuard calls vmFunctionsCallback TWICE in browser environments:
        //   - First call: synchronous, with (undefined, undefined, ...) to register
        //   - Second call: asynchronous (via queueMicrotask / Promise), with real fns
        // bgutils' BotGuardClient wraps this in a DeferredPromise that resolves on
        // the FIRST call → asyncSnapshotFunction is always undefined.
        // Our callback below ignores calls where asyncFn is falsy.
        var vm_functions = {};
        var vm_functions_promise = new Promise(function(resolve) {
            vm_functions.__resolve = resolve;
        });

        var vm_functions_callback = function(asyncFn, shutdownFn, passEventFn, cameraFn) {
            if (typeof asyncFn === 'function') {
                vm_functions.asyncSnapshotFunction = asyncFn;
                vm_functions.shutdownFunction = shutdownFn;
                vm_functions.passEventFunction = passEventFn;
                vm_functions.checkCameraFunction = cameraFn;
                vm_functions.__resolve();
            }
            // If asyncFn is falsy, BotGuard is doing its registration phase.
            // We deliberately ignore it and wait for the real call.
        };

        // vm.a returns an array; [0] is the sync snapshot function
        var sync_snapshot_fn = null;
        try {
            sync_snapshot_fn = await vm.a(program, vm_functions_callback, true, document.body, function() {}, [[], []])[0];
        } catch(e) {
            throw new Error('vm.a() threw: ' + (e.message || String(e)));
        }

        // -- Step 4: Wait for asyncSnapshotFunction to arrive ------------------
        await Promise.race([
            vm_functions_promise,
            new Promise(function(_, reject) {
                setTimeout(function() {
                    reject(new Error(
                        'vmFunctionsCallback never received asyncSnapshotFunction after 15s. ' +
                        'BotGuard may have flagged the environment.'
                    ));
                }, 15000);
            })
        ]);

        // -- Step 5: Take the async snapshot -----------------------------------
        var web_po_signal_output = [];
        var botguard_response = await new Promise(function(resolve, reject) {
            setTimeout(function() { reject(new Error('asyncSnapshotFunction timed out after 10s')); }, 10000);
            try {
                vm_functions.asyncSnapshotFunction(
                    function(response) { resolve(response); },
                    [undefined, undefined, web_po_signal_output, undefined]
                );
            } catch(e) {
                reject(new Error('asyncSnapshotFunction threw: ' + (e.message || String(e))));
            }
        });

        if (!botguard_response) throw new Error('BotGuard returned empty response');

        // -- Step 6: Fetch integrity token ------------------------------------
        var it_resp = await fetch(
            'https://jnn-pa.googleapis.com/$rpc/google.internal.waa.v1.Waa/GenerateIT',
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json+protobuf',
                    'x-goog-api-key': goog_api_key,
                    'x-user-agent': 'grpc-web-javascript/0.1'
                },
                body: JSON.stringify([REQUEST_KEY, botguard_response])
            }
        );
        var it_data = await it_resp.json();
        if (typeof it_data[0] !== 'string') {
            throw new Error('GenerateIT bad response: ' + JSON.stringify(it_data));
        }

        // -- Step 7: Mint the PO token ----------------------------------------
        var minter = await BG.WebPoMinter.create(
            { integrityToken: it_data[0] },
            web_po_signal_output
        );
        var po_token = await minter.mintAsWebsafeString(content_binding);

        var placeholder_po_token = '';
        try {
            placeholder_po_token = BG.PoToken.generatePlaceholder(content_binding);
        } catch(e) {}

        send_to_rn({
            type: 'POTOKEN_RESULT',
            request_id: request_id,
            po_token: po_token,
            placeholder_po_token: placeholder_po_token,
            visitor_data: visitor_data
        });

    } catch(e) {
        send_to_rn({
            type: 'POTOKEN_ERROR',
            request_id: request_id,
            error: e.message || String(e)
        });
    }
}

window.addEventListener('message', function(event) {
    try {
        var msg = JSON.parse(event.data);
        if (msg.type === 'POTOKEN_REQUEST') {
            generate_potoken(
                msg.request_id,
                msg.visitor_data,
                msg.content_binding,
                msg.interpreter_javascript,
                msg.program,
                msg.global_name,
                msg.goog_api_key
            );
        }
    } catch(e) {}
});

send_to_rn({ type: 'POTOKEN_READY' });
</script>
</head>
<body></body>
</html>`;
}

export function PoTokenWebView(_props: Record<string, never> = {}) {
	const source = {
		html: build_potoken_page_html(BGUTILS_BUNDLE_JS),
		baseUrl: "https://www.youtube.com/"
	};

	const on_ref = useCallback((instance: WebView | null) => {
		_potoken_webview_ref = instance;
		if (instance) reset_ready();
	}, []);

	return (
		<View style={styles.hidden} pointerEvents="none">
			<WebView ref={on_ref} originWhitelist={WEBVIEW_ORIGIN_WHITELIST} source={source} onMessage={handle_potoken_message} javaScriptEnabled cacheEnabled={false} style={styles.webview} />
		</View>
	);
}

const styles = StyleSheet.create({
	hidden: {
		position: "absolute",
		top: -10000,
		left: 0,
		width: 1,
		height: 1,
		opacity: 0
	},
	webview: {
		flex: 1
	}
});

export const mobile_potoken: PoTokenGenerator = {
	generate_potoken: async (innertube: Innertube, content_binding?: string) => {
		if (!content_binding) {
			return generror("No identifier provided and no visitorData on the Innertube session.", "CRITICAL", { identifier: content_binding });
		}
		if (!_potoken_webview_ref) {
			return generror("PoTokenWebView is not mounted. Add <PoTokenWebView /> to your component tree.", "CRITICAL");
		}

		const challenge_response = await innertube.getAttestationChallenge("ENGAGEMENT_TYPE_UNBOUND");

		if (!challenge_response.bg_challenge) {
			return generror("Could not get BotGuard challenge", "CRITICAL");
		}

		let interpreter_url: string = challenge_response.bg_challenge.interpreter_url.private_do_not_access_or_else_trusted_resource_url_wrapped_value ?? "";

		if (!interpreter_url) {
			return generror("Could not get interpreter URL from BotGuard challenge", "CRITICAL");
		}

		if (interpreter_url.startsWith("//")) interpreter_url = `https:${interpreter_url}`;

		const interpreter_javascript = await (await fetch(interpreter_url)).text();

		if (!interpreter_javascript) {
			return generror("Could not load VM", "CRITICAL");
		}

		if (!_potoken_is_ready) {
			if (!_potoken_ready_promise) reset_ready();
			await _potoken_ready_promise;
		}

		const request_id = `potoken_${++_potoken_request_counter}_${Date.now()}`;
		const visitor_data = innertube.session.context.client.visitorData ?? "";
		const program = challenge_response.bg_challenge.program;
		const global_name = challenge_response.bg_challenge.global_name;

		try {
			const result = await new Promise<PoTokenResult>((resolve, reject) => {
				const timer = setTimeout(() => {
					_potoken_pending.delete(request_id);
					reject(new Error("PoToken generation timed out after 60s"));
				}, 60_000);

				_potoken_pending.set(request_id, { resolve, reject, timer });

				_potoken_webview_ref!.injectJavaScript(`
					window.dispatchEvent(new MessageEvent('message', {
						data: ${JSON.stringify(
							JSON.stringify({
								type: "POTOKEN_REQUEST",
								request_id,
								visitor_data,
								content_binding,
								interpreter_javascript,
								program,
								global_name,
								goog_api_key: GOOG_API_KEY
							})
						)}
					}));
					true;
				`);
			});

			return result;
		} catch (_e: any) {
			return generror(`PoToken WebView failed: ${_e?.message ?? _e}`, "CRITICAL");
		}
	}
};
