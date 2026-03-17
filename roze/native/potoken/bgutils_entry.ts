// esbuild entry — bundled into an IIFE by scripts/gen_bgutils_bundle.ts
// Exposes { BG } on window.__bgutils__ for use by POTOKEN_INJECTED_JS inside the WebView.
export { BG } from "bgutils-js";
