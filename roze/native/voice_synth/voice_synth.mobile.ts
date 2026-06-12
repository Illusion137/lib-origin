import { MrLecture } from 'react-native-mr-lecture';
import { VoiceSynthConstants } from "@native/voice_synth/voice_synth_constants";
import type { VoiceExportBatchTexts, VoiceOptions, VoiceSynth } from "@native/voice_synth/voice_synth.base";

let active_engine: 'avs' | 'piper' = 'avs';

export const mobile_voice_synth: VoiceSynth = {
	set_engine: (engine: string) => {
		if (engine === 'avs' || engine === 'piper') active_engine = engine;
	},
	get_voices: async () => {
		return (await MrLecture.getVoices(active_engine)).map(voice => ({
			id: voice.id,
			name: voice.name,
			language: voice.language,
			quality: voice.quality,
			installed: true,
		}));
	},
	speak: async (text: string, opts: VoiceOptions) => {
		await MrLecture.speak(text, active_engine, {
			voiceId: opts.voice_bank?.id,
			rate: opts.rate ?? VoiceSynthConstants.default_node_speach_rate,
		});
	},
	speak_export: async (texts: VoiceExportBatchTexts, opts: VoiceOptions) => {
		const native_opts = {
			voiceId: opts.voice_bank?.id,
			rate: opts.rate ?? VoiceSynthConstants.default_node_speach_rate,
		};
		// A single batched exportBatch resolves only once, so callers get no per-segment
		// progress. Export one segment per native call across a small worker pool — the
		// engines cap their own concurrency, so throughput is unchanged — and report each
		// finished segment via on_data so chapter progress can advance live.
		const POOL = 4;
		let cursor = 0;
		const run_worker = async (): Promise<void> => {
			for (let i = cursor++; i < texts.length; i = cursor++) {
				const t = texts[i];
				await MrLecture.exportBatch([{ text: t.text, outputPath: t.export_path }], active_engine, native_opts);
				opts.on_data?.(t.export_path, t.export_path);
			}
		};
		await Promise.all(Array.from({ length: Math.min(POOL, texts.length || 1) }, run_worker));
	},
}
