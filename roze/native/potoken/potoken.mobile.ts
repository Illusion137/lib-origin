import nodejs from "nodejs-mobile-react-native";
import type { PoTokenGenerator } from "@native/potoken/potoken.base";
import { generror } from "@common/utils/error_util";
import { force_json_parse } from "@common/utils/parse_util";
import BG from "bgutils-js";

let results: { poToken?: string; identifier?: string; error?: string } = {};
nodejs?.channel?.addListener?.("potoken", (msg) => {
	results = force_json_parse(msg);
});

export const mobile_potoken: PoTokenGenerator = {
	generate_potoken: async (innertube, content_binding) => {
		try {
			if (!content_binding) return generror("No content_binding", "CRITICAL");
			if (nodejs.channel === undefined) {
				return generror("RN node is not available.", "CRITICAL");
			}
			const context = innertube.session.context;
			nodejs.channel.post("potoken", JSON.stringify({ content_binding, context }));
			const MAX_TIMEOUT = 1000;
			let timeoutCounter = 0;
			while (timeoutCounter < MAX_TIMEOUT) {
				timeoutCounter += 1;
				await new Promise((resolve) => setTimeout(resolve, 10));
				if (results.identifier === content_binding) {
					if (results.error) {
						return generror(results.error, "CRITICAL");
					}
					if (results.poToken) {
						return {
							po_token: results.poToken,
							identifier: content_binding,
							placeholder_po_token: BG.PoToken.generateColdStartToken(content_binding),
							visitor_data: content_binding
						};
					}
				}
			}
			return generror(`Failed to get PoT for ${content_binding} via node`, "LOW");
		} catch (e: any) {
			return generror(`Node potoken generation failed: ${e.message}`, "CRITICAL");
		}
	}
};
