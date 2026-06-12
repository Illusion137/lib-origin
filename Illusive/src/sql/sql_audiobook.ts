import { db } from "@illusive/db/database";
import { audiobooks_table, type AudiobookTableInsert, type AudiobookTableItem } from "@illusive/db/schema";
import { Constants } from "@illusive/constants";
import { SQLfs } from "@illusive/sql/sql_fs";
import { and, asc, eq } from "drizzle-orm";

export namespace SQLAudiobook {
	function resolve_cover_path(cover: string): string {
		if (!cover) return cover;
		if (cover.startsWith("data:") || cover.startsWith("http")) return cover;
		const marker = Constants.audiobooks_archive_path;
		const idx = cover.lastIndexOf(marker);
		const rel = idx >= 0 ? cover.slice(idx + marker.length) : cover;
		return SQLfs.audiobook_directory(rel);
	}

	function resolve_cover_row(row: AudiobookTableItem): AudiobookTableItem {
		return { ...row, cover: resolve_cover_path(row.cover) };
	}

	export async function insert_audiobook(item: AudiobookTableInsert): Promise<AudiobookTableItem> {
		const rows = await db.insert(audiobooks_table).values(item).returning();
		return resolve_cover_row(rows[0]);
	}

	export async function get_all_audiobooks(): Promise<AudiobookTableItem[]> {
		const rows = await db.select().from(audiobooks_table)
			.where(eq(audiobooks_table.deleted, false))
			.orderBy(asc(audiobooks_table.sort_index), asc(audiobooks_table.id));
		return rows.map(resolve_cover_row);
	}

	export async function reorder_audiobooks(ordered_uuids: string[]): Promise<void> {
		await db.transaction(async (tx) => {
			for (let i = 0; i < ordered_uuids.length; i++) {
				await tx.update(audiobooks_table)
					.set({ sort_index: i + 1, modified_at: Date.now() })
					.where(eq(audiobooks_table.uuid, ordered_uuids[i]));
			}
		});
	}

	export async function get_audiobook_by_uuid(uuid: string): Promise<AudiobookTableItem | undefined> {
		const rows = await db.select().from(audiobooks_table).where(
			and(eq(audiobooks_table.uuid, uuid), eq(audiobooks_table.deleted, false))
		);
		return rows[0] ? resolve_cover_row(rows[0]) : undefined;
	}

	export async function update_audiobook(uuid: string, changes: Partial<AudiobookTableInsert>): Promise<void> {
		await db.update(audiobooks_table)
			.set({ ...changes, modified_at: Date.now() })
			.where(eq(audiobooks_table.uuid, uuid));
	}

	export async function delete_audiobook(uuid: string): Promise<void> {
		await db.update(audiobooks_table)
			.set({ deleted: true, modified_at: Date.now() })
			.where(eq(audiobooks_table.uuid, uuid));
	}
	export async function clear_audiobooks(): Promise<void> {
		await db.delete(audiobooks_table);
	}
}