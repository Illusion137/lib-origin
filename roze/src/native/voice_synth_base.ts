export interface VoiceBank {
    id: string;
    name: string;
    quality: string;
    language: string;
    installed?: boolean;
}
export interface VoiceOptions {
    voice_bank?: VoiceBank;
    rate?: number;
}
export type VoiceOptionsExport = VoiceOptions & {file_path: string};
export interface VoiceSynth {
    get_voices: () => Promise<VoiceBank[]>;
    speak: (text: string, opts: VoiceOptions) => Promise<string|void>;
    speak_export: (text: string, opts: VoiceOptionsExport) => Promise<string|void>;
}