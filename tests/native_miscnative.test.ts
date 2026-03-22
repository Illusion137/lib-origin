
import { vi, describe, it, expect } from "vitest";

// Mock expo-keep-awake for mobile impl
vi.mock("expo-keep-awake", () => ({
	activateKeepAwakeAsync: async () => { return }
}));

import { node_miscnative } from "../roze/native/miscnative/miscnative.node";
import { mobile_miscnative } from "../roze/native/miscnative/miscnative.mobile";

describe("native_miscnative", () => {
	describe("keep_mobile_awake", () => {
		it("node: resolves without error (no-op on node)", async () => {
			await expect(node_miscnative.keep_mobile_awake()).resolves.not.toThrow();
		});

		it("node: returns undefined (pure no-op)", async () => {
			const result = await node_miscnative.keep_mobile_awake();
			expect(result).toBeUndefined();
		});

		it("mobile: resolves without error", async () => {
			await expect(mobile_miscnative.keep_mobile_awake()).resolves.not.toThrow();
		});
	});

	describe("interface parity", () => {
		it("node and mobile expose same methods", () => {
			const node_keys = Object.keys(node_miscnative).sort();
			const mobile_keys = Object.keys(mobile_miscnative).sort();
			expect(node_keys).toEqual(mobile_keys);
		});

		it("keep_mobile_awake is a function on both", () => {
			expect(typeof node_miscnative.keep_mobile_awake).toBe("function");
			expect(typeof mobile_miscnative.keep_mobile_awake).toBe("function");
		});
	});
});
