import os from "os";
import type { Network, NetworkStateInfo } from "@native/network/network.base";

function local_ip_address(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const entry of interfaces[name] ?? []) {
            if (entry.family === "IPv4" && !entry.internal) return entry.address;
        }
    }
    return "127.0.0.1";
}

const connected_state: NetworkStateInfo = {
    type: "UNKNOWN",
    is_connected: true,
    is_internet_reachable: true
};

export const node_network: Network = {
    ip_address: async () => local_ip_address(),
    network_state: async () => connected_state,
    wifi_connected: async () => false,
    has_internet: async () => true,
    is_connected: async () => true,
    is_airplane_mode: async () => false,
    wait_for_internet: async () => true,
    subscribe: () => () => { return; }
};
