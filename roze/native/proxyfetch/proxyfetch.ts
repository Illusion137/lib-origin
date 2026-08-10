import type { ProxyFetch } from "@native/proxyfetch/proxyfetch.base";
import { get_native_platform } from "@native/native_mode";

let proxyfetch_instance: ProxyFetch;

export async function load_native_proxyfetch(): Promise<ProxyFetch> {
	if (proxyfetch_instance) return proxyfetch_instance;
	switch (get_native_platform()) {
		case "NODE":
			try {
				proxyfetch_instance = (await import("./proxyfetch.node.ts")).node_proxyfetch;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				proxyfetch_instance = (await import("./proxyfetch.mobile.ts")).mobile_proxyfetch;
			} catch (e) { console.error(e); }
			break;
		case "WEB":
			try {
				proxyfetch_instance = (await import("./proxyfetch.fallback.ts")).fallback_proxyfetch;
			} catch (e) { console.error(e); }
			break;
	}
	return proxyfetch_instance;
}

export function proxyfetch(): ProxyFetch {
	if (proxyfetch_instance) return proxyfetch_instance;
	console.error(new Error("Native Module [proxyfetch/ProxyFetch] is NOT loaded"));
	return proxyfetch_instance;
}
