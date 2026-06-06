import type { TurnstileSolver } from "@native/turnstile/turnstile.base";
import { get_native_platform } from "@native/native_mode";

let turnstile_instance: TurnstileSolver;

export async function load_native_turnstile(): Promise<TurnstileSolver> {
	if (turnstile_instance) return turnstile_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native TurnstileSolver is NOT implemented");
			break;
		case "NODE":
			try {
				turnstile_instance = (await import("./turnstile.node.ts")).node_turnstile;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				turnstile_instance = (await import("./turnstile.mobile.tsx")).mobile_turnstile;
			} catch (e) { console.error(e); }
			break;
	}
	return turnstile_instance;
}

export function turnstile(): TurnstileSolver {
	if (turnstile_instance) return turnstile_instance;
	console.error(new Error("Native Module [turnstile/TurnstileSolver] is NOT loaded"));
	return turnstile_instance;
}
