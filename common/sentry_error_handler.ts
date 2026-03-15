import * as Sentry from "@sentry/react-native";
import { SEVERITY_HANDLER_MAP } from "./utils/error_util";
import type { ResponseError } from "./types";

function error_message(error: ResponseError) {
    return error.error.stack ?? error.error.message;
}

export function initialize_sentry_severity_handler() {
    SEVERITY_HANDLER_MAP.INFO = (error: ResponseError) => {
        Sentry.addBreadcrumb({ message: error_message(error), level: "info" });
    };
    SEVERITY_HANDLER_MAP.LOW = (error: ResponseError) => {
        Sentry.addBreadcrumb({ message: error_message(error), level: "warning" });
    };
    SEVERITY_HANDLER_MAP.MEDIUM = (error: ResponseError) => {
        Sentry.captureException(error.error);
    };
    SEVERITY_HANDLER_MAP.CRITICAL = (error: ResponseError) => {
        Sentry.captureException(error.error);
    };
}
