import { ProxyAgent, fetch as undici_fetch } from "undici";
import type { ProxyFetch } from "@native/proxyfetch/proxyfetch.base";

const proxy_agents = new Map<string, ProxyAgent>();

function get_proxy_agent(ip: string, port: number): ProxyAgent {
	const key = `${ip}:${port}`;
	let agent = proxy_agents.get(key);
	if (!agent) {
		agent = new ProxyAgent(`http://${ip}:${port}`);
		proxy_agents.set(key, agent);
	}
	return agent;
}

export const node_proxyfetch: ProxyFetch = async (input, init) => {
	const { proxy, ...rest } = init;
	const dispatcher = get_proxy_agent(proxy.ip, proxy.port);
	return (await undici_fetch(input, { ...rest, dispatcher } as Parameters<typeof undici_fetch>[1])) as unknown as Response;
};
