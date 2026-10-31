export interface ProxyFetchInit extends RequestInit {
	proxy: { ip: string; port: number };
}

export type ProxyFetch = (input: string, init: ProxyFetchInit) => Promise<Response>;
