import rozfetch, { type RoZFetchRequestInit, type RoZFetchResponse } from '@common/rozfetch';
import type { PromiseResult } from '@common/types';
import { generror } from '@common/utils/error_util';
import { encode_params, google_query } from '@common/utils/fetch_util';
import type { FlagParams, GetParams, LRCLibApiError, LRCLibOpts, PublishParams, RequestChallengeResult, SearchParams, SearchResult } from './types';
import crypto from 'react-native-quick-crypto';
import BufferRN from 'buffer/';
import { wait } from '@common/utils/timed_util';

const Buffer = BufferRN.Buffer;
export namespace LRCLib {
	const USER_AGENT = 'Illusi v1.0.0 (https://github.com/Illusion137/lib-origin)';
	const API_URL = 'https://lrclib.net/api';

	let default_opts: LRCLibOpts = {};

	export function configure(opts: LRCLibOpts) {
		default_opts = { ...default_opts, ...opts };
	}

	function build_headers(opts?: LRCLibOpts, extra: Record<string, string> = {}) {
		const merged = { ...default_opts, ...opts };
		const headers: Record<string, string> = { 'User-Agent': merged.user_agent ?? USER_AGENT, ...extra };
		if (merged.app_id) headers['Lrclib-App-Id'] = merged.app_id;
		if (merged.api_key) headers['Lrclib-Api-Key'] = merged.api_key;
		return headers;
	}

	const MAX_RETRIES = 3;
	const DEFAULT_RETRY_AFTER_MS = 1000;
	const MAX_RETRY_AFTER_MS = 60_000;
	const RETRY_STATUS_CODES = [429, 503];
	let blocked_until_ms = 0;

	function parse_retry_after_ms(header: string | null): number {
		if (header === null) return DEFAULT_RETRY_AFTER_MS;
		const seconds = Number(header);
		if (Number.isFinite(seconds)) return Math.max(seconds, 0) * 1000;
		const date_ms = Date.parse(header);
		if (Number.isNaN(date_ms)) return DEFAULT_RETRY_AFTER_MS;
		return Math.max(date_ms - Date.now(), 0);
	}
	async function wait_for_cooldown() {
		const wait_ms = blocked_until_ms - Date.now();
		if (wait_ms > 0) await wait(wait_ms);
	}

	async function api_request<T>(path: string, init: RoZFetchRequestInit, opts?: LRCLibOpts): PromiseResult<RoZFetchResponse<T>> {
		for (let attempt = 0; ; attempt++) {
			await wait_for_cooldown();
			const response = await rozfetch<T>(`${API_URL}/${path}`, { ...init, headers: build_headers(opts, init.headers as Record<string, string>), ignore_fail_request: true });
			if ('error' in response) return response;
			if (response.ok) return response;
			if (RETRY_STATUS_CODES.includes(response.status)) {
				const retry_after_ms = Math.min(parse_retry_after_ms(response.headers.get('Retry-After')), MAX_RETRY_AFTER_MS);
				blocked_until_ms = Math.max(blocked_until_ms, Date.now() + retry_after_ms * (1 + Math.random() * 0.3));
				if (attempt < MAX_RETRIES) continue;
			}
			const body = await response.json();
			const api_error = typeof body === 'object' && body !== null && 'statusCode' in body ? (body as unknown as LRCLibApiError) : undefined;
			return generror(api_error?.message ?? `LRCLIB request failed with status ${response.status}`, response.status === 404 ? 'INFO' : 'LOW', { api_error, status: response.status, path });
		}
	}

	async function get_request<T>(path: string, params: Record<string, any>, opts?: LRCLibOpts): PromiseResult<T> {
		const query = encode_params(params);
		const response = await api_request<T>(`${path}${query.length ? `?${query}` : ''}`, {}, opts);
		if ('error' in response) return response;
		return await response.json();
	}

	export async function get(params: GetParams, opts?: LRCLibOpts) {
		return await get_request<SearchResult>('get', params, opts);
	}
	export async function get_id(id: number | string, opts?: LRCLibOpts) {
		return await get_request<SearchResult>(`get/${id}`, {}, opts);
	}
	export async function search(params: SearchParams, opts?: LRCLibOpts) {
		const search_params = 'q' in params ? { ...params, q: google_query(params.q) } : params;
		return await get_request<SearchResult[]>('search', search_params, opts);
	}

	async function request_challenge(opts?: LRCLibOpts): PromiseResult<RequestChallengeResult> {
		const response = await api_request<RequestChallengeResult>('request-challenge', { method: 'POST' }, opts);
		if ('error' in response) return response;
		return await response.json();
	}
	function verify_nonce(result: Uint8Array, target: Uint8Array): boolean {
		if (result.length !== target.length) {
			return false;
		}
		for (let i = 0; i < result.length; i++) {
			if (result[i] > target[i]) {
				return false;
			} else if (result[i] < target[i]) {
				break;
			}
		}
		return true;
	}
	function solve_challenge(challenge: RequestChallengeResult): string {
		let nonce = 0;
		const target = Buffer.from(challenge.target, 'hex');
		while (true) {
			const input = challenge.prefix + nonce.toString();
			const hashed = crypto.createHash('sha256').update(input).digest();
			if (verify_nonce(hashed, target)) {
				break;
			} else {
				nonce++;
			}
		}

		return `${challenge.prefix}:${nonce}`;
	}
	async function post_with_token(path: string, body: object, opts?: LRCLibOpts): PromiseResult<null> {
		const challenge = await request_challenge(opts);
		if ('error' in challenge) return challenge;
		const response = await api_request<never>(path, {
			headers: { 'X-Publish-Token': solve_challenge(challenge), 'Content-Type': 'application/json' },
			method: 'POST',
			body: JSON.stringify(body)
		}, opts);
		if ('error' in response) return response;
		return null;
	}
	export async function publish(info: PublishParams, opts?: LRCLibOpts): PromiseResult<null> {
		return await post_with_token('publish', info, opts);
	}
	export async function flag(info: FlagParams, opts?: LRCLibOpts): PromiseResult<null> {
		return await post_with_token('flag', info, opts);
	}
}
