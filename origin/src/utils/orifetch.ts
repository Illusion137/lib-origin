import axios, { AxiosError } from "axios";
import { Proxy } from "../proxy/proxy";

let timeout_ms = 0;
let stack = 0;
export function push_abortion(new_timeout_ms: number, new_stack: number){
    timeout_ms = new_timeout_ms;
    stack = new_stack;
}

export default async function fetch<T = unknown>(input: string, init?: RequestInit & {proxy?: Proxy.Proxy}): Promise<Response> {
    try {
        const promise_response = axios<T>({
            url: input,
            method: init?.method,
            headers: init?.headers as any,
            data: init?.body,
            proxy: Proxy.to_axios_proxy(init?.proxy),
            maxRedirects: 2,
            timeout: timeout_ms
        });
        if(stack-- <= 0) timeout_ms = 0;
        const response = await promise_response;

        return {
            ok: response.status >= 200 && response.status < 300,
            status: response.status,
            statusText: response.statusText,
            json: async () => response.data,
            text: async () => response.data as string,
            body: <any>undefined,
            headers: response.headers as any,
            type: <any>undefined,
            url: response.request,
            redirected: <any>undefined,
            clone: () => <any>undefined,
            bodyUsed: <any>undefined,
            arrayBuffer: <any>undefined,
            blob: <any>undefined,
            bytes: <any>undefined,
            formData: <any>undefined
        }
    }
    catch(e: unknown){
        const error: AxiosError<T> = e as AxiosError<T>;
        if(stack-- <= 0) timeout_ms = 0;
        return {
            ok: false,
            status: error.response?.status ?? 500,
            statusText: error.response?.statusText ?? error.message,
            json: async () => ({error: new Error(error.message)}),
            text: async () => error.message,
            body: <any>undefined,
            headers: error.response?.headers as any,
            type: <any>undefined,
            url: error.response?.request,
            redirected: <any>undefined,
            clone: () => <any>undefined,
            bodyUsed: <any>undefined,
            arrayBuffer: <any>undefined,
            blob: <any>undefined,
            bytes: <any>undefined,
            formData: <any>undefined
        }
    }
}