/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import type { PoTokenGenerator } from "@native/potoken/potoken.base";
import { BotGuardClient } from 'bgutils-js/botguard';
import type { WebPoSignalOutput } from 'bgutils-js/shared-types';
import { buildURL, parseLooseJSON, getHeaders, USER_AGENT } from 'bgutils-js/utils';
import { WebPoMinter } from 'bgutils-js/webpo';
import type { Innertube, IRawResponse } from 'youtubei.js';
import { JSDOM } from 'jsdom';
import { generror, generror_catch } from "@common/utils/error_util";
import type { PromiseResult, ResponseError } from "@common/types";
import rozfetch from "@common/rozfetch";
import { try_json_parse } from "@common/utils/parse_util";

const REQUEST_KEY = 'O43z0dpjhgX20SCx4KAo';

function setup_botguard_environment(page_html: string): ResponseError|null {
    if (typeof globalThis.document !== 'undefined') return null;

    const dom = new JSDOM(
        '<!DOCTYPE html><html lang="en"><head><title></title></head><body></body></html>',
        {
            url: 'https://www.youtube.com',
            referrer: 'https://www.youtube.com/',
            userAgent: USER_AGENT,
        },
    );

    // TODO migrate to extract_regex_from_string
    const ytcfg_regex = /ytcfg\.set\(({.+?})\);/s;
    const yt_config = ytcfg_regex.exec(page_html)?.[1];
    if (!yt_config) {
        return generror("Could not find ytcfg in page HTML", "CRITICAL", { yt_config });
    }
    /* Needed because of EVENT_ID */
    const ytcfg = try_json_parse<object>(yt_config);
    if("error" in ytcfg) return ytcfg;

    dom.window.yt = { config_: ytcfg };

    Object.assign(globalThis, {
        yt: dom.window.yt,
        window: dom.window,
        document: dom.window.document,
        location: dom.window.location,
        origin: dom.window.origin
    });

    if (!('navigator' in globalThis)) {
        Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator });
    }

    // jsdom doesn't implement canvas; stub getContext so BotGuard's VM doesn't throw.
    Object.defineProperty(dom.window.HTMLCanvasElement.prototype, 'getContext', {
        value: () => null,
        writable: true,
    });
    return null;
}

let global_minter: WebPoMinter;
async function create_minter(): PromiseResult<WebPoMinter>{
    if(global_minter !== undefined) return global_minter;

    const page_response = await rozfetch('https://www.youtube.com', {
        headers: {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.7",
            "user-agent": USER_AGENT,
        }
    });
    if("error" in page_response) return page_response;

    const page_html = await page_response.text();
    
    const setup_result = setup_botguard_environment(page_html);
    if(setup_result !== null) return setup_result;

    const initial_attestation_data_regex = /window\.ytAtN\(\s*({[\s\S]*?})\s*\)/;
    // TODO extract with safe function?
    const initial_attestation_data_str = initial_attestation_data_regex.exec(page_html)?.[1];

    if (!initial_attestation_data_str) {
        return generror("Could not find challenge in page HTML", "CRITICAL", {page_html});
    }

    let initial_attestation_data_json;
    try {
        initial_attestation_data_json = parseLooseJSON(initial_attestation_data_str);
    }
    catch(e) {
        return generror_catch(e, "failed to parse initial_attestation_data_json", "CRITICAL", { initial_attestation_data_str });
    }
    const challenge_response = initial_attestation_data_json.R as IRawResponse;

    if (!challenge_response.bgChallenge) {
        return generror('Could not get BotGuard challenge', "CRITICAL");
    }

    let interpreter_url: string =
        challenge_response.bgChallenge.interpreterUrl.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue ?? '';

    if (!interpreter_url) {
        return generror('Could not get interpreter URL from BotGuard challenge', "CRITICAL");
    }

    if (interpreter_url.startsWith('//')) interpreter_url = `https:${interpreter_url}`;

    const bg_script_response = await fetch(interpreter_url);
    const interpreter_javascript = await bg_script_response.text();

    if (!interpreter_javascript) {
        return generror('Could not load VM', "CRITICAL");
    }

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function(interpreter_javascript)();

    const botguard = await BotGuardClient.create({
        program: challenge_response.bgChallenge.program,
        globalName: challenge_response.bgChallenge.globalName,
        globalObject: globalThis,
    });

    const web_po_signal_output: WebPoSignalOutput = [];
    const botguard_response = await botguard.snapshot({ webPoSignalOutput: web_po_signal_output });

    const integrity_token_response = await fetch(buildURL('GenerateIT', true), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify([REQUEST_KEY, botguard_response]),
    });

    const integrity_token_json = await integrity_token_response.json() as [string, number, number, string];

    if (typeof integrity_token_json[0] !== 'string') {
        return generror('Could not get integrity token', "CRITICAL", {integrityTokenJson: integrity_token_json});
    }

    const [integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken] = integrity_token_json;

    const token_integrity_data = {
        integrityToken,
        estimatedTtlSecs,
        mintRefreshThreshold,
        websafeFallbackToken
    };

    const web_po_minter = await WebPoMinter.create(token_integrity_data, web_po_signal_output);
    global_minter = web_po_minter;
    return web_po_minter;
}

type MinterStatusResultSent = ["sent", PromiseResult<WebPoMinter>];
type MinterStatusResultRecieved = ["recieved", WebPoMinter|ResponseError];
let minter_status: MinterStatusResultSent|MinterStatusResultRecieved|undefined = undefined;
export async function fetch_minter(): PromiseResult<WebPoMinter> {
    if(minter_status?.[0] === 'recieved') return minter_status[1];
    if(minter_status?.[0] === 'sent') {
        const recieved = await minter_status[1]
        minter_status = ["recieved", recieved];
        return recieved;
    }
    const sent_minter = create_minter();
    minter_status = ["sent", sent_minter];
    return await sent_minter;
}

export const node_potoken: PoTokenGenerator = {
    generate_potoken: async (_innertube: Innertube, content_binding: string) => {
        content_binding ??= "";
        const web_po_minter = await fetch_minter();
        if("error" in web_po_minter) return web_po_minter as ResponseError;
        const po_token = await web_po_minter.mintAsWebsafeString(content_binding);

        return {
            po_token,
            identifier: content_binding
        };
    }
};
