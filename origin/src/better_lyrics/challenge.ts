import rozfetch, { type RoZFetchRequestInit } from "@common/rozfetch";
import type { PromiseResult } from "@common/types";
import { CookieJar } from "@common/utils/cookie_util";
import { generror } from "@common/utils/error_util";
import { extract_string_from_pattern, extract_strings_from_pattern } from "@common/utils/util";
import { load_native_turnstile, turnstile } from "@native/turnstile/turnstile";

export namespace BetterLyricsChallenger {
    interface Opts { cookie_jar: CookieJar, fetch_opts?: RoZFetchRequestInit };
    const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";
    const BASE_URL = "https://lyrics.api.dacubeking.com";
    const CHALLENGE_URL = "https://lyrics.api.dacubeking.com/challenge";

    function headers(opts: Opts){
        return {
            "sec-ch-ua": "\"Chromium\";v=\"148\", \"Google Chrome\";v=\"148\", \"Not/A)Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "Referer": "https://lyrics.api.dacubeking.com/",
            "user-agent": UA,
            "cookie": opts.cookie_jar.toString()
        };
    }

    interface ChallengeDetails {
        initial_variables: string;
        script_path: string;
        turnstile_sitekey: string;
    };

    async function get_challenge_details(opts: Opts): PromiseResult<ChallengeDetails>{
        const home_response = await rozfetch(CHALLENGE_URL, {...opts.fetch_opts, impersonate: true, headers: headers(opts)});
        if("error" in home_response) return home_response;
        opts.cookie_jar.updateWithFetch(home_response);
        const home_html = await home_response.text();
        const raw_challenge_details_extractor = /innerHTML ?= ?"(.+?)";/gi;
        const raw_challenge_details = extract_string_from_pattern(home_html, raw_challenge_details_extractor, "MEDIUM");
        if(typeof raw_challenge_details !== "string") return raw_challenge_details;
        const challenge_details_extractor = /(.+?;).*?\.src='(.+?)';/gi;
        const challenge_details_pieces = extract_strings_from_pattern(raw_challenge_details, challenge_details_extractor);
        if(challenge_details_pieces.length !== 2) return generror("Challenge details weren't properly extracted.", "MEDIUM", {challenge_details_pieces, raw_challenge_details});
        const turnstile_sitekey_extractor = /data-sitekey="(.+?)"/gi;
        const turnstile_sitekey = extract_string_from_pattern(home_html, turnstile_sitekey_extractor, "MEDIUM");
        if(typeof turnstile_sitekey !== "string") return turnstile_sitekey;
        return {
            turnstile_sitekey: turnstile_sitekey,
            initial_variables: challenge_details_pieces[0],
            script_path: challenge_details_pieces[1]
        };
    }

    // The whole Cloudflare dance (JSD fingerprint -> Turnstile widget -> /rc finalize
    // -> cf_clearance) is run inside a real browser engine by the native turnstile
    // module: WebView on React Native, jsdom best-effort on Node. We can't emulate the
    // ~227KB obfuscated widget VM in a plain JS sandbox, so we let Cloudflare's own code
    // execute it natively and harvest the resulting token + cookies.
    interface TurnstileSolution {
        turnstile_token: string;
    }

    async function solve_turnstile(opts: Opts & {challenge_details: ChallengeDetails}): PromiseResult<TurnstileSolution>{
        await load_native_turnstile();
        const solver = turnstile();
        if(!solver) return generror("Turnstile native module is not loaded", "CRITICAL", {});

        const solved = await solver.solve({ page_url: CHALLENGE_URL, sitekey: opts.challenge_details.turnstile_sitekey });
        if("error" in solved) return solved;

        // cf_clearance (HttpOnly) + friends were set in the solving browser; fold them
        // into the jar so the follow-up verify-turnstile / v2/lyrics requests carry them.
        if(solved.cookies.length > 0) opts.cookie_jar.merge(CookieJar.fromStrings(solved.cookies));

        return { turnstile_token: solved.token };
    }

    // Exchanges the Turnstile token for the app JWT (mirrors BetterLyrics.verify_turnstile_token).
    async function verify_turnstile(opts: Opts & {turnstile_token: string}): PromiseResult<string>{
        const response = await rozfetch<{jwt?: string}>(`${BASE_URL}/verify-turnstile`, {
            ...opts.fetch_opts,
            impersonate: true,
            method: "POST",
            headers: {
                ...headers(opts),
                "content-type": "application/json",
                "origin": BASE_URL,
                "sec-fetch-site": "same-origin",
                "sec-fetch-mode": "cors",
                "sec-fetch-dest": "empty",
            },
            body: JSON.stringify({ token: opts.turnstile_token }),
        });
        if("error" in response) return response;
        opts.cookie_jar.updateWithFetch(response);
        const data = await response.json();
        if("error" in data) return data;
        if(!data.jwt) return generror("verify-turnstile: no JWT in response", "MEDIUM", {});
        return data.jwt;
    }

    export async function solve_challenge(opts: Opts): PromiseResult<{jwt: string; cookie_jar: CookieJar}>{
        const challenge_details = await get_challenge_details(opts);
        if("error" in challenge_details) return challenge_details;

        const turnstile_solution = await solve_turnstile({...opts, challenge_details});
        if("error" in turnstile_solution) return turnstile_solution;

        const jwt = await verify_turnstile({...opts, turnstile_token: turnstile_solution.turnstile_token});
        if(typeof jwt === "object" && "error" in jwt) return jwt;

        return { jwt, cookie_jar: opts.cookie_jar };
    }
}
