// Bundles bgutils-js into a browser IIFE and writes the result as a TS string export.
// Run: yarn gen_bgutils_bundle
import esbuild from "esbuild";
import * as nodefs from "fs";
import * as path from "path";

async function main() {
    const result = await esbuild.build({
        entryPoints: ["roze/native/potoken/bgutils_entry.ts"],
        bundle: true,
        format: "iife",
        globalName: "__bgutils__",
        write: false,
        platform: "browser",
        minify: true,
        target: ["es2017"]
    });

    const bundle = result.outputFiles[0].text;
    const output = `// AUTO-GENERATED — do not edit. Run \`yarn gen_bgutils_bundle\` to regenerate.\nexport const BGUTILS_BUNDLE_JS = ${JSON.stringify(bundle)};\n`;
    nodefs.writeFileSync(path.join("roze", "native", "potoken", "bgutils_bundle.ts"), output, "utf8");
    console.log("Generated roze/native/potoken/bgutils_bundle.ts (" + bundle.length + " bytes)");
}

main().catch(e => { console.error(e); process.exit(1); });
