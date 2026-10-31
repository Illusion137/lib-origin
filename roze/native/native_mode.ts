export type NativePlatform = "NODE" | "REACT_NATIVE" | "WEB";

export function get_native_platform(): NativePlatform {
	if (typeof process !== "undefined" && typeof process.versions === "object" && !!process.versions.electron) return "NODE";
	if (typeof document !== "undefined") return "WEB";
	if (typeof navigator !== "undefined" && (navigator as any).product === "ReactNative") return "REACT_NATIVE";
	return "NODE";
}
