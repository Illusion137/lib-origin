/**
 * bundle_native.ts
 *
 * Packages roze/native as a standalone @roze/native npm package.
 *
 * Usage:
 *   ts-node -T scripts/bundle_native.ts
 *
 * Output: dist-roze-native/
 */

import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(__dirname, "..");
const NATIVE_SRC = path.join(REPO_ROOT, "roze", "native");
const COMMON_SRC = path.join(REPO_ROOT, "common");
const LIB_SRC = path.join(REPO_ROOT, "roze", "lib");
const OUT_DIR = path.join(REPO_ROOT, "dist-roze-native");

const ROOT_PKG = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
};

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function walk_ts(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];
    const results: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...walk_ts(full));
        } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
            results.push(full);
        }
    }
    return results;
}

function ensure_dir(p: string) {
    fs.mkdirSync(p, { recursive: true });
}

function resolve_pkg_version(pkg: string): string {
    const all = { ...(ROOT_PKG.dependencies ?? {}), ...(ROOT_PKG.devDependencies ?? {}) };
    return all[pkg] ?? "*";
}

// ---------------------------------------------------------------------------
// Import rewriting
// ---------------------------------------------------------------------------

/**
 * Given the output file path (relative to OUT_DIR) and an import specifier,
 * returns the rewritten specifier.
 *
 * Rules:
 *   @native/foo/bar  → relative path within package
 *   @common/foo/bar  → relative path to common/ subdir
 *   @lib/foo/bar     → relative path to lib/ subdir
 *   anything else    → unchanged (external npm dep)
 */
function rewrite_import(specifier: string, out_file_abs: string): string {
    const out_file_dir = path.dirname(out_file_abs);

    if (specifier.startsWith("@native/")) {
        const sub = specifier.slice("@native/".length); // e.g. "fs/fs.base"
        const target = path.join(OUT_DIR, sub);
        let rel = path.relative(out_file_dir, target);
        if (!rel.startsWith(".")) rel = "./" + rel;
        return rel;
    }

    if (specifier.startsWith("@common/")) {
        const sub = specifier.slice("@common/".length);
        const target = path.join(OUT_DIR, "common", sub);
        let rel = path.relative(out_file_dir, target);
        if (!rel.startsWith(".")) rel = "./" + rel;
        return rel;
    }

    if (specifier.startsWith("@lib/")) {
        const sub = specifier.slice("@lib/".length);
        const target = path.join(OUT_DIR, "lib", sub);
        let rel = path.relative(out_file_dir, target);
        if (!rel.startsWith(".")) rel = "./" + rel;
        return rel;
    }

    return specifier; // external npm package — leave as-is
}

/**
 * Collects all import/require specifiers from source text.
 * Returns: { external_pkgs: string[], needs_common: boolean, needs_lib: boolean }
 */
function analyze_imports(source: string): { external_pkgs: string[]; needs_common: boolean; needs_lib: boolean } {
    const external_pkgs: string[] = [];
    let needs_common = false;
    let needs_lib = false;

    const import_re = /(?:import|export)\s+(?:type\s+)?(?:[\w*{},\s]+\s+from\s+)?['"]([@\w][^'"]+)['"]/g;
    const require_re = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

    function process_specifier(spec: string) {
        if (spec.startsWith("@native/")) return;
        if (spec.startsWith("@common/")) { needs_common = true; return; }
        if (spec.startsWith("@lib/")) { needs_lib = true; return; }
        if (spec.startsWith(".")) return; // relative — skip
        // External npm: take package name (handle @scope/pkg and plain pkg)
        let pkg_name: string;
        if (spec.startsWith("@")) {
            const parts = spec.split("/");
            pkg_name = parts.slice(0, 2).join("/");
        } else {
            pkg_name = spec.split("/")[0];
        }
        if (!external_pkgs.includes(pkg_name)) {
            external_pkgs.push(pkg_name);
        }
    }

    let m: RegExpExecArray | null;
    while ((m = import_re.exec(source)) !== null) process_specifier(m[1]);
    while ((m = require_re.exec(source)) !== null) process_specifier(m[1]);

    return { external_pkgs, needs_common, needs_lib };
}

/**
 * Rewrites all @native, @common, @lib alias imports in source text to relative.
 */
function rewrite_source(source: string, out_file_abs: string): string {
    // Match both import/export ... from "specifier" and require("specifier")
    let result = source;

    result = result.replace(
        /(\bfrom\s+)(['"])([@.\w/][^'"]*)\2/g,
        (_match, from_kw, quote, spec) => {
            const rewritten = rewrite_import(spec, out_file_abs);
            return `${from_kw}${quote}${rewritten}${quote}`;
        }
    );

    result = result.replace(
        /(\brequire\s*\(\s*)(['"])([@.\w/][^'"]*)\2(\s*\))/g,
        (_match, req_start, quote, spec, req_end) => {
            const rewritten = rewrite_import(spec, out_file_abs);
            return `${req_start}${quote}${rewritten}${quote}${req_end}`;
        }
    );

    // Also handle: import type { ... } from "..."
    result = result.replace(
        /(\bimport\s+type\s+[^"']*from\s+)(['"])([@.\w/][^'"]*)\2/g,
        (_match, prefix, quote, spec) => {
            const rewritten = rewrite_import(spec, out_file_abs);
            return `${prefix}${quote}${rewritten}${quote}`;
        }
    );

    return result;
}

// ---------------------------------------------------------------------------
// Copy & process a tree of files
// ---------------------------------------------------------------------------

function copy_tree(src_dir: string, out_subdir: string, src_root_for_relative: string): Set<string> {
    const files = walk_ts(src_dir);
    const extra_common = new Set<string>();

    for (const abs_src of files) {
        const rel_to_src = path.relative(src_root_for_relative, abs_src);
        const out_abs = path.join(out_subdir, rel_to_src);
        ensure_dir(path.dirname(out_abs));
        const source = fs.readFileSync(abs_src, "utf8");
        const rewritten = rewrite_source(source, out_abs);
        fs.writeFileSync(out_abs, rewritten, "utf8");
        // If this file (from lib or common) itself references @common, track it
        const { needs_common } = analyze_imports(source);
        if (needs_common) extra_common.add(abs_src);
    }

    return extra_common;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    console.log("=== bundle_native ===");
    console.log(`Source:  ${NATIVE_SRC}`);
    console.log(`Output:  ${OUT_DIR}`);

    // --- Clean output ---
    if (fs.existsSync(OUT_DIR)) {
        fs.rmSync(OUT_DIR, { recursive: true, force: true });
    }
    ensure_dir(OUT_DIR);

    // --- Pass 1: Analyze all roze/native files ---
    const native_files = walk_ts(NATIVE_SRC);
    const all_external_pkgs = new Set<string>();
    let needs_common = false;
    let needs_lib = false;

    for (const f of native_files) {
        const source = fs.readFileSync(f, "utf8");
        const info = analyze_imports(source);
        for (const p of info.external_pkgs) all_external_pkgs.add(p);
        if (info.needs_common) needs_common = true;
        if (info.needs_lib) needs_lib = true;
    }

    console.log(`\nExternal npm deps discovered (${all_external_pkgs.size}):`);
    for (const p of [...all_external_pkgs].sort()) console.log(`  ${p}`);
    console.log(`Needs @common: ${needs_common}, Needs @lib: ${needs_lib}`);

    // --- Pass 2: Copy roze/native/ → OUT_DIR/ (rewriting imports) ---
    console.log("\nCopying roze/native/ ...");
    copy_tree(NATIVE_SRC, OUT_DIR, NATIVE_SRC);

    // --- Pass 3: Copy common/ → OUT_DIR/common/ ---
    if (needs_common) {
        console.log("Copying common/ ...");
        copy_tree(COMMON_SRC, path.join(OUT_DIR, "common"), COMMON_SRC);
        // Analyze common for its own deps
        for (const f of walk_ts(COMMON_SRC)) {
            const { external_pkgs } = analyze_imports(fs.readFileSync(f, "utf8"));
            for (const p of external_pkgs) all_external_pkgs.add(p);
        }
    }

    // --- Pass 4: Copy roze/lib/ → OUT_DIR/lib/ ---
    if (needs_lib) {
        console.log("Copying roze/lib/ ...");
        copy_tree(LIB_SRC, path.join(OUT_DIR, "lib"), LIB_SRC);
        // Analyze lib for its own deps
        for (const f of walk_ts(LIB_SRC)) {
            const { external_pkgs, needs_common: lib_needs_common } = analyze_imports(fs.readFileSync(f, "utf8"));
            for (const p of external_pkgs) all_external_pkgs.add(p);
            if (lib_needs_common && !needs_common) {
                needs_common = true;
                console.log("  (lib/ references @common — copying common/ too)");
                copy_tree(COMMON_SRC, path.join(OUT_DIR, "common"), COMMON_SRC);
            }
        }
    }

    // --- Generate package.json ---
    const deps: Record<string, string> = {};
    // Remove node built-ins that aren't real npm packages
    const NODE_BUILTINS = new Set(["fs", "path", "os", "child_process", "stream", "events", "util", "crypto", "http", "https", "buffer", "url", "assert", "net", "tls", "dns", "zlib"]);
    for (const pkg of [...all_external_pkgs].sort()) {
        if (NODE_BUILTINS.has(pkg)) continue;
        deps[pkg] = resolve_pkg_version(pkg);
    }

    const pkg_json = {
        name: "@roze/native",
        version: "1.0.0",
        description: "Cross-platform native modules for roze (node + react-native)",
        main: "gen/load_native_modules.ts",
        types: "gen/load_native_modules.ts",
        license: "MIT",
        dependencies: deps
    };

    fs.writeFileSync(path.join(OUT_DIR, "package.json"), JSON.stringify(pkg_json, null, 2) + "\n", "utf8");
    console.log("\nGenerated package.json");

    // --- Generate tsconfig.json ---
    const tsconfig = {
        compilerOptions: {
            target: "esnext",
            module: "commonjs",
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            allowSyntheticDefaultImports: true,
            allowImportingTsExtensions: true,
            noEmit: true,
            jsx: "react-native"
        },
        exclude: ["node_modules"]
    };
    fs.writeFileSync(path.join(OUT_DIR, "tsconfig.json"), JSON.stringify(tsconfig, null, 2) + "\n", "utf8");
    console.log("Generated tsconfig.json");

    // --- Generate README.md ---
    const readme = `# @roze/native

Cross-platform native module bindings for node.js and React Native.

## Installation

\`\`\`bash
npm install @roze/native
# or
yarn add @roze/native
\`\`\`

## Metro configuration

Add the following blockList to your \`metro.config.js\` to prevent Metro from
trying to bundle the \`.node.ts\` (Node.js-only) implementation files:

\`\`\`js
const { getDefaultConfig } = require('expo/metro-config');
const { makeMetroConfig } = require('@rnx-kit/metro-config');

module.exports = makeMetroConfig({
    ...getDefaultConfig(__dirname),
    resolver: {
        blockList: [/(\\/node_modules\\/@roze\\/native\\/.+?\\/.+?\\.node\\.ts)$/]
    }
});
\`\`\`

## tsconfig paths

Add the following to your \`tsconfig.json\` to resolve \`@native/*\` imports:

\`\`\`json
{
    "compilerOptions": {
        "paths": {
            "@native/*": ["./node_modules/@roze/native/*"]
        }
    }
}
\`\`\`

## Usage

\`\`\`typescript
import { load_native_modules } from "@roze/native/gen/load_native_modules";

await load_native_modules();
\`\`\`
`;
    fs.writeFileSync(path.join(OUT_DIR, "README.md"), readme, "utf8");
    console.log("Generated README.md");

    // --- Summary ---
    const all_out = walk_ts(OUT_DIR);
    console.log(`\n=== Done ===`);
    console.log(`Output directory: ${OUT_DIR}`);
    console.log(`Total files: ${all_out.length}`);
    console.log(`Dependencies: ${Object.keys(deps).length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
