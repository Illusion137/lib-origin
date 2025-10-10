import { get_native_platform } from "@native/native_mode";
import type Innertube from "youtubei.js/agnostic";

let innertube_instance: Innertube;

export async function load_native_innertube(): Promise<Innertube>{
	if (innertube_instance) return innertube_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native InnerTube is NOT implemented");
			break;
		case "ELECTRON_RENDERER":
			try {
				innertube_instance = await import("youtubei.js/web");
			} catch (e) {}
			break;
		case "NODE":
			try {
				innertube_instance = await import("youtubei.js");
			} catch (e) {}
			break;
		case "REACT_NATIVE":
			try {
				import('event-target-polyfill');
				import('web-streams-polyfill');
				import('text-encoding-polyfill');
				import('react-native-url-polyfill/auto');
				const {decode, encode} = await import('base-64');
				
				if (!global.btoa) {
				  global.btoa = encode;
				}
				
				if (!global.atob) {
				  global.atob = decode;
				}
				
				const { MMKV } = import('react-native-mmkv');
				(global as any).mmkvStorage = MMKV as any;
				
				// See https://github.com/nodejs/node/issues/40678#issuecomment-1126944677
				class CustomEvent extends Event {
					readonly #detail;
					constructor(type: string, options?: CustomEventInit<any[]>) {
						super(type, options);
						this.#detail = options?.detail ?? null;
					}
					
					get detail() {
						return this.#detail;
					}
				}
				
				global.CustomEvent = CustomEvent as any;


				innertube_instance = await import("youtubei.js/react-native");
			} catch (e) {}
			break;
	}
	return innertube_instance;
}

export function innertube(): Innertube {
	if (innertube_instance) return innertube_instance;
    console.error(new Error("Native Module [innertube/InnerTube] is NOT loaded"));
	return innertube_instance;
}