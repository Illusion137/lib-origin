#!/usr/bin / env ts - node
//https://github.com/misiektoja/spotify_monitor/blob/dev/debug/spotify_monitor_secret_grabber.py

/**
 * Author: Michal Szymanski (ported to TypeScript)
 * Original: https://github.com/misiektoja/spotify_monitor#debugging-tools
 *
 * Converts Spotify Web Player JS bundle TOTP secret extractor to Node + TypeScript.
 */

import { chromium } from "playwright";
import { Command } from "commander";
import fs from "fs/promises";

const BUNDLE_RE = /(?:vendor~web-player|encore~web-player|web-player)\.[0-9a-f]{4,}\.(?:js|mjs)/;
const TIMEOUT = 45000;
let VERBOSE = true;

const OUTPUT_FILES = {
    plain_json: "origin/src/spotify/data/secrets.json",
    bytes_json_array: "origin/src/spotify/data/secret_bytes.json",
    bytes_json_dict: "origin/src/spotify/data/secret_dict.json",
};

interface Capture {
    secret?: string;
    version?: number | string;
    obj?: Record<string, any>;
};

function log(msg: string) {
    if (VERBOSE) {
        const t = new Date().toLocaleTimeString();
        console.log(`[${t}] ${msg}`);
    }
}

function inlineIntArray(nums: number[]): string {
    return `[ ${nums.join(", ")} ]`;
}

async function writeSecretBytesCompact(path: string, items: { version: number; secret: number[] }[]) {
    const lines = items.map(
        (itm) => `  { "version": ${itm.version}, "secret": ${inlineIntArray(itm.secret)} }`
    );
    const out = `[\n${lines.join(",\n")}\n]\n`;
    await fs.writeFile(path, out);
}

async function writeSecretDictCompact(path: string, mapping: Record<string, number[]>) {
    const keys = Object.keys(mapping).sort((a, b) => parseInt(a) - parseInt(b));
    const lines = keys.map((k) => `  "${k}": ${inlineIntArray(mapping[k])}`);
    const out = `{\n${lines.join(",\n")}\n}\n`;
    await fs.writeFile(path, out);
}

function summarise(caps: Capture[], mode?: string) {
    const real: Record<string, string> = {};

    for (const cap of caps) {
        const sec = cap.secret;
        if (typeof sec !== "string") continue;
        const ver =
            cap.version ??
            (typeof cap.obj === "object" ? cap.obj?.version : undefined);
        if (ver == null) continue;
        real[String(ver)] = sec;
    }

    if (Object.keys(real).length === 0) {
        log("No real secrets with version.");
        return;
    }

    const sortedItems = Object.entries(real).sort(
        ([a], [b]) => parseInt(a) - parseInt(b)
    );
    const formatted = sortedItems.map(([v, s]) => ({
        version: parseInt(v),
        secret: s,
    }));
    const secretBytes = sortedItems.map(([v, s]) => ({
        version: parseInt(v),
        secret: s.split('').map((c) => c.charCodeAt(0)),
    }));
    const secretDict: Record<string, number[]> = {};
    for (const [v, s] of sortedItems) {
        secretDict[v] = s.split('').map((c) => c.charCodeAt(0));
    }

    switch (mode) {
        case undefined: {
            console.log("\n--- List of extracted secrets ---\n");
            for (const [v, s] of sortedItems) console.log(`v${v}: '${s}'`);

            console.log("\n--- Plain secrets (JSON array) ---\n");
            console.log(JSON.stringify(formatted, null, 2));

            console.log("\n--- Secret bytes (JSON array) ---\n");
            console.log(JSON.stringify(secretBytes, null, 2));

            console.log("\n--- Secret bytes (JSON object) ---\n");
            console.log(JSON.stringify(secretDict, null, 2));
            break;
        }
        case "secret":
            console.log(JSON.stringify(formatted, null, 2));
            break;
        case "secretbytes":
            console.log(JSON.stringify(secretBytes, null, 2));
            break;
        case "secretdict":
            console.log(JSON.stringify(secretDict, null, 2));
            break;
        case "all":
            (async () => {
                try {
                    await fs.writeFile(OUTPUT_FILES.plain_json, JSON.stringify(formatted, null, 2) + "\n");
                    await writeSecretBytesCompact(OUTPUT_FILES.bytes_json_array, secretBytes);
                    await writeSecretDictCompact(OUTPUT_FILES.bytes_json_dict, secretDict);
                    if (VERBOSE) {
                        console.log(`[+] Wrote ${OUTPUT_FILES.plain_json}`);
                        console.log(`[+] Wrote ${OUTPUT_FILES.bytes_json_array}`);
                        console.log(`[+] Wrote ${OUTPUT_FILES.bytes_json_dict}`);
                    }
                } catch (err) {
                    console.error(`Error writing output files: ${err}`);
                }
            })().catch(e => e);
            break;
    }
}

async function grabLive(): Promise<Capture[]> {
    const hook = `
    (() => {
      if (globalThis.__secretHookInstalled) return;
      globalThis.__secretHookInstalled = true;
      globalThis.__captures = [];
      Object.defineProperty(Object.prototype, 'secret', {
        configurable: true,
        set: function(v) {
          try {
            __captures.push({ secret: v, version: this.version, obj: this });
          } catch(e) {}
          Object.defineProperty(this, 'secret', { value: v, writable: true, configurable: true, enumerable: true });
        }
      });
    })();
  `;

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addInitScript(hook);
    const page = await context.newPage();

    page.on("response", (resp) => {
        const filename = resp.url().split("/").pop() || "";
        if (BUNDLE_RE.test(filename)) log(`↓ ${filename} (${resp.status()})`);
    });

    log("→ opening open.spotify.com ...");
    await page.goto("https://open.spotify.com", { timeout: TIMEOUT });
    await page.waitForLoadState("networkidle", { timeout: TIMEOUT });
    await page.waitForTimeout(3000);

    const caps: Capture[] = (await page.evaluate("window.__captures")) ?? [];

    for (const c of caps) {
        if (typeof c.secret === "string" && c.version != null) {
            log(`✔ secret(${c.version}) → ${c.secret}`);
        }
    }

    await browser.close();
    return caps;
}

async function main() {
    const program = new Command()
        .description("Extract Spotify web-player TOTP secrets")
        .option("--secret", "Output plain secrets JSON only")
        .option("--secretbytes", "Output secret-bytes JSON only")
        .option("--secretdict", "Output version->byte-list dict JSON only")
        .option("--all", "Write plain, bytes array and bytes dict JSON files")
        .parse(process.argv);

    const opts = program.opts();
    let mode: string | undefined;
    if (opts.secret) mode = "secret";
    else if (opts.secretbytes) mode = "secretbytes";
    else if (opts.secretdict) mode = "secretdict";
    else if (opts.all) mode = "all";

    if (mode && mode !== "all") VERBOSE = false;
    else if (mode === "all") VERBOSE = true;

    try {
        const caps = await grabLive();
        summarise(caps, mode);
    } catch (err) {
        console.error(`Error: ${err}`);
        process.exit(1);
    }
}

main().catch( e => e);
