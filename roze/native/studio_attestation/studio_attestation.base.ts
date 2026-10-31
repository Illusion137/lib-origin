import type { PromiseResult } from "@common/types";

export interface BotGuardChallenge {
	program: string;
	global_name: string;
	interpreter_hash?: string;
	interpreter_url: string;
}

export interface AttestationBinding {
	c: string;
	e?: string;
	externalChannelId?: string;
	encryptedVideoId?: string;
}

export interface StudioAttestationGenerator {
	generate_studio_attestation: (bg_challenge: BotGuardChallenge, binding: AttestationBinding) => PromiseResult<string>;
}
