import type { PromiseResult } from "@common/types";

export interface TurnstileSolveOpts {
    page_url: string;
    sitekey?: string;
    timeout_ms?: number;
}

export interface TurnstileSolveResult {
    // the 0.xxx turnstile token (a.k.a. secondaryToken) consumed by verify-turnstile
    token: string;
    // "name=value" cookie pairs harvested from the solving browser, including the
    // HttpOnly cf_clearance set by the challenge platform's /rc finalize
    cookies: string[];
}

export interface TurnstileSolver {
    solve: (opts: TurnstileSolveOpts) => PromiseResult<TurnstileSolveResult>;
}
