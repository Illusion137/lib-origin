import Database from 'better-sqlite3-node25';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import type { Track } from '@illusive/types';
import * as legacy_schema from '@illusive/legacy/1810/schema';
import {
	outbox_table, playlist_inherited_searches_table, playlist_tracks_table, playlists_table, recently_played_table, track_plays_table, user_tracks_table
} from '@illusive/db/schema';
import { Store } from '../store';
import { read_tracks } from '../v2/tracks';
import { LOG_TABLE } from './legacy_1810';
import { LegacyMigration, migration_phase } from './migrator';

const V2_MIGRATIONS = path.resolve(__dirname, '../../drizzle/v2');
const LEGACY_MIGRATIONS = path.resolve(__dirname, '../../drizzle/mobile');

interface Connection { db: DrizzleDB; client: InstanceType<typeof Database> }
const open: Connection[] = [];
const dirs: string[] = [];

function connect(file: string, migrations: string): Connection {
	const client = new Database(file);
	const instance = drizzle({ client });
	migrate(instance, { migrationsFolder: migrations });
	const connection = { db: instance as unknown as DrizzleDB, client };
	open.push(connection);
	return connection;
}
function temp_dir() {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'illusi-migration-'));
	dirs.push(dir);
	return dir;
}
function close(connection: Connection) {
	connection.client.close();
	open.splice(open.indexOf(connection), 1);
}

afterEach(() => {
	for (const connection of open.splice(0)) connection.client.close();
	for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
	Store.set_mode('v2');
});

let next_uid = 0;
function legacy_track(overrides: Partial<typeof legacy_schema.tracks_table.$inferInsert> = {}): typeof legacy_schema.tracks_table.$inferInsert {
	next_uid++;
	return {
		uid: `t${next_uid}`,
		title: `Track ${next_uid}`,
		artists: [{ name: `Artist ${next_uid % 7}`, uri: null }],
		album: { name: `Album ${next_uid % 5}`, uri: null },
		duration: 180 + next_uid,
		youtube_id: `yt${next_uid}`,
		meta: { added_date: new Date(1_700_000_000_000 + next_uid).toISOString(), last_played_date: new Date(0).toISOString(), plays: 0 } as Track['meta'] & object,
		created_at: 1_700_000_000_000 + next_uid,
		modified_at: 1_700_000_000_000 + next_uid,
		...overrides
	} as typeof legacy_schema.tracks_table.$inferInsert;
}

async function seed(legacy: DrizzleDB, track_count: number) {
	const tracks = Array.from({ length: track_count }, () => legacy_track());
	for (let i = 0; i < tracks.length; i += 50) await legacy.insert(legacy_schema.tracks_table).values(tracks.slice(i, i + 50));
	await legacy.insert(legacy_schema.playlists_table).values([
		{ uuid: 'p1', title: 'One', inherited_searchs: [{ query: 'artist:foo', mode: 'ALL' }] as never, created_at: 1, modified_at: 1 },
		{ uuid: 'p2', title: 'Two', created_at: 2, modified_at: 2 }
	]);
	await legacy.insert(legacy_schema.playlists_tracks_table).values(tracks.slice(0, 30).map((t, i) => ({ uuid: i % 2 === 0 ? 'p1' : 'p2', track_uid: t.uid!, created_at: 10 + i, modified_at: 10 + i })));
	await legacy.insert(legacy_schema.track_plays_table).values([
		{ track_uid: tracks[0].uid!, count: 3, created_at: 100, modified_at: 100 },
		{ track_uid: tracks[1].uid!, count: 1, created_at: 200, modified_at: 200 }
	]);
	return tracks;
}

const swap_opts = { pause_writes: Store.pause_writes, swap: async () => Store.set_mode('v2') };

describe('LegacyMigration', () => {
	it('copies the 1810 library into v2', async () => {
		const dir = temp_dir();
		const legacy = connect(path.join(dir, 'legacy.sqlite3'), LEGACY_MIGRATIONS);
		const v2 = connect(path.join(dir, 'v2.sqlite3'), V2_MIGRATIONS);
		const tracks = await seed(legacy.db, 120);

		Store.set_mode('legacy');
		const phase = await new LegacyMigration(legacy.db, v2.db, { chunk_size: 25 }).run(swap_opts);
		expect(phase).toBe('DONE');
		expect(Store.current_mode()).toBe('v2');
		expect(await migration_phase(v2.db)).toBe('DONE');

		const library = await read_tracks(v2.db, 'library');
		expect(library).toHaveLength(120);
		const first = library.find(t => t.uid === tracks[0].uid)!;
		expect(first.title).toBe(tracks[0].title);
		expect(first.youtube_id).toBe(tracks[0].youtube_id);
		expect(first.duration).toBe(tracks[0].duration);
		expect(first.artists).toEqual(tracks[0].artists);

		expect(await v2.db.$count(playlists_table)).toBe(2);
		expect(await v2.db.$count(playlist_tracks_table, eq(playlist_tracks_table.deleted, false))).toBe(30);
		expect(await v2.db.$count(playlist_inherited_searches_table)).toBe(1);
		// count 3 + count 1
		expect(await v2.db.$count(track_plays_table)).toBe(4);

		// The change log is gone once the migration finishes
		expect(legacy.client.prepare('SELECT name FROM sqlite_master WHERE name = ?').all(LOG_TABLE)).toHaveLength(0);
		expect(legacy.client.prepare('SELECT name FROM sqlite_master WHERE type = \'trigger\' AND name LIKE \'__v2_%\'').all()).toHaveLength(0);
	});

	it('resumes after the app closes mid-copy, keeping writes made in between', async () => {
		const dir = temp_dir();
		const legacy_file = path.join(dir, 'legacy.sqlite3');
		const v2_file = path.join(dir, 'v2.sqlite3');
		let legacy = connect(legacy_file, LEGACY_MIGRATIONS);
		let v2 = connect(v2_file, V2_MIGRATIONS);
		const tracks = await seed(legacy.db, 200);

		Store.set_mode('legacy');
		let steps = 0;
		const first_run = await new LegacyMigration(legacy.db, v2.db, { chunk_size: 30 }).run({ ...swap_opts, should_stop: () => ++steps >= 3 });
		expect(first_run).toBe('COPYING');
		expect(Store.current_mode()).toBe('legacy');
		const partial = await v2.db.$count(user_tracks_table);
		expect(partial).toBeGreaterThan(0);
		expect(partial).toBeLessThan(200);

		// The app keeps writing to 1810 (copied and not-yet-copied rows alike), then is closed
		await legacy.db.update(legacy_schema.tracks_table).set({ title: 'Renamed early' }).where(eq(legacy_schema.tracks_table.uid, tracks[0].uid!));
		await legacy.db.update(legacy_schema.tracks_table).set({ title: 'Renamed late' }).where(eq(legacy_schema.tracks_table.uid, tracks[190].uid!));
		await legacy.db.delete(legacy_schema.tracks_table).where(eq(legacy_schema.tracks_table.uid, tracks[1].uid!));
		await legacy.db.insert(legacy_schema.tracks_table).values(legacy_track({ uid: 'added-during' }));
		await legacy.db.delete(legacy_schema.playlists_tracks_table).where(eq(legacy_schema.playlists_tracks_table.track_uid, tracks[2].uid!));
		await legacy.db.update(legacy_schema.track_plays_table).set({ count: 5 }).where(eq(legacy_schema.track_plays_table.track_uid, tracks[0].uid!));
		close(legacy);
		close(v2);

		// Reopen: the triggers kept logging, and the copy continues from its saved cursor
		legacy = connect(legacy_file, LEGACY_MIGRATIONS);
		v2 = connect(v2_file, V2_MIGRATIONS);
		await legacy.db.update(legacy_schema.playlists_table).set({ title: 'Renamed after reopen' }).where(eq(legacy_schema.playlists_table.uuid, 'p2'));
		expect(await new LegacyMigration(legacy.db, v2.db, { chunk_size: 30 }).run(swap_opts)).toBe('DONE');

		const library = await read_tracks(v2.db, 'library');
		const by_uid = new Map(library.map(t => [t.uid, t]));
		expect(library).toHaveLength(200);
		expect(by_uid.get(tracks[0].uid!)?.title).toBe('Renamed early');
		expect(by_uid.get(tracks[190].uid!)?.title).toBe('Renamed late');
		expect(by_uid.has(tracks[1].uid!)).toBe(false);
		expect(by_uid.has('added-during')).toBe(true);
		const [p2] = await v2.db.select().from(playlists_table).where(eq(playlists_table.uuid, 'p2'));
		expect(p2.title).toBe('Renamed after reopen');
		expect(await v2.db.$count(playlist_tracks_table, eq(playlist_tracks_table.track_uid, tracks[2].uid!))).toBe(0);
		// The row's count went 3 -> 5: two more plays, none duplicated
		expect(await v2.db.$count(track_plays_table, eq(track_plays_table.track_uid, tracks[0].uid!))).toBe(5);
		expect(await v2.db.$count(user_tracks_table)).toBe(201);
	});

	it('is idempotent when a step re-runs before the log is trimmed', async () => {
		const dir = temp_dir();
		const legacy = connect(path.join(dir, 'legacy.sqlite3'), LEGACY_MIGRATIONS);
		const v2 = connect(path.join(dir, 'v2.sqlite3'), V2_MIGRATIONS);
		await seed(legacy.db, 40);
		const migration = new LegacyMigration(legacy.db, v2.db, { chunk_size: 100 });
		await migration.prepare();
		while (await migration.copy_step());
		await legacy.db.update(legacy_schema.track_plays_table).set({ count: 4 });
		// Simulate a crash after the v2 commit but before trim: copy the same log entries twice
		const log = legacy.client.prepare(`SELECT * FROM ${LOG_TABLE}`).all();
		await migration.catch_up_step();
		for (const entry of log as { tbl: string; key: string }[]) legacy.client.prepare(`INSERT INTO ${LOG_TABLE} (tbl, key) VALUES (?, ?)`).run(entry.tbl, entry.key);
		await migration.catch_up_step();
		expect(await v2.db.$count(track_plays_table)).toBe(8);
		expect(await v2.db.$count(user_tracks_table)).toBe(40);
	});

	it('waits for writes in flight, then routes later writes to v2', async () => {
		const dir = temp_dir();
		const legacy = connect(path.join(dir, 'legacy.sqlite3'), LEGACY_MIGRATIONS);
		const v2 = connect(path.join(dir, 'v2.sqlite3'), V2_MIGRATIONS);
		const [target] = await seed(legacy.db, 10);
		Store.set_mode('legacy');
		const modes: string[] = [];
		const fake = new Proxy({}, { get: () => ({}) }) as never;
		Store.register('legacy', fake);
		Store.register('v2', fake);

		let release!: () => void;
		const slow_write = Store.write(async () => {
			modes.push(`start:${Store.current_mode()}`);
			await new Promise<void>((resolve) => { release = resolve; });
			// A legacy write that lands while the migration waits for the gate
			await legacy.db.update(legacy_schema.tracks_table).set({ title: 'In flight' }).where(eq(legacy_schema.tracks_table.uid, target.uid!));
		});
		const migration = new LegacyMigration(legacy.db, v2.db, { chunk_size: 100 }).run(swap_opts);
		await new Promise(resolve => setTimeout(resolve, 20));
		release();
		await slow_write;
		await migration;
		await Store.write(async () => { modes.push(`after:${Store.current_mode()}`); });
		expect(modes).toEqual(['start:legacy', 'after:v2']);
		const [track] = await read_tracks(v2.db, [target.uid!]);
		expect(track.title).toBe('In flight');
	});

	it('backfills plays meta.plays counted but track_plays never recorded', async () => {
		const dir = temp_dir();
		const legacy_file = path.join(dir, 'legacy.sqlite3');
		const v2_file = path.join(dir, 'v2.sqlite3');
		let legacy = connect(legacy_file, LEGACY_MIGRATIONS);
		let v2 = connect(v2_file, V2_MIGRATIONS);
		const meta = (plays: number) => ({ added_date: new Date(1_600_000_000_000).toISOString(), last_played_date: new Date(0).toISOString(), plays }) as never;
		await legacy.db.insert(legacy_schema.tracks_table).values([
			legacy_track({ uid: 'old-favourite', meta: meta(10), created_at: 1_600_000_000_000 }),
			legacy_track({ uid: 'all-recorded', meta: meta(2) }),
			...Array.from({ length: 30 }, () => legacy_track())
		]);
		await legacy.db.insert(legacy_schema.track_plays_table).values([
			{ track_uid: 'old-favourite', count: 0, created_at: 1_700_000_000_000 },
			{ track_uid: 'old-favourite', count: 0, created_at: 1_700_000_000_001 },
			{ track_uid: 'old-favourite', count: 0, created_at: 1_700_000_000_002 },
			{ track_uid: 'all-recorded', count: 2, created_at: 1_700_000_000_000 }
		]);

		let steps = 0;
		await new LegacyMigration(legacy.db, v2.db, { chunk_size: 10 }).run({ ...swap_opts, should_stop: () => ++steps >= 2 });
		// A play during the migration bumps meta.plays and records a row; it must not add a backfilled play
		await legacy.db.update(legacy_schema.tracks_table).set({ meta: meta(11) }).where(eq(legacy_schema.tracks_table.uid, 'old-favourite'));
		await legacy.db.insert(legacy_schema.track_plays_table).values({ track_uid: 'old-favourite', count: 0, created_at: 1_700_000_000_003 });
		close(legacy);
		close(v2);
		legacy = connect(legacy_file, LEGACY_MIGRATIONS);
		v2 = connect(v2_file, V2_MIGRATIONS);
		expect(await new LegacyMigration(legacy.db, v2.db, { chunk_size: 10 }).run(swap_opts)).toBe('DONE');

		const plays = await v2.db.select().from(track_plays_table).where(eq(track_plays_table.track_uid, 'old-favourite'));
		expect(plays).toHaveLength(11);
		expect(plays.filter(p => p.created_at === 1_600_000_000_000)).toHaveLength(7);
		const [user] = await v2.db.select().from(user_tracks_table).where(eq(user_tracks_table.uid, 'old-favourite'));
		expect(user.plays).toBe(11);
		expect(await v2.db.$count(track_plays_table, eq(track_plays_table.track_uid, 'all-recorded'))).toBe(2);
	});

	it('flags backpacked tracks and queues their unavailable report', async () => {
		const dir = temp_dir();
		const legacy = connect(path.join(dir, 'legacy.sqlite3'), LEGACY_MIGRATIONS);
		const v2 = connect(path.join(dir, 'v2.sqlite3'), V2_MIGRATIONS);
		const gone = legacy_track({ uid: 'bp1', deleted: true });
		await legacy.db.insert(legacy_schema.tracks_table).values([legacy_track({ uid: 'keep' }), gone]);
		await legacy.db.insert(legacy_schema.backpack_table).values({ ...gone, deleted: false });
		await legacy.db.insert(legacy_schema.recently_played_tracks_table).values(legacy_track({ uid: 'recent' }));
		await new LegacyMigration(legacy.db, v2.db).run(swap_opts);

		const [flagged] = await v2.db.select().from(user_tracks_table).where(eq(user_tracks_table.uid, 'bp1'));
		expect(flagged.backpacked).toBe(true);
		expect(flagged.deleted).toBe(false);
		const outbox = await v2.db.select().from(outbox_table).where(eq(outbox_table.kind, 'unavailable'));
		expect(outbox.map(o => [o.key, o.payload])).toEqual([['bp1', { service: 'youtube' }]]);
		expect(await v2.db.$count(recently_played_table)).toBe(1);
	});
});
