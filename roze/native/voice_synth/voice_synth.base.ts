import type { OnTextExport } from "@lib/say/platform/base";

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
    on_data?: OnTextExport
}
interface VoiceExportBatchText {
    text: string;
    export_path: string
}
export type VoiceExportBatchTexts = VoiceExportBatchText[];
export interface VoiceSynth {
    get_voices: () => Promise<VoiceBank[]>;
    speak: (text: string, opts: VoiceOptions) => Promise<any>;
    speak_export: (texts: VoiceExportBatchTexts, opts: VoiceOptions) => Promise<any>;
}