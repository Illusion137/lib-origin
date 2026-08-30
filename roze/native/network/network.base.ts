export type NetworkConnectionType = "WIFI" | "CELLULAR" | "ETHERNET" | "BLUETOOTH" | "WIMAX" | "VPN" | "OTHER" | "NONE" | "UNKNOWN";

export interface NetworkStateInfo {
    type: NetworkConnectionType;
    is_connected: boolean;
    is_internet_reachable: boolean;
}

export interface WaitForInternetOptions {
    timeout_ms?: number;
}

export interface Network {
    ip_address: () => Promise<string>;
    network_state: () => Promise<NetworkStateInfo>;
    wifi_connected: () => Promise<boolean>;
    has_internet: () => Promise<boolean>;
    is_connected: () => Promise<boolean>;
    is_airplane_mode: () => Promise<boolean>;
    wait_for_internet: (options?: WaitForInternetOptions) => Promise<boolean>;
    subscribe: (listener: (state: NetworkStateInfo) => void) => () => void;
}
