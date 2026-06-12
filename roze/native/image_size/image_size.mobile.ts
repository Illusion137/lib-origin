import type { ImageSize, ImageSizeResult } from "@native/image_size/image_size.base";

function u16_be(b: Uint8Array, o: number) { return (b[o] << 8) | b[o + 1]; }
function u32_be(b: Uint8Array, o: number) { return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0; }
function u16_le(b: Uint8Array, o: number) { return b[o] | (b[o + 1] << 8); }
function i32_le(b: Uint8Array, o: number) { return b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24); }

function png_size(b: Uint8Array): ImageSizeResult | null {
    if (b[0] !== 0x89 || b[1] !== 0x50 || b[2] !== 0x4E || b[3] !== 0x47) return null;
    return { width: u32_be(b, 16), height: u32_be(b, 20), type: 'png' };
}

const JPEG_SOF = new Set([0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF]);
function jpeg_size(b: Uint8Array): ImageSizeResult | null {
    if (b[0] !== 0xFF || b[1] !== 0xD8) return null;
    let i = 2;
    while (i < b.length - 8) {
        if (b[i] !== 0xFF) break;
        const marker = b[i + 1];
        if (JPEG_SOF.has(marker)) return { height: u16_be(b, i + 5), width: u16_be(b, i + 7), type: 'jpg' };
        i += 2 + u16_be(b, i + 2);
    }
    return null;
}

function gif_size(b: Uint8Array): ImageSizeResult | null {
    if (b[0] !== 0x47 || b[1] !== 0x49 || b[2] !== 0x46) return null;
    return { width: u16_le(b, 6), height: u16_le(b, 8), type: 'gif' };
}

function webp_size(b: Uint8Array): ImageSizeResult | null {
    if (b[0] !== 0x52 || b[1] !== 0x49 || b[2] !== 0x46 || b[3] !== 0x46) return null;
    if (b[8] !== 0x57 || b[9] !== 0x45 || b[10] !== 0x42 || b[11] !== 0x50) return null;
    const chunk = String.fromCharCode(b[12], b[13], b[14], b[15]);
    if (chunk === 'VP8 ') return { width: u16_le(b, 26) & 0x3FFF, height: u16_le(b, 28) & 0x3FFF, type: 'webp' };
    if (chunk === 'VP8L') {
        const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
        return { width: (bits & 0x3FFF) + 1, height: ((bits >> 14) & 0x3FFF) + 1, type: 'webp' };
    }
    if (chunk === 'VP8X') {
        const width = (b[24] | (b[25] << 8) | (b[26] << 16)) + 1;
        const height = (b[27] | (b[28] << 8) | (b[29] << 16)) + 1;
        return { width, height, type: 'webp' };
    }
    return null;
}

function bmp_size(b: Uint8Array): ImageSizeResult | null {
    if (b[0] !== 0x42 || b[1] !== 0x4D) return null;
    return { width: i32_le(b, 18), height: Math.abs(i32_le(b, 22)), type: 'bmp' };
}

export const mobile_image_size_module: ImageSize = {
    image_size: (buffer) => {
        const b = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        return png_size(b) ?? jpeg_size(b) ?? gif_size(b) ?? webp_size(b) ?? bmp_size(b) ?? { width: 0, height: 0 };
    }
};
