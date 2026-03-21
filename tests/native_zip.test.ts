import { vi, describe, it, expect, beforeAll, afterAll } from "vitest";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

// Mock react-native-zip-stream to use adm-zip under the hood
vi.mock("react-native-zip-stream", async () => {
	const AdmZip = (await import("adm-zip")).default;
	return {
		listZipContents: async (file_path: string) => {
			const zip = new AdmZip(file_path);
			return zip.getEntries().map((e: any) => e.entryName as string);
		},
		streamFileFromZip: async (file_path: string, entry: string) => {
			const zip = new AdmZip(file_path);
			const data = zip.readFile(entry);
			if (!data) throw new Error(`Entry not found: ${entry}`);
			return data.buffer;
		},
		unzipFile: async (file_path: string, destination_path: string) => {
			const zip = new AdmZip(file_path);
			zip.extractAllTo(destination_path, true);
			return true;
		},
		createZipFile: async (destination_path: string, source_path: string) => {
			const zip = new AdmZip();
			zip.addLocalFolder(source_path);
			zip.writeZip(destination_path);
			return true;
		}
	};
});

import { node_zip } from "../roze/native/zip/zip.node";
import { mobile_zip } from "../roze/native/zip/zip.mobile";

const TEST_DIR = path.join(os.tmpdir(), "native_zip_test_" + Date.now());
let SOURCE_DIR: string;
let ZIP_PATH_NODE: string;
let ZIP_PATH_MOBILE: string;

beforeAll(() => {
	fs.mkdirSync(TEST_DIR, { recursive: true });
	SOURCE_DIR = path.join(TEST_DIR, "source");
	fs.mkdirSync(SOURCE_DIR, { recursive: true });
	fs.writeFileSync(path.join(SOURCE_DIR, "file1.txt"), "content of file1");
	fs.writeFileSync(path.join(SOURCE_DIR, "file2.txt"), "content of file2");
	ZIP_PATH_NODE = path.join(TEST_DIR, "test_node.zip");
	ZIP_PATH_MOBILE = path.join(TEST_DIR, "test_mobile.zip");
});

afterAll(() => {
	fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("native_zip", () => {
	describe("create_zip", () => {
		it("node: creates a zip file", async () => {
			const result = await node_zip.create_zip(SOURCE_DIR, ZIP_PATH_NODE);
			expect(result).toBe(true);
			expect(fs.existsSync(ZIP_PATH_NODE)).toBe(true);
			expect(fs.statSync(ZIP_PATH_NODE).size).toBeGreaterThan(0);
		});

		it("mobile: creates a zip file", async () => {
			const result = await mobile_zip.create_zip(SOURCE_DIR, ZIP_PATH_MOBILE);
			expect(result).toBe(true);
			expect(fs.existsSync(ZIP_PATH_MOBILE)).toBe(true);
		});
	});

	describe("list_entries", () => {
		it("node: lists entries in a zip", async () => {
			const entries = await node_zip.list_entries(ZIP_PATH_NODE);
			expect(Array.isArray(entries)).toBe(true);
			expect((entries as string[]).length).toBeGreaterThan(0);
		});

		it("mobile: lists entries in a zip", async () => {
			const entries = await mobile_zip.list_entries(ZIP_PATH_MOBILE);
			expect(Array.isArray(entries)).toBe(true);
			expect((entries as string[]).length).toBeGreaterThan(0);
		});

		it("node and mobile list same entries", async () => {
			const node_entries = (await node_zip.list_entries(ZIP_PATH_NODE)) as string[];
			const mobile_entries = (await mobile_zip.list_entries(ZIP_PATH_MOBILE)) as string[];
			expect(node_entries.sort()).toEqual(mobile_entries.sort());
		});
	});

	describe("extract_all", () => {
		it("node: extracts a zip", async () => {
			const dest = path.join(TEST_DIR, "extracted_node");
			fs.mkdirSync(dest, { recursive: true });
			const result = await node_zip.extract_all(ZIP_PATH_NODE, dest);
			expect(result).toBe(true);
			const extracted = fs.readdirSync(dest);
			expect(extracted.length).toBeGreaterThan(0);
		});

		it("mobile: extracts a zip", async () => {
			const dest = path.join(TEST_DIR, "extracted_mobile");
			fs.mkdirSync(dest, { recursive: true });
			const result = await mobile_zip.extract_all(ZIP_PATH_MOBILE, dest);
			expect(result).toBe(true);
		});
	});

	describe("stream_entry", () => {
		it("node: streams a zip entry as a Buffer", async () => {
			const entries = (await node_zip.list_entries(ZIP_PATH_NODE)) as string[];
			const first = entries[0];
			const data = await node_zip.stream_entry(ZIP_PATH_NODE, first);
			expect(data instanceof Buffer).toBe(true);
		});
	});
});
