import type { WebPoSignalOutputFunction } from 'bgutils-js/shared-types';
import type { BotGuardSolver } from './botguard_solver.base';
import nodejs from 'nodejs-mobile-react-native';
import { milliseconds_of } from '@common/utils/util';

const WEB_RESPONSE_CHANNEL = 'BOTGUARD_WEB_RESPONSE';
const WEB_PO_SIGNAL_OUTPUT_CHANNEL = 'BOTGUARD_WEB_PO_SIGNAL_OUTPUT';
const WEB_PO_MINT_CHANNEL = 'BOTGUARD_WEB_PO_MINT';
const REQUEST_TIMEOUT_MS = milliseconds_of({ seconds: 30 });

interface ChannelResponse {
	request_id: number;
	result?: unknown;
	error?: string;
}
interface PendingRequest {
	resolve: (result: unknown) => void;
	reject: (error: Error) => void;
	timer: ReturnType<typeof setTimeout>;
}
interface WebResponseResult {
	botguard_response: string;
	minter_handle?: number;
}

const pending_requests = new Map<number, PendingRequest>();
let request_counter = 0;

function on_channel_response(response: ChannelResponse) {
	const pending = pending_requests.get(response.request_id);
	if (pending === undefined) return;
	pending_requests.delete(response.request_id);
	clearTimeout(pending.timer);
	if (response.error !== undefined) pending.reject(new Error(response.error));
	else pending.resolve(response.result);
}

for (const channel of [WEB_RESPONSE_CHANNEL, WEB_PO_SIGNAL_OUTPUT_CHANNEL, WEB_PO_MINT_CHANNEL]) {
	nodejs.channel.addListener(channel, on_channel_response);
}

function request<T>(channel: string, payload: Record<string, unknown>): Promise<T> {
	const request_id = ++request_counter;
	return new Promise<T>((resolve, reject) => {
		const timer = setTimeout(() => {
			pending_requests.delete(request_id);
			reject(new Error(`BotGuard node request timed out on ${channel}`));
		}, REQUEST_TIMEOUT_MS);
		pending_requests.set(request_id, { resolve: resolve as (result: unknown) => void, reject, timer });
		nodejs.channel.post(channel, { request_id, ...payload });
	});
}

function create_web_po_signal_output_function(minter_handle: number): WebPoSignalOutputFunction {
	return async (integrity_token: Uint8Array) => {
		const mint_handle = await request<number>(WEB_PO_SIGNAL_OUTPUT_CHANNEL, { minter_handle, integrity_token: Array.from(integrity_token) });
		return async (content_binding: Uint8Array) => {
			const minted = await request<number[] | null>(WEB_PO_MINT_CHANNEL, { mint_handle, content_binding: Array.from(content_binding) });
			return minted === null ? undefined : new Uint8Array(minted);
		};
	};
}

export const mobile_botguard_solver: BotGuardSolver = {
	solve: async (botguard_challenge, binding) => {
		let interpreter_url = botguard_challenge.interpreter_url.private_do_not_access_or_else_safe_script_wrapped_value ?? botguard_challenge.interpreter_url.private_do_not_access_or_else_trusted_resource_url_wrapped_value ?? '';

		if (interpreter_url.startsWith('//')) interpreter_url = `https:${interpreter_url}`;

		const bg_script_response = await fetch(interpreter_url);
		const interpreter_javascript = await bg_script_response.text();

		const web_po = 'webPoSignalOutput' in binding;

		const { botguard_response, minter_handle } = await request<WebResponseResult>(WEB_RESPONSE_CHANNEL, {
			interpreter_javascript,
			program: botguard_challenge.program,
			global_name: botguard_challenge.global_name,
			ytcfg: botguard_challenge.ytcfg,
			content_binding: web_po ? undefined : binding,
			web_po
		});

		if (web_po && minter_handle !== undefined) {
			binding.webPoSignalOutput.push(create_web_po_signal_output_function(minter_handle));
		}

		return botguard_response;
	}
};
