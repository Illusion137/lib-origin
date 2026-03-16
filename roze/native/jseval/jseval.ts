import { get_native_platform } from "@native/native_mode";
interface JSEval {
    eval_in_webview: (code: string, timeout_ms?: number) => any
};
let jseval_instance: JSEval;

export async function load_native_jseval(): Promise<JSEval> {
    if (jseval_instance) return jseval_instance;
    switch (get_native_platform()) {
        case "WEB":
            console.error("Web Native JSEval is NOT implemented");
            break;
        case "NODE":
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-implied-eval
                jseval_instance = { eval_in_webview: (code: string) => { return new Function(code)(); } };
            } catch (e) { console.error(e); }
            break;
        case "REACT_NATIVE":
            try {
                jseval_instance = { eval_in_webview: (await import("./jseval.mobile.tsx")).eval_in_webview };
            } catch (e) { console.error(e); }
            break;
    }
    return jseval_instance;
}

export function jseval(): JSEval {
    if (jseval_instance) return jseval_instance;
    console.error(new Error("Native Module [jseval/JSEval] is NOT loaded"));
    return jseval_instance;
}