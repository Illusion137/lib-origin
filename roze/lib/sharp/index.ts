import { load_native_raw_to_png } from '@native/raw_to_png/raw_to_png';

export type Channels = 1 | 2 | 3 | 4;
export type ResizeFit = 'cover' | 'contain' | 'fill' | 'inside' | 'outside';

export interface ResizeOptions {
    fit?: ResizeFit;
}

function clamp(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value;
}

function bilinear_resize(src: Uint8Array, src_width: number, src_height: number, channels: number, dst_width: number, dst_height: number): Uint8Array {
    const dst = new Uint8Array(dst_width * dst_height * channels);
    const x_ratio = src_width / dst_width;
    const y_ratio = src_height / dst_height;
    for (let dy = 0; dy < dst_height; dy++) {
        const sy = (dy + 0.5) * y_ratio - 0.5;
        const sy0 = clamp(Math.floor(sy), 0, src_height - 1);
        const sy1 = clamp(sy0 + 1, 0, src_height - 1);
        const wy = clamp(sy - sy0, 0, 1);
        for (let dx = 0; dx < dst_width; dx++) {
            const sx = (dx + 0.5) * x_ratio - 0.5;
            const sx0 = clamp(Math.floor(sx), 0, src_width - 1);
            const sx1 = clamp(sx0 + 1, 0, src_width - 1);
            const wx = clamp(sx - sx0, 0, 1);
            const dst_offset = (dy * dst_width + dx) * channels;
            for (let c = 0; c < channels; c++) {
                const p00 = src[(sy0 * src_width + sx0) * channels + c];
                const p10 = src[(sy0 * src_width + sx1) * channels + c];
                const p01 = src[(sy1 * src_width + sx0) * channels + c];
                const p11 = src[(sy1 * src_width + sx1) * channels + c];
                const top = p00 + (p10 - p00) * wx;
                const bottom = p01 + (p11 - p01) * wx;
                dst[dst_offset + c] = Math.round(top + (bottom - top) * wy);
            }
        }
    }
    return dst;
}

function crop_center(src: Uint8Array, src_width: number, src_height: number, channels: number, crop_width: number, crop_height: number): Uint8Array {
    const dst = new Uint8Array(crop_width * crop_height * channels);
    const offset_x = Math.floor((src_width - crop_width) / 2);
    const offset_y = Math.floor((src_height - crop_height) / 2);
    for (let y = 0; y < crop_height; y++) {
        const src_row_offset = ((y + offset_y) * src_width + offset_x) * channels;
        const dst_row_offset = y * crop_width * channels;
        dst.set(src.subarray(src_row_offset, src_row_offset + crop_width * channels), dst_row_offset);
    }
    return dst;
}

function pad_center(src: Uint8Array, src_width: number, src_height: number, channels: number, pad_width: number, pad_height: number): Uint8Array {
    const dst = new Uint8Array(pad_width * pad_height * channels);
    const offset_x = Math.floor((pad_width - src_width) / 2);
    const offset_y = Math.floor((pad_height - src_height) / 2);
    for (let y = 0; y < src_height; y++) {
        const src_row_offset = y * src_width * channels;
        const dst_row_offset = ((y + offset_y) * pad_width + offset_x) * channels;
        dst.set(src.subarray(src_row_offset, src_row_offset + src_width * channels), dst_row_offset);
    }
    return dst;
}

function resize_raw(src: Uint8Array, src_width: number, src_height: number, channels: number, target_width: number | null, target_height: number | null, fit: ResizeFit): { data: Uint8Array; width: number; height: number } {
    if (target_width === null && target_height === null) return { data: src, width: src_width, height: src_height };

    const aspect = src_width / src_height;
    const dst_width = target_width ?? Math.round((target_height as number) * aspect);
    const dst_height = target_height ?? Math.round((target_width as number) / aspect);

    switch (fit) {
        case 'fill':
            return { data: bilinear_resize(src, src_width, src_height, channels, dst_width, dst_height), width: dst_width, height: dst_height };
        case 'cover': {
            const scale = Math.max(dst_width / src_width, dst_height / src_height);
            const scaled_width = Math.round(src_width * scale);
            const scaled_height = Math.round(src_height * scale);
            const scaled = bilinear_resize(src, src_width, src_height, channels, scaled_width, scaled_height);
            return { data: crop_center(scaled, scaled_width, scaled_height, channels, dst_width, dst_height), width: dst_width, height: dst_height };
        }
        case 'contain': {
            const scale = Math.min(dst_width / src_width, dst_height / src_height);
            const scaled_width = Math.round(src_width * scale);
            const scaled_height = Math.round(src_height * scale);
            const scaled = bilinear_resize(src, src_width, src_height, channels, scaled_width, scaled_height);
            return { data: pad_center(scaled, scaled_width, scaled_height, channels, dst_width, dst_height), width: dst_width, height: dst_height };
        }
        case 'inside': {
            const scale = Math.min(dst_width / src_width, dst_height / src_height);
            const scaled_width = Math.round(src_width * scale);
            const scaled_height = Math.round(src_height * scale);
            return { data: bilinear_resize(src, src_width, src_height, channels, scaled_width, scaled_height), width: scaled_width, height: scaled_height };
        }
        case 'outside': {
            const scale = Math.max(dst_width / src_width, dst_height / src_height);
            const scaled_width = Math.round(src_width * scale);
            const scaled_height = Math.round(src_height * scale);
            return { data: bilinear_resize(src, src_width, src_height, channels, scaled_width, scaled_height), width: scaled_width, height: scaled_height };
        }
    }
}

export default function sharp(data: Buffer | Uint8Array, opts: { raw: { width: number; height: number; channels: Channels } }) {
    const state = {
        ...opts,
        resize_opts: null as { width: number | null; height: number | null; fit: ResizeFit } | null
    };
    return {
        raw() { return this; },
        png() { return this; },
        resize(width: number | null, height: number | null, resize_options: ResizeOptions = {}) {
            if (width == null && height == null) throw new Error("sharp.resize requires a width, a height, or both");
            state.resize_opts = { width: width ?? null, height: height ?? null, fit: resize_options.fit ?? 'cover' };
            return this;
        },
        scale(factor: number) {
            if (!(factor > 0)) throw new Error("sharp.scale requires a positive factor");
            state.resize_opts = {
                width: Math.round(state.raw.width * factor),
                height: Math.round(state.raw.height * factor),
                fit: 'fill'
            };
            return this;
        },
        resize_exact(width: number, height: number) {
            state.resize_opts = { width, height, fit: 'fill' };
            return this;
        },
        async toBuffer(): Promise<Buffer> {
            const mod = await load_native_raw_to_png();
            let raw = data instanceof Uint8Array ? data : new Uint8Array((data as Buffer).buffer, (data as Buffer).byteOffset, (data as Buffer).byteLength);
            let { width, height, channels } = state.raw;

            if (state.resize_opts) {
                const resized = resize_raw(raw, width, height, channels, state.resize_opts.width, state.resize_opts.height, state.resize_opts.fit);
                raw = resized.data;
                width = resized.width;
                height = resized.height;
            }

            return mod.raw_to_png(raw, width, height, channels);
        }
    };
}
