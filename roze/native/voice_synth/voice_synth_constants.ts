export namespace VoiceSynthConstants {
    export const default_mobile_speach_rate = 100;
    export const default_node_speach_rate = 1.0;
}

export interface DownloadableVoiceCatalogEntry {
    engine: "piper" | "kokoro";
    // Passed to Shumil.downloadModel(engine, model_id, destDir).
    model_id: string;
    id: string;
    name: string;
    language: string;
    quality: string;
}

// Curated Piper voices mirrored on the csukuangfj/vits-piper-* HuggingFace repos that
// ModelDownloader (react-native-shumil) pulls from. model_id follows the upstream
// rhasspy/piper-voices naming: <lang>_<REGION>-<name>-<quality>. Each is its own
// standalone model/download.
export const PIPER_VOICE_CATALOG: DownloadableVoiceCatalogEntry[] = [
    { engine: "piper", model_id: "en_US-amy-medium", id: "en_US-amy-medium", name: "Amy", language: "en-US", quality: "medium" },
    { engine: "piper", model_id: "en_US-lessac-medium", id: "en_US-lessac-medium", name: "Lessac", language: "en-US", quality: "medium" },
    { engine: "piper", model_id: "en_US-ryan-high", id: "en_US-ryan-high", name: "Ryan", language: "en-US", quality: "high" },
    { engine: "piper", model_id: "en_GB-alan-medium", id: "en_GB-alan-medium", name: "Alan", language: "en-GB", quality: "medium" }
];

// Kokoro ships one multi-speaker model — downloading any voice below fetches the
// shared "kokoro-en-v0_19" model and unlocks the rest of the pack at once. Names
// mirror KokoroEngine's known-speaker table so ids match what the native side reports.
const KOKORO_MODEL_ID = "kokoro-en-v0_19";
export const KOKORO_VOICE_CATALOG: DownloadableVoiceCatalogEntry[] = [
    { engine: "kokoro", model_id: KOKORO_MODEL_ID, id: "af", name: "Af", language: "en-US", quality: "high" },
    { engine: "kokoro", model_id: KOKORO_MODEL_ID, id: "af_bella", name: "Bella", language: "en-US", quality: "high" },
    { engine: "kokoro", model_id: KOKORO_MODEL_ID, id: "af_nicole", name: "Nicole", language: "en-US", quality: "high" },
    { engine: "kokoro", model_id: KOKORO_MODEL_ID, id: "af_sarah", name: "Sarah", language: "en-US", quality: "high" },
    { engine: "kokoro", model_id: KOKORO_MODEL_ID, id: "af_sky", name: "Sky", language: "en-US", quality: "high" },
    { engine: "kokoro", model_id: KOKORO_MODEL_ID, id: "am_adam", name: "Adam", language: "en-US", quality: "high" },
    { engine: "kokoro", model_id: KOKORO_MODEL_ID, id: "am_michael", name: "Michael", language: "en-US", quality: "high" },
    { engine: "kokoro", model_id: KOKORO_MODEL_ID, id: "bf_emma", name: "Emma", language: "en-GB", quality: "high" },
    { engine: "kokoro", model_id: KOKORO_MODEL_ID, id: "bf_isabella", name: "Isabella", language: "en-GB", quality: "high" },
    { engine: "kokoro", model_id: KOKORO_MODEL_ID, id: "bm_george", name: "George", language: "en-GB", quality: "high" },
    { engine: "kokoro", model_id: KOKORO_MODEL_ID, id: "bm_lewis", name: "Lewis", language: "en-GB", quality: "high" }
];