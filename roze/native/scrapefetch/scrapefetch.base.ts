export interface ScrapeFetchInit extends RequestInit {
	proxy?: { ip: string; port: number };
	proxy_url?: string;
}

export type ScrapeFetch = (input: string, init?: ScrapeFetchInit) => Promise<Response>;
