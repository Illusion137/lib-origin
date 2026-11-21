import Database from 'better-sqlite3-node25';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import { Illusi } from '@origin/illusi/illusi';
import type { ArtworkResult, Playlist as ServerPlaylist } from '@origin/illusi/types';
import { use_database } from '@illusive/db/database';
import { outbox_table, playlists_table } from '@illusive/db/schema';
import { v2_repos } from '../v2/repos';
import { Outbox } from '../v2/outbox';
import { apply_rows } from './apply';
import { PlaylistArtwork } from './playlist_artwork';

const V2_MIGRATIONS = path.resolve(__dirname, '../../drizzle/v2');
const clients: InstanceType<typeof Database>[] = [];

function open_db(): DrizzleDB {
	const client = new Database(':memory:');
	clients.push(client);
	const instance = drizzle({ client });
	migrate(instance, { migrationsFolder: V2_MIGRATIONS });
	return instance as unknown as DrizzleDB;
}

const NOW = 1_750_000_000_000;
const iso = (ms: number) => new Date(ms).toISOString();
const original_io = { ...PlaylistArtwork.io };

beforeEach(() => {
	PlaylistArtwork.io.prepare_upload = async () => ({ path: '/tmp/art.webp', file: { uri: '/tmp/art.webp', name: 'artwork.webp', type: 'image/webp' } });
	PlaylistArtwork.io.discard = async () => undefined;
	PlaylistArtwork.io.has_download = async () => false;
	PlaylistArtwork.io.save_download = async artwork_id => `${PlaylistArtwork.FILE_PREFIX}${artwork_id}`;
	PlaylistArtwork.io.remove_download = async () => undefined;
});
afterEach(() => {
	Object.assign(PlaylistArtwork.io, original_io);
	vi.restoreAllMocks();
	for (const client of clients.splice(0)) client.close();
});

async function insert_playlist(db: DrizzleDB, uuid: string, values: Partial<typeof playlists_table.$inferInsert> = {}) {
	await db.insert(playlists_table).values({ uuid, title: 'Mix', edited_at: NOW, created_at: NOW, modified_at: NOW, ...values });
}
async function playlist(db: DrizzleDB, uuid: string) {
	const [row] = await db.select().from(playlists_table).where(eq(playlists_table.uuid, uuid));
	return row;
}
async function outbox(db: DrizzleDB) {
	return (await db.select({ kind: outbox_table.kind, key: outbox_table.key, attempts: outbox_table.attempts }).from(outbox_table)).map(r => `${r.kind}:${r.key}:${r.attempts}`);
}
function server_playlist(id: string, artwork_id: string | null, artwork_edited_at: number | null): ServerPlaylist {
	return {
		id, user_id: 'u1', title: 'Mix', description: null, pinned: false, archived: false, public: false, sort_mode: 'OLDEST', deleted: false,
		edited_at: iso(NOW), artwork_id, artwork_edited_at: artwork_edited_at === null ? null : iso(artwork_edited_at), created_at: iso(NOW), modified_at: iso(NOW)
	};
}

describe('PlaylistArtwork last-write-wins', () => {
	it('keeps a newer local change waiting to upload and drops an older one', () => {
		const local = { artwork_id: null, artwork_edited_at: NOW + 10 };
		expect(PlaylistArtwork.winner(local, 'a.jpg', NOW, true)).toBe('local');
		expect(PlaylistArtwork.winner(local, 'a.jpg', NOW + 20, true)).toBe('server');
		expect(PlaylistArtwork.winner({ artwork_id: 'a.jpg', artwork_edited_at: NOW }, 'a.jpg', NOW, false)).toBe('same');
		expect(PlaylistArtwork.winner(local, null, null, false)).toBe('local');
	});

	it('takes newer server artwork on pull and queues its download', async () => {
		const db = open_db();
		await insert_playlist(db, 'p1', { thumbnail_uri: 'old.png', artwork_id: 'old.jpg', artwork_edited_at: NOW });
		await apply_rows(db, { playlists: [server_playlist('p1', 'new.jpg', NOW + 1000)] });
		const row = await playlist(db, 'p1');
		expect(row).toMatchObject({ artwork_id: 'new.jpg', artwork_edited_at: NOW + 1000, thumbnail_uri: 'old.png' });
		expect(await outbox(db)).toEqual(['artwork_download:p1:0']);

		vi.spyOn(Illusi.Playlists, 'download_artwork').mockResolvedValue(new ArrayBuffer(4));
		expect(await PlaylistArtwork.download_pending(db)).toBe(true);
		expect((await playlist(db, 'p1')).thumbnail_uri).toBe(`${PlaylistArtwork.FILE_PREFIX}new.jpg`);
		expect(await outbox(db)).toEqual([]);
	});

	it('keeps a pending newer local change over older server artwork', async () => {
		const db = open_db();
		await insert_playlist(db, 'p1', { thumbnail_uri: 'mine.png', artwork_edited_at: NOW + 5000 });
		await Outbox.enqueue(db, 'playlist_artwork', ['p1']);
		await apply_rows(db, { playlists: [server_playlist('p1', 'theirs.jpg', NOW + 1000)] });
		expect(await playlist(db, 'p1')).toMatchObject({ thumbnail_uri: 'mine.png', artwork_id: null, artwork_edited_at: NOW + 5000 });
		expect(await outbox(db)).toEqual(['playlist_artwork:p1:0']);
	});

	it('clears the thumbnail when the server removed the artwork later', async () => {
		const db = open_db();
		await insert_playlist(db, 'p1', { thumbnail_uri: 'illusi_artwork_a.jpg', artwork_id: 'a.jpg', artwork_edited_at: NOW });
		await Outbox.enqueue(db, 'playlist_artwork', ['p1']);
		await apply_rows(db, { playlists: [server_playlist('p1', null, NOW + 1000)] });
		expect(await playlist(db, 'p1')).toMatchObject({ thumbnail_uri: '', artwork_id: null, artwork_edited_at: NOW + 1000 });
		expect(await outbox(db)).toEqual([]);
	});
});

describe('PlaylistArtwork local changes', () => {
	it('queues an upload when the thumbnail changes and nothing for other edits', async () => {
		const db = open_db();
		use_database(db);
		await insert_playlist(db, 'p1', { thumbnail_uri: 'old.png', artwork_id: 'old.jpg', artwork_edited_at: NOW });
		await v2_repos.playlists.update('p1', { title: 'Renamed', thumbnail_uri: 'old.png' });
		expect(await outbox(db)).toEqual(['playlist:p1:0']);
		await v2_repos.playlists.update('p1', { thumbnail_uri: 'new.png' });
		expect(await outbox(db)).toEqual(['playlist:p1:0', 'playlist_artwork:p1:0']);
		const row = await playlist(db, 'p1');
		expect(row.artwork_id).toBeNull();
		expect(row.artwork_edited_at).toBeGreaterThan(NOW);
	});
});

describe('PlaylistArtwork push', () => {
	it('waits for the playlist itself, then uploads and records the server image', async () => {
		const db = open_db();
		await insert_playlist(db, 'p1', { thumbnail_uri: 'mine.png', artwork_edited_at: NOW });
		await Outbox.enqueue(db, 'playlist', ['p1']);
		await Outbox.enqueue(db, 'playlist_artwork', ['p1']);
		const upload = vi.spyOn(Illusi.Playlists, 'set_artwork').mockResolvedValue({ applied: true, playlist: server_playlist('p1', 'srv.jpg', NOW) } satisfies ArtworkResult);

		await PlaylistArtwork.push(db);
		expect(upload).not.toHaveBeenCalled();

		await db.delete(outbox_table).where(eq(outbox_table.kind, 'playlist'));
		await PlaylistArtwork.push(db);
		expect(upload).toHaveBeenCalledWith('p1', expect.objectContaining({ type: 'image/webp' }), new Date(NOW));
		expect(await playlist(db, 'p1')).toMatchObject({ artwork_id: 'srv.jpg', thumbnail_uri: 'mine.png' });
		expect(await outbox(db)).toEqual([]);
	});

	it('removes artwork on the server when the local thumbnail was cleared', async () => {
		const db = open_db();
		await insert_playlist(db, 'p1', { thumbnail_uri: '', artwork_edited_at: NOW });
		await Outbox.enqueue(db, 'playlist_artwork', ['p1']);
		const remove = vi.spyOn(Illusi.Playlists, 'remove_artwork').mockResolvedValue({ applied: true, playlist: server_playlist('p1', null, NOW) });
		await PlaylistArtwork.push(db);
		expect(remove).toHaveBeenCalledWith('p1', new Date(NOW));
		expect(await outbox(db)).toEqual([]);
	});

	it('adopts the server artwork when the server had a newer change', async () => {
		const db = open_db();
		await insert_playlist(db, 'p1', { thumbnail_uri: 'mine.png', artwork_edited_at: NOW });
		await Outbox.enqueue(db, 'playlist_artwork', ['p1']);
		vi.spyOn(Illusi.Playlists, 'set_artwork').mockResolvedValue({ applied: false, playlist: server_playlist('p1', 'newer.jpg', NOW + 1000) });
		await PlaylistArtwork.push(db);
		expect(await playlist(db, 'p1')).toMatchObject({ artwork_id: 'newer.jpg', artwork_edited_at: NOW + 1000 });
		expect(await outbox(db)).toEqual(['artwork_download:p1:0']);
	});

	it('keeps an upload for a later sync on server errors and counts 404s', async () => {
		const db = open_db();
		await insert_playlist(db, 'p1', { thumbnail_uri: 'mine.png', artwork_edited_at: NOW });
		await Outbox.enqueue(db, 'playlist_artwork', ['p1']);
		const upload = vi.spyOn(Illusi.Playlists, 'set_artwork').mockResolvedValue({ error: new Error('down'), status: 503 } as Illusi.IllusiError);
		await PlaylistArtwork.push(db);
		expect(await outbox(db)).toEqual(['playlist_artwork:p1:0']);
		upload.mockResolvedValue({ error: new Error('missing'), status: 404 } as Illusi.IllusiError);
		await PlaylistArtwork.push(db);
		expect(await outbox(db)).toEqual(['playlist_artwork:p1:1']);
	});

	it('drops artwork that cannot be read or converted', async () => {
		const db = open_db();
		await insert_playlist(db, 'p1', { thumbnail_uri: 'gone.heic', artwork_edited_at: NOW });
		await Outbox.enqueue(db, 'playlist_artwork', ['p1']);
		PlaylistArtwork.io.prepare_upload = async () => ({ error: new Error('cannot decode') });
		const upload = vi.spyOn(Illusi.Playlists, 'set_artwork');
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		await PlaylistArtwork.push(db);
		expect(upload).not.toHaveBeenCalled();
		expect(await outbox(db)).toEqual([]);
	});

	it('does not record an upload over a newer local change made meanwhile', async () => {
		const db = open_db();
		await insert_playlist(db, 'p1', { thumbnail_uri: 'first.png', artwork_edited_at: NOW });
		await Outbox.enqueue(db, 'playlist_artwork', ['p1']);
		vi.spyOn(Illusi.Playlists, 'set_artwork').mockImplementation(async () => {
			await db.update(playlists_table).set({ thumbnail_uri: 'second.png', artwork_edited_at: NOW + 50 }).where(eq(playlists_table.uuid, 'p1'));
			await Outbox.enqueue(db, 'playlist_artwork', ['p1']);
			return { applied: true, playlist: server_playlist('p1', 'first.jpg', NOW) };
		});
		await PlaylistArtwork.push(db);
		expect(await playlist(db, 'p1')).toMatchObject({ thumbnail_uri: 'second.png', artwork_id: null, artwork_edited_at: NOW + 50 });
		expect(await outbox(db)).toEqual(['playlist_artwork:p1:0']);
	});
});

describe('PlaylistArtwork one-time upload', () => {
	it('queues every playlist with local artwork the server lacks, and resumes after a restart', async () => {
		const db = open_db();
		await insert_playlist(db, 'p1', { thumbnail_uri: 'a.png', edited_at: NOW - 100 });
		await insert_playlist(db, 'p2', { thumbnail_uri: 'b.png', artwork_id: 'b.jpg', artwork_edited_at: NOW });
		await insert_playlist(db, 'p3', { thumbnail_uri: '' });
		await insert_playlist(db, 'p4', { thumbnail_uri: 'd.png', deleted: true });
		await insert_playlist(db, 'p5', { thumbnail_uri: 'e.png' });
		await PlaylistArtwork.queue_existing(db);
		expect((await outbox(db)).sort()).toEqual(['playlist_artwork:p1:0', 'playlist_artwork:p5:0']);
		expect((await playlist(db, 'p1')).artwork_edited_at).toBe(NOW - 100);

		const upload = vi.spyOn(Illusi.Playlists, 'set_artwork')
			.mockResolvedValueOnce({ applied: true, playlist: server_playlist('p1', 'a.jpg', NOW - 100) })
			.mockResolvedValueOnce({ error: new Error('offline') } as Illusi.IllusiError);
		await PlaylistArtwork.push(db);
		// The app closes here; the queue is in the database, so the next sync carries on with p5
		expect(await outbox(db)).toEqual(['playlist_artwork:p5:0']);
		upload.mockResolvedValue({ applied: true, playlist: server_playlist('p5', 'e.jpg', NOW) });
		await PlaylistArtwork.push(db);
		expect(await outbox(db)).toEqual([]);
		expect((await playlist(db, 'p5')).artwork_id).toBe('e.jpg');

		await PlaylistArtwork.queue_existing(db);
		expect(await outbox(db)).toEqual([]);
	});
});
