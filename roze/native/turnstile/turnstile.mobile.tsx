import React, { useCallback, useState } from "react";
import { View, StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import CookieManager from "@react-native-community/cookies";
import type { TurnstileSolver, TurnstileSolveResult } from "@native/turnstile/turnstile.base";
import { generror } from "@common/utils/error_util";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";

const CF_CLEARANCE_SETTLE_MS = 1_000;

interface Pending {
	resolve: (result: TurnstileSolveResult | { error: Error }) => void;
	page_url: string;
	timer: ReturnType<typeof setTimeout>;
}

let _set_uri: ((uri: string | null) => void) | null = null;
let _pending: Pending | null = null;

const INJECTED_BEFORE_CONTENT_LOADED = `(function(){
	function send(o){ try { window.ReactNativeWebView.postMessage(JSON.stringify(o)); } catch(e) {} }
	window.addEventListener('message', function(e){
		var d;
		try { d = (typeof e.data === 'string') ? JSON.parse(e.data) : e.data; } catch(_) { return; }
		if (!d || typeof d !== 'object') return;
		if (d.type === 'turnstile-token' && d.token) send({ type: 'turnstile-token', token: d.token });
		else if (d.type === 'turnstile-error' || d.type === 'turnstile-expired' || d.type === 'turnstile-timeout') send({ type: 'turnstile-error', error: d.error || d.type });
	});
})();
true;`;

async function harvest_cookies(page_url: string): Promise<string[]> {
	try {
		const cookies = await CookieManager.get(page_url, true);
		return Object.values(cookies).map(c => `${c.name}=${c.value}`);
	} catch {
		return [];
	}
}

function settle(value: TurnstileSolveResult | { error: Error }) {
	const pending = _pending;
	if (!pending) return;
	clearTimeout(pending.timer);
	_pending = null;
	_set_uri?.(null);
	pending.resolve(value);
}

function handle_message(event: WebViewMessageEvent) {
	const pending = _pending;
	if (!pending) return;
	let data: any;
	try { data = JSON.parse(event.nativeEvent.data); } catch { return; }

	if (data.type === "turnstile-token" && typeof data.token === "string") {
		const { page_url } = pending;
		const token = data.token as string;
		setTimeout(() => {
			void harvest_cookies(page_url).then(cookies => settle({ token, cookies }));
		}, CF_CLEARANCE_SETTLE_MS);
		return;
	}
	if (data.type === "turnstile-error") {
		settle(generror(`Turnstile widget error: ${data.error}`, "MEDIUM", {}));
	}
}

export const mobile_turnstile: TurnstileSolver = {
	solve: async (opts) => new Promise<TurnstileSolveResult | { error: Error }>((resolve) => {
		if (!_set_uri) {
			resolve(generror("TurnstileWebView is not mounted. Add <TurnstileWebView /> to your component tree.", "CRITICAL", {}));
			return;
		}
		if (_pending) {
			resolve(generror("A turnstile solve is already in progress", "LOW", {}));
			return;
		}
		const timer = setTimeout(() => settle(generror("Turnstile WebView timed out", "MEDIUM", { page_url: opts.page_url })), opts.timeout_ms ?? 45_000);
		_pending = { resolve, page_url: opts.page_url, timer };
		// cache-bust so re-solves force a fresh navigation/widget execution
		_set_uri(`${opts.page_url}${opts.page_url.includes("?") ? "&" : "?"}_cf=${Date.now()}`);
	})
};

export function TurnstileWebView() {
	const [uri, set_uri] = useState<string | null>(null);

	const register = useCallback((value: string | null) => set_uri(value), []);
	_set_uri = register;

	if (!uri) return null;

	return (
		<View style={styles.hidden} pointerEvents="none">
			<WebView
				key={uri}
				source={{ uri }}
				injectedJavaScriptBeforeContentLoaded={INJECTED_BEFORE_CONTENT_LOADED}
				onMessage={handle_message}
				javaScriptEnabled
				domStorageEnabled
				sharedCookiesEnabled
				thirdPartyCookiesEnabled
				userAgent={UA}
				cacheEnabled
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
		opacity: 0,
	},
	webview: {
		flex: 1,
	},
});
