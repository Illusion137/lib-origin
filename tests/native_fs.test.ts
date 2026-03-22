 
import { vi, describe, it, expect, beforeAll, afterAll } from "vitest";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

// Mock expo-file-system/legacy for mobile impl
vi.mock("expo-file-system/legacy", () => {
	const tmp = os.tmpdir();
	return {
		cacheDirectory: tmp + "/",
		documentDirectory: tmp + "/",
		readAsStringAsync: async (p: string) => fs.readFileSync(p, "utf8"),
		readDirectoryAsync: async (p: string) => fs.readdirSync(p),
		getInfoAsync: async (p: string) => {
			try {
				const stats = fs.statSync(p);
				return { exists: true, modificationTime: stats.mtimeMs / 1000, isDirectory: stats.isDirectory(), uri: p };
			} catch {
				return { exists: false, modificationTime: 0, isDirectory: false, uri: p };
			}
		},
		writeAsStringAsync: async (p: string, contents: string) => { fs.writeFileSync(p, contents, "utf8"); },
		moveAsync: async ({ from, to }: { from: string; to: string }) => { fs.renameSync(from, to); },
		copyAsync: async ({ from, to }: { from: string; to: string }) => { fs.cpSync(from, to, { recursive: true }); },
		makeDirectoryAsync: async (p: string) => { fs.mkdirSync(p); },
		deleteAsync: async (p: string) => { try { fs.rmSync(p, { recursive: true, force: true }); } catch {} },
		downloadAsync: async (_uri: string, to_path: string) => { fs.writeFileSync(to_path, ""); return { status: 200, uri: to_path }; }
	};
});

import { node_fs } from "../roze/native/fs/fs.node";
import { mobile_fs } from "../roze/native/fs/fs.mobile";

const TEST_DIR = path.join(os.tmpdir(), "native_fs_test_" + Date.now());

beforeAll(() => {
	fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterAll(() => {
	fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("native_fs", () => {
	describe("write_file_as_string + read_as_string", () => {
		it("node: writes and reads a file", async () => {
			const file = path.join(TEST_DIR, "node_write_read.txt");
			await node_fs.write_file_as_string(file, "hello node", { encoding: "utf8" });
			const result = await node_fs.read_as_string(file, { encoding: "utf8" });
			expect(result).toBe("hello node");
		});

		it("mobile: writes and reads a file", async () => {
			const file = path.join(TEST_DIR, "mobile_write_read.txt");
			await mobile_fs.write_file_as_string(file, "hello mobile", { encoding: "utf8" });
			const result = await mobile_fs.read_as_string(file, { encoding: "utf8" });
			expect(result).toBe("hello mobile");
		});

		it("node and mobile produce same result", async () => {
			const file_node = path.join(TEST_DIR, "parity_node.txt");
			const file_mobile = path.join(TEST_DIR, "parity_mobile.txt");
			const content = "parity test content";
			await node_fs.write_file_as_string(file_node, content, { encoding: "utf8" });
			await mobile_fs.write_file_as_string(file_mobile, content, { encoding: "utf8" });
			const node_result = await node_fs.read_as_string(file_node, { encoding: "utf8" });
			const mobile_result = await mobile_fs.read_as_string(file_mobile, { encoding: "utf8" });
			expect(node_result).toEqual(mobile_result);
		});
	});

	describe("make_directory", () => {
		it("node: creates a directory", async () => {
			const dir = path.join(TEST_DIR, "node_mkdir");
			await node_fs.make_directory(dir);
			expect(fs.existsSync(dir)).toBe(true);
		});

		it("mobile: creates a directory", async () => {
			const dir = path.join(TEST_DIR, "mobile_mkdir");
			await mobile_fs.make_directory(dir);
			expect(fs.existsSync(dir)).toBe(true);
		});
	});

	describe("get_info", () => {
		it("node: returns info for existing file", async () => {
			const file = path.join(TEST_DIR, "node_info.txt");
			fs.writeFileSync(file, "info test");
			const info = await node_fs.get_info(file);
			expect(info.exists).toBe(true);
			expect(info.is_directory).toBe(false);
			expect(info.uri).toBe(file);
		});

		it("node: returns not-exists for missing file", async () => {
			const info = await node_fs.get_info(path.join(TEST_DIR, "does_not_exist.txt"));
			expect(info.exists).toBe(false);
		});

		it("mobile: returns info for existing file", async () => {
			const file = path.join(TEST_DIR, "mobile_info.txt");
			fs.writeFileSync(file, "info test");
			const info = await mobile_fs.get_info(file);
			expect(info.exists).toBe(true);
			expect(info.is_directory).toBe(false);
		});

		it("node and mobile get_info shape is consistent", async () => {
			const file = path.join(TEST_DIR, "info_parity.txt");
			fs.writeFileSync(file, "x");
			const node_info = await node_fs.get_info(file);
			const mobile_info = await mobile_fs.get_info(file);
			expect(typeof node_info.exists).toBe(typeof mobile_info.exists);
			expect(typeof node_info.is_directory).toBe(typeof mobile_info.is_directory);
			expect(typeof node_info.uri).toBe(typeof mobile_info.uri);
		});
	});

	describe("remove", () => {
		it("node: removes a file", async () => {
			const file = path.join(TEST_DIR, "node_remove.txt");
			fs.writeFileSync(file, "bye");
			await node_fs.remove(file);
			expect(fs.existsSync(file)).toBe(false);
		});

		it("mobile: removes a file", async () => {
			const file = path.join(TEST_DIR, "mobile_remove.txt");
			fs.writeFileSync(file, "bye");
			await mobile_fs.remove(file);
			expect(fs.existsSync(file)).toBe(false);
		});
	});

	describe("temp_directory / document_directory", () => {
		it("node: temp_directory returns a string path", async () => {
			const p = await node_fs.temp_directory("test");
			expect(typeof p).toBe("string");
			expect(p.length).toBeGreaterThan(0);
		});

		it("mobile: temp_directory returns a string path", async () => {
			const p = await mobile_fs.temp_directory("test");
			expect(typeof p).toBe("string");
			expect(p.length).toBeGreaterThan(0);
		});
	});
});
