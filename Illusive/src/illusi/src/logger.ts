import { ResponseError } from "../../../../origin/src/utils/types";

export namespace Logger {
    export async function log_error(error: string|ResponseError) {
        error;
    }
}