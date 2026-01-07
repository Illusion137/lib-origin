// supertonic.ts
import path from 'path';
import type { BatchedText } from './helper';
import { loadTextToSpeech, loadVoiceStyle, writeWavFile } from './helper';

export interface SupertonicArgs {
    useGpu: boolean;
    onnxDir: string;
    totalStep: number;
    speed: number;
    voiceStyle: string;
    texts: BatchedText[];
    lang?: 'en' | 'ko' | 'es' | 'pt' | 'fr';
}

export async function supertonic_batch(args: SupertonicArgs) {
    const {
        texts,
        voiceStyle,
        onnxDir,
        totalStep,
        speed,
        useGpu,
        lang = 'en'
    } = args;
    const tts = await loadTextToSpeech(path.resolve(__dirname, onnxDir), useGpu);
    console.log(tts.sampleRate);

    const stylePaths = texts.map(() => path.resolve(__dirname, voiceStyle));
    const style = loadVoiceStyle(stylePaths);

    console.log("Start batch")

    const { wav, duration } = await tts.batch(texts, lang, style, totalStep, speed);

    let offset = 0;

    for (let i = 0; i < texts.length; i++) {
        const samples = Math.floor(duration[i] * tts.sampleRate);
        const slice = wav.slice(offset, offset + samples);
        offset += samples;

        const out = path.resolve(texts[i].export_path);
        writeWavFile(out, slice, tts.sampleRate);
    }
}
