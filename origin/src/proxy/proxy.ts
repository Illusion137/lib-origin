import type { AxiosProxyConfig } from "axios";
import type { ResponseError } from "../../../common/types";

export namespace Proxy {
    export interface Proxy { ip: string; port: number };
    export interface MoreProxy { ip: string; port: number; code: string; country: string; anonymity: string; google?: boolean; https: boolean; last_checked: string };
    
    function get_random_index(max: number) {
        return Math.floor(Math.random() * (Math.floor(max) - 0) + 0); // The maximum is exclusive and the minimum is inclusive
    }

    const ip_regex = /^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\.(?!$)|$)){4}$/;

    let cached_proxies: MoreProxy[] = [];
    export async function get_new_proxy_list(filter?: (proxy: MoreProxy) => boolean): Promise<MoreProxy[] | ResponseError> {
        try {
            if(cached_proxies.length > 0) return cached_proxies;
            const proxy_regex = /(\s*)?<tr>.{0,50}?<(td ?.+?>(.{0,30}?)<\/td>\s*<){4}\/tr>/gis;
            const body = await (await fetch("https://www.us-proxy.org/", {method: 'GET'})).text();
        
            const matched_proxies = [...body.matchAll(proxy_regex)];
            // console.log(matched_proxies);
            const proxies: MoreProxy[] = [];
            for(const matched_proxy of matched_proxies) {
                const [ip, port, code, country, anonymity, google, https, last_checked] = matched_proxy[0]
                    .replace(/<tr>/g, '')
                    .replace(/<\/tr>/g, '')
                    .replace(/<td.{0,12}?>/g, '')
                    .split('</td>')
                    .map(line => line.trim())
                    .filter(line => line);
                if(!ip_regex.test(ip)) continue;
                proxies.push({
                    ip: ip,
                    port: parseInt(port),
                    code: code,
                    country: country,
                    anonymity: anonymity,
                    google: google === "yes" ? true : google === "no" ? false : undefined,
                    https: https === "yes" ? true : false,
                    last_checked: last_checked
                });
            }
            cached_proxies = filter ? proxies.filter(filter) : proxies;
            return cached_proxies;
        } catch (error) { return { error: error as Error }; }
    }
    export async function get_proxy_list(filter?: (proxy: Proxy) => boolean): Promise<Proxy[] | ResponseError> {
        try {
            const proxy_regex = /((\d+\.)+(\d+)):(\d+)/g;
            const body = await (await fetch("https://www.us-proxy.org/", {method: 'GET'})).text();
        
            const matched_proxies = [...body.matchAll(proxy_regex)]
            const proxies: Proxy[] = [];
            for(const matched_proxy of matched_proxies) {
                proxies.push({
                    ip: matched_proxy[1],
                    port: parseInt(matched_proxy[4]),
                });
            }
            return filter ? proxies.filter(filter) : proxies;
        } catch (error) { return { error: error as Error }; }
    }
    export function to_axios_proxy(p?: Proxy): AxiosProxyConfig|undefined{
        if(p === undefined) return undefined;
        return ({host: p.ip, port: p.port, protocol: 'http' });
    }
    export function get_axios_proxies(proxies: Proxy[]): {host: string, port: number}[] {
        return proxies.map(p => ({host: p.ip, port: p.port}));
    }
    export function get_random_proxy(proxies: Proxy[]) {
        return proxies[get_random_index(proxies.length)];
    }
}