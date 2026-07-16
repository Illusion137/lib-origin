import { Audiobooks, type AudiobookTTSOpts } from "@illusive/audiobooks";
import type { AudiobookTableItem } from "@illusive/db/schema";
import { GLOBALS } from "@illusive/globals";
import type Roz from "@roze/types/roz";
import { generror_catch } from "@common/utils/error_util";

export namespace AudiobookGeneration {
	export interface GenState {
		uuid: string;
		title: string;
		// null = generating every chapter; otherwise the single targeted chapter.
		target_chapter: number | null;
		current: number;
		total: number;
		// Progress within the chapter currently being generated.
		chapter_done: number;
		chapter_total: number;
		// Non-null only while the chapter's final .aac encode pass is running
		// (after synthesis); progress in [0, 1].
		encode_progress: number | null;
	}

	const states = new Map<string, GenState>();
	const subscribers = new Set<() => void>();

	export function subscribe(cb: () => void): () => void {
		subscribers.add(cb);
		return () => { subscribers.delete(cb); };
	}

	function notify(): void {
		for (const cb of subscribers) {
			try { cb(); } catch { /* one bad subscriber shouldn't break the rest */ }
		}
	}

	// Snapshots, not live references: run() mutates one GenState object in place,
	// so handing that object out lets React bail on re-renders (prev === next in
	// useState/useAudiobookGeneration) and the UI freezes at the initial values.
	export function get_states(): GenState[] {
		return [...states.values()].map(state => ({ ...state }));
	}

	export function get_state(uuid: string): GenState | undefined {
		const state = states.get(uuid);
		return state === undefined ? undefined : { ...state };
	}

	export function is_generating(uuid: string): boolean {
		return states.has(uuid);
	}

	// Fire-and-forget: kicks off generation and returns immediately. Returns
	// undefined (no-op) if this audiobook is already generating.
	export function start(novel: AudiobookTableItem, roz: Roz, target_chapter: number | null, opts: AudiobookTTSOpts): GenState | undefined {
		if (states.has(novel.uuid)) return undefined;
		const chapter_content_total = (i: number) => roz.chapters[i]?.contents.length ?? 0;
		const state: GenState = {
			uuid: novel.uuid,
			title: novel.title,
			target_chapter,
			current: target_chapter ?? 0,
			total: novel.chapter_count,
			chapter_done: 0,
			chapter_total: chapter_content_total(target_chapter ?? 0),
			encode_progress: null,
		};
		states.set(novel.uuid, state);
		notify();
		run(novel, target_chapter, opts, state, chapter_content_total).catch(() => undefined);
		return state;
	}

	async function run(novel: AudiobookTableItem, target_chapter: number | null, opts: AudiobookTTSOpts, state: GenState, chapter_content_total: (i: number) => number): Promise<void> {
		const bump = () => {
			state.chapter_done = state.chapter_total > 0 ? Math.min(state.chapter_done + 1, state.chapter_total) : state.chapter_done + 1;
			notify();
		};
		const finish_chapter = () => {
			state.chapter_done = state.chapter_total;
			state.encode_progress = null;
			notify();
		};
		const encode_progress = (_ch: unknown, progress: number) => {
			state.encode_progress = progress;
			notify();
		};
		try {
			const result = target_chapter === null
				? await Audiobooks.generate_full_audio(novel.uuid, opts, {
						on_chapter_start: (i, total) => {
							state.current = i;
							state.total = total;
							state.chapter_done = 0;
							state.chapter_total = chapter_content_total(i);
							state.encode_progress = null;
							notify();
						},
						on_content_export: bump,
						on_content_skip: bump,
						on_encode_progress: encode_progress,
						on_chapter_finish: finish_chapter,
					})
				: await Audiobooks.generate_chapter_audio(novel.uuid, target_chapter, opts, { on_content_export: bump, on_content_skip: bump, on_encode_progress: encode_progress, on_chapter_finish: finish_chapter });
			if ("error" in result) {
				GLOBALS.global_var.bottom_alert(`Generation failed: ${result.error.message}`, "WARN");
			}
		} catch (e) {
			const err = generror_catch(e, "Audiobook generation crashed", "MEDIUM", { uuid: novel.uuid });
			GLOBALS.global_var.bottom_alert(`Generation failed: ${err.error.message}`, "WARN");
		} finally {
			states.delete(novel.uuid);
			notify();
		}
	}
}
