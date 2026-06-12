import rozfetch from "@common/rozfetch";
import type { BaseOpts, PromiseResult } from "@common/types";
import type { CookieJar } from "@common/utils/cookie_util";
import { generror } from "@common/utils/error_util";
import { extract_string_from_pattern, extract_strings_from_pattern, milliseconds_of } from "@common/utils/util";
import BufferRN from "buffer/";
import type { ViewItems } from "./types";
import { FSCache } from "@common/fs_cache";
const Buffer = BufferRN.Buffer;

export namespace Elscione {
    interface Opts {
        cookie_jar: CookieJar;
        fetch_opts?: BaseOpts['fetch_opts'];
    }
    const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";
    let prepared = false;

    // Verbose diagnostics for the Cloudflare challenge flow. Flip to true to trace it.
    const DEBUG = false;
    const elog = (...args: unknown[]) => { if (DEBUG) console.log("[elscione]", ...args); };

    function post_headers(opts: Opts) {
        return {
            "user-agent": UA,
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "content-type": "text/plain;charset=UTF-8",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Chromium\";v=\"148\", \"Google Chrome\";v=\"148\", \"Not/A)Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "cookie": opts.cookie_jar?.toString() ?? ""
        };
    }

    interface ChallengeDetails {
        initial_variables: string;
        script_path: string;
    };

    async function get_challenge_details(opts: Opts): PromiseResult<ChallengeDetails> {
        const home_response = await rozfetch("https://server.elscione.com/", { ...opts.fetch_opts, headers: post_headers(opts) });
        if ("error" in home_response) { elog("home fetch error", home_response.error?.message); return home_response; }
        opts.cookie_jar.updateWithFetch(home_response);
        const home_html = await home_response.text();
        elog("home fetched", { status: home_response.status, html_len: home_html.length, cookies: opts.cookie_jar?.toString()?.length ?? 0 });
        const raw_challenge_details_extractor = /innerHTML ?= ?"(.+?)";/gi;
        const raw_challenge_details = extract_string_from_pattern(home_html, raw_challenge_details_extractor, "MEDIUM");
        if (typeof raw_challenge_details !== "string") { elog("innerHTML extraction failed; html head:", home_html.slice(0, 300)); return raw_challenge_details; }
        const challenge_details_extractor = /(.+?;).*?\.src='(.+?)';/gi;
        const challenge_details_pieces = extract_strings_from_pattern(raw_challenge_details, challenge_details_extractor);
        if (challenge_details_pieces.length !== 2) { elog("challenge details extraction failed", { pieces: challenge_details_pieces, raw: raw_challenge_details }); return generror("Challenge details weren't properly extracted.", "MEDIUM", { challenge_details_pieces, raw_challenge_details }); }
        elog("challenge details extracted", { script_path: challenge_details_pieces[1], initial_variables: challenge_details_pieces[0] });
        return {
            initial_variables: challenge_details_pieces[0],
            script_path: challenge_details_pieces[1]
        };
    }

    async function solve_challenge(opts: Opts & { challenge_details: ChallengeDetails }) {
        const challenge_js_response = await rozfetch(`https://server.elscione.com${opts.challenge_details.script_path}`);
        if ("error" in challenge_js_response) { elog("challenge js fetch error", challenge_js_response.error?.message); return challenge_js_response; }
        const challenge_js = opts.challenge_details.initial_variables + await challenge_js_response.text();
        elog("challenge js fetched", { status: challenge_js_response.status, len: challenge_js.length, head: challenge_js.slice(0, 160) });

        return new Promise<{ challenge_payload: string; challenge_url: string } | { error: Error }>((resolve) => {
            let settled = false;
            // Activity counters so a timeout summary tells us what the challenge actually did.
            const counts = { timers: 0, xhr_open: 0, xhr_send: 0, fetch: 0, beacon: 0, submits: 0 };
            // The challenge defers its answer XHR behind timers; under Hermes on-device this
            // is slower than V8, so a tight budget spuriously times out. Give it room.
            const settle_timeout = setTimeout(() => {
                if (!settled) {
                    settled = true;
                    // Surface the first deferred error and the last submission attempt so a
                    // timeout isn't a dead end — if the challenge POSTed to an unexpected URL,
                    // last_attempt tells us exactly what to match next.
                    elog("TIMEOUT", { ...counts, last_attempt, last_async_error });
                    resolve(generror("Elscione challenge timed out", "MEDIUM", {
                        ...counts,
                        ...(last_async_error ? { last_async_error } : {}),
                        ...(last_attempt ? { last_attempt } : {})
                    }));
                }
            }, 10000);

            // The challenge schedules work via timers; an uncaught throw there (e.g. a missing
            // mock API) would otherwise vanish and look like a plain timeout. Record the first.
            let last_async_error: string | undefined;
            const guard = (fn: (...args: any[]) => any) => (...args: any[]) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                try { return fn(...args); }
                catch (e) { last_async_error ??= String(e); }
            };

            // Cloudflare submits the solved challenge as a POST (with a body) to a
            // /cdn-cgi/challenge-platform/ endpoint, but rotates the exact sub-path, so match the
            // family rather than a fixed /h/b. Capture works across transports (XHR/fetch/
            // sendBeacon); any non-matching attempt is recorded so a timeout stays diagnosable.
            let last_attempt: string | undefined;
            const CHALLENGE_RE = /\/cdn-cgi\/challenge-platform\//;
            const to_abs = (url: string) => { try { return new URL(url, "https://server.elscione.com").href; } catch { return url; } };
            const record_submit = (method: string, url: string, body: unknown): boolean => {
                if (settled) return true;
                counts.submits++;
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
                const abs = to_abs(String(url ?? ""));
                const verb = (method || "GET").toUpperCase();
                const has_body = typeof body === "string" && body.length > 0;
                // eslint-disable-next-line @typescript-eslint/prefer-includes
                const is_challenge = CHALLENGE_RE.test(abs);
                elog("submit", verb, abs, has_body ? `body:${(body).length}` : "no-body", is_challenge ? "<challenge>" : "");
                if (is_challenge && verb === "POST" && has_body) {
                    settled = true;
                    clearTimeout(settle_timeout);
                    elog("MATCHED challenge submission ->", abs);
                    resolve({ challenge_payload: body, challenge_url: abs });
                    return true;
                }
                last_attempt = `${verb} ${abs}${has_body ? ` (body:${(body).length})` : ""}`;
                return false;
            };
            // eslint-disable-next-line @typescript-eslint/promise-function-async
            const mock_response = () => Promise.resolve({
                ok: true, status: 200, statusText: "OK", redirected: false, type: "basic", url: "https://server.elscione.com/",
                headers: { get: () => null, has: () => false, forEach: () => { } },
                text: async () => "", json: async () => ({}), arrayBuffer: async () => new ArrayBuffer(0),
                clone(this: unknown) { return this; }
            });
            // eslint-disable-next-line @typescript-eslint/promise-function-async
            const mock_fetch = (input: any, init?: any) => {
                counts.fetch++;
                const url = typeof input === "string" ? input : (input?.url ?? String(input));
                const method = init?.method ?? (typeof input === "object" ? input?.method : undefined) ?? "GET";
                const body = init?.body ?? (typeof input === "object" ? input?.body : undefined);
                record_submit(method, url, body);
                return mock_response();
            };

            function MockXHR(this: Record<string, any>) {
                this.timeout = 0;
                this.onload = null;
                this.onerror = null;
                this.ontimeout = null;
                this.onreadystatechange = null;
                this.readyState = 0;
                this.status = 0;
                this.responseText = "";
                this._url = "";
                this._method = "GET";
                this.open = (method: string, url: string) => {
                    counts.xhr_open++;
                    this._method = method;
                    this._url = url;
                    this.readyState = 1;
                    elog("xhr.open", method, url);
                };
                this.setRequestHeader = () => { };
                this.getResponseHeader = () => null;
                this.send = (body: string) => {
                    counts.xhr_send++;
                    record_submit(this._method as string, this._url as string, body);
                };
            }

            const nav_start = Date.now() - 1200;
            const mock_window: Record<string, any> = {
                XMLHttpRequest: MockXHR,
                location: {
                    href: "https://server.elscione.com/",
                    hostname: "server.elscione.com",
                    protocol: "https:",
                    host: "server.elscione.com",
                    port: "",
                    pathname: "/",
                    search: "",
                    hash: "",
                    origin: "https://server.elscione.com",
                },
                document: {
                    createElement: (tag: string) => ({
                        tagName: tag.toUpperCase(),
                        style: {},
                        width: 300,
                        height: 150,
                        getContext: () => null,
                        getAttribute: () => null,
                        setAttribute: () => { },
                        appendChild: () => { },
                        removeChild: () => { },
                    }),
                    getElementById: () => null,
                    querySelector: () => null,
                    querySelectorAll: () => [],
                    createElementNS: () => ({ getAttribute: () => null, setAttribute: () => { } }),
                    getElementsByTagName: () => [],
                    head: { appendChild: () => { }, removeChild: () => { } },
                    body: { appendChild: () => { }, removeChild: () => { } },
                    cookie: "",
                    readyState: "complete",
                    referrer: "",
                    title: "",
                    characterSet: "UTF-8",
                    hidden: false,
                    visibilityState: "visible",
                    addEventListener: () => { },
                    removeEventListener: () => { },
                    dispatchEvent: () => true,
                },
                navigator: {
                    userAgent: UA,
                    language: "en-US",
                    languages: ["en-US", "en"],
                    platform: "MacIntel",
                    hardwareConcurrency: 8,
                    maxTouchPoints: 0,
                    cookieEnabled: true,
                    onLine: true,
                    vendor: "Google Inc.",
                    plugins: Object.assign([], { length: 0 }),
                    mimeTypes: Object.assign([], { length: 0 }),
                    doNotTrack: null,
                    webdriver: false,
                    permissions: { query: async () => ({ state: "denied" }) },
                    sendBeacon: (url: string, body?: unknown) => { counts.beacon++; record_submit("POST", url, typeof body === "string" ? body : ""); return true; },
                },
                screen: {
                    width: 1920, height: 1080, colorDepth: 24, pixelDepth: 24,
                    availWidth: 1920, availHeight: 1040, availLeft: 0, availTop: 0,
                },
                history: { length: 1, scrollRestoration: "auto" },
                performance: {
                    now: () => Date.now() - nav_start,
                    timing: {
                        navigationStart: nav_start,
                        fetchStart: nav_start + 10,
                        domainLookupStart: nav_start + 20,
                        domainLookupEnd: nav_start + 30,
                        connectStart: nav_start + 30,
                        connectEnd: nav_start + 100,
                        secureConnectionStart: nav_start + 60,
                        requestStart: nav_start + 105,
                        responseStart: nav_start + 200,
                        responseEnd: nav_start + 250,
                        domLoading: nav_start + 260,
                        domInteractive: nav_start + 400,
                        domContentLoadedEventStart: nav_start + 400,
                        domContentLoadedEventEnd: nav_start + 410,
                        domComplete: nav_start + 800,
                        loadEventStart: nav_start + 800,
                        loadEventEnd: nav_start + 810,
                    },
                    getEntriesByType: () => [],
                    getEntriesByName: () => [],
                    mark: () => { },
                    measure: () => { },
                },
                crypto: (globalThis as any).crypto ?? {
                    getRandomValues: (arr: Uint8Array) => {
                        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
                        return arr;
                    },
                },
                setTimeout: (fn: (...args: any[]) => any, ms?: number, ...rest: any[]) => { counts.timers++; return setTimeout(guard(fn), ms, ...rest); },
                clearTimeout,
                setInterval: (fn: (...args: any[]) => any, ms?: number, ...rest: any[]) => { counts.timers++; return setInterval(guard(fn), ms, ...rest); },
                clearInterval,
                requestAnimationFrame: (fn: (...args: any[]) => any) => { counts.timers++; return setTimeout(guard(fn), 16); },
                cancelAnimationFrame: clearTimeout,
                fetch: mock_fetch,
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                queueMicrotask: (fn: (...args: any[]) => any) => { Promise.resolve().then(guard(fn)); },
                MessageChannel: function (this: Record<string, any>) {
                    const mk = (): Record<string, any> => ({ onmessage: null, onmessageerror: null, addEventListener: () => { }, removeEventListener: () => { }, start: () => { }, close: () => { }, postMessage: () => { } });
                    const p1 = mk(); const p2 = mk();
                    p1.postMessage = (data: unknown) => setTimeout(guard(() => { if (typeof p2.onmessage === "function") p2.onmessage({ data }); }), 0);
                    p2.postMessage = (data: unknown) => setTimeout(guard(() => { if (typeof p1.onmessage === "function") p1.onmessage({ data }); }), 0);
                    this.port1 = p1; this.port2 = p2;
                },
                addEventListener: () => { },
                removeEventListener: () => { },
                dispatchEvent: () => true,
                postMessage: () => { },
                innerWidth: 1920,
                innerHeight: 1080,
                outerWidth: 1920,
                outerHeight: 1080,
                devicePixelRatio: 1,
                pageXOffset: 0,
                pageYOffset: 0,
                scrollX: 0,
                scrollY: 0,
                frameElement: null,
                frames: {},
                length: 0,
                Math,
                JSON,
                Date,
                Array,
                Object,
                Function,
                String,
                Number,
                Boolean,
                RegExp,
                Error,
                TypeError,
                RangeError,
                SyntaxError,
                Promise,
                Map,
                Set,
                WeakMap,
                WeakSet,
                Symbol,
                Proxy,
                Reflect,
                parseInt,
                parseFloat,
                isNaN,
                isFinite,
                NaN,
                Infinity,
                encodeURIComponent,
                decodeURIComponent,
                encodeURI,
                decodeURI,
                atob: (globalThis as any).atob ?? ((str: string) => Buffer.from(str, "base64").toString("binary")),
                btoa: (globalThis as any).btoa ?? ((str: string) => Buffer.from(str, "binary").toString("base64")),
                console,
                Uint8Array,
                Uint16Array,
                Uint32Array,
                Int8Array,
                Int16Array,
                Int32Array,
                Float32Array,
                Float64Array,
                Uint8ClampedArray,
                ArrayBuffer,
                DataView,
                TextEncoder: (globalThis as any).TextEncoder,
                TextDecoder: (globalThis as any).TextDecoder,
                URL,
                URLSearchParams,
                opener: null,
            };
            mock_window.window = mock_window;
            mock_window.self = mock_window;
            mock_window.globalThis = mock_window;
            mock_window.top = mock_window;
            mock_window.parent = mock_window;

            try {
                // "use strict" makes `this` undefined inside the challenge IIFE so
                // `W = this || self` resolves to our mock self instead of the global object
                // eslint-disable-next-line @typescript-eslint/no-implied-eval
                const fn = new Function("__w", `"use strict";
var window=__w,self=__w,globalThis=__w,document=__w.document,navigator=__w.navigator,
location=__w.location,screen=__w.screen,history=__w.history,performance=__w.performance,
crypto=__w.crypto,XMLHttpRequest=__w.XMLHttpRequest,setTimeout=__w.setTimeout,
clearTimeout=__w.clearTimeout,setInterval=__w.setInterval,clearInterval=__w.clearInterval,
requestAnimationFrame=__w.requestAnimationFrame,cancelAnimationFrame=__w.cancelAnimationFrame,
fetch=__w.fetch,queueMicrotask=__w.queueMicrotask,MessageChannel=__w.MessageChannel,
atob=__w.atob,btoa=__w.btoa,URL=__w.URL,URLSearchParams=__w.URLSearchParams,
TextEncoder=__w.TextEncoder,TextDecoder=__w.TextDecoder,
Uint8Array=__w.Uint8Array,Uint16Array=__w.Uint16Array,Uint32Array=__w.Uint32Array,
Int8Array=__w.Int8Array,Int16Array=__w.Int16Array,Int32Array=__w.Int32Array,
Float32Array=__w.Float32Array,Float64Array=__w.Float64Array,
Uint8ClampedArray=__w.Uint8ClampedArray,ArrayBuffer=__w.ArrayBuffer,DataView=__w.DataView,
Map=__w.Map,Set=__w.Set,WeakMap=__w.WeakMap,WeakSet=__w.WeakSet,
Symbol=__w.Symbol,Proxy=__w.Proxy,Reflect=__w.Reflect;
${challenge_js}`);
                elog("executing challenge js...");
                fn(mock_window);
                elog("challenge js returned (sync)", { ...counts, settled });
            } catch (e) {
                elog("challenge js threw (sync)", String(e), { ...counts });
                if (!settled) {
                    settled = true;
                    clearTimeout(settle_timeout);
                    resolve(generror("Challenge JS execution error", "MEDIUM", { error: String(e) }));
                }
            }
        });
    }

    async function secure_challenge(opts: Opts & { challenge_payload: string; challenge_url: string }) {
        elog("securing challenge", { url: opts.challenge_url, payload_len: opts.challenge_payload.length });
        const response = await rozfetch(opts.challenge_url, {
            headers: post_headers(opts),
            body: opts.challenge_payload,
            method: "POST"
        });
        if ("error" in response) { elog("secure POST error", response.error?.message); return response; }
        // update cookie jar and type shit
        opts.cookie_jar.updateWithFetch(response);
        elog("secured", { status: response.status, cookies: opts.cookie_jar?.toString()?.length ?? 0 });
        return opts.cookie_jar;
    }

    async function prepare(opts: Opts) {
        if (prepared) { elog("prepare: already prepared, skipping"); return null; }
        elog("prepare: start");
        const challenge_details = await get_challenge_details(opts);
        if ("error" in challenge_details) { elog("prepare: get_challenge_details failed"); return challenge_details; }
        const solved_challenge = await solve_challenge({ ...opts, challenge_details });
        if ("error" in solved_challenge) { elog("prepare: solve_challenge failed"); return solved_challenge; }
        const secured_result = await secure_challenge({ ...opts, ...solved_challenge });
        if ("error" in secured_result) { elog("prepare: secure_challenge failed"); return secured_result; }
        prepared = true;
        elog("prepare: done, prepared=true");
        return secured_result;
    }
    interface ViewPathResult {
        cached: boolean;
        items: ViewItems['items'];
    }
    export async function view_path(opts: Opts & { path: string, filter: boolean }): PromiseResult<ViewPathResult> {
        elog("view_path", { path: opts.path, filter: opts.filter });
        const cache_duration = milliseconds_of({ days: 7 });
        const cache_result = await FSCache.check_cache<ViewItems['items']>(opts.path, cache_duration, {});
        if (cache_result !== undefined) {
            elog("view_path: cache hit", { items: cache_result.length });
            return {
                cached: true,
                items: cache_result.filter(item => !opts.filter || item.href.includes(opts.path))
            };
        }
        const prepare_result = await prepare(opts);
        elog("view_path: prepare result", prepare_result && typeof prepare_result === "object" && "error" in prepare_result ? { error: prepare_result.error?.message } : "ok");
        const payload = {
            "action": "get",
            "items": {
                "href": opts.path,
                "what": 1
            }
        };
        const view_response = await rozfetch<ViewItems>(`https://server.elscione.com${opts.path}`, {
            headers: post_headers(opts),
            method: "POST",
            body: JSON.stringify(payload)
        });
        if ("error" in view_response) { elog("view_path: request error", view_response.error?.message); return view_response; }
        elog("view_path: response", { status: view_response.status });
        const view = await view_response.json();
        if ("error" in view) { elog("view_path: json parse failed (likely a challenge/HTML page, not data)", view.error?.message); return view; }
        elog("view_path: ok", { items: view.items.length });
        await FSCache.insert_cache(opts.path, view.items, {});
        return {
            cached: false,
            items: view.items.filter(item => !opts.filter || item.href.includes(opts.path))
        }
    }
    export function select_item(item: ViewItems['items'][0]) {
        return `https://server.elscione.com${item.href}`;
    }
}