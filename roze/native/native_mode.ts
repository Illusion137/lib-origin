export type NativePlatform = "NODE"|"REACT_NATIVE"|"WEB";

export function get_native_platform(): NativePlatform{
    return typeof document !== 'undefined' ? "WEB" : 
        typeof navigator !== 'undefined' && (navigator as any).product === 'ReactNative' ? "REACT_NATIVE" :
            "NODE";
}