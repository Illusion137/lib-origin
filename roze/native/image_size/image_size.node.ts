import type { ImageSize } from "@native/image_size/image_size.base";
import { imageSize as node_image_size } from "image-size";

export const node_image_size_module: ImageSize = {
    image_size: (buffer) => {
        const result = node_image_size(buffer);
        return { width: result.width ?? 0, height: result.height ?? 0, type: result.type };
    }
};
