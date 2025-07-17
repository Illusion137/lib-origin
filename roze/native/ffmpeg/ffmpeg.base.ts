export interface FFMPEG {
    execute_args: (args: string[]) => Promise<void>;
}