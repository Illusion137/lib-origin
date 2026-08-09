import type { AttestationBinding, BotGuardChallenge, StudioAttestationGenerator } from "./studio_attestation.base";
import { BotGuardClient } from "bgutils-js/botguard";
import { USER_AGENT } from "bgutils-js/utils";
import { JSDOM, VirtualConsole } from "jsdom";
import { generror, generror_catch } from "@common/utils/error_util";
import type { PromiseResult, ResponseError } from "@common/types";

// TODO this works? but is a shitshow so refactor it
// TODO make this compatible with po_token
function setup_botguard_environment(): ResponseError | null {
	if (typeof globalThis.document !== "undefined") return null;

	const virtual_console = new VirtualConsole();
	const dom = new JSDOM('<!DOCTYPE html><html lang="en"><head><title></title></head><body></body></html>', { url: "https://www.youtube.com", referrer: "https://www.youtube.com/", userAgent: USER_AGENT, resources: "usable", runScripts: "dangerously", virtualConsole: virtual_console });

	Object.assign(globalThis, { window: dom.window, document: dom.window.document, location: dom.window.location, origin: dom.window.origin });

	if (!("navigator" in globalThis)) {
		Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator });
	}

	Object.defineProperty(dom.window.HTMLCanvasElement.prototype, "getContext", { value: () => null, writable: true });
	return null;
}

// let loaded_interpreter_key: string | undefined = undefined;
// async function load_interpreter(bg_challenge: BotGuardChallenge): PromiseResult<undefined> {

//     const interpreter_key = bg_challenge.interpreter_hash ?? interpreter_url;
//     if (loaded_interpreter_key === interpreter_key) return undefined;

//     const bg_script_response = await fetch(interpreter_url);
//     const interpreter_javascript = await bg_script_response.text();

//     if (!interpreter_javascript) {
//         return generror('Could not load VM', "CRITICAL", { interpreter_url });
//     }

//     // eslint-disable-next-line @typescript-eslint/no-implied-eval
//     new Function(interpreter_javascript)();
//     loaded_interpreter_key = interpreter_key;
//     return undefined;
// }

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

// type ClientStatusResultSent = ["sent", PromiseResult<BotGuardClient>];
// type ClientStatusResultRecieved = ["recieved", BotGuardClient|ResponseError];
// let client_program: string | undefined = undefined;
// let client_status: ClientStatusResultSent|ClientStatusResultRecieved|undefined = undefined;
// export async function fetch_client(bg_challenge: BotGuardChallenge): PromiseResult<BotGuardClient> {
//     if (client_program === bg_challenge.program) {
//         if (client_status?.[0] === 'recieved') return client_status[1];
//         if (client_status?.[0] === 'sent') {
//             const recieved = await client_status[1];
//             client_status = ["recieved", recieved];
//             return recieved;
//         }
//     }

//     const sent_client = get_snapshot(bg_challenge);
//     client_program = bg_challenge.program;
//     client_status = ["sent", sent_client];
//     return await sent_client;
// }

export const node_studio_attestation: StudioAttestationGenerator = {
	generate_studio_attestation: async (bg_challenge: BotGuardChallenge, binding: AttestationBinding) => {
		try {
			return await get_snapshot(bg_challenge, binding);
			// if (binding.c === '') return generror("No challenge to bind the snapshot to", "CRITICAL");

			// const client = await fetch_client(bg_challenge);
			// if ("error" in client) return client;

			// const po = [];
			// return await client.snapshot({ webPoSignalOutput: po });
		} catch (error) {
			await node_studio_attestation.reset_studio_attestation();
			return generror_catch(error, "", "CRITICAL", { engagement_type: binding.e });
		}
	},
	reset_studio_attestation: async () => {
		// const previous = client_status;
		// client_program = undefined;
		// client_status = undefined;
		// loaded_interpreter_key = undefined;
		// if (previous === undefined) return;
		// try {
		//     const client = previous[0] === 'recieved' ? previous[1] : await previous[1];
		//     if (!("error" in client)) await client.shutdown();
		// } catch (_) { }
	}
};
