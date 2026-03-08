import type { PoTokenGenerator } from "@native/potoken/potoken.base";
import type { WebPoSignalOutput } from 'bgutils-js';
import { BG, buildURL, GOOG_API_KEY, USER_AGENT } from 'bgutils-js';
import type { Innertube } from 'youtubei.js';
import { JSDOM } from 'jsdom';
import { generror } from "@common/utils/error_util";
import type { PromiseResult } from "@common/types";

export interface PoTokenMinter {
    mint_as_websafe_string: (identifier: string) => Promise<string>;
    visitor_data: string;
}

function setup_botguard_environment(): void {
    if (typeof globalThis.document !== 'undefined') return;

    const dom = new JSDOM(
        '<!DOCTYPE html><html lang="en"><head><title></title></head><body></body></html>',
        {
            url: 'https://www.youtube.com/',
            referrer: 'https://www.youtube.com/',
            userAgent: USER_AGENT,
        },
    );

    Object.assign(globalThis, {
        window: dom.window,
        document: dom.window.document,
        location: dom.window.location,
        origin: dom.window.origin,
    });

    if (!Reflect.has(globalThis, 'navigator')) {
        Object.defineProperty(globalThis, 'navigator', {
            value: dom.window.navigator,
        });
    }
}

export async function create_po_token_minter(
    innertube: Innertube,
): PromiseResult<PoTokenMinter> {
    setup_botguard_environment();

    const visitor_data = innertube.session.context.client.visitorData || '';

    const challenge_response = await innertube.getAttestationChallenge(
        'ENGAGEMENT_TYPE_UNBOUND',
    );

    if (!challenge_response.bg_challenge) {
        return generror('Could not get challenge');
    }

    const bg_challenge = challenge_response.bg_challenge;

    const interpreter_url =
        bg_challenge.interpreter_url
            .private_do_not_access_or_else_trusted_resource_url_wrapped_value;

    const bg_script_response = await fetch(`https:${interpreter_url}`);
    const interpreter_javascript = await bg_script_response.text();

    if (!interpreter_javascript) {
        return generror('Could not load VM');
    }

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function(interpreter_javascript)();

    const botguard = await BG.BotGuardClient.create({
        program: bg_challenge.program,
        globalName: bg_challenge.global_name,
        globalObj: globalThis,
    });

    const web_po_signal_output: WebPoSignalOutput = [];
    const botguard_response = await botguard.snapshot({ webPoSignalOutput: web_po_signal_output });

    const request_key = 'O43z0dpjhgX20SCx4KAo';

    const integrity_token_response = await fetch(buildURL('GenerateIT', true), {
        method: 'POST',
        headers: {
            'content-type': 'application/json+protobuf',
            'x-goog-api-key': GOOG_API_KEY,
            'x-user-agent': 'grpc-web-javascript/0.1',
            'user-agent': USER_AGENT,
        },
        body: JSON.stringify([request_key, botguard_response]),
    });

    const response = (await integrity_token_response.json()) as unknown[];

    if (typeof response[0] !== 'string') {
        return generror('Could not get integrity token');
    }

    const minter = await BG.WebPoMinter.create(
        { integrityToken: response[0] },
        web_po_signal_output,
    );

    return {
        mint_as_websafe_string: async(identifier: string) =>
            await minter.mintAsWebsafeString(identifier),
        visitor_data,
    };
}

let static_minter: PoTokenMinter|null = null; 

export const node_potoken: PoTokenGenerator = {
	generate_potoken: async(innertube: Innertube, identifier?: string) => {
		if(static_minter === null){
			const minter = await create_po_token_minter(innertube);
			if("error" in minter) return minter;
			static_minter = minter;
		}

		const resolved_identifier = identifier ?? static_minter.visitor_data;

		if (!resolved_identifier) {
			return generror('No identifier provided and no visitorData on the Innertube session.', {identifier});
		}

		const po_token = await static_minter.mint_as_websafe_string(resolved_identifier);

		return {
			po_token,
			identifier: resolved_identifier,
			visitor_data: static_minter.visitor_data,
		};
	}
};
