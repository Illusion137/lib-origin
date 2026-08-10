import sharp, { type Channels } from "@lib/sharp";
import type { PromiseResult } from './types';
import { generror_catch } from "./utils/error_util";
import { load_native_raw_to_png } from "@native/raw_to_png/raw_to_png";
import { reinterpret_cast } from "./cast";

export async function resize_image_factor(buffer: Buffer, factor: number): PromiseResult<Buffer> {
    try {
        const mod = await load_native_raw_to_png();
        const decoded = await mod.decode_to_raw(buffer);
        return await sharp(decoded.data, {
            raw: { width: decoded.width, height: decoded.height, channels: reinterpret_cast<Channels>(decoded.channels) }
        }).scale(factor).raw().png().toBuffer();
    }
    catch(e) {
        return generror_catch(e, "failed to resize_image", "MEDIUM", { buffer });
    }
}