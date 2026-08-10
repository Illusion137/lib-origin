import TcpSocket from "react-native-tcp-socket";
import { Buffer } from "buffer";
import forge from "node-forge";
import * as pako from "pako";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ssl_root_cas_pems: string[] = require("ssl-root-cas");
import type { ProxyFetch, ProxyFetchInit } from "@native/proxyfetch/proxyfetch.base";

type Socket = InstanceType<typeof TcpSocket.Socket>;
interface ProxyTarget { ip: string; port: number; }

let ca_store: forge.pki.CAStore | undefined;
function get_ca_store(): forge.pki.CAStore {
	if (ca_store) return ca_store;
	ca_store = forge.pki.createCaStore();
	for (const pem of ssl_root_cas_pems) {
		try { ca_store.addCertificate(pem); } catch {}
	}
	return ca_store;
}

function to_buffer(data: string | Buffer): Buffer {
	return typeof data === "string" ? Buffer.from(data, "utf8") : data;
}

interface ByteStream {
	write: (data: Buffer) => void;
	on_data: (cb: (chunk: Buffer) => void) => void;
	on_end: (cb: () => void) => void;
	on_error: (cb: (err: Error) => void) => void;
	destroy: () => void;
}

async function open_socket(proxy: ProxyTarget, signal: AbortSignal | undefined): Promise<Socket> {
	return new Promise((resolve, reject) => {
		let settled = false;
		const on_abort = () => {
			if (settled) return;
			settled = true;
			socket.destroy();
			reject(signal?.reason instanceof Error ? signal.reason : new Error("proxyfetch: aborted"));
		};
		const socket = TcpSocket.createConnection({ port: proxy.port, host: proxy.ip }, () => {
			if (settled) return;
			settled = true;
			signal?.removeEventListener("abort", on_abort);
			resolve(socket);
		});
		socket.once("error", (e: Error) => {
			if (settled) return;
			settled = true;
			signal?.removeEventListener("abort", on_abort);
			reject(e);
		});
		if (signal?.aborted) on_abort();
		else signal?.addEventListener("abort", on_abort, { once: true });
	});
}

async function read_until_double_crlf(socket: Socket): Promise<{ head: string; leftover: Buffer }> {
	return new Promise((resolve, reject) => {
		let buffer = Buffer.alloc(0);
		function on_data(chunk: string | Buffer) {
			buffer = Buffer.concat([buffer, to_buffer(chunk)]);
			const idx = buffer.indexOf("\r\n\r\n");
			if (idx === -1) return;
			cleanup();
			resolve({ head: buffer.subarray(0, idx).toString("ascii"), leftover: buffer.subarray(idx + 4) });
		}
		function on_error(e: Error) { cleanup(); reject(e); }
		function cleanup() { socket.off("data", on_data); socket.off("error", on_error); }
		socket.on("data", on_data);
		socket.on("error", on_error);
	});
}

async function connect_tunnel(proxy: ProxyTarget, target_host: string, target_port: number, signal: AbortSignal | undefined): Promise<{ socket: Socket; leftover: Buffer }> {
	const socket = await open_socket(proxy, signal);
	socket.write(Buffer.from(`CONNECT ${target_host}:${target_port} HTTP/1.1\r\nHost: ${target_host}:${target_port}\r\nProxy-Connection: Keep-Alive\r\n\r\n`, "ascii"));
	const { head, leftover } = await read_until_double_crlf(socket);
	const status_line = head.split("\r\n")[0];
	if (!/^HTTP\/1\.[01]\s+2\d\d/.test(status_line)) {
		socket.destroy();
		throw new Error(`proxyfetch: proxy CONNECT to ${target_host}:${target_port} failed: ${status_line}`);
	}
	return { socket, leftover };
}

async function tls_wrap(socket: Socket, virtual_host: string, leftover: Buffer): Promise<ByteStream> {
	return new Promise((resolve, reject) => {
		let settled = false;
		const data_cbs: ((chunk: Buffer) => void)[] = [];
		const end_cbs: (() => void)[] = [];
		const error_cbs: ((err: Error) => void)[] = [];
		let ended = false;
		const fire_end = () => { if (ended) return; ended = true; for (const cb of end_cbs) cb(); };

		const conn = forge.tls.createConnection({
			server: false,
			virtualHost: virtual_host,
			caStore: get_ca_store(),
			verify: (_connection, verified) => verified,
			connected: () => {
				if (settled) return;
				settled = true;
				resolve({
					write: (data: Buffer) => { conn.prepare(data.toString("binary")); },
					on_data: (cb) => data_cbs.push(cb),
					on_end: (cb) => end_cbs.push(cb),
					on_error: (cb) => error_cbs.push(cb),
					destroy: () => { try { conn.close(); } catch { /* already closed */ } socket.destroy(); },
				});
			},
			tlsDataReady: (connection) => {
				socket.write(Buffer.from(connection.tlsData.getBytes(), "binary"));
			},
			dataReady: (connection) => {
				const chunk = Buffer.from(connection.data.getBytes(), "binary");
				for (const cb of data_cbs) cb(chunk);
			},
			closed: fire_end,
			error: (_connection, error) => {
				const err = new Error(`proxyfetch: TLS error: ${error.message}`);
				if (!settled) { settled = true; reject(err); }
				else for (const cb of error_cbs) cb(err);
			},
		});

		socket.on("data", (chunk: string | Buffer) => conn.process(to_buffer(chunk).toString("binary")));
		socket.on("end", fire_end);
		socket.on("close", fire_end);
		socket.on("error", (e: Error) => {
			if (!settled) { settled = true; reject(e); }
			else for (const cb of error_cbs) cb(e);
		});

		conn.handshake();
		if (leftover.length) conn.process(leftover.toString("binary"));
	});
}

function plain_stream(socket: Socket): ByteStream {
	const data_cbs: ((chunk: Buffer) => void)[] = [];
	const end_cbs: (() => void)[] = [];
	const error_cbs: ((err: Error) => void)[] = [];
	let ended = false;
	const fire_end = () => { if (ended) return; ended = true; for (const cb of end_cbs) cb(); };
	socket.on("data", (chunk: string | Buffer) => { const buf = to_buffer(chunk); for (const cb of data_cbs) cb(buf); });
	socket.on("end", fire_end);
	socket.on("close", fire_end);
	socket.on("error", (e: Error) => { for (const cb of error_cbs) cb(e); });
	return {
		write: (data) => { socket.write(data); },
		on_data: (cb) => data_cbs.push(cb),
		on_end: (cb) => end_cbs.push(cb),
		on_error: (cb) => error_cbs.push(cb),
		destroy: () => { socket.destroy(); },
	};
}

interface ParsedResponse { status: number; status_text: string; headers: Headers; body: Buffer; }

async function read_http_response(stream: ByteStream, method: string): Promise<ParsedResponse> {
	return new Promise((resolve, reject) => {
		let buffer = Buffer.alloc(0);
		let headers_parsed = false;
		let status = 0;
		let status_text = "";
		let headers = new Headers();
		let body_mode: "content-length" | "chunked" | "close" = "close";
		let content_length = 0;
		const chunks: Buffer[] = [];
		let body_bytes_read = 0;
		let chunk_remaining = 0;
		let done = false;

		function finish() {
			if (done) return;
			done = true;
			resolve({ status, status_text, headers, body: Buffer.concat(chunks) });
		}

		function parse_headers_if_ready(): boolean {
			if (headers_parsed) return true;
			const idx = buffer.indexOf("\r\n\r\n");
			if (idx === -1) return false;
			const head = buffer.subarray(0, idx).toString("ascii");
			buffer = buffer.subarray(idx + 4);
			const lines = head.split("\r\n");
			const status_match = /^HTTP\/1\.[01]\s+(\d\d\d)\s*(.*)$/.exec(lines[0]);
			if (!status_match) { reject(new Error(`proxyfetch: malformed status line: ${lines[0]}`)); return true; }
			status = parseInt(status_match[1]);
			status_text = status_match[2] ?? "";
			headers = new Headers();
			for (const line of lines.slice(1)) {
				const sep = line.indexOf(":");
				if (sep === -1) continue;
				headers.append(line.slice(0, sep).trim(), line.slice(sep + 1).trim());
			}
			headers_parsed = true;
			const transfer_encoding = headers.get("transfer-encoding");
			const content_length_header = headers.get("content-length");
			if (transfer_encoding?.toLowerCase().includes("chunked")) body_mode = "chunked";
			else if (content_length_header !== null) { body_mode = "content-length"; content_length = parseInt(content_length_header) || 0; }
			else body_mode = "close";
			if (method === "HEAD" || status === 204 || status === 304) finish();
			return true;
		}

		function pump() {
			if (done) return;
			if (!headers_parsed && !parse_headers_if_ready()) return;
			if (done) return;
			if (body_mode === "content-length") {
				const need = content_length - body_bytes_read;
				const take = Math.min(need, buffer.length);
				if (take > 0) { chunks.push(buffer.subarray(0, take)); buffer = buffer.subarray(take); body_bytes_read += take; }
				if (body_bytes_read >= content_length) finish();
			} else if (body_mode === "chunked") {
				for (;;) {
					if (chunk_remaining > 0) {
						const take = Math.min(chunk_remaining, buffer.length);
						if (take > 0) { chunks.push(buffer.subarray(0, take)); buffer = buffer.subarray(take); chunk_remaining -= take; }
						if (chunk_remaining > 0) return;
						if (buffer.length < 2) return;
						buffer = buffer.subarray(2);
						continue;
					}
					const line_end = buffer.indexOf("\r\n");
					if (line_end === -1) return;
					const size = parseInt(buffer.subarray(0, line_end).toString("ascii").split(";")[0].trim(), 16);
					if (Number.isNaN(size)) { reject(new Error("proxyfetch: malformed chunk size")); return; }
					buffer = buffer.subarray(line_end + 2);
					if (size === 0) {
						const term = buffer.indexOf("\r\n\r\n");
						if (term !== -1) buffer = buffer.subarray(term + 4);
						finish();
						return;
					}
					chunk_remaining = size;
				}
			}
		}

		stream.on_data((chunk) => { buffer = Buffer.concat([buffer, chunk]); pump(); });
		stream.on_end(() => {
			if (done) return;
			if (!headers_parsed || body_mode === "close") {
				if (buffer.length) chunks.push(buffer);
				finish();
			} else {
				reject(new Error("proxyfetch: connection closed before response was complete"));
			}
		});
		stream.on_error((e) => { if (!done) reject(e); });
	});
}

function body_to_buffer(body: BodyInit | null | undefined): { buffer?: Buffer; content_type?: string } {
	if (body === undefined || body === null) return {};
	if (typeof body === "string") return { buffer: Buffer.from(body, "utf8") };
	if (body instanceof URLSearchParams) return { buffer: Buffer.from(body.toString(), "utf8"), content_type: "application/x-www-form-urlencoded;charset=UTF-8" };
	if (body instanceof Uint8Array) return { buffer: Buffer.from(body.buffer, body.byteOffset, body.byteLength) };
	if (body instanceof ArrayBuffer) return { buffer: Buffer.from(body) };
	throw new Error("proxyfetch: unsupported body type (only string, Uint8Array, ArrayBuffer and URLSearchParams are supported)");
}

function decompress(encoding: string | null, data: Buffer): Buffer {
	if (!encoding) return data;
	const input = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
	try {
		switch (encoding.toLowerCase()) {
			case "gzip": case "x-gzip": return Buffer.from(pako.ungzip(input));
			case "deflate":
				try { return Buffer.from(pako.inflate(input)); }
				catch { return Buffer.from(pako.inflateRaw(input)); }
			default: return data;
		}
	} catch { return data; }
}

async function single_request(url: URL, init: ProxyFetchInit): Promise<Response> {
	const secure = url.protocol === "https:";
	const target_port = url.port ? parseInt(url.port) : (secure ? 443 : 80);

	const headers = new Headers(init.headers);
	if (!headers.has("host")) headers.set("host", url.host);
	if (!headers.has("accept-encoding")) headers.set("accept-encoding", "gzip, deflate");
	headers.set("connection", "close");

	const method = (init.method ?? "GET").toUpperCase();
	const { buffer: body_buffer, content_type } = body_to_buffer(init.body);
	const has_body = body_buffer !== undefined && method !== "GET" && method !== "HEAD";
	if (has_body) {
		if (content_type && !headers.has("content-type")) headers.set("content-type", content_type);
		if (!headers.has("content-length")) headers.set("content-length", String(body_buffer.byteLength));
	}

	const signal = init.signal ?? undefined;
	let stream: ByteStream;
	let request_line: string;
	if (secure) {
		const { socket, leftover } = await connect_tunnel(init.proxy, url.hostname, target_port, signal);
		stream = await tls_wrap(socket, url.hostname, leftover);
		request_line = `${method} ${url.pathname + url.search} HTTP/1.1`;
	} else {
		const socket = await open_socket(init.proxy, signal);
		stream = plain_stream(socket);
		request_line = `${method} ${url.toString()} HTTP/1.1`;
	}
	if (signal) {
		const on_abort = () => stream.destroy();
		if (signal.aborted) on_abort();
		else signal.addEventListener("abort", on_abort, { once: true });
	}

	const head_lines = [request_line];
	for (const [key, value] of headers.entries()) head_lines.push(`${key}: ${value}`);
	stream.write(Buffer.from(head_lines.join("\r\n") + "\r\n\r\n", "ascii"));
	if (has_body) stream.write(body_buffer);

	const parsed = await read_http_response(stream, method);
	stream.destroy();

	const decompressed = decompress(parsed.headers.get("content-encoding"), parsed.body);
	const response_headers = new Headers();
	for (const [key, value] of parsed.headers.entries()) {
		const lower = key.toLowerCase();
		if (lower === "content-encoding" || lower === "content-length" || lower === "transfer-encoding" || lower === "connection") continue;
		response_headers.append(key, value);
	}
	return new Response(new Uint8Array(decompressed), { status: parsed.status, statusText: parsed.status_text, headers: response_headers });
}

const MAX_REDIRECTS = 10;
function is_redirect_status(status: number): boolean {
	return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

export const mobile_proxyfetch: ProxyFetch = async (input, init) => {
	const redirect_mode = init.redirect ?? "follow";
	let current_url = new URL(input);
	let current_init = init;

	for (let redirect_count = 0; ; redirect_count++) {
		const response = await single_request(current_url, current_init);
		if (!is_redirect_status(response.status)) return response;
		if (redirect_mode === "manual") return response;
		if (redirect_mode === "error") throw new Error(`proxyfetch: encountered redirect (${response.status}) with redirect: "error"`);

		const location = response.headers.get("location");
		if (!location || redirect_count >= MAX_REDIRECTS) return response;

		let next_method = current_init.method ?? "GET";
		let next_body = current_init.body;
		if (response.status === 303 || ((response.status === 301 || response.status === 302) && next_method !== "GET" && next_method !== "HEAD")) {
			next_method = "GET";
			next_body = undefined;
		}
		current_url = new URL(location, current_url);
		current_init = { ...current_init, method: next_method, body: next_body };
	}
};
