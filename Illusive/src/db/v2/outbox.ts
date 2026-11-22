import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import { outbox_table, type OutboxKind, type OutboxRow } from '@illusive/db/schema';
import { and, asc, eq, inArray, isNull, lte, or, sql } from 'drizzle-orm';
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
					set: { version: sql`${outbox_table.version} + 1`, payload: sql.raw('excluded.payload'), attempts: 0, last_error: null, retry_at: null }
				});
		}
		on_enqueue?.();
	}

	/** Entries due to be sent: never failed, or failed and past their retry_at */
	export async function take(ex: DrizzleDB, limit: number, kinds?: readonly OutboxKind[], now = Date.now()): Promise<OutboxRow[]> {
		return ex.select().from(outbox_table)
			.where(and(
				kinds === undefined ? undefined : inArray(outbox_table.kind, [...kinds]),
				or(isNull(outbox_table.retry_at), lte(outbox_table.retry_at, now))
			))
			.orderBy(asc(outbox_table.id))
			.limit(limit);
	}

	/** Waits after the 1st..5th failure: a rejection that might clear up (an entity still being created) gets time to */
	const RETRY_DELAYS_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 3_600_000, 6 * 3_600_000];
	export function retry_delay_ms(attempts: number): number {
		return RETRY_DELAYS_MS[Math.min(attempts, RETRY_DELAYS_MS.length - 1)];
	}

	/** Removes pushed entries, unless they were enqueued again since being taken */
	export async function ack(ex: DrizzleDB, rows: readonly Pick<OutboxRow, 'id' | 'version'>[]) {
		for (const row of rows) await ex.delete(outbox_table).where(and(eq(outbox_table.id, row.id), eq(outbox_table.version, row.version)));
	}

	/** Counts a failed attempt and holds the entries back with a growing delay */
	export async function fail(ex: DrizzleDB, ids: readonly number[], error: string, now = Date.now()) {
		const delays = RETRY_DELAYS_MS.map((ms, i) => `when ${i} then ${now + ms}`).join(' ');
		for (const chunk of chunkify(ids, 500)) {
			await ex.update(outbox_table)
				.set({
					attempts: sql`${outbox_table.attempts} + 1`,
					last_error: error.slice(0, 1000),
					retry_at: sql.raw(`case attempts ${delays} else ${now + RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1]} end`)
				})
				.where(inArray(outbox_table.id, chunk));
		}
	}

	/** When the next held-back entry is due, or null if none is waiting */
	export async function next_retry_at(ex: DrizzleDB): Promise<number | null> {
		const [row] = await ex.select({ at: sql<number | null>`min(${outbox_table.retry_at})` }).from(outbox_table);
		return row?.at ?? null;
	}

	export async function count(ex: DrizzleDB): Promise<number> {
		return ex.$count(outbox_table);
	}
}
