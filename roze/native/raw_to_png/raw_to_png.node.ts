import type { RawToPng } from "@native/raw_to_png/raw_to_png.base";
import sharp_lib, { type Channels } from 'sharp';

export const node_raw_to_png: RawToPng = {
    raw_to_png: async(data: Uint8Array, width: number, height: number, channels: number): Promise<Buffer> => {
        return await sharp_lib(Buffer.from(data), { raw: { width, height, channels: channels as Channels } }).raw().png().toBuffer();
    }
};
