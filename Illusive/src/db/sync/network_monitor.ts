import NetInfo, { NetInfoCellularGeneration, NetInfoStateType, type NetInfoSubscription } from '@react-native-community/netinfo';
import * as Battery from 'expo-battery';

export class NetworkMonitor {
    private static instance: NetworkMonitor;

    static get_instance() {
        if (!this.instance) {
            this.instance = new NetworkMonitor();
        }
        return this.instance;
    }

    async is_good_time_to_sync(): Promise<boolean> {
        const [net_state, battery_level, battery_state] = await Promise.all([
            NetInfo.fetch(),
            Battery.getBatteryLevelAsync(),
            Battery.getBatteryStateAsync(),
        ]);

        // Good conditions:
        // - WiFi or good cellular connection
        // - Not on low battery (>20% or charging)
        const has_good_connection: boolean =
            (net_state.isConnected ?? false) &&
            (net_state.type === NetInfoStateType.wifi ||
                (net_state.type === NetInfoStateType.cellular && net_state.details?.cellularGeneration === NetInfoCellularGeneration['4g']));

        const has_sufficient_battery =
            battery_level > 0.2 ||
            battery_state === Battery.BatteryState.CHARGING;

        return has_good_connection && has_sufficient_battery;
    }

    on_network_change(callback: (isGoodTime: boolean) => void): NetInfoSubscription {
        return NetInfo.addEventListener(async () => {
            const is_good_time = await this.is_good_time_to_sync();
            callback(is_good_time);
        });
    }
}