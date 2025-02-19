import * as Network from 'expo-network';

export namespace Wifi {
    export async function ip_address() { return await Network.getIpAddressAsync(); }
    export async function network_state() { return await Network.getNetworkStateAsync(); }
    export async function wifi_connected() {
        const state = await network_state(); 
        return state.type === Network.NetworkStateType.WIFI;
    }
    export async function has_internet() {
        const state = await network_state(); 
        return !!state.isInternetReachable; 
    }
}