import rozfetch from "@common/rozfetch";
import type { PromiseResult } from "@common/types";
import { encode_params, google_query } from "@common/utils/fetch_util";
import type { GetParams, RequestChallengeResult, SearchParams, SearchResult } from "./types";
import crypto from 'react-native-quick-crypto';
import BufferRN from "buffer/";

const Buffer = BufferRN.Buffer;
export namespace LRCLib { 
    const USER_AGENT = "LIB_ORIGIN v21.0.0 (https://github.com/Illusion137/lib-origin)";

    async function get_request<T>(path: string, params: Record<string, any>){
        const response = await rozfetch<T>(`https://lrclib.net/api/${path}?${encode_params(params)}`, {
            headers: { "User-Agent": USER_AGENT }
        });
        if("error" in response) return response;
        const data = await response.json();
        return data;
    }

    export async function get(params: GetParams){
        return await get_request<SearchResult>("get", params);
    }
    export async function get_cached(params: GetParams){
        return await get_request<SearchResult>("get-cached", params);
    }
    export async function get_id(id: string){
        return await get_request<SearchResult>(`get/${id}`, {});
    }
    export async function search(params: SearchParams): PromiseResult<SearchResult[]>{
        if("q" in params) params.q = google_query(params.q);
        return await get_request<SearchResult[]>(`search`, params);
    }
    async function request_challenge(): PromiseResult<RequestChallengeResult>{
        const response = await rozfetch<RequestChallengeResult>(`https://lrclib.net/api/request-challenge`, {
            headers: { "User-Agent": USER_AGENT },
            method: "POST"
        });
        if("error" in response) return response;
        const data = await response.json();
        return data;
    }
    function verify_nonce(result: Uint8Array, target: Uint8Array): boolean {
        if (result.length !== target.length) {
            return false;
        }
        for (let i = 0; i < result.length; i++) {
            if (result[i] > target[i]) {
                return false;
            } else if (result[i] < target[i]) {
                break;
            }
        }
        return true;
    }
    function solve_challenge(challenge: RequestChallengeResult): string {
        let nonce = 0;
        const target = Buffer.from(challenge.target, 'hex');

        while (true) {
            const input = challenge.prefix + nonce.toString();
            const hashed = crypto.createHash('sha256').update(input).digest();

            if (verify_nonce(hashed, target)) {
                break;
            } else {
                nonce++;
            }
        }

        return nonce.toString();
    }
    export async function publish(info: SearchResult): PromiseResult<null>{
        const challenge = await request_challenge();
        if("error" in challenge) return challenge;
        const response = await rozfetch(`https://lrclib.net/api/publish`, {
            headers: { "User-Agent": USER_AGENT, "X-Publish-Token": solve_challenge(challenge) },
            method: "POST",
            body: JSON.stringify(info)
        });
        if("error" in response) return response;
        return null;
    }
};