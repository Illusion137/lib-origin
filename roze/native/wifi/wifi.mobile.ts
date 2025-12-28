import type { WiFi } from "@native/wifi/wifi.base";

export const mobile_wifi: WiFi = {
    ip_address: async() => {
        return "";        
    },
    network_state: async() => {
        return "";        
    },
    wifi_connected: async() => {
        return true;
    },
    has_internet: async() => {
        return true;
    }
};
