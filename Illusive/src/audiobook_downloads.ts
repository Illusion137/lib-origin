import { fs } from "@native/fs/fs";
import type { ResumableDownload } from "@native/fs/fs.base";
import { SQLfs } from "@illusive/sql/sql_fs";
import { Audiobooks } from "@illusive/audiobooks";
import { GLOBALS } from "@illusive/globals";
import { generror_catch } from "@common/utils/error_util";
import type { CookieJar } from "@common/utils/cookie_util";
import type { PromiseResult } from "@common/types";

export namespace AudiobookDownloads {
	export type DownloadStatus = "queued" | "downloading" | "processing" | "error";

	export interface DownloadState {
		uuid: string;
		url: string;
		title: string;
		dest_rel: string;
		source_file_type: string;
		headers?: Record<string, string>;
		resume_data?: string;
		status: DownloadStatus;
		bytes_written: number;
		bytes_total: number;
		error?: string;
	}

	interface PersistedDownload {
		uuid: string;
		url: string;
		title: string;
		dest_rel: string;
		source_file_type: string;
		headers?: Record<string, string>;
		resume_data?: string;
	}

	const states = new Map<string, DownloadState>();
	const handles = new Map<string, ResumableDownload>();
	const subscribers = new Set<() => void>();
	const paused = new Set<string>();

	function registry_path(): string {
		return SQLfs.audiobook_directory("_downloads.json");
	}

	export function subscribe(cb: () => void): () => void {
		subscribers.add(cb);
		return () => { subscribers.delete(cb); };
	}

	function notify(): void {
		for (const cb of subscribers) {
			try { cb(); } catch { /* one bad subscriber shouldn't break the rest */ }
		}
	}

	export function get_states(): DownloadState[] {
		return [...states.values()];
	}

	export function get_state(uuid: string): DownloadState | undefined {
		return states.get(uuid);
	}

	function to_persisted(s: DownloadState): PersistedDownload {
		return { uuid: s.uuid, url: s.url, title: s.title, dest_rel: s.dest_rel, source_file_type: s.source_file_type, headers: s.headers, resume_data: s.resume_data };
	}

	async function persist(): Promise<void> {
		const payload = [...states.values()].filter(s => s.status !== "error").map(to_persisted);
		await Promise.resolve(SQLfs.create_file(registry_path(), JSON.stringify(payload))).catch(() => undefined);
	}

	async function read_registry(): Promise<PersistedDownload[]> {
		const path = registry_path();
		if (!(await SQLfs.info(path)).exists) return [];
		const raw = await SQLfs.read_file(path);
		if (typeof raw !== "string") return [];
		try {
			const parsed = JSON.parse(raw) as unknown;
			return Array.isArray(parsed) ? parsed as PersistedDownload[] : [];
		} catch {
			return [];
		}
	}

	export interface EnqueueRemoteImportOpts {
		url: string;
		title?: string;
		source_file_type?: string;
		cookie_jar?: CookieJar;
		headers?: Record<string, string>;
		user_agent?: string;
	}

	export async function enqueue_remote_import(opts: EnqueueRemoteImportOpts): PromiseResult<DownloadState> {
		const prepared = await Audiobooks.prepare_remote_import(opts);
		if ("error" in prepared) return prepared;
		const { rel } = Audiobooks.remote_source_dest(prepared.uuid, opts.url);
		const state: DownloadState = {
			uuid: prepared.uuid,
			url: opts.url,
			title: opts.title ?? prepared.title ?? "",
			dest_rel: rel,
			source_file_type: opts.source_file_type ?? "REMOTE",
			headers: Audiobooks.build_remote_headers(opts),
			status: "queued",
			bytes_written: 0,
			bytes_total: 0,
		};
		states.set(state.uuid, state);
		await persist();
		notify();
		run_download(state).catch(() => undefined);
		return state;
	}

	async function run_download(state: DownloadState): Promise<void> {
		try {
			paused.delete(state.uuid);
			state.status = "downloading";
			state.error = undefined;
			notify();

			const handle = fs().download_resumable({
				uri: state.url,
				to_path: Audiobooks.resolve_relative_path(state.dest_rel),
				headers: state.headers,
				resume_data: state.resume_data,
				on_progress: (written, total) => {
					state.bytes_written = written;
					state.bytes_total = total;
					notify();
				},
			});
			handles.set(state.uuid, handle);
			const result = await handle.start();
			handles.delete(state.uuid);

			if (paused.has(state.uuid)) return;

			if (typeof result !== "string") {
				state.status = "error";
				state.error = result.error.message;
				notify();
				await persist();
				GLOBALS.global_var.bottom_alert(`Download failed: ${state.title || "audiobook"}`, "WARN");
				return;
			}

			state.status = "processing";
			notify();
			const finalized = await Audiobooks.finalize_remote_import(state.uuid, result, { title: state.title });
			if ("error" in finalized) {
				state.status = "error";
				state.error = finalized.error.message;
				notify();
				await persist();
				GLOBALS.global_var.bottom_alert(`Import failed: ${state.title || "audiobook"}`, "WARN");
				return;
			}

			states.delete(state.uuid);
			await persist();
			notify();
		} catch (e) {
			handles.delete(state.uuid);
			if (paused.has(state.uuid)) return;
			const err = generror_catch(e, "Audiobook download crashed", "MEDIUM", { uuid: state.uuid });
			state.status = "error";
			state.error = err.error.message;
			notify();
			await persist();
		}
	}

	export async function resume_all(): Promise<void> {
		const persisted = await read_registry();
		let added = false;
		for (const p of persisted) {
			if (states.has(p.uuid)) continue;
			states.set(p.uuid, { ...p, status: "queued", bytes_written: 0, bytes_total: 0 });
			added = true;
		}
		if (added) notify();
		for (const state of states.values()) {
			if (state.status === "queued" && !handles.has(state.uuid)) run_download(state).catch(() => undefined);
		}
	}

	export async function persist_for_background(): Promise<void> {
		const active = [...states.values()].filter(s => s.status === "downloading");
		for (const state of active) {
			const handle = handles.get(state.uuid);
			if (handle === undefined) continue;
			paused.add(state.uuid);
			state.resume_data = await handle.pause();
			state.status = "queued";
		}
		await persist();
		if (active.length > 0) notify();
	}

	export async function cancel(uuid: string): Promise<void> {
		const handle = handles.get(uuid);
		if (handle !== undefined) {
			paused.add(uuid);
			await handle.pause().catch(() => undefined);
		}
		states.delete(uuid);
		handles.delete(uuid);
		await Audiobooks.cleanup_failed_import(uuid);
		await persist();
		notify();
	}
}
