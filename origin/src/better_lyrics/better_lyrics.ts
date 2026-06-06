import { XMLParser } from "fast-xml-parser";
import rozfetch from "@common/rozfetch";
import type { PromiseResult } from "@common/types";
import type { CookieJar } from "@common/utils/cookie_util";
import { generror, generror_catch } from "@common/utils/error_util";
import { BetterLyricsChallenger } from "./challenge";
import type { GetParams, Lyric, LyricPart, LrcLyrics, MetadataResult, StreamResult, TtmlLyrics } from "./types";

const API_BASE = "https://lyrics.api.dacubeking.com/";
export const TURNSTILE_CHALLENGE_URL = `${API_BASE}challenge` as const;

const ID_TAG_KEYS = new Set(["ti", "ar", "al", "au", "lr", "length", "by", "offset", "re", "tool", "ve"]);

function parse_lrc_time(time_str: string): number {
	const parts = time_str.split(":");
	if (parts.length === 2) return Math.round((parseInt(parts[0], 10) * 60 + parseFloat(parts[1])) * 1000);
	return 0;
}

function parse_lrc(lrc_text: string, song_duration_ms: number): LrcLyrics {
	const result: Lyric[] = [];
	let offset_ms = 0;

	for (const raw_line of lrc_text.split("\n")) {
		const line = raw_line.trim();
		const id_match = /^\[(\w+):(.*)\]$/.exec(line);
		if (id_match && ID_TAG_KEYS.has(id_match[1])) {
			if (id_match[1] === "offset") offset_ms = (Number(id_match[2]) || 0) * 1000;
			continue;
		}

		const time_tags: number[] = [];
		for (const m of line.matchAll(/\[(\d+:\d+\.\d+)\]/g)) time_tags.push(parse_lrc_time(m[1]));
		if (time_tags.length === 0) continue;

		const lyric_text = line.replace(/\[(\d+:\d+\.\d+)\]/g, "").trim();
		const fragments = lyric_text.split(/<(\d+:\d+\.\d+)>/);
		const parts: LyricPart[] = [];
		let last_time: number | null = null;
		let plain_text = "";

		for (let i = 0; i < fragments.length; i++) {
			if (i % 2 === 0) {
				plain_text += fragments[i];
				if (parts.length > 0) parts[parts.length - 1].words += fragments[i];
			} else {
				const part_time = parse_lrc_time(fragments[i]);
				if (last_time !== null && parts.length > 0) parts[parts.length - 1].duration_ms = part_time - last_time;
				parts.push({ start_time_ms: part_time, words: "", duration_ms: 0 });
				last_time = part_time;
			}
		}

		result.push({
			start_time_ms: Math.min(...time_tags),
			words: plain_text.trim(),
			duration_ms: 0,
			parts: parts.length > 0 ? parts : undefined,
		});
	}

	for (let i = 0; i < result.length; i++) {
		const next = result[i + 1];
		const lyric_parts = result[i].parts;
		if (next) {
			if (result[i].duration_ms === 0) result[i].duration_ms = Math.max(next.start_time_ms - result[i].start_time_ms, 0);
			if (lyric_parts && lyric_parts.length > 0)
				lyric_parts[lyric_parts.length - 1].duration_ms = Math.max(next.start_time_ms - lyric_parts[lyric_parts.length - 1].start_time_ms, 0);
		} else {
			if (result[i].duration_ms === 0) result[i].duration_ms = Math.max(song_duration_ms - result[i].start_time_ms, 0);
			if (lyric_parts && lyric_parts.length > 0)
				lyric_parts[lyric_parts.length - 1].duration_ms = Math.max(song_duration_ms - lyric_parts[lyric_parts.length - 1].start_time_ms, 0);
		}
	}

	if (offset_ms !== 0) {
		for (const lyric of result) {
			lyric.start_time_ms -= offset_ms;
			lyric.parts?.forEach(p => (p.start_time_ms -= offset_ms));
		}
	}

	return { type: "lrc", lyrics: result };
}

function parse_plain(text: string): LrcLyrics {
	return {
		type: "lrc",
		lyrics: text.split("\n").map(words => ({ start_time_ms: 0, words, duration_ms: 0 })),
	};
}

function parse_qrc(qrc_text: string): LrcLyrics {
	const result: Lyric[] = [];
	for (const raw_line of qrc_text.split("\n")) {
		const line = raw_line.trim();
		if (!line?.startsWith("[")) continue;
		const header_end = line.indexOf("]");
		const comma = line.indexOf(",", 1);
		if (header_end === -1 || comma === -1 || comma > header_end) continue;
		const start_time_ms = parseInt(line.slice(1, comma), 10);
		const duration_ms = parseInt(line.slice(comma + 1, header_end), 10);
		if (isNaN(start_time_ms) || isNaN(duration_ms)) continue;
		const content = line.slice(header_end + 1);
		const parts: LyricPart[] = [];
		let plain_text = "";
		for (const m of content.matchAll(/(.*?)\((\d+),(\d+)\)/g)) {
			plain_text += m[1];
			parts.push({ start_time_ms: parseInt(m[2], 10), words: m[1], duration_ms: parseInt(m[3], 10) });
		}
		result.push({ start_time_ms, words: plain_text.trim(), duration_ms, parts: parts.length > 0 ? parts : undefined });
	}
	return { type: "lrc", lyrics: result };
}

interface TtmlSpanNode {
	"#text"?: string;
	"@_begin"?: string;
	"@_end"?: string;
	"@_role"?: string;
	span?: TtmlSpanNode[];
}

interface TtmlParagraphNode {
	"#text"?: string;
	"@_begin"?: string;
	"@_end"?: string;
	span?: TtmlSpanNode[];
}

interface TtmlDivNode {
	p?: TtmlParagraphNode[];
}

interface TtmlBodyNode {
	div?: TtmlDivNode[];
	"@_dur"?: string;
}

interface TtmlDocument {
	tt?: { body?: TtmlBodyNode };
}

const ELEMENT_PREFIX_RE = /<\/?([A-Za-z][\w.-]*):/g;
const ATTRIBUTE_PREFIX_RE = /\s([A-Za-z][\w.-]*):[\w.-]+\s*=/g;
const DECLARED_PREFIX_RE = /xmlns:([A-Za-z][\w.-]*)\s*=/g;
const ROOT_TT_TAG_RE = /<tt\b[^>]*>/;

function declare_missing_namespaces(content: string): string {
	const root_match = ROOT_TT_TAG_RE.exec(content);
	if (!root_match) return content;
	const root_tag = root_match[0];
	const declared = new Set(["xml", "xmlns"]);
	for (const m of root_tag.matchAll(DECLARED_PREFIX_RE)) declared.add(m[1]);
	const used = new Set<string>();
	for (const m of content.matchAll(ELEMENT_PREFIX_RE)) used.add(m[1]);
	for (const m of content.matchAll(ATTRIBUTE_PREFIX_RE)) used.add(m[1]);
	const missing = [...used].filter(p => !declared.has(p));
	if (missing.length === 0) return content;
	const additions = missing.map(p => ` xmlns:${p}="urn:better-lyrics:unbound:${p}"`).join("");
	return content.replace(root_tag, root_tag.replace(/>$/, `${additions}>`));
}

function parse_ttml_time(time_str: string | undefined): number {
	if (!time_str) return 0;
	const offset_match = /^([\d.]+)(h|m|s|ms)$/.exec(time_str);
	if (offset_match) {
		const val = parseFloat(offset_match[1]);
		const unit = offset_match[2];
		if (unit === "h") return Math.round(val * 3600000);
		if (unit === "m") return Math.round(val * 60000);
		if (unit === "s") return Math.round(val * 1000);
		if (unit === "ms") return Math.round(val);
	}
	const colon_parts = time_str.split(":").map(v => v.replace(/[^0-9.]/g, ""));
	if (colon_parts.length === 3) return Math.round((parseInt(colon_parts[0], 10) * 3600 + parseInt(colon_parts[1], 10) * 60 + parseFloat(colon_parts[2])) * 1000);
	if (colon_parts.length === 2) return Math.round((parseInt(colon_parts[0], 10) * 60 + parseFloat(colon_parts[1])) * 1000);
	if (colon_parts.length === 1) return Math.round(parseFloat(colon_parts[0]) * 1000);
	return 0;
}

interface SseMessage { event: string; data: string }

function parse_sse(message: string): SseMessage | null {
	let event = "";
	let data = "";
	for (const line of message.split(/\r?\n/)) {
		if (line.startsWith("event:")) event = line.slice(line.indexOf(":") + 1).trim();
		else if (line.startsWith("data:")) data += line.slice(line.indexOf(":") + 1).trim();
	}
	if (!data || data === "[DONE]") return null;
	return { event, data };
}

interface MetadataEvent { song?: string; artist?: string; album?: string; duration?: string | number }
interface ProviderEvent { provider?: string; results?: Record<string, string> }
type SseEvent = MetadataEvent | ProviderEvent;

function process_event(event: string, data: SseEvent, result: StreamResult, duration_ms: number): void {
	if (event === "metadata") {
		const d = data as MetadataEvent;
		result.metadata = {
			song: d.song ?? "",
			artist: d.artist ?? "",
			album: d.album ?? "",
			duration: Number(d.duration ?? 0),
		} satisfies MetadataResult;
		return;
	}
	if (event !== "provider") return;
	const d = data as ProviderEvent;
	if (!d.provider || !d.results) return;
	const r = d.results;

	if (d.provider === "musixmatch") {
		if (r.wordByWord) result.musixmatch_richsync = parse_lrc(r.wordByWord, duration_ms);
		if (r.synced) result.musixmatch_synced = parse_lrc(r.synced, duration_ms);
	}
	if (d.provider === "lrclib") {
		if (r.synced) result.lrclib_synced = parse_lrc(r.synced, duration_ms);
		if (r.plain) result.lrclib_plain = parse_plain(r.plain);
	}
	if (d.provider === "kugou" && r.lyrics) {
		const decoded = JSON.parse(r.lyrics) as { lyrics?: string };
		if (decoded.lyrics) result.legato_synced = parse_lrc(decoded.lyrics, duration_ms);
	}
	if (d.provider === "qq" && r.lyrics) {
		const decoded = JSON.parse(r.lyrics) as { lyrics?: string };
		if (decoded.lyrics) result.portato_richsynced = parse_qrc(decoded.lyrics);
	}
	if (d.provider === "golyrics" && r.lyrics) {
		let ttml = r.lyrics;
		let score: number | undefined;
		try {
			const p = JSON.parse(ttml) as { ttml?: string; score?: number };
			if (p.ttml) ttml = p.ttml;
			if (p.score !== undefined) score = p.score;
		} catch {}
		if (score === 0) return;
		const ttml_result: TtmlLyrics = { type: "ttml", raw: ttml, score };
		result.blyrics_richsynced = ttml_result;
		result.blyrics_synced = ttml_result;
	}
	if (d.provider === "binimum" && r.lyrics) {
		const score = r.score !== undefined ? Number(r.score) : undefined;
		if (score === 0) return;
		const ttml_result: TtmlLyrics = { type: "ttml", raw: r.lyrics, score };
		if (r.timingType === "syllable") result.binimum_richsynced = ttml_result;
		else if (r.timingType === "line") result.binimum_synced = ttml_result;
		else { result.binimum_richsynced = ttml_result; result.binimum_synced = ttml_result; }
	}
}

export namespace BetterLyrics {
	interface Opts {
		cookie_jar: CookieJar;
	}

	export function ttml_to_lrc(ttml_raw: string): LrcLyrics {
		const sanitized = declare_missing_namespaces(ttml_raw);
		const parser = new XMLParser({
			ignoreAttributes: false,
			attributeNamePrefix: "@_",
			removeNSPrefix: true,
			parseAttributeValue: false,
			parseTagValue: false,
			textNodeName: "#text",
			isArray: (name: string) => name === "p" || name === "span" || name === "div",
		});
		const doc = parser.parse(sanitized) as TtmlDocument;
		const divs = doc.tt?.body?.div ?? [];
		const result: Lyric[] = [];

		for (const div of divs) {
			for (const p of (div.p ?? [])) {
				const begin = parse_ttml_time(p["@_begin"]);
				const end = parse_ttml_time(p["@_end"]);
				if (!p["@_begin"] && !p["@_end"]) continue;

				const spans = (p.span ?? []).filter(s => s["@_role"] !== "x-bg");

				if (spans.length > 0 && spans.some(s => s["@_begin"])) {
					const parts: LyricPart[] = [];
					let plain_text = "";
					for (const span of spans) {
						const span_text = span["#text"] ?? "";
						const span_begin = parse_ttml_time(span["@_begin"]);
						const span_end = parse_ttml_time(span["@_end"]);
						plain_text += span_text;
						parts.push({ start_time_ms: span_begin, words: span_text, duration_ms: span_end - span_begin });
					}
					result.push({ start_time_ms: begin, words: plain_text.trim(), duration_ms: end - begin, parts });
				} else {
					const text = spans.length > 0
						? spans.map(s => s["#text"] ?? "").join("").trim()
						: (p["#text"] ?? "").trim();
					result.push({ start_time_ms: begin, words: text, duration_ms: end - begin });
				}
			}
		}

		return { type: "lrc", lyrics: result };
	}

	export function is_jwt_expired(jwt: string): boolean {
		try {
			const payload_b64 = jwt.split(".")[1];
			if (!payload_b64) return true;
			const decoded = atob(payload_b64.replace(/-/g, "+").replace(/_/g, "/"));
			const payload = JSON.parse(decoded) as { exp?: number };
			if (!payload.exp) return true;
			return Date.now() / 1000 > payload.exp;
		} catch {
			return true;
		}
	}

	export async function verify_turnstile_token(turnstile_token: string, opts: Opts): PromiseResult<string> {
		const response = await rozfetch<{ jwt?: string }>(API_BASE + "verify-turnstile", {
			impersonate: true,
			method: "POST",
			headers: { "Content-Type": "application/json", "cookie": opts.cookie_jar.toString() },
			body: JSON.stringify({ token: turnstile_token }),
		});
		if ("error" in response) return response;
		opts.cookie_jar.updateWithFetch(response);
		const data = await response.json();
		if ("error" in data) return data;
		if (!data.jwt) return generror("verify-turnstile: no JWT in response", "MEDIUM", {});
		return data.jwt;
	}

	// Single in-memory JWT reused across calls until it expires (mirrors the upstream
	// extension's stored jwtToken). The cf_clearance cookie minted alongside it lives in
	// the caller's cookie_jar, which they persist.
	let cached_jwt: string | null = null;

	// Resolves a usable JWT: reuse the cached/passed token while valid, otherwise run the
	// full Turnstile challenge (native widget on RN, best-effort jsdom on Node) which also
	// folds cf_clearance into the cookie_jar. force_new skips the cache (used on a 403).
	export async function authenticate(opts: Opts & { token?: string }, force_new = false): PromiseResult<string> {
		if (!force_new) {
			const candidate = cached_jwt ?? opts.token;
			if (candidate && !is_jwt_expired(candidate)) {
				cached_jwt = candidate;
				return candidate;
			}
		}
		cached_jwt = null;
		const solved = await BetterLyricsChallenger.solve_challenge({ cookie_jar: opts.cookie_jar });
		if ("error" in solved) return solved;
		cached_jwt = solved.jwt;
		return solved.jwt;
	}

	export async function get_lyrics(params: GetParams & Opts): PromiseResult<StreamResult> {
		return get_lyrics_attempt(params, 0);
	}

	async function get_lyrics_attempt(params: GetParams & Opts, retry_count: number): PromiseResult<StreamResult> {
		const jwt = await authenticate(params, retry_count > 0);
		if (typeof jwt === "object" && "error" in jwt) return jwt;
		params.token = jwt;
		const body = new URLSearchParams();
		body.append("videoId", params.video_id);
		if (params.track_name) body.append("song", params.track_name);
		if (params.artist_name) body.append("artist", params.artist_name);
		if (params.duration) body.append("duration", String(Math.round(params.duration)));
		if (params.album_name) body.append("album", params.album_name);
		if (params.isrc) body.append("isrc", params.isrc);
		if (params.token) body.append("token", params.token);
		body.append("alwaysFetchMetadata", "true");

		const response = await rozfetch(API_BASE + "v2/lyrics", {
			impersonate: true,
			method: "POST",
			headers: { "cookie": params.cookie_jar.toString() },
			body,
			ignore_fail_request: true,
		});
		if ("error" in response) return response;
		params.cookie_jar.updateWithFetch(response);
		// A 403 means the JWT/clearance was rejected; re-solve the challenge once.
		if (response.status === 403 && retry_count < 1) return get_lyrics_attempt(params, retry_count + 1);
		if (!response.ok) return generror(`better_lyrics: v2/lyrics failed | ${response.status}`, "MEDIUM", { status: response.status });
		if (!response.body) return generror("better_lyrics: no response body", "MEDIUM", {});

		try {
			const result: StreamResult = {};
			const duration_ms = params.duration * 1000;
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";

			while (true) {
				const { done, value } = await reader.read();
				if (value) {
					buffer += decoder.decode(value, { stream: true });
					const messages = buffer.split(/\n\n|\r\n\r\n/);
					buffer = messages.pop() ?? "";
					for (const msg of messages) {
						const sse = parse_sse(msg);
						if (!sse) continue;
						try { process_event(sse.event, JSON.parse(sse.data) as SseEvent, result, duration_ms); } catch {}
					}
				}
				if (done) {
					if (buffer.trim()) {
						const sse = parse_sse(buffer);
						if (sse) try { process_event(sse.event, JSON.parse(sse.data) as SseEvent, result, duration_ms); } catch {}
					}
					break;
				}
			}
			return result;
		} catch (e: unknown) {
			return generror_catch(e, "better_lyrics: stream error", "MEDIUM", {});
		}
	}
}
