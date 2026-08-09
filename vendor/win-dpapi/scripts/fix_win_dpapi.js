/* eslint-disable @typescript-eslint/no-require-imports */
const { existsSync } = require("fs");
const { execFileSync } = require("child_process");
const { join } = require("path");

if (process.platform !== "win32") process.exit(0);

const pkg_dir = join(__dirname, "..");
const binary_path = join(pkg_dir, "build", "Release", "node-dpapi.node");
const root = join(pkg_dir, "..", "..");
const node_gyp = join(root, "node_modules", "node-gyp", "bin", "node-gyp.js");

if (existsSync(binary_path)) {
	try {
		require(pkg_dir);
		process.exit(0);
	} catch {
		// binary present but broken (e.g. built against a different node ABI) - rebuild
	}
}

console.log("[fix_win_dpapi] building win-dpapi native module...");
execFileSync(process.execPath, [node_gyp, "rebuild"], { cwd: pkg_dir, stdio: "inherit" });
