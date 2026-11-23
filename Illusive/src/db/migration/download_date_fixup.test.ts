import Database from 'better-sqlite3-node25';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { asc, eq } from 'drizzle-orm';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import { outbox_table, user_tracks_table } from '@illusive/db/schema';
import { download_dates_fixed, fix_download_dates } from './download_date_fixup';

const V2_MIGRATIONS = path.resolve(__dirname, '../../drizzle/v2');
const clients: InstanceType<typeof Database>[] = [];

function connect(): DrizzleDB {
	const client = new Database(':memory:');
	clients.push(client);
	const instance = drizzle({ client });
	migrate(instance, { migrationsFolder: V2_MIGRATIONS });
	return instance as unknown as DrizzleDB;
}

afterEach(() => {
	for (const client of clients.splice(0)) client.close();
});

const DAY = 86_400_000;
const T0 = Date.UTC(2024, 0, 1);

async function insert(db: DrizzleDB, uid: string, fields: Partial<typeof user_tracks_table.$inferInsert>) {
	await db.insert(user_tracks_table).values({
		uid, track: { title: uid, artists: [], album: null, duration_ms: null, explicit: null, imported: false, service_ids: {}, thumbnails: [], analysis: null },
		edited_at: T0, created_at: T0, modified_at: T0, ...fields
	} as typeof user_tracks_table.$inferInsert);
}

describe('fix_download_dates', () => {
	it('dates downloaded tracks by their file, once, and queues them for sync', async () => {
		const db = connect();
		const files: Record<string, number> = { 'a.m4a': T0 + 10 * DAY, 'b.m4a': T0 + 20 * DAY, 'old.m4a': 0 };
		await insert(db, 'a', { media_uri: 'a.m4a', downloaded_at: T0 + 30 * DAY, created_at: T0 + 30 * DAY });
		await insert(db, 'b', { media_uri: 'b.m4a', downloaded_at: null });
		await insert(db, 'missing', { media_uri: 'gone.m4a', downloaded_at: T0 + DAY, created_at: T0 + DAY });
		await insert(db, 'old', { media_uri: 'old.m4a', downloaded_at: T0 + DAY, created_at: T0 + DAY });
		await insert(db, 'streamed', { created_at: T0 + 5 * DAY });
		await insert(db, 'deleted', { media_uri: 'a.m4a', deleted: true });

		const now = T0 + 100 * DAY;
		await fix_download_dates(db, async uri => (uri in files ? files[uri] : null), now);

		const rows = await db.select().from(user_tracks_table).orderBy(asc(user_tracks_table.uid));
		const by = Object.fromEntries(rows.map(row => [row.uid, row]));
		expect(by.a).toMatchObject({ downloaded_at: T0 + 10 * DAY, created_at: T0 + 10 * DAY, edited_at: now });
		expect(by.b).toMatchObject({ downloaded_at: T0 + 20 * DAY, created_at: T0 + 20 * DAY, edited_at: now });
		expect(by.missing).toMatchObject({ downloaded_at: T0 + DAY, created_at: T0 + DAY, edited_at: T0 });
		expect(by.old).toMatchObject({ downloaded_at: T0 + DAY, created_at: T0 + DAY, edited_at: T0 });
		expect(by.streamed).toMatchObject({ downloaded_at: null, created_at: T0 + 5 * DAY, edited_at: T0 });
		expect(by.deleted).toMatchObject({ created_at: T0, edited_at: T0 });

		const queued = await db.select({ key: outbox_table.key }).from(outbox_table).where(eq(outbox_table.kind, 'user_track'));
		expect(queued.map(row => row.key).sort()).toEqual(['a', 'b']);
		expect(await download_dates_fixed(db)).toBe(true);

		files['a.m4a'] = T0 + 50 * DAY;
		await fix_download_dates(db, async uri => (uri in files ? files[uri] : null), now + DAY);
		const [a] = await db.select().from(user_tracks_table).where(eq(user_tracks_table.uid, 'a'));
		expect(a.created_at).toBe(T0 + 10 * DAY);
	});
});
