import type { PoTokenGenerator } from "@native/potoken/potoken.base";
import { BG, type BgConfig } from 'bgutils-js';
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

export const node_potoken: PoTokenGenerator = {
    generate_potoken: async (innertube: Innertube, identifier?: string) => {
        setup_botguard_environment();

        const visitor_data = innertube.session.context.client.visitorData || '';
        const content_binding = identifier ?? visitor_data;

        if (!content_binding) {
            return generror('No identifier provided and no visitorData on the Innertube session.', { identifier });
        }

        const bg_config: BgConfig = {
            fetch: (input, init?) => fetch(input, init),
            globalObj: globalThis,
            identifier: content_binding,
            requestKey: REQUEST_KEY,
        };

        const bg_challenge = await BG.Challenge.create(bg_config);

        if (!bg_challenge) {
            return generror('Could not get challenge');
        }

        const interpreter_javascript = bg_challenge.interpreterJavascript.privateDoNotAccessOrElseSafeScriptWrappedValue;

        if (!interpreter_javascript) {
            return generror('Could not load VM');
        }

        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        new Function(interpreter_javascript)();

        const po_token_result = await BG.PoToken.generate({
            program: bg_challenge.program,
            globalName: bg_challenge.globalName,
            bgConfig: bg_config,
        });

        return {
            po_token: po_token_result.poToken,
            identifier: content_binding,
            visitor_data,
        };
    }
};
