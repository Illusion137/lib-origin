import type { Network } from "@native/network/network.base";
import { get_native_platform } from "@native/native_mode";

let network_instance: Network;

export async function load_native_network(): Promise<Network>{
	if (network_instance) return network_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native Network is NOT implemented");
			break;
		case "NODE":
			try {
				network_instance = (await import("./network.node.ts")).node_network;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				network_instance = (await import("./network.mobile.ts")).mobile_network;
			} catch (e) { console.error(e); }
			break;
	}
	return network_instance;
}

export function network(): Network {
	if (network_instance) return network_instance;
    console.error(new Error("Native Module [network/Network] is NOT loaded"));
	return network_instance;
}
