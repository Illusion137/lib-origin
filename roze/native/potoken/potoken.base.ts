import type { PromiseResult } from "@common/types";
import type Innertube from "youtubei.js";

export interface PoTokenResult {
	po_token: string;
	placeholder_po_token: string;
	visitor_data: string;
	identifier: string;
};

export interface PoTokenGenerator {
	generate_potoken: (innertube: Innertube, content_binding?: string) => PromiseResult<PoTokenResult>;
}
