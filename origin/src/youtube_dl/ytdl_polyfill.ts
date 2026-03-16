import 'event-target-polyfill';
import 'web-streams-polyfill';
import 'text-encoding-polyfill';
import 'react-native-url-polyfill/auto';
import { decode, encode } from 'base-64';

if (!global.btoa) {
	global.btoa = encode;
}

if (!global.atob) {
	global.atob = decode;
}

// https://github.com/lovegaoshi/azusa-player-mobile/commit/fbe48cfbe0c490b8b00760ef23071e865afac141#diff-fb1cd04255454573a01fe97acd969c75c490731cc03538c4972edde845f9fcbe
class MMKV {
	id: string;
	map: Map<string, Uint8Array>;

	constructor({ id }: { id: string }) {
		this.id = id;
		this.map = new Map();
	}
	getBuffer(key: string) {
		const value = this.map.get(key);
		return value ? { buffer: value } : null;
	}
	set(key: string, value: Uint8Array) {
		this.map.set(key, value);
	}
	delete(key: string) {
		this.map.delete(key);
	}
}
(global as any).mmkvStorage = MMKV as any;

// See https://github.com/nodejs/node/issues/40678#issuecomment-1126944677
class CustomEvent extends Event {
	readonly #detail;

	constructor(type: string, options?: CustomEventInit<any[]>) {
		super(type, options);
		this.#detail = options?.detail ?? null;
	}

	get detail() {
		return this.#detail as unknown[];
	}
}

global.CustomEvent = CustomEvent as any;

import 'youtubei.js/react-native';