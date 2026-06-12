import type { ScrapeFetch } from "@native/scrapefetch/scrapefetch.base";
import { get_native_platform } from "@native/native_mode";

let scrapefetch_instance: ScrapeFetch;

export async function load_native_scrapefetch(): Promise<ScrapeFetch> {
	if (scrapefetch_instance) return scrapefetch_instance;
	switch (get_native_platform()) {
		case "NODE":
			try {
				scrapefetch_instance = (await import("./scrapefetch.node.ts")).node_scrapefetch;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
		case "WEB":
			try {
				scrapefetch_instance = (await import("./scrapefetch.fallback.ts")).fallback_scrapefetch;
			} catch (e) { console.error(e); }
			break;
	}
	return scrapefetch_instance;
}

export function scrapefetch(): ScrapeFetch {
	if (scrapefetch_instance) return scrapefetch_instance;
	console.error(new Error("Native Module [scrapefetch/ScrapeFetch] is NOT loaded"));
	return scrapefetch_instance;
}
