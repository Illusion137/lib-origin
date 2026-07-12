import type { OnTextExport } from "@lib/say/platform/base";
import type { PromiseResult } from "@common/types";

export interface VoiceBank {
    id: string;
    name: string;
    quality: string;
    language: string;
    installed?: boolean;
    // Set on catalog entries that need a model download before use (piper/kokoro).
    // Absent/undefined for voices that are already installed.
    model_id?: string;
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
    set_engine?: (engine: string) => void;
    // Downloads (if needed) and activates the given voice's model for the current
    // engine. Also used to (re)load an already-downloaded model that isn't the
    // currently active one in the native engine (e.g. after an app restart).
    download_voice?: (voice: VoiceBank) => PromiseResult<void>;
}