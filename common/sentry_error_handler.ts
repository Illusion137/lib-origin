import * as Sentry from "@sentry/react-native";
import { SEVERITY_HANDLER_MAP } from "./utils/error_util";
import type { ResponseError } from "./types";

function error_message(error: ResponseError) {
    return error.error.stack ?? error.error.message;
}

let console_sink_enabled = false;
export function set_breadcrumb_console_sink(enabled: boolean) {
    console_sink_enabled = enabled;
}

export function breadcrumb(category: string, message: string, data?: Record<string, unknown>) {
    if (console_sink_enabled) console.log(`[${category}] ${message}`, data ?? "");
    Sentry.addBreadcrumb({ category, message, data, level: "info" });
}
export function set_context(name: string, context: Record<string, any>) {
    Sentry.setContext(name, context);
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
