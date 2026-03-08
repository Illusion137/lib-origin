import type { PoTokenGenerator } from "@native/potoken/potoken.base";
import { get_native_platform } from "@native/native_mode";

let potoken_instance: PoTokenGenerator;

export async function load_native_potoken(): Promise<PoTokenGenerator>{
	if (potoken_instance) return potoken_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native PoTokenGenerator is NOT implemented");
			break;
		case "NODE":
			try {
				potoken_instance = (await import("./potoken.node.ts")).node_potoken;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				potoken_instance = (await import("./potoken.mobile.tsx")).mobile_potoken;
			} catch (e) { console.error(e); }
			break;
	}
	return potoken_instance;
}

export function potoken(): PoTokenGenerator {
	if (potoken_instance) return potoken_instance;
    console.error(new Error("Native Module [potoken/PoTokenGenerator] is NOT loaded"));
	return potoken_instance;
}