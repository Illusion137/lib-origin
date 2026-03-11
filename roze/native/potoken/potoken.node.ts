import type { PoTokenGenerator } from "@native/potoken/potoken.base";
import { BG, buildURL, GOOG_API_KEY, USER_AGENT, type WebPoSignalOutput } from 'bgutils-js';
import type { Innertube } from 'youtubei.js';
import { JSDOM } from 'jsdom';
import { generror } from "@common/utils/error_util";

const REQUEST_KEY = 'O43z0dpjhgX20SCx4KAo';

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

    // jsdom doesn't implement canvas; stub getContext so BotGuard's VM doesn't throw.
    Object.defineProperty(dom.window.HTMLCanvasElement.prototype, 'getContext', {
        value: () => null,
        writable: true,
    });
}

export const node_potoken: PoTokenGenerator = {
    generate_potoken: async (innertube: Innertube, content_binding?: string) => {
        setup_botguard_environment();

        const visitor_data = content_binding || '';

        if (!content_binding) {
            return generror('No identifier provided and no visitorData on the Innertube session.', { identifier: content_binding });
        }

        const challenge_response = await innertube.getAttestationChallenge('ENGAGEMENT_TYPE_UNBOUND');

        if (!challenge_response.bg_challenge) {
            return generror('Could not get BotGuard challenge');
        }

        let interpreter_url: string =
            challenge_response.bg_challenge.interpreter_url.private_do_not_access_or_else_trusted_resource_url_wrapped_value ?? '';

        if (!interpreter_url) {
            return generror('Could not get interpreter URL from BotGuard challenge');
        }

        if (interpreter_url.startsWith('//')) interpreter_url = `https:${interpreter_url}`;

        const bg_script_response = await fetch(interpreter_url);
        const interpreter_javascript = await bg_script_response.text();

        if (!interpreter_javascript) {
            return generror('Could not load VM');
        }

        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        new Function(interpreter_javascript)();

        const botguard = await BG.BotGuardClient.create({
            program: challenge_response.bg_challenge.program,
            globalName: challenge_response.bg_challenge.global_name,
            globalObj: globalThis,
        });

        const web_po_signal_output: WebPoSignalOutput = [];
        const botguard_response = await botguard.snapshot({ webPoSignalOutput: web_po_signal_output });

        const integrity_token_response = await fetch(buildURL('GenerateIT', true), {
            method: 'POST',
            headers: {
                'content-type': 'application/json+protobuf',
                'x-goog-api-key': GOOG_API_KEY,
                'x-user-agent': 'grpc-web-javascript/0.1',
                'user-agent': USER_AGENT,
            },
            body: JSON.stringify([REQUEST_KEY, botguard_response]),
        });

        const integrity_token_data = await integrity_token_response.json() as unknown[];

        if (typeof integrity_token_data[0] !== 'string') {
            return generror('Could not get integrity token');
        }

        const web_po_minter = await BG.WebPoMinter.create({ integrityToken: integrity_token_data[0] }, web_po_signal_output);
        const po_token = await web_po_minter.mintAsWebsafeString(content_binding);

        // generatePlaceholder throws if content_binding > 118 UTF-8 bytes (visitor_data can exceed this).
        // placeholder_po_token is only needed for SABR init (content binding = video_id, always short).
        let placeholder_po_token = '';
        try {
            placeholder_po_token = BG.PoToken.generatePlaceholder(content_binding);
        } catch { /* identifier too long — placeholder not needed for this binding */ }

        return {
            po_token,
            placeholder_po_token,
            identifier: content_binding,
            visitor_data,
        };
    }
};
