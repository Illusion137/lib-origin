import type { Proxy } from "../proxy/proxy";
import { CookieJar } from "../utils/cookie_util";
import axios from "axios";
import { encode_params } from "../utils/util";

export namespace Traktrain {
    interface Opts {proxy?: Proxy.Proxy}

    const cookie_jar = new CookieJar([]);

    function base_headers(){
        return {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "priority": "u=0, i",
            "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": cookie_jar.toString()
        };
    }

    function proxy_opt(opts: Opts){
        console.log("PROXYING AXIOS: ", opts.proxy !== undefined ? {host: opts.proxy.ip, port: opts.proxy.port} : undefined);
        return opts.proxy !== undefined ? {host: opts.proxy.ip, port: opts.proxy.port} : undefined;
    }

    export async function producer(producer_id: string, opts: Opts){
        const response = await axios.get(`https://traktrain.com/${producer_id}`, {headers: base_headers(), proxy: proxy_opt(opts)});
        cookie_jar.updateWithAxios(response);
        const html: string = response.data;
        const matches = html.matchAll(/data-name="(.+?)"\n.+?data-id="(.+?\.mp3)"\n/gi);
        const beats = [...matches].map(beat => [beat[1].trim(), beat[2].trim()]); // [name, data-id]
        return beats;
    }
    export async function online(opts: Opts){
        const response = await axios.put('https://traktrain.com/customer/online', {headers: {
            ...base_headers(),
            "x-requested-with": "XMLHttpRequest",
        }, proxy: proxy_opt(opts)});
        cookie_jar.updateWithAxios(response);
        return response.data;
    }

    export async function play(producer_id: string, opts: Opts){
        // https://traktrain.com/api/stats/play/1302961/21902?source=producer&path=%2Fsamrubin&playId=sbw91dy7fp0jvrxevhmb
        const params = {
            source: "producer",
            path: `/${producer_id}`,
            playId: 'sbw91dy7fp0jvrxevhmb'
        }
        const response = await axios.post(`https://traktrain.com/api/stats/play/1302961/21902?${encode_params(params)}`, {headers: {
            ...base_headers(),
            "Referer": `https://traktrain.com/${producer_id}`,
            "x-requested-with": "XMLHttpRequest",
        }, proxy: proxy_opt(opts)});

        cookie_jar.updateWithAxios(response);

        console.log("PLAY_STATUS: ", response.status);
        console.log("PLAY_STATUS_TEXT: ", response.statusText);
        console.log("PLAY: ", response.data);
    }
    export async function play_finish(producer_id: string, opts: Opts){
        // https://traktrain.com/api/stats/play-finish/1302972?s=5&playId=z3s4tvab97hzg5s2rj9a&duration=133&source=producer
        const params = {
            s: 5,
            playId: "z3s4tvab97hzg5s2rj9a",
            duration: 133,
            source: "producer"
        }
        const response = await axios.post(`https://traktrain.com/api/stats/play-finish/1302972?${encode_params(params)}`, {headers: {
            ...base_headers(),
            "Referer": `https://traktrain.com/${producer_id}`,
            "x-requested-with": "XMLHttpRequest",
        }, proxy: proxy_opt(opts)});

        cookie_jar.updateWithAxios(response);

        console.log("PLAY_FINSIH_STATUS: ", response.status);
        console.log("PLAY_FINSIH_STATUS_TEXT: ", response.statusText);
        console.log("PLAY_FINSIH: ", response.data);
    }

    export async function beat_mp3(producer_id: string, id: string, opts: Opts){

        play(producer_id, opts).catch(e => { console.error(e); });

        const response = await axios.get(`https://d2lvs3zi8kbddv.cloudfront.net/${id}`, {headers: {
            ...base_headers(),
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "priority": "i",
            "range": "bytes=0-",
            "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "audio",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "Referer": "https://traktrain.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }, proxy: proxy_opt(opts)});
        console.log("[BEAT]===============================");
        console.log("STATUS: ", response.status);
        console.log("STATUS_TEXT: ", response.statusText);
        console.log("HEADERS: ", response.headers);
        // console.log("DATA: ", response.data);
        return response.data;
    }
}