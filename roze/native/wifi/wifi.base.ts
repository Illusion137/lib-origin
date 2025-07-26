export interface WiFi {
    ip_address:     () => Promise<string>;
    network_state:  () => Promise<string>;
    wifi_connected: () => Promise<boolean>;
    has_internet:   () => Promise<boolean>;
}