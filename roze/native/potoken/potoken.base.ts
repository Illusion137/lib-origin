import type { PromiseResult, ResponseError } from "@common/types";
import type Innertube from "youtubei.js";

export interface PoTokenResult {
	po_token: string;
	identifier: string;
};

export interface PoTokenGenerator {
	generate_potoken: (innertube: Innertube, content_binding: string) => PromiseResult<PoTokenResult>;
	generate_potoken_bytes: (innertube: Innertube, content_binding: string) => PromiseResult<Uint8Array>;
}
