export interface ImageSizeResult {
    width: number;
    height: number;
    type?: string;
}

export interface ImageSize {
    image_size: (buffer: Buffer | Uint8Array) => ImageSizeResult;
}
