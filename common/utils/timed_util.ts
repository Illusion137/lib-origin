import type { PromiseResult, ResponseError } from '../types';

export async function wait(milliseconds: number) {
	return new Promise(function (resolve) {
		setTimeout(resolve, milliseconds, 'HASH_TIMED_OUT');
	});
}
export async function timeout_call(promise: () => Promise<any>, timeout_milliseconds: number) {
	await Promise.race([
		promise(),
		wait(timeout_milliseconds)
	]);
}
export async function wait_for(condition_function: () => boolean, poll_rate_ms = 400) {
	const poll = (resolve: () => void) => {
		if (condition_function()) resolve();
		else setTimeout((_: never) => { poll(resolve); }, poll_rate_ms);
	};
	return new Promise(poll as never);
}
type BlockFetchResultSent<T> = ['sent', PromiseResult<T>];
type BlockFetchResultRecieved<T> = ['recieved', T | ResponseError];
const block_fetch_item_map: Record<string, BlockFetchResultSent<unknown> | BlockFetchResultRecieved<unknown>> = {};
export async function block_fetch_item<T>(key: string, callback: () => PromiseResult<T>): PromiseResult<T> {
	if (block_fetch_item_map[key]?.[0] === 'recieved') return block_fetch_item_map[key][1] as T | ResponseError;
	if (block_fetch_item_map[key]?.[0] === 'sent') {
		const recieved = await block_fetch_item_map[key][1] as T | ResponseError;
		block_fetch_item_map[key] = ['recieved', recieved];
		return recieved;
	}
	const sent_item = callback();
	block_fetch_item_map[key] = ['sent', sent_item];
	return await sent_item;
}
export function get_block_fetch_item<T>(key: string) {
	return block_fetch_item_map[key] as T;
}
export function delete_block_fetch_item(key: string) {
	delete block_fetch_item_map[key];
}
