import type { RawToPng } from "@native/raw_to_png/raw_to_png.base";

function make_crc32_table(): Uint32Array {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[n] = c;
    }
    return table;
}

const CRC32_TABLE = make_crc32_table();

function crc32(buf: Uint8Array, offset = 0, length = buf.length - offset): number {
    let crc = 0xFFFFFFFF;
    for (let i = offset; i < offset + length; i++) {
        crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function adler32(buf: Uint8Array): number {
    let s1 = 1;
    let s2 = 0;
    const MOD_ADLER = 65521;
    for (const byte of buf) {
        s1 = (s1 + byte) % MOD_ADLER;
        s2 = (s2 + s1) % MOD_ADLER;
    }
    return ((s2 << 16) | s1) >>> 0;
}

function write_uint32_be(buf: Uint8Array, offset: number, value: number): void {
    buf[offset]     = (value >>> 24) & 0xFF;
    buf[offset + 1] = (value >>> 16) & 0xFF;
    buf[offset + 2] = (value >>> 8)  & 0xFF;
    buf[offset + 3] =  value         & 0xFF;
}

function write_uint16_le(buf: Uint8Array, offset: number, value: number): void {
    buf[offset]     =  value        & 0xFF;
    buf[offset + 1] = (value >>> 8) & 0xFF;
}

function make_chunk(type: string, data: Uint8Array): Uint8Array {
    const type_bytes = new Uint8Array(4);
    for (let i = 0; i < 4; i++) type_bytes[i] = type.charCodeAt(i);

    const chunk = new Uint8Array(4 + 4 + data.length + 4);
    write_uint32_be(chunk, 0, data.length);
    chunk.set(type_bytes, 4);
    chunk.set(data, 8);

    const crc_input = new Uint8Array(4 + data.length);
    crc_input.set(type_bytes, 0);
    crc_input.set(data, 4);
    write_uint32_be(chunk, 8 + data.length, crc32(crc_input));

    return chunk;
}

function make_ihdr(width: number, height: number, channels: number): Uint8Array {
    // color_type: 0=gray(1ch), 4=gray+alpha(2ch), 2=RGB(3ch), 6=RGBA(4ch)
    const color_type_map: Record<number, number> = { 1: 0, 2: 4, 3: 2, 4: 6 };
    const color_type = color_type_map[channels] ?? 2;

    const ihdr_data = new Uint8Array(13);
    write_uint32_be(ihdr_data, 0, width);
    write_uint32_be(ihdr_data, 4, height);
    ihdr_data[8]  = 8; // bit depth
    ihdr_data[9]  = color_type;
    ihdr_data[10] = 0; // compression
    ihdr_data[11] = 0; // filter
    ihdr_data[12] = 0; // interlace

    return make_chunk("IHDR", ihdr_data);
}

function make_idat(data: Uint8Array, width: number, height: number, channels: number): Uint8Array {
    const scanline_len = width * channels;
    // Each scanline: 1 filter byte + scanline_len bytes
    const raw_len = height * (1 + scanline_len);
    const raw = new Uint8Array(raw_len);
    for (let y = 0; y < height; y++) {
        const row_offset = y * (1 + scanline_len);
        raw[row_offset] = 0x00; // filter type None
        raw.set(data.subarray(y * scanline_len, y * scanline_len + scanline_len), row_offset + 1);
    }

    // DEFLATE stored blocks (BTYPE=00, non-compressed)
    // Each block can hold up to 65535 bytes
    const MAX_BLOCK = 65535;
    const num_blocks = Math.ceil(raw_len / MAX_BLOCK) || 1;

    // Each block: 1 (BFINAL|BTYPE) + 2 (LEN) + 2 (NLEN) + LEN bytes
    let deflate_len = 0;
    for (let i = 0; i < num_blocks; i++) {
        const block_data_len = Math.min(MAX_BLOCK, raw_len - i * MAX_BLOCK);
        deflate_len += 5 + block_data_len;
    }

    // zlib wrapper: 2-byte header + deflate stream + 4-byte adler32
    const zlib_len = 2 + deflate_len + 4;
    const zlib = new Uint8Array(zlib_len);

    // zlib header: CMF=0x78 (deflate, window=32KB), FLG=0x01 (no dict, check bits)
    zlib[0] = 0x78;
    zlib[1] = 0x01;

    let pos = 2;
    for (let i = 0; i < num_blocks; i++) {
        const block_start = i * MAX_BLOCK;
        const block_data_len = Math.min(MAX_BLOCK, raw_len - block_start);
        const is_final = (i === num_blocks - 1) ? 1 : 0;

        zlib[pos++] = is_final; // BFINAL=is_final, BTYPE=00
        write_uint16_le(zlib, pos, block_data_len); pos += 2;
        write_uint16_le(zlib, pos, block_data_len ^ 0xFFFF); pos += 2; // NLEN = one's complement of LEN
        zlib.set(raw.subarray(block_start, block_start + block_data_len), pos);
        pos += block_data_len;
    }

    const adler = adler32(raw);
    write_uint32_be(zlib, pos, adler);

    return make_chunk("IDAT", zlib);
}

function make_iend(): Uint8Array {
    return make_chunk("IEND", new Uint8Array(0));
}

function encode_png(data: Uint8Array, width: number, height: number, channels: number): Buffer {
    const signature = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const ihdr = make_ihdr(width, height, channels);
    const idat = make_idat(data, width, height, channels);
    const iend = make_iend();

    const total = signature.length + ihdr.length + idat.length + iend.length;
    const out = Buffer.allocUnsafe(total);
    let off = 0;
    out.set(signature, off); off += signature.length;
    out.set(ihdr, off);      off += ihdr.length;
    out.set(idat, off);      off += idat.length;
    out.set(iend, off);

    return out;
}

export const mobile_raw_to_png: RawToPng = {
    raw_to_png: async(data: Uint8Array, width: number, height: number, channels: number): Promise<Buffer> => {
        return encode_png(data, width, height, channels);
    }
};
