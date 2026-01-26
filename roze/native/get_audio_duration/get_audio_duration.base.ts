export interface GetAudioDuration {
    get_audio_duration: (path: string) => Promise<number>;
}