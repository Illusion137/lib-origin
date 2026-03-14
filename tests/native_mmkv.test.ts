/* eslint-disable @typescript-eslint/consistent-type-imports */
import { vi, describe, it, expect, beforeAll } from "vitest";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

// In-memory store backing the mobile mock
const _store: Record<string, any> = {};

vi.mock("react-native-mmkv", () => {
	class MMKV {
		set(key: string, value: any) { _store[key] = value; }
		getString(key: string) { return typeof _store[key] === "string" ? _store[key] : undefined; }
		getBoolean(key: string) { return typeof _store[key] === "boolean" ? _store[key] : undefined; }
		getNumber(key: string) { return typeof _store[key] === "number" ? _store[key] : undefined; }
		contains(key: string) { return key in _store; }
		getAllKeys() { return Object.keys(_store); }
		delete(key: string) { delete _store[key]; }
		clearAll() { for (const k of Object.keys(_store)) delete _store[k]; }
	}
	return { MMKV };
});

import { node_mmkv } from "../roze/native/mmkv/mmkv.node";
import { mobile_mmkv } from "../roze/native/mmkv/mmkv.mobile";

const MMKV_TEST_DIR = path.join(os.tmpdir(), "mmkv_test_" + Date.now());

beforeAll(async () => {
	fs.mkdirSync(MMKV_TEST_DIR, { recursive: true });
	await node_mmkv.load_mmkv({ id: "test", path: MMKV_TEST_DIR });
	await mobile_mmkv.load_mmkv({});
	// Clear state
	await node_mmkv.clear_all();
	await mobile_mmkv.clear_all();
});

describe("native_mmkv", () => {
	describe("set_string / get_string", () => {
		it("node: stores and retrieves a string", async () => {
			await node_mmkv.set_string("node_str", "hello");
			const val = await node_mmkv.get_string("node_str");
			expect(val).toBe("hello");
		});

		it("mobile: stores and retrieves a string", async () => {
			await mobile_mmkv.set_string("mobile_str", "world");
			const val = await mobile_mmkv.get_string("mobile_str");
			expect(val).toBe("world");
		});

		it("node: set_string returns the value", async () => {
			const ret = await node_mmkv.set_string("ret_str", "value");
			expect(ret).toBe("value");
		});

		it("mobile: set_string returns the value", async () => {
			const ret = await mobile_mmkv.set_string("ret_str", "value");
			expect(ret).toBe("value");
		});
	});

	describe("set_boolean / get_boolean", () => {
		it("node: stores and retrieves a boolean", async () => {
			await node_mmkv.set_boolean("node_bool", true);
			const val = await node_mmkv.get_boolean("node_bool");
			expect(val).toBe(true);
		});

		it("mobile: stores and retrieves a boolean", async () => {
			await mobile_mmkv.set_boolean("mobile_bool", false);
			const val = await mobile_mmkv.get_boolean("mobile_bool");
			expect(val).toBe(false);
		});
	});

	describe("contains_key", () => {
		it("node: returns true for existing key", async () => {
			await node_mmkv.set_string("exists_node", "yes");
			expect(await node_mmkv.contains_key("exists_node")).toBe(true);
		});

		it("node: returns false for missing key", async () => {
			expect(await node_mmkv.contains_key("definitely_missing_" + Date.now())).toBe(false);
		});

		it("mobile: returns true for existing key", async () => {
			await mobile_mmkv.set_string("exists_mobile", "yes");
			expect(await mobile_mmkv.contains_key("exists_mobile")).toBe(true);
		});
	});

	describe("remove_key", () => {
		it("node: removes a key", async () => {
			await node_mmkv.set_string("rm_node", "bye");
			await node_mmkv.remove_key("rm_node");
			expect(await node_mmkv.contains_key("rm_node")).toBe(false);
		});

		it("mobile: removes a key", async () => {
			await mobile_mmkv.set_string("rm_mobile", "bye");
			await mobile_mmkv.remove_key("rm_mobile");
			expect(await mobile_mmkv.contains_key("rm_mobile")).toBe(false);
		});
	});

	describe("interface parity", () => {
		it("node and mobile both implement all expected methods", () => {
			const methods = ["load_mmkv", "set_string", "get_string", "set_boolean", "get_boolean", "set_number", "get_number", "contains_key", "get_keys", "remove_key", "clear_memory_cache", "clear_all"];
			for (const m of methods) {
				expect(typeof (node_mmkv as any)[m]).toBe("function");
				expect(typeof (mobile_mmkv as any)[m]).toBe("function");
			}
		});
	});
});
