import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import { outbox_table, type OutboxKind, type OutboxRow } from '@illusive/db/schema';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { ROWS_PER_STATEMENT } from './sqlite';
import { chunkify } from '@common/utils/util';

/** Local changes waiting for the sync engine. Writers enqueue keys; a push reads the rows' current state. */
export namespace Outbox {
	let on_enqueue: (() => void) | undefined;

	/** The sync engine listens to schedule a push */
	export function set_listener(listener: (() => void) | undefined) {
		on_enqueue = listener;
	}

	export async function enqueue(ex: DrizzleDB, kind: OutboxKind, keys: readonly string[], payload?: Record<string, unknown>) {
		if (keys.length === 0) return;
		const now = Date.now();
		for (const chunk of chunkify([...new Set(keys)], ROWS_PER_STATEMENT * 3)) {
			await ex.insert(outbox_table)
				.values(chunk.map(key => ({ kind, key, payload: payload ?? null, created_at: now })))
				.onConflictDoUpdate({
					target: [outbox_table.kind, outbox_table.key],
					set: { version: sql`${outbox_table.version} + 1`, payload: sql.raw('excluded.payload'), attempts: 0, last_error: null }
				});
		}
		on_enqueue?.();
	}

	export async function take(ex: DrizzleDB, limit: number, kinds?: readonly OutboxKind[]): Promise<OutboxRow[]> {
		return ex.select().from(outbox_table)
			.where(kinds === undefined ? undefined : inArray(outbox_table.kind, [...kinds]))
			.orderBy(asc(outbox_table.id))
			.limit(limit);
	}

	/** Removes pushed entries, unless they were enqueued again since being taken */
	export async function ack(ex: DrizzleDB, rows: readonly Pick<OutboxRow, 'id' | 'version'>[]) {
		for (const row of rows) await ex.delete(outbox_table).where(and(eq(outbox_table.id, row.id), eq(outbox_table.version, row.version)));
	}

	export async function fail(ex: DrizzleDB, ids: readonly number[], error: string) {
		for (const chunk of chunkify(ids, 500)) {
			await ex.update(outbox_table)
				.set({ attempts: sql`${outbox_table.attempts} + 1`, last_error: error.slice(0, 1000) })
				.where(inArray(outbox_table.id, chunk));
		}
	}

	export async function count(ex: DrizzleDB): Promise<number> {
		return ex.$count(outbox_table);
	}
}
