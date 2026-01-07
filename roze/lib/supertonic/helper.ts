/* eslint-disable @typescript-eslint/parameter-properties */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// helper.ts
import fs from 'fs';
import path from 'path';
import * as ort from 'onnxruntime-node';

/* ---------------------------------- Types --------------------------------- */

export interface BatchedText {
    text: string;
    export_path: string;
}

type Lang = 'en' | 'ko' | 'es' | 'pt' | 'fr';

interface VoiceStyleJSON {
    style_ttl: { data: number[][][]; dims: [number, number, number] };
    style_dp: { data: number[][][]; dims: [number, number, number] };
}

interface TTSConfig {
    ae: {
        sample_rate: number;
        base_chunk_size: number;
    };
    ttl: {
        chunk_compress_factor: number;
        latent_dim: number;
    };
}

/* ----------------------------- Unicode Processor ---------------------------- */

class UnicodeProcessor {
    private readonly indexer: Record<number, number>;

    constructor(unicodeIndexerJsonPath: string) {
        this.indexer = JSON.parse(fs.readFileSync(unicodeIndexerJsonPath, 'utf8'));
    }

    private preprocess(text: string, lang: Lang): string {
        text = text.normalize('NFKD');
        text = text.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
        text = text.replace(/\s+/g, ' ').trim();

        if (!(/[.!?]$/.exec(text))) text += '.';
        return `<${lang}>${text}</${lang}>`;
    }

    call(texts: string[], langs: Lang[]) {
        const processed = texts.map((t, i) => this.preprocess(t, langs[i]));
        const lengths = processed.map(t => t.length);
        const maxLen = Math.max(...lengths);

        const ids = processed.map(t => {
            const row = new Array(maxLen).fill(0);
            for (let i = 0; i < t.length; i++) {
                row[i] = this.indexer[t.charCodeAt(i)] ?? 0;
            }
            return row;
        });

        return {
            textIds: ids,
            textMask: lengthToMask(lengths)
        };
    }
}

/* ---------------------------------- Style ---------------------------------- */

class Style {
    constructor(
        public readonly ttl: ort.Tensor,
        public readonly dp: ort.Tensor
    ) {}
}

/* ------------------------------ Text To Speech ------------------------------ */

export class TextToSpeech {
    readonly sampleRate: number;

    constructor(
        private readonly cfgs: TTSConfig,
        private readonly textProcessor: UnicodeProcessor,
        private readonly dpOrt: ort.InferenceSession,
        private readonly textEncOrt: ort.InferenceSession,
        private readonly vectorEstOrt: ort.InferenceSession,
        private readonly vocoderOrt: ort.InferenceSession
    ) {
        this.sampleRate = cfgs.ae.sample_rate;
    }

    async batch(
        items: BatchedText[],
        lang: Lang,
        style: Style,
        totalStep: number,
        speed = 1.05
    ) {
        const texts = items.map(i => i.text);
        const langs = texts.map(() => lang);

        const { textIds, textMask } = this.textProcessor.call(texts, langs);
        const bsz = texts.length;

        const dpOut = await this.dpOrt.run({
            text_ids: intTensor(textIds),
            text_mask: floatTensor(textMask),
            style_dp: style.dp
        });

        const durations = Array.from(dpOut.duration.data).map((d: any) => d / speed);

        const encOut = await this.textEncOrt.run({
            text_ids: intTensor(textIds),
            text_mask: floatTensor(textMask),
            style_ttl: style.ttl
        });

        const latent = sampleLatent(durations, this.cfgs);

        for (let step = 0; step < totalStep; step++) {
            const est = await this.vectorEstOrt.run({
                noisy_latent: floatTensor(latent.data),
                text_emb: encOut.text_emb,
                style_ttl: style.ttl,
                text_mask: floatTensor(textMask),
                latent_mask: floatTensor(latent.mask),
                total_step: floatTensor(new Array(bsz).fill(totalStep)),
                current_step: floatTensor(new Array(bsz).fill(step))
            });

            latent.data = reshape(est.denoised_latent.data, (latent as any).shape);
        }

        const voc = await this.vocoderOrt.run({
            latent: floatTensor(latent.data)
        });

        return {
            wav: Array.from(voc.wav_tts.data),
            duration: durations
        };
    }
}

/* --------------------------------- Loaders --------------------------------- */

export function loadVoiceStyle(paths: string[]): Style {
    const jsons = paths.map(p => JSON.parse(fs.readFileSync(p, 'utf8')) as VoiceStyleJSON);
    const bsz = jsons.length;

    const ttlDim = jsons[0].style_ttl.dims;
    const dpDim = jsons[0].style_dp.dims;

    const ttl = new Float32Array(bsz * ttlDim[1] * ttlDim[2]);
    const dp = new Float32Array(bsz * dpDim[1] * dpDim[2]);

    jsons.forEach((j, i) => {
        ttl.set(j.style_ttl.data.flat() as any, i * ttlDim[1] * ttlDim[2]);
        dp.set(j.style_dp.data.flat() as any, i * dpDim[1] * dpDim[2]);
    });

    return new Style(
        new ort.Tensor('float32', ttl, [bsz, ttlDim[1], ttlDim[2]]),
        new ort.Tensor('float32', dp, [bsz, dpDim[1], dpDim[2]])
    );
}

export async function loadTextToSpeech(onnxDir: string, useGpu: boolean) {
    const cfgs = JSON.parse(fs.readFileSync(path.join(onnxDir, 'tts.json'), 'utf8'));
    const textProcessor = new UnicodeProcessor(path.join(onnxDir, 'unicode_indexer.json'));

    const opts = useGpu ? { executionProviders: ['cuda'] } : {};
    const load = (n: string) => ort.InferenceSession.create(path.join(onnxDir, n), opts);

    return new TextToSpeech(
        cfgs,
        textProcessor,
        await load('duration_predictor.onnx'),
        await load('text_encoder.onnx'),
        await load('vector_estimator.onnx'),
        await load('vocoder.onnx')
    );
}

/* ------------------------------- Utilities --------------------------------- */

function lengthToMask(lengths: number[]) {
    const max = Math.max(...lengths);
    return lengths.map(l => [[...Array(max)].map((_, i) => (i < l ? 1 : 0))]);
}

function floatTensor(arr: any, dims?: number[]) {
    const flat = arr.flat(Infinity);
    return new ort.Tensor('float32', Float32Array.from(flat), dims);
}

function intTensor(arr: number[][]) {
    return new ort.Tensor(
        'int64',
        BigInt64Array.from(arr.flat().map(BigInt)),
        [arr.length, arr[0].length]
    );
}

function reshape(data: readonly number[], shape: number[]) {
    let i = 0;
    return Array.from({ length: shape[0] }, () =>
        Array.from({ length: shape[1] }, () =>
            Array.from({ length: shape[2] }, () => data[i++])
        )
    );
}

function sampleLatent(durations: number[], cfg: TTSConfig) {
    const maxLen = Math.max(...durations) * cfg.ae.sample_rate;
    const size = Math.ceil(maxLen / (cfg.ae.base_chunk_size * cfg.ttl.chunk_compress_factor));
    const dim = cfg.ttl.latent_dim * cfg.ttl.chunk_compress_factor;

    const data = durations.map(() =>
        Array.from({ length: dim }, () =>
            Array.from({ length: size }, () => Math.random() * 2 - 1)
        )
    );

    return {
        data,
        mask: lengthToMask(durations.map(d => Math.floor(d)))
    };
}

export function writeWavFile(filename, audioData, sampleRate) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = audioData.length * bitsPerSample / 8;

    const buffer = Buffer.alloc(44 + dataSize);
    
    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    
    // fmt chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // fmt chunk size
    buffer.writeUInt16LE(1, 20); // audio format (PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    
    // data chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    
    // Write audio data
    for (let i = 0; i < audioData.length; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i]));
        const intSample = Math.floor(sample * 32767);
        buffer.writeInt16LE(intSample, 44 + i * 2);
    }
    
    fs.writeFileSync(filename, buffer);
}