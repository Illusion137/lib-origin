import type { ImageWebp } from "@native/image_webp/image_webp.base";
import { generror, generror_catch } from "@common/utils/error_util";
import { FilterMode, ImageFormat, MipmapMode, Skia } from "@shopify/react-native-skia";

export const mobile_image_webp: ImageWebp = {
	to_square_webp: async (input_path: string, size: number, quality: number) => {
		try {
			const uri = input_path.includes("://") ? input_path : `file://${input_path}`;
			const data = await Skia.Data.fromURI(uri);
			const image = Skia.Image.MakeImageFromEncoded(data);
			if (image === null) return generror("Failed to decode image", "LOW", { input_path });

			const surface = Skia.Surface.Make(size, size);
			if (surface === null) return generror("Failed to create Skia surface", "LOW", { size });

			const crop = Math.min(image.width(), image.height());
			const src = Skia.XYWHRect((image.width() - crop) / 2, (image.height() - crop) / 2, crop, crop);
			const dst = Skia.XYWHRect(0, 0, size, size);
			surface.getCanvas().drawImageRectOptions(image, src, dst, FilterMode.Linear, MipmapMode.Linear);

			const base64 = surface.makeImageSnapshot().encodeToBase64(ImageFormat.WEBP, quality);
			if (!base64) return generror("Failed to encode WebP", "LOW", { input_path, size, quality });
			return { base64 };
		} catch (e) {
			return generror_catch(e, "to_square_webp failed", "LOW", { input_path, size, quality });
		}
	}
};
