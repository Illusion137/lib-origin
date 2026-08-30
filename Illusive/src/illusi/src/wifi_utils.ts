import { load_native_network, network } from '@native/network/network';

export namespace Wifi {
    export async function ip_address() { await load_native_network(); return network().ip_address(); }
    export async function network_state() { await load_native_network(); return network().network_state(); }
    export async function wifi_connected() { await load_native_network(); return network().wifi_connected(); }
    export async function has_internet() { await load_native_network(); return network().has_internet(); }
    export async function is_connected() { await load_native_network(); return network().is_connected(); }
    export async function is_airplane_mode() { await load_native_network(); return network().is_airplane_mode(); }
    export async function wait_for_internet(timeout_ms?: number) { await load_native_network(); return network().wait_for_internet({ timeout_ms }); }
    export async function subscribe(listener: Parameters<ReturnType<typeof network>["subscribe"]>[0]) { await load_native_network(); return network().subscribe(listener); }
}
