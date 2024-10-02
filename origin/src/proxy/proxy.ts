import { ResponseError } from "./utils/types";

export namespace Proxy {
    export type Proxy = { ip: string; port: number };
    
    function get_random_index(max: number) {
        return Math.floor(Math.random() * (Math.floor(max) - 0) + 0); // The maximum is exclusive and the minimum is inclusive
    }

    export async function get_proxy_list(): Promise<Proxy[] | ResponseError>{
        try {
            const proxy_regex = /((\d+\.)+(\d+)):(\d+)/g
            const body = await (await fetch("https://www.us-proxy.org/", {'method': 'GET'})).text()
        
            const matched_proxies = [...body.matchAll(proxy_regex)]
            const proxies: Proxy[] = [];
            for(let i = 0; i < matched_proxies.length; i++){
                proxies.push({
                    ip: matched_proxies[i][1],
                    port: parseInt(matched_proxies[i][4]),
                });
            }
            return proxies;
        } catch (error) { return { "error": String(error) }; }
    }
    export function get_axios_proxies(proxies: Proxy[]): {host: string, port: number}[]{
        return proxies.map(p => ({"host": p.ip, "port": p.port}));
    }
    export function get_random_proxy(proxies: Proxy[]){
        return proxies[get_random_index(proxies.length)];
    }
}