import { db } from "@illusive/db/database";
import { audiobooks_table, type AudiobookTableInsert, type AudiobookTableItem } from "@illusive/db/schema";
import { and, eq } from "drizzle-orm";

export namespace SQLAudiobook {
	export async function insert_audiobook(item: AudiobookTableInsert): Promise<AudiobookTableItem> {
		const rows = await db.insert(audiobooks_table).values(item).returning();
		return rows[0];
	}

	export async function get_all_audiobooks(): Promise<AudiobookTableItem[]> {
		return await db.select().from(audiobooks_table).where(eq(audiobooks_table.deleted, false));
	}

	export async function get_audiobook_by_uuid(uuid: string): Promise<AudiobookTableItem | undefined> {
		const rows = await db.select().from(audiobooks_table).where(
			and(eq(audiobooks_table.uuid, uuid), eq(audiobooks_table.deleted, false))
		);
		return rows[0];
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
}