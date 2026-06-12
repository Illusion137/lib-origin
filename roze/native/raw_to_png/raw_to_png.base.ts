export interface RawToPng {
    raw_to_png: (data: Uint8Array, width: number, height: number, channels: number) => Promise<Buffer>;
}
