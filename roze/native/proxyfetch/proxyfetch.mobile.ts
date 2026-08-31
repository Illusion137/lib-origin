import type { ProxyFetch } from "@native/proxyfetch/proxyfetch.base";

export const mobile_proxyfetch: ProxyFetch = async (input, init) => {
	const { proxy: _proxy, ...rest } = init;
	return fetch(input, rest);
};
