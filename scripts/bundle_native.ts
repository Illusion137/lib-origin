/**
 * bundle_native.ts
 *
 * Packages @sumi/native as a standalone @sumi137/roze npm package.
 *
 * Usage:
 *   ts-node -T scripts/bundle_native.ts
 *
 * Output: dist-roze-native/
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

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

function resolve_pkg_version(pkg: string): string | null {
    const all = { ...(ROOT_PKG.dependencies ?? {}), ...(ROOT_PKG.devDependencies ?? {}) };
    return all[pkg] ?? null;
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

    // Relative imports: rewrite .ts/.tsx extensions to .js for compiled output
    if (specifier.startsWith(".")) {
        return specifier.replace(/\.tsx?$/, ".js");
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

    // Handle dynamic imports: import("...")
    result = result.replace(
        /(\bimport\s*\(\s*)(['"])([@.\w/][^'"]*)\2(\s*\))/g,
        (_match, import_start, quote, spec, import_end) => {
            const rewritten = rewrite_import(spec, out_file_abs);
            return `${import_start}${quote}${rewritten}${quote}${import_end}`;
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
        const version = resolve_pkg_version(pkg);
        if (version === null) continue; // internal/private — not on npm
        deps[pkg] = version;
    }

    const pkg_json = {
        name: "@sumi137/native",
        version: "1.0.3",
        description: "Cross-platform native modules for roze (node + react-native)",
        main: "index.ts",
        types: "index.ts",
        license: "MIT",
        dependencies: deps
    };

    fs.writeFileSync(path.join(OUT_DIR, "package.json"), JSON.stringify(pkg_json, null, 2) + "\n", "utf8");
    console.log("\nGenerated package.json");

    // --- Generate tsconfig.json ---
    const tsconfig = {
        compilerOptions: {
            target: "es2020",
            module: "commonjs",
            moduleResolution: "node",
            strict: false,
            esModuleInterop: true,
            skipLibCheck: true,
            allowSyntheticDefaultImports: true,
            outDir: "./",
            declaration: true,
            declarationMap: true,
            jsx: "react-native",
            noImplicitAny: false,
            resolveJsonModule: true
        },
        exclude: ["node_modules"]
    };
    fs.writeFileSync(path.join(OUT_DIR, "tsconfig.json"), JSON.stringify(tsconfig, null, 2) + "\n", "utf8");
    console.log("Generated tsconfig.json");

    // --- Generate README.md ---
    const readme = `# @sumi137/native

Cross-platform native module bindings for Node.js and React Native.

## Installation

\`\`\`bash
npm install @sumi137/native
# or
yarn add @sumi137/native
\`\`\`

## Metro configuration

Add the following blockList to your \`metro.config.js\` to prevent Metro from
trying to bundle the \`.node.ts\` (Node.js-only) implementation files:

\`\`\`js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = {
    ...config,
    resolver: {
        ...config.resolver,
        blockList: [/(\\/node_modules\\/@sumi137\\/native\\/.+?\\/.+?\\.node\\.ts)$/]
    }
};
\`\`\`

## tsconfig paths

Add the following to your \`tsconfig.json\` to resolve \`@native/*\` imports:

\`\`\`json
{
    "compilerOptions": {
        "paths": {
            "@native/*": ["./node_modules/@sumi137/native/*"]
        }
    }
}
\`\`\`

## Usage

Initialize all native modules at startup:

\`\`\`typescript
import { load_native_modules } from "@sumi137/native";

await load_native_modules();
\`\`\`

Or load individual modules as needed:

\`\`\`typescript
import { load_native_fs, fs } from "@sumi137/native/fs/fs";
import { load_native_zip, zip } from "@sumi137/native/zip/zip";

await load_native_fs();
await load_native_zip();
\`\`\`

### File System

\`\`\`typescript
import { fs } from "@sumi137/native/fs/fs";

const contents = await fs().read_as_string("/path/to/file.txt", { encoding: "utf8" });
await fs().write_file_as_string("/path/to/output.txt", "hello", { encoding: "utf8" });

const files = await fs().read_directory("/some/dir");
const info = await fs().get_info("/path/to/file.txt");

await fs().copy("/src.txt", "/dst.txt", {});
await fs().move("/old.txt", "/new.txt", {});
await fs().remove("/path/to/file.txt");

const downloaded = await fs().download_to_file("https://example.com/file.zip");
\`\`\`

### Zip

\`\`\`typescript
import { zip } from "@sumi137/native/zip/zip";

const entries = await zip().list_entries("archive.zip");
const buffer = await zip().stream_entry("archive.zip", "path/inside/archive.txt");
await zip().extract_all("archive.zip", "./output/");
await zip().create_zip("./source_dir/", "output.zip");
\`\`\`

### FFmpeg / FFprobe

\`\`\`typescript
import { ffmpeg } from "@sumi137/native/ffmpeg/ffmpeg";
import { ffprobe } from "@sumi137/native/ffprobe/ffprobe";

const result = await ffmpeg().execute_args(
    ["-i", "input.mp3", "-ac", "1", "output.wav"],
    (stats) => console.log(\\\`Progress: \\\${stats.time_seconds}s, speed: \\\${stats.speed}x\\\`)
);
await result.retcode; // 0 = success

const probe = await ffprobe().execute_args(["-i", "input.mp3", "-show_format", "-print_format", "json"]);
\`\`\`

### Voice Synth

\`\`\`typescript
import { load_native_voice_synth, voice_synth } from "@sumi137/native/voice_synth/voice_synth";

await load_native_voice_synth(); // not included in load_native_modules()

const voices = await voice_synth().get_voices();
await voice_synth().speak("Hello world", { voice_bank: voices[0], rate: 1.0 });

// Export speech to files
await voice_synth().speak_export(
    [{ text: "Chapter one.", export_path: "/tmp/ch1.wav" }],
    { voice_bank: voices[0] }
);
\`\`\`

### Audio Duration

\`\`\`typescript
import { get_audio_duration } from "@sumi137/native/get_audio_duration/get_audio_duration";

const seconds = await get_audio_duration().get_audio_duration("/path/to/audio.mp3");
\`\`\`

### MMKV (Key-Value Storage)

\`\`\`typescript
import { mmkv } from "@sumi137/native/mmkv/mmkv";

await mmkv().load_mmkv({ id: "my-store" });

await mmkv().set_string("key", "value");
const val = await mmkv().get_string("key"); // "value" | undefined

await mmkv().set_boolean("flag", true);
await mmkv().set_number("count", 42);

const keys = await mmkv().get_keys();
await mmkv().remove_key("key");
\`\`\`

### Document Picker (React Native only)

\`\`\`typescript
import { document_picker } from "@sumi137/native/document_picker/document_picker";

const file = await document_picker().pick_file();
if (!("error" in file)) {
    console.log(file.name, file.extension, file.size_bytes);
}

const dir = await document_picker().pick_directory();
\`\`\`

## Modules

| Module | Description |
|--------|-------------|
| \\\`fs\\\` | Cross-platform file system operations |
| \\\`zip\\\` | ZIP archive read/write/extract |
| \\\`ffmpeg\\\` | FFmpeg execution with progress callbacks |
| \\\`ffprobe\\\` | FFprobe media inspection |
| \\\`voice_synth\\\` | Text-to-speech synthesis (loaded separately) |
| \\\`get_audio_duration\\\` | Audio duration extraction |
| \\\`mmkv\\\` | High-performance key-value storage |
| \\\`document_picker\\\` | File/directory picker (React Native) |
| \\\`miscnative\\\` | Misc native ops (e.g. keep screen awake) |
| \\\`potoken\\\` | YouTube PoToken generation |
| \\\`sabr_downloader\\\` | YouTube SABR protocol downloader |
| \\\`jseval\\\` | JavaScript evaluation in WebView context |
`;
    fs.writeFileSync(path.join(OUT_DIR, "README.md"), readme, "utf8");
    console.log("Generated README.md");

    // --- Generate index.ts (root entry point) ---
    const index_ts = `export { load_native_modules } from "./gen/load_native_modules";\n`;
    fs.writeFileSync(path.join(OUT_DIR, "index.ts"), index_ts, "utf8");
    console.log("Generated index.ts");

    // --- Compile TypeScript to JavaScript ---
    console.log("\nCompiling TypeScript to JavaScript...");
    try {
        // First pass: transpile to JavaScript (ignoring type errors with --skipLibCheck and --noEmitOnError false)
        execSync(
            `tsc --project ${path.join(OUT_DIR, "tsconfig.json")} --declaration --declarationMap --noEmitOnError false`,
            {
                stdio: "inherit",
                cwd: OUT_DIR
            }
        );
        console.log("Compilation complete");
    } catch (e) {
        console.error("TypeScript compilation had errors (continuing anyway):", (e as Error).message.split('\n')[0]);
        // Try again with transpileOnly mode
        try {
            execSync(
                `tsc --project ${path.join(OUT_DIR, "tsconfig.json")} --declaration --declarationMap --noCheck`,
                {
                    stdio: "inherit",
                    cwd: OUT_DIR
                }
            );
        } catch (_) {
            console.error("Second compilation attempt also failed");
        }
    }

    // --- Fix imports in generated .ts files to use .js extensions ---
    console.log("Updating imports in TypeScript source to reference .js...");
    const ts_files_pre = walk_ts(OUT_DIR);
    let fixed_count = 0;
    for (const ts_file of ts_files_pre) {
        const source = fs.readFileSync(ts_file, "utf8");
        // Update imports to use .js extensions for compiled modules
        const fixed = source
            .replace(/require\s*\(\s*["']([^"']+)\.tsx?["']\s*\)/g, 'require("$1.js")')
            .replace(/from\s+["']([^"']+)\.tsx?["']/g, 'from "$1.js"')
            .replace(/import\s*\(\s*["']([^"']+)\.tsx?["']\s*\)/g, 'import("$1.js")');
        if (source !== fixed) {
            fs.writeFileSync(ts_file, fixed, "utf8");
            fixed_count++;
        }
    }
    console.log(`Updated imports in ${fixed_count} TypeScript files`);

    // --- Fix imports in compiled .js files to use .js extensions instead of .ts ---
    console.log("Fixing .ts references in compiled JavaScript...");
    const js_files: string[] = [];
    function walk_js(dir: string) {
        if (!fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk_js(full);
            } else if (entry.isFile() && entry.name.endsWith(".js")) {
                js_files.push(full);
            }
        }
    }
    walk_js(OUT_DIR);

    let js_files_fixed = 0;
    for (const js_file of js_files) {
        const source = fs.readFileSync(js_file, "utf8");
        // Replace .ts and .tsx extensions with .js in all contexts
        const fixed = source
            .replace(/require\s*\(\s*["']([^"']+)\.tsx?["']\s*\)/g, 'require("$1.js")')
            .replace(/from\s+["']([^"']+)\.tsx?["']/g, 'from "$1.js"')
            .replace(/__importStar\s*\(\s*require\s*\(\s*["']([^"']+)\.tsx?["']/g, '__importStar(require("$1.js"')
            .replace(/import\s*\(\s*["']([^"']+)\.tsx?["']\s*\)/g, 'import("$1.js")');
        if (source !== fixed) {
            fs.writeFileSync(js_file, fixed, "utf8");
            js_files_fixed++;
        }
    }
    console.log(`Fixed .ts references in ${js_files_fixed} compiled JavaScript files`);

    // --- Update package.json to point to compiled JS with types from .ts ---
    const compiled_pkg_json = {
        ...pkg_json,
        main: "index.js",
        types: "index.d.ts"
    };
    fs.writeFileSync(path.join(OUT_DIR, "package.json"), JSON.stringify(compiled_pkg_json, null, 2) + "\n", "utf8");
    console.log("Updated package.json to point to compiled JavaScript with type definitions");

    // --- Summary ---
    walk_ts(OUT_DIR);
    const js_count = fs.readdirSync(OUT_DIR, { recursive: true })
        .filter((f) => typeof f === 'string' && f.endsWith('.js')).length;
    const dts_count = fs.readdirSync(OUT_DIR, { recursive: true })
        .filter((f) => typeof f === 'string' && f.endsWith('.d.ts')).length;
    console.log(`\n=== Done ===`);
    console.log(`Output directory: ${OUT_DIR}`);
    console.log(`JavaScript files: ${js_count}`);
    console.log(`Declaration files: ${dts_count}`);
    console.log(`Dependencies: ${Object.keys(deps).length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
