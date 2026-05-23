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
		await MrLecture.exportBatch(
			texts.map(t => ({ text: t.text, outputPath: t.export_path })),
			active_engine,
			{
				voiceId: opts.voice_bank?.id,
				rate: opts.rate ?? VoiceSynthConstants.default_node_speach_rate,
			}
		);
	},
}
