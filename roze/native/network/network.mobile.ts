import * as ExpoNetwork from 'expo-network';
import type { Network, NetworkConnectionType, NetworkStateInfo, WaitForInternetOptions } from "@native/network/network.base";

function map_type(type?: ExpoNetwork.NetworkStateType): NetworkConnectionType {
    switch (type) {
        case ExpoNetwork.NetworkStateType.WIFI: return "WIFI";
        case ExpoNetwork.NetworkStateType.CELLULAR: return "CELLULAR";
        case ExpoNetwork.NetworkStateType.ETHERNET: return "ETHERNET";
        case ExpoNetwork.NetworkStateType.BLUETOOTH: return "BLUETOOTH";
        case ExpoNetwork.NetworkStateType.WIMAX: return "WIMAX";
        case ExpoNetwork.NetworkStateType.VPN: return "VPN";
        case ExpoNetwork.NetworkStateType.OTHER: return "OTHER";
        case ExpoNetwork.NetworkStateType.NONE: return "NONE";
        case ExpoNetwork.NetworkStateType.UNKNOWN:
        case undefined:
        default: return "UNKNOWN";
    }
}

function to_state(state: ExpoNetwork.NetworkState): NetworkStateInfo {
    return {
        type: map_type(state.type),
        is_connected: !!state.isConnected,
        is_internet_reachable: !!state.isInternetReachable
    };
}

export const mobile_network: Network = {
    ip_address: async () => ExpoNetwork.getIpAddressAsync(),
    network_state: async () => to_state(await ExpoNetwork.getNetworkStateAsync()),
    wifi_connected: async () => (await ExpoNetwork.getNetworkStateAsync()).type === ExpoNetwork.NetworkStateType.WIFI,
    has_internet: async () => !!(await ExpoNetwork.getNetworkStateAsync()).isInternetReachable,
    is_connected: async () => !!(await ExpoNetwork.getNetworkStateAsync()).isConnected,
    is_airplane_mode: async () => {
        try { return await ExpoNetwork.isAirplaneModeEnabledAsync(); }
        catch { return false; }
    },
    wait_for_internet: async (options?: WaitForInternetOptions) => {
        if ((await ExpoNetwork.getNetworkStateAsync()).isInternetReachable ?? false) return true;
        const timeout_ms = options?.timeout_ms ?? 30000;
        return new Promise<boolean>(resolve => {
            let settled = false;
            const finish = (value: boolean) => {
                if (settled) return;
                settled = true;
                subscription.remove();
                clearTimeout(timer);
                resolve(value);
            };
            const subscription = ExpoNetwork.addNetworkStateListener(event => {
                if (event.isInternetReachable) finish(true);
            });
            const timer = setTimeout(() => finish(false), timeout_ms);
        });
    },
    subscribe: (listener) => {
        const subscription = ExpoNetwork.addNetworkStateListener(event => listener(to_state(event)));
        return () => subscription.remove();
    }
};
