import type { PromiseResult, ResponseError } from "@common/types";
import { generror_catch, generror_ignore } from "@common/utils/error_util";
import { wait } from "@common/utils/timed_util";
import { load_native_network, network } from "@native/network/network";

const TRANSIENT_NETWORK_SIGNATURES: RegExp[] = [
    /the request timed out/i,
    /the network connection was lost/i,
    /could not connect to the server/i,
    /the network connection was interrupted/i,
    /the internet connection appears to be offline/i,
    /network request failed/i,
    /fetch failed/i,
    /load failed/i,
    /socket hang up/i,
    /timed out/i,
    /ECONNRESET/i,
    /ECONNREFUSED/i,
    /ECONNABORTED/i,
    /ETIMEDOUT/i,
    /EPIPE/i,
    /ENETDOWN/i,
    /ENETUNREACH/i,
    /EAI_AGAIN/i,
    /UND_ERR_(CONNECT_TIMEOUT|SOCKET|HEADERS_TIMEOUT|BODY_TIMEOUT)/i
];

export function is_transient_network_error(e: Error): boolean {
    const haystack = [e.message, e.name].filter(v => typeof v === "string").join(" ");
    if (haystack.length > 0 && TRANSIENT_NETWORK_SIGNATURES.some(rx => rx.test(haystack))) return true;
    return false;
}

function is_response_error<T>(value: ResponseError | T): value is ResponseError {
    return typeof value === "object" && value !== null && "error" in value;
}

export interface RetryResultOptions {
    retries?: number;
    base_delay_ms?: number;
    max_delay_ms?: number;
    wait_for_network?: boolean;
    network_timeout_ms?: number;
    should_retry?: (error: ResponseError) => boolean;
    on_retry?: (error: ResponseError, attempt: number, delay_ms: number) => void;
}

export async function retry_result<T>(op: (attempt: number) => PromiseResult<T>, options: RetryResultOptions = {}): PromiseResult<T> {
    const retries = options.retries ?? 3;
    const base_delay_ms = options.base_delay_ms ?? 500;
    const max_delay_ms = options.max_delay_ms ?? 8000;
    const wait_for_network = options.wait_for_network ?? false;
    const should_retry = options.should_retry ?? (error => is_transient_network_error(error.error));

    let last_error: ResponseError = generror_ignore("retry_result: operation never ran", "INFO");
    for (let attempt = 0; attempt <= retries; attempt++) {
        let result: ResponseError | T;
        try { result = await op(attempt); }
        catch (e) { result = generror_catch(e, "retry_result operation threw", "LOW", { attempt }); }

        if (!is_response_error(result)) return result;
        last_error = result;
        if (attempt >= retries || !should_retry(last_error)) return last_error;

        if (wait_for_network) {
            await load_native_network();
            await network().wait_for_internet({ timeout_ms: options.network_timeout_ms ?? 30000 });
        }
        const backoff = Math.min(max_delay_ms, base_delay_ms * 2 ** attempt);
        const delay_ms = Math.floor(Math.random() * backoff);
        options.on_retry?.(last_error, attempt, delay_ms);
        await wait(delay_ms);
    }
    return last_error;
}
