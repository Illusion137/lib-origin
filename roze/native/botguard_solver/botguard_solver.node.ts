import type { BotGuardSolver } from './botguard_solver.base';
import { VirtualConsole, JSDOM } from 'jsdom';
import { USER_AGENT } from 'bgutils-js/utils';
import { BotGuardClient } from 'bgutils-js/botguard';

export const node_botguard_solver: BotGuardSolver = {
	solve: async (botguard_challenge, binding) => {
		const virtual_console = new VirtualConsole();
		const dom = new JSDOM('<!DOCTYPE html><html lang="en"><head><title></title></head><body></body></html>', { url: 'https://www.youtube.com', referrer: 'https://www.youtube.com/', userAgent: USER_AGENT, resources: 'usable', runScripts: 'dangerously', virtualConsole: virtual_console });

		if (botguard_challenge.ytcfg) dom.window.yt = { config_: botguard_challenge.ytcfg };

		Object.assign(globalThis, { ...(botguard_challenge.ytcfg ? { yt: dom.window.yt } : {}), window: dom.window, document: dom.window.document, location: dom.window.location, origin: dom.window.origin });

		if (!('navigator' in globalThis)) {
			Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator });
		}

		Object.defineProperty(dom.window.HTMLCanvasElement.prototype, 'getContext', { value: () => null, writable: true });

		let interpreter_url = botguard_challenge.interpreter_url.private_do_not_access_or_else_safe_script_wrapped_value ?? botguard_challenge.interpreter_url.private_do_not_access_or_else_trusted_resource_url_wrapped_value ?? '';

		if (interpreter_url.startsWith('//')) interpreter_url = `https:${interpreter_url}`;

		const bg_script_response = await fetch(interpreter_url);
		const interpreter_javascript = await bg_script_response.text();

		// eslint-disable-next-line @typescript-eslint/no-implied-eval
		new Function(interpreter_javascript)();

		const botguard = await BotGuardClient.create({ program: botguard_challenge.program, globalName: botguard_challenge.global_name, globalObject: globalThis });

		const botguard_response = 'webPoSignalOutput' in binding
			? await botguard.snapshot(binding)
			: await botguard.snapshot({ contentBinding: binding });
		return botguard_response;
	}
};
