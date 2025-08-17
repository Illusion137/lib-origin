import { SayPlatformLinux } from "./platform/linux";
import { SayPlatformDarwin } from "./platform/darwin";
import { SayPlatformWin32 } from "./platform/win32";

const MACOS = "darwin";
const LINUX = "linux";
const WIN32 = "win32";

export const platforms = {
	WIN32: WIN32,
	MACOS: MACOS,
	LINUX: LINUX
} as const;
type Platform = (typeof platforms)[keyof typeof platforms];

function SayGeneric(platform?: Platform) {
	if (!platform) {
		platform = process.platform as Platform;
	}

	if (platform === MACOS) {
		return SayPlatformDarwin;
	} else if (platform === LINUX) {
		return SayPlatformLinux;
	} else if (platform === WIN32) {
		return SayPlatformWin32;
	}

	throw new Error(`new Say(): unsupported platorm! ${platform}`);
}

export default SayGeneric(); // Create a singleton automatically for backwards compatability
export const Say = SayGeneric; // Allow users to `say = new Say.Say(platform)`
