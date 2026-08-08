import type { StudioAttestationGenerator } from "@native/studio_attestation/studio_attestation.base";
import { get_native_platform } from "@native/native_mode";

let studio_attestation_instance: StudioAttestationGenerator;

export async function load_native_studio_attestation(): Promise<StudioAttestationGenerator> {
	if (studio_attestation_instance) return studio_attestation_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native StudioAttestationGenerator is NOT implemented");
			break;
		case "NODE":
			try {
				studio_attestation_instance = (await import("./studio_attestation.node.ts")).node_studio_attestation;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				studio_attestation_instance = (await import("./studio_attestation.mobile.ts")).mobile_studio_attestation;
			} catch (e) { console.error(e); }
			break;
	}
	return studio_attestation_instance;
}

export function studio_attestation(): StudioAttestationGenerator {
	if (studio_attestation_instance) return studio_attestation_instance;
	console.error(new Error("Native Module [studio_attestation/StudioAttestationGenerator] is NOT loaded"));
	return studio_attestation_instance;
}