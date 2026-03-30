import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

interface PendingRequest {
	resolve: (result: any) => void;
	reject: (error: Error) => void;
	timer: ReturnType<typeof setTimeout>;
}

const BGUTILS_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)";
export const WEBVIEW_INJECTED_JS = `\n` + `
(function() {
    var _wv_log = function(level, args) {
        try {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'WV_LOG',
                level: level,
                msg: Array.prototype.slice.call(args).map(function(a) {
                    try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch(e) { return String(a); }
                }).join(' ')
            }));
        } catch(e) {}
    };
    var _orig_log = console.log, _orig_warn = console.warn, _orig_error = console.error;
    console.log   = function() { _orig_log.apply(console, arguments);   _wv_log('log',   arguments); };
    console.warn  = function() { _orig_warn.apply(console, arguments);  _wv_log('warn',  arguments); };
    console.error = function() { _orig_error.apply(console, arguments); _wv_log('error', arguments); };
})();
(function() {
    window.addEventListener('message', function(event) {
        var data;
        try { data = JSON.parse(event.data); } catch(e) { return; }
        if (data.type !== 'EVAL_CODE') return;
        try {
            var result = new Function(data.code)();
            Promise.resolve(result).then(function(resolved) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'EVAL_RESULT',
                    request_id: data.request_id,
                    result: resolved !== undefined ? resolved : null
                }));
            }).catch(function(err) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'EVAL_ERROR',
                    request_id: data.request_id,
                    error: err.message || String(err)
                }));
            });
        } catch(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'EVAL_ERROR',
                request_id: data.request_id,
                error: e.message || String(e)
            }));
        }
    });
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'JSEVAL_READY' }));
})();
true;
`;

const WEBVIEW_ORIGIN_WHITELIST = ["*"];

 
export let _jseval_webview_ref: WebView | null = null;
export let _jseval_is_ready = false;
export let _jseval_ready_promise: Promise<void> | null = null;
export let _jseval_ready_resolve: (() => void) | null = null;
export const _jseval_pending = new Map<string, PendingRequest>();
export let _jseval_request_counter = 0;

function reset_ready() {
	_jseval_is_ready = false;
	_jseval_ready_promise = new Promise<void>((resolve) => {
		_jseval_ready_resolve = resolve;
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

	if (data.type === "WV_LOG") {
		const prefix = `[WebView:${data.level}]`;
		if (data.level === "error") console.error(prefix, data.msg);
		else if (data.level === "warn") console.warn(prefix, data.msg);
		else console.log(prefix, data.msg);
		return;
	}

	if (data.type === "JSEVAL_READY") {
		_jseval_is_ready = true;
		_jseval_ready_resolve?.();
		return;
	}

	if (data.type === "EVAL_RESULT") {
		const req = _jseval_pending.get(data.request_id);
		if (req) {
			clearTimeout(req.timer);
			_jseval_pending.delete(data.request_id);
			req.resolve(data.result);
		}
		return;
	}

	if (data.type === "EVAL_ERROR") {
		const req = _jseval_pending.get(data.request_id);
		if (req) {
			clearTimeout(req.timer);
			_jseval_pending.delete(data.request_id);
			req.reject(new Error(data.error));
		}
		return;
	}
}

export async function eval_in_webview(code: string, timeout_ms = 15_000): Promise<any> {
	if (!_jseval_webview_ref) {
		throw new Error("JSEvaluatorWebView is not mounted. Add <JSEvaluatorWebView /> to your component tree.");
	}

	if (!_jseval_is_ready) {
		if (!_jseval_ready_promise) reset_ready();
		await _jseval_ready_promise;
	}

	const request_id = `jseval_${++_jseval_request_counter}_${Date.now()}`;

	return new Promise<any>((resolve, reject) => {
		const timer = setTimeout(() => {
			_jseval_pending.delete(request_id);
			reject(new Error(`eval_in_webview timed out after ${timeout_ms}ms`));
		}, timeout_ms);

		_jseval_pending.set(request_id, { resolve, reject, timer });

		_jseval_webview_ref!.postMessage(
			JSON.stringify({
				type: "EVAL_CODE",
				request_id,
				code
			})
		);
	});
}

const JSEVAL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>YouTube</title>
</head>
<body>
<div id="app"></div>
<canvas id="c" style="display:none"></canvas>
</body>
</html>`;

export function JSEvaluatorWebView() {
	const source = { html: JSEVAL_HTML };

	const on_ref = useCallback((instance: WebView | null) => {
		_jseval_webview_ref = instance;
		if (instance) reset_ready();
	}, []);

	return (
		<View style={styles.hidden} pointerEvents="none">
			<WebView
				ref={on_ref}
				originWhitelist={WEBVIEW_ORIGIN_WHITELIST}
				source={source}
				injectedJavaScript={WEBVIEW_INJECTED_JS}
				onMessage={handle_message}
				javaScriptEnabled
				sharedCookiesEnabled={true}
				userAgent={BGUTILS_USER_AGENT}
				cacheEnabled={true}
				style={styles.webview}
			/>
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
