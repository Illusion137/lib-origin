import Database from 'better-sqlite3-node25';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import { Illusi } from '@origin/illusi/illusi';
import type { Track as ServerTrack, TrackArtworkResult } from '@origin/illusi/types';
import { use_database } from '@illusive/db/database';
import { outbox_table, user_tracks_table } from '@illusive/db/schema';
import type { Track } from '@illusive/types';
import { v2_repos } from '../v2/repos';
import { apply_rows } from './apply';
import { PlaylistArtwork } from './playlist_artwork';
import { TrackArtwork } from './track_artwork';

const V2_MIGRATIONS = path.resolve(__dirname, '../../drizzle/v2');
const clients: InstanceType<typeof Database>[] = [];

function open_db(): DrizzleDB {
	const client = new Database(':memory:');
	clients.push(client);
	const instance = drizzle({ client });
	migrate(instance, { migrationsFolder: V2_MIGRATIONS });
	const db = instance as unknown as DrizzleDB;
	use_database(db);
	return db;
}

const NOW = 1_750_000_000_000;
const iso = (ms: number) => new Date(ms).toISOString();
const original_io = { ...PlaylistArtwork.io };
const accepted = (artwork_id: string | null): TrackArtworkResult => ({ track: { id: 'ill_1', artwork_id, artwork_edited_at: iso(NOW) }, applied: true });

beforeEach(() => {
	PlaylistArtwork.io.prepare_upload = async () => ({ path: '/tmp/art.webp', file: { uri: '/tmp/art.webp', name: 'artwork.webp', type: 'image/webp' } });
	PlaylistArtwork.io.discard = async () => undefined;
});
afterEach(() => {
	Object.assign(PlaylistArtwork.io, original_io);
	vi.restoreAllMocks();
	for (const client of clients.splice(0)) client.close();
});

function track(overrides: Partial<Track> = {}): Track {
	return { uid: 'u1', title: 'Demo', artists: [{ name: 'Me', uri: null }], duration: 100, imported_id: 'u1', media_uri: 'demo.m4a', ...overrides };
}
async function queued(db: DrizzleDB) {
	return (await db.select({ kind: outbox_table.kind, key: outbox_table.key }).from(outbox_table)).filter(r => r.kind === 'track_artwork').map(r => r.key);
}
async function clear_outbox(db: DrizzleDB) {
	await db.delete(outbox_table);
}
async function synced(db: DrizzleDB, uid: string, illusi_id: string) {
	await db.update(user_tracks_table).set({ illusi_id }).where(eq(user_tracks_table.uid, uid));
}
function server_track(id: string, artwork_id: string | null): ServerTrack {
	return {
		id, title: 'Demo', album_id: null, duration_ms: 100_000, explicit: null, imported: true, artwork_id, artwork_edited_at: artwork_id === null ? null : iso(NOW),
		backpacked: false, backpacked_at: null, created_at: iso(NOW), modified_at: iso(NOW)
	};
}

describe('TrackArtwork', () => {
	it('queues a changed thumbnail of an imported track, and only that', async () => {
		const db = open_db();
		await v2_repos.tracks.insert([track(), track({ uid: 'yt', imported_id: undefined, youtube_id: 'abc' })]);
		await clear_outbox(db);

		await v2_repos.tracks.update('u1', track({ thumbnail_uri: 'cover.png' }));
		await v2_repos.tracks.update('yt', track({ uid: 'yt', imported_id: undefined, youtube_id: 'abc', thumbnail_uri: 'cover.png' }));
		expect(await queued(db)).toEqual(['u1']);

		await clear_outbox(db);
		await v2_repos.tracks.update('u1', track({ thumbnail_uri: 'cover.png', title: 'Renamed' }));
		expect(await queued(db)).toEqual([]);
	});

	it('waits for the track to reach the server, then uploads or removes', async () => {
		const db = open_db();
		await v2_repos.tracks.insert([track()]);
		await v2_repos.tracks.update('u1', track({ thumbnail_uri: 'cover.png' }));
		const set = vi.spyOn(Illusi.Tracks, 'set_artwork').mockResolvedValue(accepted('a.jpg'));
		const remove = vi.spyOn(Illusi.Tracks, 'remove_artwork').mockResolvedValue(accepted(null));

		await TrackArtwork.push(db);
		expect(set).not.toHaveBeenCalled();
		expect(await queued(db)).toEqual(['u1']);

		await db.delete(outbox_table).where(eq(outbox_table.kind, 'user_track'));
		await db.update(outbox_table).set({ retry_at: null });
		await synced(db, 'u1', 'ill_1');
		await TrackArtwork.push(db);
		expect(set).toHaveBeenCalledWith('ill_1', expect.objectContaining({ name: 'artwork.webp' }), expect.any(Date));
		expect(await queued(db)).toEqual([]);

		await v2_repos.tracks.update('u1', track({ thumbnail_uri: '', illusi_id: 'ill_1' }));
		await db.delete(outbox_table).where(eq(outbox_table.kind, 'user_track'));
		await TrackArtwork.push(db);
		expect(remove).toHaveBeenCalledWith('ill_1', expect.any(Date));
	});

	it('shows server artwork on other devices until they pick their own', async () => {
		const db = open_db();
		await v2_repos.tracks.insert([track()]);
		await synced(db, 'u1', 'ill_1');
		await apply_rows(db, { tracks: [server_track('ill_1', 'a.jpg')] });
		const [shown] = await v2_repos.tracks.all();
		expect(shown.artwork_url).toBe(Illusi.Tracks.artwork_url('a.jpg'));

		// A local edit keeps it, without making it one of the track's service thumbnails
		await v2_repos.tracks.update('u1', { ...shown, title: 'Renamed' });
		await apply_rows(db, { tracks: [server_track('ill_1', null)] });
		const [cleared] = await v2_repos.tracks.all();
		expect(cleared.artwork_url).toBe('');
	});

	it('queues thumbnails set before artwork synced, once', async () => {
		const db = open_db();
		await v2_repos.tracks.insert([track({ thumbnail_uri: 'old.png' }), track({ uid: 'plain', imported_id: 'plain' })]);
		await clear_outbox(db);
		await TrackArtwork.queue_existing(db);
		expect(await queued(db)).toEqual(['u1']);
	});
});
