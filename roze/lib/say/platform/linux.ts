import { generror } from "@common/utils/error_util";
import type { SayPlatformBase } from "./base";

export const SayPlatformLinux: SayPlatformBase = {
	get_voices: async () => [],
	speak: async (_: string, __?: string, ___?: number) => generror("NO LINUX SUPPORT"),
	export_batch: async (_: { text: string; export_path: string }[], __?: string, ___?: number) => generror("NO LINUX SUPPORT")
};
