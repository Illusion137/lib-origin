import { fs } from "@native/fs/fs";
import { voice_synth } from "@native/voice_synth/voice_synth";
import type { VoiceOptions } from "@native/voice_synth/voice_synth.base";
import type Roz from "@roze/types/roz";
import type { RozChapterContents } from "@roze/types/roz";
import { FileParser } from "@roze/file";
import { upgrade_roz_version } from "@roze/index";
import { AudiobookGen } from "@roze/audiobook_gen";
import { SQLfs } from "@illusive/sql/sql_fs";
import { SQLAudiobook } from "@illusive/sql/sql_audiobook";
import type { AudiobookTableInsert, AudiobookTableItem } from "@illusive/db/schema";
import { extract_file_extension } from "@common/utils/util";
import { generror, generror_catch } from "@common/utils/error_util";
import { try_json_parse } from "@common/utils/parse_util";
import { reinterpret_cast } from "@common/cast";
import type { CookieJar } from "@common/utils/cookie_util";
import type { PromiseResult } from "@common/types";

export type AudiobookTTSEngine = 'avs' | 'piper';

export interface AudiobookImportOpts {
	tts_engine?: AudiobookTTSEngine;
	tts_voice_id?: string;
}

export interface AudiobookTTSOpts {
	engine?: AudiobookTTSEngine;
	voice_id?: string;
	rate?: number;
}

export interface AudiobookChapterGenCallbacks {
	on_content_skip?: (chapter: RozChapterContents) => void;
	on_content_export?: (chapter: RozChapterContents) => void;
	on_chapter_finish?: (chapter: RozChapterContents) => void;
}

export interface AudiobookFullGenCallbacks extends AudiobookChapterGenCallbacks {
	on_chapter_start?: (chapter_index: number, total: number) => void;
}

export interface Audiobook {
	meta: AudiobookTableItem;
	roz: Roz;
}

export namespace Audiobooks {
	function rel_dir(uuid: string) { return `${uuid}/`; }
	function rel_roz_path(uuid: string) { return `${uuid}/${uuid}.roz`; }
	function rel_source_path(uuid: string, ext: string) { return `${uuid}/source${ext}`; }
	function rel_chapter_audio_path(uuid: string, chapter_uuid: string) { return `${uuid}/chapters/${chapter_uuid}.caf`; }
	function full_path(rel: string) { return SQLfs.audiobook_directory(rel); }

	async function write_roz_file(roz_uri: string, roz: Roz): Promise<void> {
		await SQLfs.create_file(full_path(roz_uri), JSON.stringify(roz));
	}

	export async function load_roz(meta: AudiobookTableItem): PromiseResult<Roz> {
		const raw_file = await SQLfs.read_file(full_path(meta.roz_uri));
		if (typeof raw_file !== "string") return generror("Failed to read .roz file", "CRITICAL", { uuid: meta.uuid, title: meta.title, roz_uri: meta.roz_uri });
		const parsed = try_json_parse<Roz>(raw_file);
		if ("error" in parsed) return parsed;
		return upgrade_roz_version(parsed);
	}

	export async function save_roz(meta: AudiobookTableItem, roz: Roz): Promise<void> {
		await write_roz_file(meta.roz_uri, roz);
	}

	async function setup_audiobook_dirs(uuid: string): Promise<void> {
		await SQLfs.mkdir(full_path(rel_dir(uuid)));
		await SQLfs.mkdir(full_path(`${uuid}/chapters/`));
	}

	function build_insert(roz: Roz, source_raw_uri: string): AudiobookTableInsert {
		return {
			uuid: roz.uuid,
			version: roz.version,
			title: roz.title,
			author: roz.author ?? "",
			publisher: roz.publisher ?? "",
			cover: "",
			date: roz.date ?? "",
			series_name: roz.series_name ?? "",
			series_no: roz.series_no ?? 0,
			source_file: roz.source_file,
			source_file_type: roz.source_file_type,
			roz_uri: rel_roz_path(roz.uuid),
			source_raw_uri,
			chapter_count: roz.chapters.length,
		};
	}

	export async function import_audiobook(source: string, _opts?: AudiobookImportOpts): PromiseResult<AudiobookTableItem> {
		try {
			const parse_result = await FileParser.parse(source);
			if ("error" in parse_result) return parse_result;
			const roz = parse_result;
			await setup_audiobook_dirs(roz.uuid);
			const ext = extract_file_extension(source) || ".bin";
			const raw_rel = rel_source_path(roz.uuid, ext);
			await fs().copy(source, full_path(raw_rel), {});
			await write_roz_file(rel_roz_path(roz.uuid), roz);
			return await SQLAudiobook.insert_audiobook(build_insert(roz, raw_rel));
		} catch (e) {
			return generror_catch(e, "Failed to import audiobook", "CRITICAL", { source });
		}
	}

	export async function create_audiobook_from_roz(roz: Roz, _opts?: AudiobookImportOpts): PromiseResult<AudiobookTableItem> {
		try {
			await setup_audiobook_dirs(roz.uuid);
			await write_roz_file(rel_roz_path(roz.uuid), roz);
			return await SQLAudiobook.insert_audiobook(build_insert(roz, ""));
		} catch (e) {
			return generror_catch(e, "Failed to create audiobook from roz", "CRITICAL", { uuid: roz.uuid });
		}
	}

	export async function reextract_audiobook(uuid: string): PromiseResult<AudiobookTableItem> {
		try {
			const meta = await SQLAudiobook.get_audiobook_by_uuid(uuid);
			if (!meta) return generror(`Audiobook ${uuid} not found`, "MEDIUM", { uuid });
			if (!meta.source_raw_uri) return generror(`Audiobook ${uuid} has no raw source stored`, "MEDIUM", { uuid, title: meta.title });
			const parse_result = await FileParser.parse(full_path(meta.source_raw_uri));
			if ("error" in parse_result) return parse_result;
			const roz = parse_result;
			await save_roz(meta, roz);
			await SQLAudiobook.update_audiobook(uuid, {
				version: roz.version,
				title: roz.title,
				author: roz.author ?? "",
				publisher: roz.publisher ?? "",
				date: roz.date ?? "",
				series_name: roz.series_name ?? "",
				series_no: roz.series_no ?? 0,
				chapter_count: roz.chapters.length,
			});
			const updated = await SQLAudiobook.get_audiobook_by_uuid(uuid);
			if (!updated) return generror(`Audiobook ${uuid} not found after reextract`, "MEDIUM", { uuid, title: meta.title });
			return updated;
		} catch (e) {
			return generror_catch(e, "Failed to reextract audiobook", "CRITICAL", { uuid });
		}
	}

	export async function get_audiobooks(): Promise<AudiobookTableItem[]> {
		return await SQLAudiobook.get_all_audiobooks();
	}

	export async function get_audiobook(uuid: string): PromiseResult<Audiobook> {
		const meta = await SQLAudiobook.get_audiobook_by_uuid(uuid);
		if (!meta) return generror(`Audiobook ${uuid} not found`, "MEDIUM", { uuid });
		const roz_result = await load_roz(meta);
		if ("error" in roz_result) return roz_result;
		return { meta, roz: roz_result };
	}

	export async function update_meta(uuid: string, changes: Partial<AudiobookTableInsert>): Promise<void> {
		await SQLAudiobook.update_audiobook(uuid, changes);
	}

	export async function save_read_progress(
		uuid: string,
		chapter_index: number,
		chapter_timestamp_ms: number,
		total_listened_ms: number,
	): Promise<void> {
		await SQLAudiobook.update_audiobook(uuid, {
			last_chapter_index: chapter_index,
			last_chapter_timestamp_ms: chapter_timestamp_ms,
			total_listened_ms,
			last_read_date: new Date().toISOString(),
		});
	}

	export async function delete_audiobook(uuid: string): Promise<void> {
		await SQLAudiobook.delete_audiobook(uuid);
	}

	function build_voice_options(opts: AudiobookTTSOpts): VoiceOptions {
		voice_synth().set_engine?.(opts.engine ?? 'avs');
		return {
			rate: opts.rate,
			voice_bank: opts.voice_id
				? { id: opts.voice_id, name: "", quality: "", language: "" }
				: undefined,
		};
	}

	export async function generate_chapter_audio(
		uuid: string,
		chapter_index: number,
		opts: AudiobookTTSOpts,
		callbacks: AudiobookChapterGenCallbacks = {},
	): PromiseResult<RozChapterContents> {
		try {
			const meta = await SQLAudiobook.get_audiobook_by_uuid(uuid);
			if (!meta) return generror(`Audiobook ${uuid} not found`, "MEDIUM", { uuid });
			const roz_result = await load_roz(meta);
			if ("error" in roz_result) return roz_result;
			const roz = roz_result;
			const chapter = roz.chapters[chapter_index];
			if (!chapter) return generror(`Chapter ${chapter_index} out of range`, "MEDIUM", { uuid, chapter_index, chapter_count: roz.chapters.length });

			const voice_opts = build_voice_options(opts);
			const gen_callbacks: Parameters<typeof AudiobookGen.roz_chapter_to_audiobook>[2] = {
				on_chapter_content_skip: callbacks.on_content_skip,
				on_chapter_content_export: callbacks.on_content_export,
				on_chapter_finish: (ch) => callbacks.on_chapter_finish?.(ch),
			};

			const result = await AudiobookGen.roz_chapter_to_audiobook(chapter, {}, gen_callbacks, voice_opts);
			if ("error" in result) return result;

			if (result.chapter.audio_path) {
				const dest_rel = rel_chapter_audio_path(uuid, result.chapter.uuid);
				await fs().move(result.chapter.audio_path, full_path(dest_rel), {});
				result.chapter.audio_path = dest_rel;
			}

			roz.chapters[chapter_index] = result;
			await save_roz(meta, roz);

			const total_duration_ms = Math.round(
				roz.chapters.reduce((acc, ch) => acc + (ch.chapter.duration ?? 0) * 1000, 0)
			);
			await SQLAudiobook.update_audiobook(uuid, {
				total_duration_ms,
				tts_engine: opts.engine ?? 'avs',
				tts_voice_id: opts.voice_id ?? "",
			});

			return result;
		} catch (e) {
			return generror_catch(e, "Failed to generate chapter audio", "CRITICAL", { uuid, chapter_index });
		}
	}

	export async function generate_full_audio(
		uuid: string,
		opts: AudiobookTTSOpts,
		callbacks: AudiobookFullGenCallbacks = {},
	): PromiseResult<Roz> {
		try {
			const meta = await SQLAudiobook.get_audiobook_by_uuid(uuid);
			if (!meta) return generror(`Audiobook ${uuid} not found`, "MEDIUM", { uuid });
			const total = meta.chapter_count;
			for (let i = 0; i < total; i++) {
				callbacks.on_chapter_start?.(i, total);
				const result = await generate_chapter_audio(uuid, i, opts, callbacks);
				if ("error" in result) return result;
			}
			const final = await get_audiobook(uuid);
			if ("error" in final) return final;
			return final.roz;
		} catch (e) {
			return generror_catch(e, "Failed to generate full audiobook audio", "CRITICAL", { uuid });
		}
	}

	export interface AddFromRemoteUrlOpts {
		url: string;
		title?: string;
		source_file_type?: string;
	}

	export async function add_from_remote_url(opts: AddFromRemoteUrlOpts): PromiseResult<AudiobookTableItem> {
		try {
			const inserted = await SQLAudiobook.insert_audiobook({
				title: opts.title ?? "",
				source_file: "",
				source_file_type: opts.source_file_type ?? "REMOTE",
				source_raw_uri: opts.url,
			});
			await setup_audiobook_dirs(inserted.uuid);
			return inserted;
		} catch (e) {
			return generror_catch(e, "Failed to add audiobook from remote URL", "MEDIUM", { url: opts.url });
		}
	}

	export interface DownloadAudiobookOpts {
		cookie_jar?: CookieJar;
		headers?: Record<string, string>;
		user_agent?: string;
	}

	export async function download_audiobook(uuid: string, opts: DownloadAudiobookOpts = {}): PromiseResult<string> {
		try {
			const meta = await SQLAudiobook.get_audiobook_by_uuid(uuid);
			if (!meta) return generror(`Audiobook ${uuid} not found`, "MEDIUM", { uuid });
			if (!meta.source_raw_uri) return generror(`Audiobook ${uuid} has no source URI`, "MEDIUM", { uuid, title: meta.title });
			await setup_audiobook_dirs(uuid);
			const ext = extract_file_extension(meta.source_raw_uri) || ".bin";
			const dest_rel = rel_source_path(uuid, ext);
			const dest_path = full_path(dest_rel);
			const headers: Record<string, string> = {
				"user-agent": opts.user_agent ?? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
				accept: "*/*",
				...(opts.headers ?? {})
			};
			if (opts.cookie_jar !== undefined) headers.cookie = opts.cookie_jar.toString();
			const download_result = await fs().download_to_file(meta.source_raw_uri, dest_path, headers);
			if (typeof download_result !== "string") return download_result;
			await SQLAudiobook.update_audiobook(uuid, { source_file: dest_rel });
			return dest_path;
		} catch (e) {
			return generror_catch(e, "Failed to download audiobook", "MEDIUM", { uuid });
		}
	}

	export function resolve_source_path(meta: AudiobookTableItem): string | undefined {
		if (!meta.source_file) return undefined;
		return full_path(meta.source_file);
	}

	export async function upgrade_audiobook_roz_versions(): Promise<void> {
		const all = await SQLAudiobook.get_all_audiobooks();
		for (const meta of all) {
			const roz_result = await load_roz(meta);
			if ("error" in roz_result) continue;
			const upgraded = upgrade_roz_version(reinterpret_cast<Parameters<typeof upgrade_roz_version>[0]>(roz_result));
			if (upgraded.version !== meta.version) {
				await save_roz(meta, upgraded);
				await SQLAudiobook.update_audiobook(meta.uuid, { version: upgraded.version });
			}
		}
	}
}
