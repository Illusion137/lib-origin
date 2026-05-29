import { load_native_raw_to_png } from '@native/raw_to_png/raw_to_png';

export type Channels = 1 | 2 | 3 | 4;

export default function sharp(data: Buffer | Uint8Array, opts: { raw: { width: number; height: number; channels: Channels } }) {
    const state = { ...opts };
    return {
        raw() { return this; },
        png() { return this; },
        async toBuffer(): Promise<Buffer> {
            const mod = await load_native_raw_to_png();
            return mod.raw_to_png(
                data instanceof Uint8Array ? data : new Uint8Array((data as Buffer).buffer, (data as Buffer).byteOffset, (data as Buffer).byteLength),
                state.raw.width,
                state.raw.height,
                state.raw.channels
            );
        }
    };
}
