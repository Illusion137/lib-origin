export interface DecodedRaw {
    data: Uint8Array;
    width: number;
    height: number;
    channels: number;
}

export interface RawToPng {
    raw_to_png: (data: Uint8Array, width: number, height: number, channels: number) => Promise<Buffer>;
    decode_to_raw: (encoded: Uint8Array) => Promise<DecodedRaw>;
}
