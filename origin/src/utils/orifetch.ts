import axios, { AxiosError } from "axios";
import { Proxy } from "../proxy/proxy";


export default async function fetch<T = unknown>(input: string, init?: RequestInit & {proxy?: Proxy.Proxy}): Promise<Response> {
    try {
        const response = await axios<T>({
            url: input,
            method: init?.method,
            headers: init?.headers as any,
            data: init?.body,
            proxy: Proxy.to_axios_proxy(init?.proxy),
            maxRedirects: 2
        });

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