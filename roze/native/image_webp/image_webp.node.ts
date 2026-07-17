import type { ImageWebp } from "@native/image_webp/image_webp.base";
import { generror_catch } from "@common/utils/error_util";
import sharp from "sharp";

export const node_image_webp: ImageWebp = {
	to_square_webp: async (input_path: string, size: number, quality: number) => {
		try {
			const path = input_path.startsWith("file://") ? decodeURI(input_path.substring("file://".length)) : input_path;
			const buffer = await sharp(path)
				.resize(size, size, { fit: "cover" })
				.webp({ quality })
				.toBuffer();
			return { base64: buffer.toString("base64") };
		} catch (e) {
			return generror_catch(e, "to_square_webp failed", "LOW", { input_path, size, quality });
		}
	}
};
