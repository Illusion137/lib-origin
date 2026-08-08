import { generror } from "@common/utils/error_util";
import type { StudioAttestationGenerator } from "./studio_attestation.base";

export const mobile_studio_attestation: StudioAttestationGenerator = {
	generate_studio_attestation: async (bg_challenge, binding) => {
		return generror("YouTube Studio attestation is not implemented on React Native", "CRITICAL", {
			global_name: bg_challenge.global_name,
			engagement_type: binding.e
		});
	},
	reset_studio_attestation: async () => { return; }
};
