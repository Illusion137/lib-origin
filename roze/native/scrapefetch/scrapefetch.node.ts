import type { ScrapeFetch, ScrapeFetchInit } from "@native/scrapefetch/scrapefetch.base";

let _got_scraping: ((opts: Record<string, unknown>) => Promise<GotResponse>) | null = null;

interface GotResponse {
	statusCode: number;
	statusMessage?: string;
	headers: Record<string, string | string[] | undefined>;
	body: Buffer;
}

async function got_scraping() {
	if (_got_scraping) return _got_scraping;
	_got_scraping = (await import("got-scraping")).gotScraping as unknown as typeof _got_scraping;
	return _got_scraping!;
}

function collect_headers(init?: ScrapeFetchInit): Record<string, string> {
	const out: Record<string, string> = {};
	if (init?.headers) new Headers(init.headers).forEach((value, key) => { out[key] = value; });
	return out;
}

function proxy_url(init?: ScrapeFetchInit): string | undefined {
	if (init?.proxy_url) return init.proxy_url;
	if (init?.proxy) return `http://${init.proxy.ip}:${init.proxy.port}`;
	return undefined;
}

export const node_scrapefetch: ScrapeFetch = async (input, init) => {
	const gotScraping = await got_scraping();
	const method = (init?.method ?? "GET").toUpperCase();
	const has_body = init?.body != null && method !== "GET" && method !== "HEAD";

	const req_headers = collect_headers(init);
	let body: string | Buffer | undefined;
	if (has_body) {
		const raw = init.body;
		if (raw instanceof URLSearchParams) {
			body = raw.toString();
			if (!Object.keys(req_headers).some(k => k.toLowerCase() === "content-type")) req_headers["content-type"] = "application/x-www-form-urlencoded;charset=UTF-8";
		} else {
			body = raw as string | Buffer;
		}
	}

	const res = await gotScraping({
		url: input,
		method,
		headers: req_headers,
		body,
		proxyUrl: proxy_url(init),
		signal: init?.signal ?? undefined,
		throwHttpErrors: false,
		followRedirect: init?.redirect !== "manual",
		responseType: "buffer",
		useHeaderGenerator: true,
	});

	const headers = new Headers();
	for (const [key, value] of Object.entries(res.headers)) {
		if (key.startsWith(":")) continue;
		const lower = key.toLowerCase();
		if (lower === "content-encoding" || lower === "content-length" || lower === "transfer-encoding") continue;
		try {
			if (Array.isArray(value)) for (const item of value) headers.append(key, item);
			else if (value != null) headers.append(key, value);
		} catch { /* skip any header the web Headers class refuses */ }
	}

	return new Response(new Uint8Array(res.body), { status: res.statusCode, statusText: res.statusMessage, headers });
};
