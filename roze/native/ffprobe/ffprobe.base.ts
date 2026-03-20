export interface FFPROBEReturn {
    retcode: Promise<number>;
    session_id: number;
    logs: () => Promise<string>;
}
export type FFPROBESizeType = "unknown" | "KiB";
export type FFPROBEBitrateType = "unknown" | "kbits/s";
export type DataCallback = (data: string) => void;
export interface FFPROBE {
    execute_args: (args: string[], data_callback?: DataCallback) => Promise<FFPROBEReturn>;
}