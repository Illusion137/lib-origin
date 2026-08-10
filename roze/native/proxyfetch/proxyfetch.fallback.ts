import type { ProxyFetch } from "@native/proxyfetch/proxyfetch.base";

let warned = false;

export const fallback_proxyfetch: ProxyFetch = async (input, init) => {
	if (!warned) {
		warned = true;
		console.error(new Error("proxyfetch: proxying is not supported on this platform; falling back to a direct (unproxied) request"));
	}
	const { proxy: _proxy, ...rest } = init;
	return fetch(input, rest);
};
