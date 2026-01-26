import type { MiscNative } from "@native/miscnative/miscnative.base";
import { activateKeepAwakeAsync } from 'expo-keep-awake';

export const mobile_miscnative: MiscNative = {
    keep_mobile_awake: async() => {
        await activateKeepAwakeAsync();
    }
};
