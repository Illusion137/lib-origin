import Database from 'better-sqlite3-node25';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import type { Track } from '@illusive/types';
import type { PushResponse, SyncRows } from '@origin/illusi/types';
import { outbox_table, playlist_tracks_table, playlists_table, track_plays_table, user_tracks_table } from '@illusive/db/schema';
import { playlist_track_key } from '../v2/keys';
import { Outbox } from '../v2/outbox';
import { encode_track } from '../v2/track_codec';
import { read_tracks, write_user_tracks } from '../v2/tracks';
import { apply_rows } from './apply';
import { apply_push_result, build_push, MAX_ATTEMPTS } from './push';

const V2_MIGRATIONS = path.resolve(__dirname, '../../drizzle/v2');
const clients: InstanceType<typeof Database>[] = [];

function open_db(): DrizzleDB {
	const client = new Database(':memory:');
	clients.push(client);
	const instance = drizzle({ client });
	migrate(instance, { migrationsFolder: V2_MIGRATIONS });
	return instance as unknown as DrizzleDB;
}
afterEach(() => {
	for (const client of clients.splice(0)) client.close();
});

const NOW = 1_750_000_000_000;
const iso = (ms: number) => new Date(ms).toISOString();

function make_track(uid: string, overrides: Partial<Track> = {}): Track {
	return {
		uid,
		title: `Title ${uid}`,
		alt_title: '',
		artists: [{ name: 'Some Artist', uri: 'youtube:channel:abc' as never }, { name: 'Feature', uri: null }],
		duration: 201.5,
		prods: [{ name: 'Some Producer' }],
		analysis: { genre: 'pop' },
		tags: ['a'],
		explicit: 'EXPLICIT',
		unreleased: false,
		album: { name: 'The Album', uri: null },
		service_plays: 1234,
		imported_id: '',
		illusi_id: '',
		youtube_id: `yt_${uid}`,
		soundcloud_id: 0,
		soundcloud_permalink: '',
		spotify_id: 'sp1',
		amazonmusic_id: '',
		applemusic_id: '',
		bandlab_id: '',
		audiomack_id: '',
		deezer_id: '',
		pandora_id: '',
		tidal_id: '',
		artwork_url: 'https://img/1.jpg',
		thumbnail_uri: '',
		media_uri: 'file.m4a',
		lyrics_uri: '',
		synced_lyrics_uri: '',
		meta: { plays: 7, added_date: iso(NOW - 1000) as never, last_played_date: iso(NOW - 500) as never, begdur: 1.5, enddur: 190 },
		...overrides
	} as Track;
}

async function add_tracks(ex: DrizzleDB, tracks: Track[]) {
	await write_user_tracks(ex, tracks.map(track => encode_track(track, { now: NOW, title_is_catalog: true })));
}

function empty_response(overrides: Partial<PushResponse> = {}): PushResponse {
	return {
		push_id: '00000000-0000-4000-8000-000000000000',
		cursor: null,
		id_map: {},
		inherited_id_map: { playlist_inherited_searches: {}, playlist_inherited_playlists: {} },
		rows: {} as SyncRows,
		entities: {} as PushResponse['entities'],
		rejected: [],
		applied: {},
		progress: { entities: 0, user_rows: 0, created: 0, matched: 0, rejected: 0 },
		...overrides
	};
}

describe('track codec', () => {
	it('round-trips a Track through its user row and snapshot', async () => {
		const ex = open_db();
		const track = make_track('u1');
		await add_tracks(ex, [track]);
		const [decoded] = await read_tracks(ex, ['u1']);
		expect(decoded.title).toBe(track.title);
		expect(decoded.artists).toEqual(track.artists);
		expect(decoded.album).toEqual(track.album);
		expect(decoded.duration).toBe(track.duration);
		expect(decoded.explicit).toBe('EXPLICIT');
		expect(decoded.youtube_id).toBe(track.youtube_id);
		expect(decoded.spotify_id).toBe('sp1');
		expect(decoded.soundcloud_id).toBe(0);
		expect(decoded.artwork_url).toBe(track.artwork_url);
		expect(decoded.media_uri).toBe('file.m4a');
		expect(decoded.meta?.plays).toBe(7);
		expect(decoded.meta?.begdur).toBe(1.5);
		expect(decoded.meta?.enddur).toBe(190);
		expect(decoded.meta?.added_date).toBe(track.meta!.added_date);
	});

	it('keeps analysis scores, adding to them rather than dropping missing ones', async () => {
		const ex = open_db();
		await add_tracks(ex, [make_track('u1'), make_track('u2', { analysis: { energy: 0.8, valence: 0.3 } })]);
		const [plain, analyzed] = await read_tracks(ex, ['u1', 'u2']);
		expect(plain.analysis).toEqual({ genre: 'pop' });
		expect(analyzed.analysis).toEqual({ energy: 0.8, valence: 0.3 });
		const [previous] = await ex.select().from(user_tracks_table).where(eq(user_tracks_table.uid, 'u2'));
		const row = encode_track(make_track('u2', { analysis: { danceability: 0.5 } }), { now: NOW, title_is_catalog: true, previous });
		expect(row.track.analysis).toEqual({ energy: 0.8, valence: 0.3, danceability: 0.5 });
	});

	it('keeps server ids and the catalog title when a server track is saved again', async () => {
		const ex = open_db();
		await add_tracks(ex, [make_track('u1')]);
		const [row] = await ex.select().from(user_tracks_table);
		await ex.update(user_tracks_table).set({
			illusi_id: 'ill_track',
			track: { ...row.track, artists: row.track.artists.map((a, i) => (i === 0 ? { ...a, illusi_id: 'ill_artist' } : a)), service_ids: { ...row.track.service_ids, isrc: 'US123' } }
		});
		const [previous] = await ex.select().from(user_tracks_table);
		await write_user_tracks(ex, [encode_track(make_track('u1', { title: 'My title' }), { now: NOW, title_is_catalog: false, previous })]);
		const [saved] = await ex.select().from(user_tracks_table);
		expect(saved.illusi_id).toBe('ill_track');
		expect(saved.track.title).toBe('Title u1');
		expect(saved.title).toBe('My title');
		expect(saved.track.artists[0].illusi_id).toBe('ill_artist');
		expect(saved.track.service_ids.isrc).toBe('US123');
	});
});

describe('push', () => {
	it('sends unknown tracks as entities keyed by their uid, then uses their illusi_id', async () => {
		const ex = open_db();
		await add_tracks(ex, [make_track('u1')]);
		await ex.insert(playlists_table).values({ uuid: '11111111-1111-4111-8111-111111111111', title: '', edited_at: NOW, created_at: NOW, modified_at: NOW });
		await ex.insert(playlist_tracks_table).values({ playlist_uuid: '11111111-1111-4111-8111-111111111111', track_uid: 'u1', position: 1, edited_at: NOW, created_at: NOW, modified_at: NOW });
		await ex.insert(track_plays_table).values({ client_id: '22222222-2222-4222-8222-222222222222', track_uid: 'u1', created_at: NOW });
		await Outbox.enqueue(ex, 'playlist', ['11111111-1111-4111-8111-111111111111']);
		await Outbox.enqueue(ex, 'user_track', ['u1']);
		await Outbox.enqueue(ex, 'playlist_track', [playlist_track_key('11111111-1111-4111-8111-111111111111', 'u1')]);
		await Outbox.enqueue(ex, 'track_play', ['22222222-2222-4222-8222-222222222222']);
		await Outbox.enqueue(ex, 'unavailable', ['u1'], { service: 'youtube' });

		const batch = (await build_push(ex))!;
		expect(batch.changes.playlists?.[0].title).toBe('Untitled');
		expect(batch.changes.user_tracks?.[0]).toMatchObject({ track_id: 'u1', start_at: 1500, end_at: 190_000 });
		expect(batch.changes.playlist_tracks?.[0].track_id).toBe('u1');
		expect(batch.changes.track_plays?.[0].track_id).toBe('u1');
		const entities = batch.changes.entities as Required<NonNullable<typeof batch.changes.entities>>;
		expect(entities.tracks.map(t => t.ref)).toEqual(['u1']);
		expect(entities.tracks[0]).toMatchObject({ title: 'Title u1', duration_ms: 201_500, explicit: true, service_ids: { youtube_id: 'yt_u1', spotify_id: 'sp1' } });
		expect(entities.artists).toHaveLength(2);
		expect(entities.albums).toHaveLength(1);
		expect(entities.relations?.tracks_artists).toHaveLength(2);

		const artist_ref = entities.artists[0].ref;
		await apply_push_result(ex, batch, empty_response({ id_map: { u1: 'ill_track', [artist_ref]: 'ill_artist' } }));
		const [track] = await ex.select().from(user_tracks_table).where(eq(user_tracks_table.uid, 'u1'));
		expect(track.illusi_id).toBe('ill_track');
		expect(track.track.artists.map(a => a.illusi_id)).toEqual(['ill_artist', undefined]);
		// Only the unavailable report is left; reports go through their own endpoint
		expect((await ex.select().from(outbox_table)).map(o => o.kind)).toEqual(['unavailable']);

		await ex.update(user_tracks_table).set({ title: 'Mine', edited_at: NOW + 1 });
		await Outbox.enqueue(ex, 'user_track', ['u1']);
		const next = (await build_push(ex))!;
		expect(next.changes.entities).toBeUndefined();
		expect(next.changes.user_tracks?.[0]).toMatchObject({ track_id: 'ill_track', title: 'Mine' });
	});

	it('retries rejected rows and drops them after repeated failures', async () => {
		const ex = open_db();
		await add_tracks(ex, [make_track('u1')]);
		await ex.update(user_tracks_table).set({ illusi_id: 'ill_track' });
		await Outbox.enqueue(ex, 'user_track', ['u1']);
		for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
			const batch = (await build_push(ex))!;
			await apply_push_result(ex, batch, empty_response({ rejected: [{ table: 'user_tracks', index: 0, reason: 'nope' }] }));
			const left = await ex.select().from(outbox_table);
			if (attempt < MAX_ATTEMPTS) expect(left[0]).toMatchObject({ attempts: attempt, last_error: 'nope' });
			else expect(left).toHaveLength(0);
		}
	});

	it('pushes recent searches from their outbox payload', async () => {
		const ex = open_db();
		await Outbox.enqueue(ex, 'recent_search', ['c1'], { text: 'daft punk', created_at: NOW });
		await Outbox.enqueue(ex, 'recent_search', ['c2'], { created_at: NOW });
		const batch = (await build_push(ex))!;
		expect(batch.changes.recent_searches).toEqual([{ client_id: 'c1', text: 'daft punk', created_at: NOW }]);
		expect(batch.skipped.map(entry => entry.key)).toEqual(['c2']);
		await apply_push_result(ex, batch, empty_response());
		expect(await ex.$count(outbox_table)).toBe(0);
	});

	it('keeps an entry that changed while its push was in flight', async () => {
		const ex = open_db();
		await add_tracks(ex, [make_track('u1')]);
		await ex.update(user_tracks_table).set({ illusi_id: 'ill_track' });
		await Outbox.enqueue(ex, 'user_track', ['u1']);
		const batch = (await build_push(ex))!;
		await Outbox.enqueue(ex, 'user_track', ['u1']);
		await apply_push_result(ex, batch, empty_response());
		expect(await ex.$count(outbox_table)).toBe(1);
	});

	it('skips deleting a track the server never had', async () => {
		const ex = open_db();
		await add_tracks(ex, [make_track('u1')]);
		await ex.update(user_tracks_table).set({ deleted: true });
		await Outbox.enqueue(ex, 'user_track', ['u1']);
		const batch = (await build_push(ex))!;
		expect(batch.changes).toEqual({});
		expect(batch.skipped).toHaveLength(1);
	});
});

describe('apply_rows', () => {
	const server_user_track = (edited_at: number, title: string) => ({
		user_id: 'u', track_id: 'ill_track', title, downloaded_at: null, start_at: null, end_at: null, deleted: false, edited_at: iso(edited_at),
		created_at: iso(NOW), modified_at: iso(edited_at)
	});

	it('keeps a newer local edit that is waiting to be pushed', async () => {
		const ex = open_db();
		await add_tracks(ex, [make_track('u1')]);
		await ex.update(user_tracks_table).set({ illusi_id: 'ill_track' });
		await ex.update(user_tracks_table).set({ title: 'Local', edited_at: NOW + 100 });
		await Outbox.enqueue(ex, 'user_track', ['u1']);
		await apply_rows(ex, { user_tracks: [server_user_track(NOW + 50, 'Server')] });
		let [row] = await ex.select().from(user_tracks_table);
		expect(row.title).toBe('Local');

		await apply_rows(ex, { user_tracks: [server_user_track(NOW + 200, 'Newer server')] });
		[row] = await ex.select().from(user_tracks_table);
		expect(row.title).toBe('Newer server');
	});

	it('takes server rows when nothing local is pending', async () => {
		const ex = open_db();
		await add_tracks(ex, [make_track('u1')]);
		await ex.update(user_tracks_table).set({ illusi_id: 'ill_track' });
		await ex.update(user_tracks_table).set({ title: 'Local', edited_at: NOW + 100 });
		await apply_rows(ex, { user_tracks: [server_user_track(NOW + 50, 'Server')] });
		const [row] = await ex.select().from(user_tracks_table);
		expect(row.title).toBe('Server');
	});

	it('creates local rows for tracks from other devices', async () => {
		const ex = open_db();
		const result = await apply_rows(ex, {
			tracks: [{ id: 'ill_new', title: 'Remote', album_id: null, duration_ms: 1000, explicit: null, imported: false, backpacked: false, backpacked_at: null, created_at: iso(NOW), modified_at: iso(NOW) }],
			user_tracks: [{ ...server_user_track(NOW, 'Remote title'), track_id: 'ill_new' }]
		});
		expect(result.library_changed).toBe(true);
		const [track] = await read_tracks(ex, ['ill_new']);
		expect(track.title).toBe('Remote title');
		expect(track.illusi_id).toBe('ill_new');
	});

	it('fills snapshots from catalog rows and names artists and albums that arrive later', async () => {
		const ex = open_db();
		await apply_rows(ex, {
			tracks: [{ id: 'ill_new', title: 'Remote', album_id: 'ill_album', duration_ms: 1000, explicit: true, imported: false, backpacked: false, backpacked_at: null, created_at: iso(NOW), modified_at: iso(NOW) }],
			tracks_artists: [{ track_id: 'ill_new', artist_id: 'ill_artist', created_at: iso(NOW), modified_at: iso(NOW) }],
			user_tracks: [{ ...server_user_track(NOW, 'Remote'), track_id: 'ill_new' }]
		});
		let [track] = await read_tracks(ex, ['ill_new']);
		expect(track.artists).toEqual([{ name: '', uri: null }]);
		expect(track.explicit).toBe('EXPLICIT');

		await apply_rows(ex, {
			artists: [{ id: 'ill_artist', name: 'Remote Artist', description: null, primary_genre_name: null, created_at: iso(NOW), modified_at: iso(NOW) }],
			albums: [{ id: 'ill_album', artist_id: 'ill_artist', name: 'Remote Album', album_type: null, release_date: null, track_count: null, explicit: null, created_at: iso(NOW), modified_at: iso(NOW) }]
		});
		[track] = await read_tracks(ex, ['ill_new']);
		expect(track.artists.map(a => a.name)).toEqual(['Remote Artist']);
		expect(track.album?.name).toBe('Remote Album');
	});

	it('only fills in service ids for tracks this device holds', async () => {
		const ex = open_db();
		await add_tracks(ex, [make_track('u1')]);
		await ex.update(user_tracks_table).set({ illusi_id: 'ill_track' });
		const ids = (illusi_id: string) => ({ illusi_id, youtube_id: null, isrc: 'US123', created_at: iso(NOW), modified_at: iso(NOW) }) as never;
		await apply_rows(ex, { service_ids: [ids('ill_track'), ids('ill_other')] });
		const rows = await ex.select().from(user_tracks_table);
		expect(rows).toHaveLength(1);
		expect(rows[0].track.service_ids).toMatchObject({ youtube_id: 'yt_u1', isrc: 'US123' });
	});

	it('stores producers with their ids', async () => {
		const ex = open_db();
		await apply_rows(ex, {
			tracks: [{ id: 'ill_new', title: 'Remote', album_id: null, duration_ms: 1000, explicit: null, imported: false, backpacked: false, backpacked_at: null, created_at: iso(NOW), modified_at: iso(NOW) }],
			tracks_producers: [{ track_id: 'ill_new', producer_id: 7, name: 'Metro Boomin' }, { track_id: 'ill_new', producer_id: 8, name: null }],
			user_tracks: [{ ...server_user_track(NOW, 'Remote'), track_id: 'ill_new' }]
		});
		const [track] = await read_tracks(ex, ['ill_new']);
		expect(track.prods).toEqual([{ name: 'Metro Boomin', producer_id: 7 }]);
	});

	it('fills genre, explicit and artwork from iTunes when the catalog has none', async () => {
		const ex = open_db();
		await apply_rows(ex, {
			tracks: [{ id: 'ill_new', title: 'Remote', album_id: null, duration_ms: 1000, explicit: null, imported: false, backpacked: false, backpacked_at: null, created_at: iso(NOW), modified_at: iso(NOW) }],
			itunes: [{ id: 'ill_new', entity_type: 'track', explicitness: 'explicit', release_date: null, primary_genre_name: 'Hip-Hop/Rap', artwork_url: 'https://itunes/600.jpg' }],
			user_tracks: [{ ...server_user_track(NOW, 'Remote'), track_id: 'ill_new' }]
		});
		const [track] = await read_tracks(ex, ['ill_new']);
		expect(track).toMatchObject({ analysis: { genre: 'Hip-Hop/Rap' }, explicit: 'EXPLICIT', artwork_url: 'https://itunes/600.jpg' });
	});

	it('merges local tracks when the server redirects one id to another', async () => {
		const ex = open_db();
		await add_tracks(ex, [make_track('a', { media_uri: '' }), make_track('b', { media_uri: 'b.m4a' })]);
		await ex.update(user_tracks_table).set({ illusi_id: 'ill_a' }).where(eq(user_tracks_table.uid, 'a'));
		await ex.update(user_tracks_table).set({ illusi_id: 'ill_b' }).where(eq(user_tracks_table.uid, 'b'));
		await ex.insert(playlists_table).values({ uuid: 'p', title: 'P', edited_at: NOW, created_at: NOW, modified_at: NOW });
		await ex.insert(playlist_tracks_table).values({ playlist_uuid: 'p', track_uid: 'b', position: 1, edited_at: NOW, created_at: NOW, modified_at: NOW });
		await Outbox.enqueue(ex, 'playlist_track', [playlist_track_key('p', 'b')]);

		await apply_rows(ex, { redirects: [{ old_id: 'ill_b', new_id: 'ill_a' }] });
		const tracks = await ex.select().from(user_tracks_table);
		expect(tracks.map(t => t.uid)).toEqual(['a']);
		expect(tracks[0].media_uri).toBe('b.m4a');
		const [moved] = await ex.select().from(playlist_tracks_table);
		expect(moved.track_uid).toBe('a');
		const [queued] = await ex.select().from(outbox_table);
		expect(queued.key).toBe(playlist_track_key('p', 'a'));
	});

	it('starts a pulled library row with the plays that arrived before it', async () => {
		const ex = open_db();
		await apply_rows(ex, {
			track_plays: [
				{ id: 1, user_id: 'u', track_id: 'ill_new', client_id: 'a', created_at: iso(NOW) },
				{ id: 2, user_id: 'u', track_id: 'ill_new', client_id: 'b', created_at: iso(NOW + 5) }
			]
		});
		await apply_rows(ex, { user_tracks: [{ ...server_user_track(NOW, 'Remote'), track_id: 'ill_new' }] });
		const [user] = await ex.select().from(user_tracks_table);
		expect(user.plays).toBe(2);
		expect(user.last_played_at).toBe(NOW + 5);
	});

	it('counts plays from other devices once', async () => {
		const ex = open_db();
		await add_tracks(ex, [make_track('u1')]);
		await ex.update(user_tracks_table).set({ illusi_id: 'ill_track' });
		await ex.insert(track_plays_table).values({ client_id: 'mine', track_uid: 'u1', created_at: NOW });
		const plays = [
			{ id: 1, user_id: 'u', track_id: 'ill_track', client_id: 'mine', created_at: iso(NOW) },
			{ id: 2, user_id: 'u', track_id: 'ill_track', client_id: 'other', created_at: iso(NOW + 10) }
		];
		await apply_rows(ex, { track_plays: plays });
		await apply_rows(ex, { track_plays: plays });
		const [user] = await ex.select().from(user_tracks_table);
		expect(user.plays).toBe(8);
		expect(user.last_played_at).toBe(NOW + 10);
	});
});
