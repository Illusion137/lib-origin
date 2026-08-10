import type { RawToPng } from "@native/raw_to_png/raw_to_png.base";
import sharp_lib, { type Channels } from 'sharp';

export const node_raw_to_png: RawToPng = {
    raw_to_png: async(data: Uint8Array, width: number, height: number, channels: number): Promise<Buffer> => {
        return await sharp_lib(Buffer.from(data), { raw: { width, height, channels: channels as Channels } }).raw().png().toBuffer();
    },
    decode_to_raw: async(encoded: Uint8Array) => {
        const { data, info } = await sharp_lib(Buffer.from(encoded)).raw().toBuffer({ resolveWithObject: true });
        return { data, width: info.width, height: info.height, channels: info.channels };
    }
};
