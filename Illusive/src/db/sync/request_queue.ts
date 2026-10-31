import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import { catch_log } from '@common/utils/error_util';
import { Illusi } from '@origin/illusi/illusi';
import { request_queue_table, type RequestQueueRow } from '@illusive/db/schema';
import { and, asc, count, eq, inArray, isNotNull, lte, notInArray } from 'drizzle-orm';
import { milliseconds_of } from '@common/utils/util';

/**
 * Writes to the Illusi API that should survive being offline. A request that fails on the network (or a server
 * that's briefly unavailable) is stored and sent again, oldest first, on the next sync.
 */
export namespace RequestQueue {
	const OPS = {
		ingest_soundcloud: async (...args: Parameters<typeof Illusi.Ingest.soundcloud>) => Illusi.Ingest.soundcloud(...args),
		ingest_service: async (...args: Parameters<typeof Illusi.Ingest.service>) => Illusi.Ingest.service(...args),
		contribute: async (...args: Parameters<typeof Illusi.contribute>) => Illusi.contribute(...args),
		backpack_report: async (...args: Parameters<typeof Illusi.Backpack.report>) => Illusi.Backpack.report(...args),
		media_fulfil: async (...args: Parameters<typeof Illusi.MediaFiles.fulfil>) => Illusi.MediaFiles.fulfil(...args),
		track_research: async (...args: Parameters<typeof Illusi.Ingest.track_research>) => Illusi.Ingest.track_research(...args),
		track_research_not_found: async (...args: Parameters<typeof Illusi.Ingest.track_research_not_found>) => Illusi.Ingest.track_research_not_found(...args),
		genius: async (...args: Parameters<typeof Illusi.Ingest.genius>) => Illusi.Ingest.genius(...args),
		genius_not_found: async (...args: Parameters<typeof Illusi.Ingest.genius_not_found>) => Illusi.Ingest.genius_not_found(...args),
		youtube_music_lyrics: async (...args: Parameters<typeof Illusi.Ingest.youtube_music_lyrics>) => Illusi.Ingest.youtube_music_lyrics(...args),
		youtube_music_not_found: async (...args: Parameters<typeof Illusi.Ingest.youtube_music_not_found>) => Illusi.Ingest.youtube_music_not_found(...args),
		new_releases: async (...args: Parameters<typeof Illusi.Ingest.new_releases>) => Illusi.Ingest.new_releases(...args)
	};
	export type Op = keyof typeof OPS;
	type Args<O extends Op> = Parameters<(typeof OPS)[O]>;
	type Result<O extends Op> = Awaited<ReturnType<(typeof OPS)[O]>>;

	/** Requests that don't answer an action are dropped unsent after this */
	const DEFAULT_TTL_MS = milliseconds_of({ days: 30 });
	/** Action tokens live 10 minutes; used when a token can't be read */
	const ACTION_TTL_MS = milliseconds_of({ minutes: 10 });
	/** A request the server keeps failing (5xx) is dropped after this many tries */
	export const MAX_ATTEMPTS = 5;
	/** Oldest requests of an op are dropped past this; SoundCloud batches can be megabytes each */
	const MAX_QUEUED: Partial<Record<Op, number>> = { ingest_soundcloud: 20, ingest_service: 20, contribute: 50 };
	const DEFAULT_MAX_QUEUED = 500;
	const DRAIN_BATCH = 50;

	let ex: DrizzleDB | undefined;
	let draining: Promise<void> | null = null;

	/** The sync engine hands over the v2 database; until then failed requests aren't kept */
	export function use(instance: DrizzleDB | undefined) {
		ex = instance;
	}

	/** No response, a timeout, rate limiting, or a server that's down or restarting */
	export function is_transient(error: Illusi.IllusiError): boolean {
		const status = error.status;
		return status === undefined || status === 408 || status === 429 || status === 502 || status === 503 || status === 504;
	}

	function jwt_expiry(token: string): number | null {
		try {
			const part = token.split('.')[1];
			if (part === undefined) return null;
			const json = globalThis.atob(part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '='));
			const exp = (JSON.parse(json) as { exp?: unknown }).exp;
			return typeof exp === 'number' ? exp * 1000 : null;
		} catch {
			return null;
		}
	}

	/** Replies to an action can't outlive its token; the server rejects them after that anyway */
	function expiry(args: readonly unknown[], now: number): number {
		const token = (args[0] as { token?: unknown } | null | undefined)?.token;
		if (typeof token !== 'string') return now + DEFAULT_TTL_MS;
		return jwt_expiry(token) ?? now + ACTION_TTL_MS;
	}

	/** Stores a request to send on the next drain */
	export async function enqueue<O extends Op>(op: O, ...args: Args<O>) {
		if (ex === undefined) return;
		const now = Date.now();
		await ex.insert(request_queue_table).values({ op, args, expires_at: expiry(args, now), created_at: now });
		const limit = MAX_QUEUED[op] ?? DEFAULT_MAX_QUEUED;
		const [{ total }] = await ex.select({ total: count() }).from(request_queue_table).where(eq(request_queue_table.op, op));
		if (total <= limit) return;
		const oldest = await ex.select({ id: request_queue_table.id }).from(request_queue_table).where(eq(request_queue_table.op, op))
			.orderBy(asc(request_queue_table.id)).limit(total - limit);
		await ex.delete(request_queue_table).where(inArray(request_queue_table.id, oldest.map(row => row.id)));
	}

	/**
	 * Sends a request now. If it fails in a way that's worth retrying, it's stored and null is returned; otherwise
	 * the response (or error) is.
	 */
	export async function send<O extends Op>(op: O, ...args: Args<O>): Promise<Result<O> | null> {
		const result = await (OPS[op] as unknown as (...a: Args<O>) => Promise<Result<O>>)(...args);
		if (!Illusi.is_error(result) || ex === undefined || !is_transient(result as Illusi.IllusiError)) return result;
		await enqueue(op, ...args);
		return null;
	}

	/**
	 * Sends the stored requests, oldest first. Stops at the first one that still can't get through, so the order
	 * is kept; requests the server refuses are dropped.
	 */
	export async function drain(): Promise<void> {
		if (draining !== null) return draining;
		draining = run_drain().finally(() => { draining = null; });
		return draining;
	}

	async function run_drain() {
		if (ex === undefined || Illusi.get_session() === null) return;
		const db = ex;
		await db.delete(request_queue_table).where(and(isNotNull(request_queue_table.expires_at), lte(request_queue_table.expires_at, Date.now())));
		const tried: number[] = [];
		while (true) {
			const rows: RequestQueueRow[] = await db.select().from(request_queue_table)
				.where(tried.length === 0 ? undefined : notInArray(request_queue_table.id, tried))
				.orderBy(asc(request_queue_table.id)).limit(DRAIN_BATCH);
			if (rows.length === 0) return;
			for (const row of rows) {
				tried.push(row.id);
				if (row.expires_at !== null && row.expires_at <= Date.now()) {
					await db.delete(request_queue_table).where(eq(request_queue_table.id, row.id));
					continue;
				}
				const op = OPS[row.op as Op] as ((...a: unknown[]) => Promise<unknown>) | undefined;
				const result = op === undefined ? undefined : await op(...row.args).catch((error: unknown) => ({ error: error instanceof Error ? error : new Error(String(error)) }));
				if (op === undefined || !Illusi.is_error(result)) {
					await db.delete(request_queue_table).where(eq(request_queue_table.id, row.id));
					continue;
				}
				const error = result as Illusi.IllusiError;
				if (is_transient(error)) {
					await db.update(request_queue_table).set({ attempts: row.attempts + 1, last_error: error.error.message }).where(eq(request_queue_table.id, row.id));
					return;
				}
				// A 4xx won't change on a retry; a 5xx might, a few times
				const status = error.status ?? 500;
				if (status < 500 || row.attempts + 1 >= MAX_ATTEMPTS) {
					catch_log(error.error);
					await db.delete(request_queue_table).where(eq(request_queue_table.id, row.id));
				} else {
					await db.update(request_queue_table).set({ attempts: row.attempts + 1, last_error: error.error.message }).where(eq(request_queue_table.id, row.id));
				}
			}
		}
	}

	export async function pending(): Promise<number> {
		if (ex === undefined) return 0;
		const [{ total }] = await ex.select({ total: count() }).from(request_queue_table);
		return total;
	}

	/** Requests belong to the account that made them */
	export async function clear() {
		if (ex !== undefined) await ex.delete(request_queue_table);
	}
}
