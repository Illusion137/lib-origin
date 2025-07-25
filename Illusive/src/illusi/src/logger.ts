import type { ResponseError } from "@common/types";

export namespace Logger {
    export async function log_error(error: string|ResponseError) {
        error;
    }
}