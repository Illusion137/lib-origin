export type NativePlatform = "NODE" | "REACT_NATIVE" | "WEB";

export function get_native_platform(): NativePlatform {
	// if (typeof navigator === "object" && typeof navigator.userAgent === "string" && navigator.userAgent.includes("Electron")) return "ELECTRON_RENDERER";
	if (typeof document !== "undefined") return "WEB";
	if (typeof navigator !== "undefined" && (navigator as any).product === "ReactNative") return "REACT_NATIVE";
	return "NODE";
}
