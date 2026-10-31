import type { PromiseResult } from "@common/types";

export interface ImageWebp {
	/**
	 * Decode the image at input_path, center-crop to a square, scale to
	 * size×size and re-encode as WebP. Returns the encoded bytes as base64.
	 */
	to_square_webp: (input_path: string, size: number, quality: number) => PromiseResult<{ base64: string }>;
}
