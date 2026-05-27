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
    
    function post_headers(opts: Opts){
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

    async function get_challenge_details(opts: Opts): PromiseResult<ChallengeDetails>{
        const home_response = await rozfetch("https://server.elscione.com/", {...opts.fetch_opts, headers: post_headers(opts)});
        if("error" in home_response) return home_response;
        opts.cookie_jar.updateWithFetch(home_response);
        const home_html = await home_response.text();
        const raw_challenge_details_extractor = /innerHTML ?= ?"(.+?)";/gi;
        const raw_challenge_details = extract_string_from_pattern(home_html, raw_challenge_details_extractor, "MEDIUM");
        if(typeof raw_challenge_details !== "string") return raw_challenge_details;
        const challenge_details_extractor = /(.+?;).*?\.src='(.+?)';/gi;
        const challenge_details_pieces = extract_strings_from_pattern(raw_challenge_details, challenge_details_extractor);
        if(challenge_details_pieces.length !== 2) return generror("Challenge details weren't properly extracted.", "MEDIUM", {challenge_details_pieces, raw_challenge_details});
        return {
            initial_variables: challenge_details_pieces[0],
            script_path: challenge_details_pieces[1]
        };
    }

    async function solve_challenge(opts: Opts & {challenge_details: ChallengeDetails}){
        const challenge_js_response = await rozfetch(`https://server.elscione.com${opts.challenge_details.script_path}`);
        if("error" in challenge_js_response) return challenge_js_response;
        const challenge_js = opts.challenge_details.initial_variables + await challenge_js_response.text();

        return new Promise<{challenge_payload: string; challenge_path: string} | {error: Error}>((resolve) => {
            let settled = false;
            const settle_timeout = setTimeout(() => {
                if (!settled) {
                    settled = true;
                    resolve(generror("Elscione challenge timed out", "MEDIUM", {}));
                }
            }, 30000);

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
                this.open = (_method: string, url: string) => {
                    this._url = url;
                    this.readyState = 1;
                };
                this.setRequestHeader = () => {};
                this.getResponseHeader = () => null;
                this.send = (body: string) => {
                    if (settled) return;
                    const match = /\/cdn-cgi\/challenge-platform\/h\/b(.+)/.exec(this._url as string);
                    if (match) {
                        settled = true;
                        clearTimeout(settle_timeout);
                        resolve({ challenge_payload: body, challenge_path: match[1] });
                    }
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
                        setAttribute: () => {},
                        appendChild: () => {},
                        removeChild: () => {},
                    }),
                    getElementById: () => null,
                    querySelector: () => null,
                    querySelectorAll: () => [],
                    createElementNS: () => ({ getAttribute: () => null, setAttribute: () => {} }),
                    getElementsByTagName: () => [],
                    head: { appendChild: () => {}, removeChild: () => {} },
                    body: { appendChild: () => {}, removeChild: () => {} },
                    cookie: "",
                    readyState: "complete",
                    referrer: "",
                    title: "",
                    characterSet: "UTF-8",
                    hidden: false,
                    visibilityState: "visible",
                    addEventListener: () => {},
                    removeEventListener: () => {},
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
                    mark: () => {},
                    measure: () => {},
                },
                crypto: (globalThis as any).crypto ?? {
                    getRandomValues: (arr: Uint8Array) => {
                        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
                        return arr;
                    },
                },
                setTimeout,
                clearTimeout,
                setInterval,
                clearInterval,
                requestAnimationFrame: (fn: (...args: any[]) => any) => setTimeout(fn, 16),
                cancelAnimationFrame: clearTimeout,
                addEventListener: () => {},
                removeEventListener: () => {},
                dispatchEvent: () => true,
                postMessage: () => {},
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
atob=__w.atob,btoa=__w.btoa,URL=__w.URL,URLSearchParams=__w.URLSearchParams,
TextEncoder=__w.TextEncoder,TextDecoder=__w.TextDecoder,
Uint8Array=__w.Uint8Array,Uint16Array=__w.Uint16Array,Uint32Array=__w.Uint32Array,
Int8Array=__w.Int8Array,Int16Array=__w.Int16Array,Int32Array=__w.Int32Array,
Float32Array=__w.Float32Array,Float64Array=__w.Float64Array,
Uint8ClampedArray=__w.Uint8ClampedArray,ArrayBuffer=__w.ArrayBuffer,DataView=__w.DataView,
Map=__w.Map,Set=__w.Set,WeakMap=__w.WeakMap,WeakSet=__w.WeakSet,
Symbol=__w.Symbol,Proxy=__w.Proxy,Reflect=__w.Reflect;
${challenge_js}`);
                fn(mock_window);
            } catch (e) {
                if (!settled) {
                    settled = true;
                    clearTimeout(settle_timeout);
                    resolve(generror("Challenge JS execution error", "MEDIUM", { error: String(e) }));
                }
            }
        });
    }

    async function secure_challenge(opts: Opts & {challenge_payload: string; challenge_path: string}){
        const response = await rozfetch(`https://server.elscione.com/cdn-cgi/challenge-platform/h/b${opts.challenge_path}`, {
            headers: post_headers(opts),
            body: opts.challenge_payload,
            method: "POST"
        });
        if("error" in response) return response;
        // update cookie jar and type shit
        opts.cookie_jar.updateWithFetch(response);
        return opts.cookie_jar;
    }

    async function prepare(opts: Opts){
        if(prepared) return null;
        const challenge_details = await get_challenge_details(opts);
        if("error" in challenge_details) return challenge_details;
        const solved_challenge = await solve_challenge({...opts, challenge_details});
        if("error" in solved_challenge) return solved_challenge;
        const secured_result = await secure_challenge({...opts, ...solved_challenge});
        if("error" in secured_result) return secured_result;
        prepared = true;
        return secured_result;
    }
    interface ViewPathResult {
        cached: boolean;
        items: ViewItems['items'];
    }
    export async function view_path(opts: Opts & {path: string, filter: boolean}): PromiseResult<ViewPathResult>{
        const cache_duration = milliseconds_of({days: 7});
        const cache_result = await FSCache.check_cache<ViewItems['items']>(opts.path, cache_duration, {});
        if(cache_result !== undefined) return {
            cached: true,
            items: cache_result.filter(item => !opts.filter || item.href.includes(opts.path))
        }
        await prepare(opts);
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
        if("error" in view_response) return view_response;
        const view = await view_response.json();
        if("error" in view) return view;
        await FSCache.insert_cache(opts.path, view.items, {});
        return {
            cached: false,
            items: view.items.filter(item => !opts.filter || item.href.includes(opts.path))
        }
    }
    export function select_item(item: ViewItems['items'][0]){
        return `https://server.elscione.com${item.href}`;
    }
}