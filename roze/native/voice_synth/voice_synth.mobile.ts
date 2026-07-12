import { Shumil } from 'react-native-shumil';
import { VoiceSynthConstants, PIPER_VOICE_CATALOG, KOKORO_VOICE_CATALOG, type DownloadableVoiceCatalogEntry } from "@native/voice_synth/voice_synth_constants";
import type { VoiceBank, VoiceExportBatchTexts, VoiceOptions, VoiceSynth } from "@native/voice_synth/voice_synth.base";
import { fs } from "@native/fs/fs";
import { generror_catch } from "@common/utils/error_util";

let active_engine: 'avs' | 'kokoro' | 'piper' = 'avs';
// Tracks which downloadable model is currently loaded into the native piper/kokoro
// engine, since each can only hold one active model at a time. Reset on cold start,
// which is why download_voice re-checks disk + reloads rather than trusting this alone.
let loaded_model: { engine: string; model_id: string } | null = null;

function strip_file_scheme(p: string): string {
	return p.startsWith("file://") ? p.slice("file://".length) : p;
}

function catalog_for(engine: string): DownloadableVoiceCatalogEntry[] {
	if (engine === 'piper') return PIPER_VOICE_CATALOG;
	if (engine === 'kokoro') return KOKORO_VOICE_CATALOG;
	return [];
}

// Piper stores one voice per model file (<model_id>.onnx); Kokoro bundles many
// speakers into a single shared model.onnx + voices.bin. Both keep a
// document-directory home at tts-models/<engine>/<model_id>/ that persists
// across app restarts.
async function model_paths(engine: string, model_id: string) {
	const primary_name = engine === 'piper' ? `${model_id}.onnx` : 'model.onnx';
	const dir_uri = await fs().document_directory('tts-models', engine, model_id);
	const dir = strip_file_scheme(dir_uri);
	return {
		dest_dir: dir,
		primary_path: `${dir}/${primary_name}`,
		primary_uri: `${dir_uri}/${primary_name}`,
		voices_path: `${dir}/voices.bin`,
		voices_uri: `${dir_uri}/voices.bin`,
		tokens_path: `${dir}/tokens.txt`,
		tokens_uri: `${dir_uri}/tokens.txt`,
		espeak_uri: `${dir_uri}/espeak-ng-data`
	};
}

// Checking only the primary model file isn't enough — a partial/interrupted
// download, or one made before espeak-ng-data was bundled alongside models,
// leaves model.onnx on disk but the model unusable. Require every file the
// native engine needs before calling it "installed".
async function model_is_complete(engine: string, model_id: string): Promise<boolean> {
	const paths = await model_paths(engine, model_id);
	const required_uris = engine === 'kokoro' ? [paths.primary_uri, paths.voices_uri, paths.tokens_uri, paths.espeak_uri] : [paths.primary_uri, paths.tokens_uri, paths.espeak_uri];
	const infos = await Promise.all(required_uris.map(async(uri) => await fs().get_info(uri)));
	return infos.every(info => info.exists);
}

export const mobile_voice_synth: VoiceSynth = {
	set_engine: (engine: string) => {
		if (engine === 'avs' || engine === 'piper' || engine === 'kokoro') active_engine = engine;
	},
	get_voices: async () => {
		const native_voices = await Shumil.getVoices(active_engine);
		const installed: VoiceBank[] = native_voices.map(voice => ({
			id: voice.id,
			name: voice.name,
			language: voice.language,
			quality: voice.quality,
			installed: true
		}));
		const catalog = catalog_for(active_engine);
		if (catalog.length === 0) return installed;
		// Voices already reported by the native engine (loaded this session) don't
		// need a disk check. Everything else in the catalog might already be
		// downloaded from a previous session — check the shared model file per
		// distinct model_id (Kokoro's 11 voices share one file).
		const covered_ids = new Set(installed.map(v => v.id));
		const remaining = catalog.filter(entry => !covered_ids.has(entry.id));
		const unique_model_ids = [...new Set(remaining.map(entry => entry.model_id))];
		const exists_by_model: Record<string, boolean> = {};
		await Promise.all(unique_model_ids.map(async model_id => {
			exists_by_model[model_id] = await model_is_complete(active_engine, model_id);
		}));
		const downloadable: VoiceBank[] = remaining.map(entry => ({
			id: entry.id,
			name: entry.name,
			language: entry.language,
			quality: entry.quality,
			installed: exists_by_model[entry.model_id] ?? false,
			model_id: entry.model_id
		}));
		return [...installed, ...downloadable];
	},
	download_voice: async (voice: VoiceBank) => {
		if (active_engine !== 'piper' && active_engine !== 'kokoro') return;
		// Voices reported by the native engine (already loaded this session) carry no
		// model_id — resolve it through the catalog by voice id. Falling back to the
		// bare voice id is wrong for kokoro (speaker "af_nicole" is not a repo), so it
		// only remains as a last resort for uncataloged piper models.
		const model_id = voice.model_id ?? catalog_for(active_engine).find(entry => entry.id === voice.id)?.model_id ?? voice.id;
		if (loaded_model?.engine === active_engine && loaded_model.model_id === model_id) return;
		try {
			const paths = await model_paths(active_engine, model_id);
			const already_complete = await model_is_complete(active_engine, model_id);
			if (!already_complete) await Shumil.downloadModel(active_engine, model_id, paths.dest_dir);
			if (active_engine === 'piper') Shumil.setPiperModel(paths.primary_path, paths.tokens_path);
			else Shumil.setKokoroModel(paths.primary_path, paths.voices_path, paths.tokens_path);
			loaded_model = { engine: active_engine, model_id };
			return;
		} catch (error) {
			return generror_catch(error, "Failed to prepare voice model", "MEDIUM", { engine: active_engine, model_id });
		}
	},
	speak: async (text: string, opts: VoiceOptions) => {
		await Shumil.speak(text, active_engine, {
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
				await Shumil.exportBatch([{ text: t.text, outputPath: t.export_path }], active_engine, native_opts);
				opts.on_data?.(t.export_path, t.export_path);
			}
		};
		await Promise.all(Array.from({ length: Math.min(POOL, texts.length || 1) }, run_worker));
	},
}
