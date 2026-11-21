import rozfetch from '@common/rozfetch';
import type { BaseOpts, PromiseResult, ResponseError } from '@common/types';
import { encode_params } from '@common/utils/fetch_util';
import { generror } from '@common/utils/error_util';
import type { UnisonEnvelope, UnisonLookupParams, UnisonLyrics } from './types';

/**
 * Unison, Better Lyrics' community lyrics (https://unison.betterlyrics.org). Reads need no key. Its terms allow
 * individuals, non-profits and open-source apps only, and require crediting the lyrics and their submitter.
 */
export namespace Unison {
	const BASE_URL = 'https://unison.betterlyrics.org';
	/** Unison asks for a user agent that names the app and links to it. */
	const USER_AGENT = 'LIB_ORIGIN v21.0.0 (https://github.com/Illusion137/lib-origin)';

	type Opts = BaseOpts;

	export async function get_lyrics(params: UnisonLookupParams, opts: Opts = {}): PromiseResult<UnisonLyrics> {
		const query = encode_params(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '')));
		const response = await rozfetch<UnisonEnvelope<UnisonLyrics>>(`${BASE_URL}/lyrics?${query}`, {
			headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
			ignore_fail_request: true,
			...opts.fetch_opts
		});
		if ('error' in response) return response;
		const json = await response.json();
		if ('error' in json && typeof json.error !== 'string') return json as ResponseError;
		const body = json as UnisonEnvelope<UnisonLyrics>;
		if (response.status === 404) return generror('Unison: lyrics not found', 'INFO', { params, status: 404 });
		// LOOKUP_PENDING: Unison is still resolving this track; asking again later may find it.
		if (body.code === 'LOOKUP_PENDING') return generror('Unison: lookup pending', 'INFO', { params, retry_after: response.headers.get('Retry-After') });
		if (!response.ok || !body.success || !body.data) return generror(`Unison request failed: ${body.code ?? response.status} ${body.error ?? ''}`.trim(), 'LOW', { params, status: response.status });
		return body.data;
	}
}
