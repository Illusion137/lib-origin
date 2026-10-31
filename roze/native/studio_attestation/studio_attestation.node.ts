import type { AttestationBinding, BotGuardChallenge, StudioAttestationGenerator } from "./studio_attestation.base";
import { BotGuardClient } from "bgutils-js/botguard";
import { USER_AGENT } from "bgutils-js/utils";
import { JSDOM, VirtualConsole } from "jsdom";
import { generror, generror_catch } from "@common/utils/error_util";
import type { PromiseResult, ResponseError } from "@common/types";

function setup_botguard_environment(): ResponseError | null {
	const virtual_console = new VirtualConsole();
	const dom = new JSDOM('<!DOCTYPE html><html lang="en"><head><title></title></head><body></body></html>', { url: "https://www.youtube.com", referrer: "https://www.youtube.com/", userAgent: USER_AGENT, resources: "usable", runScripts: "dangerously", virtualConsole: virtual_console });

	Object.assign(globalThis, { window: dom.window, document: dom.window.document, location: dom.window.location, origin: dom.window.origin });

	if (!("navigator" in globalThis)) {
		Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator });
	}

	Object.defineProperty(dom.window.HTMLCanvasElement.prototype, "getContext", { value: () => null, writable: true });
	return null;
}

async function get_snapshot(bg_challenge: BotGuardChallenge, binding: AttestationBinding): PromiseResult<string> {
	const setup_result = setup_botguard_environment();
	if (setup_result !== null) return setup_result;

	let interpreter_url = bg_challenge.interpreter_url ?? "";

	if (!interpreter_url) {
		return generror("Could not get interpreter URL from BotGuard challenge", "CRITICAL", { interpreter_hash: bg_challenge.interpreter_hash });
	}

	if (interpreter_url.startsWith("//")) interpreter_url = `https:${interpreter_url}`;

	const bg_script_response = await fetch(interpreter_url);
	const interpreter_javascript = await bg_script_response.text();

	if (!interpreter_javascript) {
		return generror("Could not load VM", "CRITICAL");
	}

	// eslint-disable-next-line @typescript-eslint/no-implied-eval
	new Function(interpreter_javascript)();

	const botguard = await BotGuardClient.create({ program: bg_challenge.program, globalName: bg_challenge.global_name, globalObject: globalThis });

	const botguard_response = await botguard.snapshot({ contentBinding: { atr_challenge: binding.c } });

	if (!botguard_response.startsWith("$")) {
		return generror("BotGuard VM did not produce a snapshot", "CRITICAL", { botguard_response });
	}
	return botguard_response;
}

export const node_studio_attestation: StudioAttestationGenerator = {
	generate_studio_attestation: async (bg_challenge: BotGuardChallenge, binding: AttestationBinding) => {
		try {
			return await get_snapshot(bg_challenge, binding);
		} catch (error) {
			return generror_catch(error, "", "CRITICAL", { engagement_type: binding.e });
		}
	}
};
