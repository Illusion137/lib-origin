import type { WebPoSignalOutput } from 'bgutils-js/shared-types';
import { WebPoMinter } from 'bgutils-js/webpo';
import type { Innertube, Types } from 'youtubei.js';
import { generror } from '@common/utils/error_util';
import type { PromiseResult } from '@common/types';
import { TimedCacheValue } from '@common/types';
import { milliseconds_of } from '@common/utils/util';
import { block_fetch_item, delete_block_fetch_item, get_block_fetch_item } from '@common/utils/timed_util';
import { buildURL, getHeaders } from 'bgutils-js/utils';
import type { BotGuardWebPo } from '@native/botguard_solver/botguard_solver.base';
import { load_native_botguard } from '@native/botguard_solver/botguard_solver';

const REQUEST_KEY = 'O43z0dpjhgX20SCx4KAo';

type BotGuardManager = Innertube['botguard'];
export interface PoTokenResult {
	po_token: string;
	identifier: string;
}
interface TokenIntegrityData {
	integrityToken?: string;
	estimatedTtlSecs: number;
	mintRefreshThreshold?: number;
	websafeFallbackToken?: string;
}
interface BotGuardResponse {
	web_response: string;
	challenge: Types.BotGuardChallengeInfo;
}

export namespace PoToken {
	// * REQUIRES COOKIES in Innertube
	export async function potato_token_integrity_data(botguard_manager: BotGuardManager, botguard_response: BotGuardResponse): PromiseResult<TokenIntegrityData> {
		const integrity_token_response = await botguard_manager.fetchIntegrityToken(await load_native_botguard(), botguard_response.challenge);

		if (typeof integrity_token_response.integrity_token !== 'object') {
			return generror('Could not get integrity token', 'CRITICAL', { integrity_token_response });
		}

		const token_integrity_data = {
			integrityToken: integrity_token_response.integrity_token.integrity_token,
			estimatedTtlSecs: integrity_token_response.integrity_token.estimated_ttl_secs,
			mintRefreshThreshold: integrity_token_response.integrity_token.mint_refresh_threshold,
			websafeFallbackToken: integrity_token_response.integrity_token.websafe_fallback_token
		};
		return token_integrity_data;
	}
	export async function genit_token_integrity_data(web_response: string): PromiseResult<TokenIntegrityData> {
		const integrity_token_response = await fetch(buildURL('GenerateIT', true), {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify([REQUEST_KEY, web_response])
		});

		const integrity_token_json = await integrity_token_response.json() as [string, number, number, string];

		if (typeof integrity_token_json[0] !== 'string') {
			return generror('Could not get integrity token', 'CRITICAL', { integrityTokenJson: integrity_token_json });
		}

		const [integrity_token, estimated_ttl_secs, mint_refresh_threshold, websafe_fallback_token] = integrity_token_json;

		const token_integrity_data = {
			integrityToken: integrity_token,
			estimatedTtlSecs: estimated_ttl_secs,
			mintRefreshThreshold: mint_refresh_threshold,
			websafeFallbackToken: websafe_fallback_token
		};
		return token_integrity_data;
	}

	const global_minter_cache: TimedCacheValue<WebPoMinter> = new TimedCacheValue<WebPoMinter>();
	async function create_minter(botguard_manager: BotGuardManager): PromiseResult<WebPoMinter> {
		const cache_result = global_minter_cache.get();
		if (cache_result !== undefined) cache_result;

		const web_po_signal_output: WebPoSignalOutput = [];

		const botguard_response = await botguard_manager.run<BotGuardWebPo>(await load_native_botguard(), {
			content_binding: () => ({ webPoSignalOutput: web_po_signal_output }),
			atn_page_url: 'https://www.youtube.com',
			engagement_type: 'ENGAGEMENT_TYPE_UNKNOWN',
			ids: []
		});

		const token_integrity_data = await genit_token_integrity_data(botguard_response.web_response);
		if ('error' in token_integrity_data) return token_integrity_data;

		const web_po_minter = await WebPoMinter.create(token_integrity_data, web_po_signal_output);

		global_minter_cache.set_with_lifespan(web_po_minter, milliseconds_of({ seconds: token_integrity_data.estimatedTtlSecs }));
		return web_po_minter;
	}

	const KEY = 'WEBPO';
	export async function fetch_minter(botguard_manager: BotGuardManager): PromiseResult<WebPoMinter> {
		if (global_minter_cache.get() === undefined && get_block_fetch_item(KEY)?.[0] === 'recieved') delete_block_fetch_item(KEY);
		return await block_fetch_item(KEY, async () => await create_minter(botguard_manager));
	}

	export async function generate_potoken(botguard_manager: BotGuardManager, content_binding: string): PromiseResult<PoTokenResult> {
		content_binding ??= '';
		const web_po_minter = await fetch_minter(botguard_manager);
		if ('error' in web_po_minter) return web_po_minter;
		const po_token = await web_po_minter.mintAsWebsafeString(content_binding);

		return {
			po_token,
			identifier: content_binding
		};
	}
	export async function generate_potoken_bytes(botguard_manager: BotGuardManager, content_binding: string) {
		content_binding ??= '';
		const web_po_minter = await fetch_minter(botguard_manager);
		if ('error' in web_po_minter) return web_po_minter;
		const po_token = await web_po_minter.mint(content_binding);
		return po_token;
	}

}
