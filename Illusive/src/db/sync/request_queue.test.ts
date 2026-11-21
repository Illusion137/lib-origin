import Database from 'better-sqlite3-node25';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import type { ActionOf } from '@origin/illusi/types';
import { Illusi } from '@origin/illusi/illusi';
import { request_queue_table } from '@illusive/db/schema';
import { IllusiIngest } from './illusi_ingest';
import { RequestQueue } from './request_queue';

const V2_MIGRATIONS = path.resolve(__dirname, '../../drizzle/v2');
const clients: InstanceType<typeof Database>[] = [];

function open_db(): DrizzleDB {
	const client = new Database(':memory:');
	clients.push(client);
	const instance = drizzle({ client });
	migrate(instance, { migrationsFolder: V2_MIGRATIONS });
	return instance as unknown as DrizzleDB;
}

const offline = () => ({ error: new Error('Network request failed') }) as never;
const refused = (status: number) => ({ error: new Error(`refused ${status}`), status }) as never;
const ok = () => ({ track_id: 'ill', lyrics: null }) as never;

function token(exp_ms: number): string {
	const part = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
	return `${part({ alg: 'HS256' })}.${part({ exp: Math.floor(exp_ms / 1000) })}.sig`;
}
function genius_action(exp_ms: number): ActionOf<'CHECK_GENIUS'> {
	return { type: 'CHECK_GENIUS', token: token(exp_ms), track_id: 'ill', query: 'song' } as ActionOf<'CHECK_GENIUS'>;
}

let ex: DrizzleDB;
beforeEach(() => {
	ex = open_db();
	RequestQueue.use(ex);
	vi.spyOn(Illusi, 'get_session').mockReturnValue({ access_token: 'a', refresh_token: 'r' } as Illusi.Session);
});
afterEach(() => {
	vi.restoreAllMocks();
	RequestQueue.use(undefined);
	IllusiIngest.reset();
	for (const client of clients.splice(0)) client.close();
});

describe('RequestQueue', () => {
	it('stores requests that fail on the network and sends them in order later', async () => {
		const later = Date.now() + 60_000;
		const send = vi.spyOn(Illusi.Ingest, 'genius_not_found').mockResolvedValue(offline());
		expect(await RequestQueue.send('genius_not_found', genius_action(later))).toBeNull();
		const report = vi.spyOn(Illusi.Backpack, 'report').mockResolvedValue(offline());
		await RequestQueue.send('backpack_report', 'ill_1', 'youtube');
		expect(await RequestQueue.pending()).toBe(2);

		const calls: string[] = [];
		send.mockImplementation(async () => { calls.push('genius'); return ok(); });
		report.mockImplementation(async () => { calls.push('report'); return ok(); });
		await RequestQueue.drain();
		expect(calls).toEqual(['genius', 'report']);
		expect(await RequestQueue.pending()).toBe(0);
	});

	it('passes responses and refusals straight through', async () => {
		vi.spyOn(Illusi.Backpack, 'report').mockResolvedValueOnce(ok()).mockResolvedValueOnce(refused(404));
		expect(await RequestQueue.send('backpack_report', 'ill_1', 'youtube')).toEqual(ok());
		expect(Illusi.is_error(await RequestQueue.send('backpack_report', 'ill_1', 'youtube'))).toBe(true);
		expect(await RequestQueue.pending()).toBe(0);
	});

	it('stops at the first request still offline and drops ones the server refuses', async () => {
		const report = vi.spyOn(Illusi.Backpack, 'report').mockResolvedValue(offline());
		for (const id of ['a', 'b', 'c']) await RequestQueue.send('backpack_report', id, 'youtube');
		report.mockReset();
		report.mockResolvedValueOnce(refused(400)).mockResolvedValueOnce(offline());
		await RequestQueue.drain();
		expect(report).toHaveBeenCalledTimes(2);
		const left = await ex.select().from(request_queue_table);
		expect(left.map(row => row.args[0])).toEqual(['b', 'c']);
		expect(left[0].attempts).toBe(1);
	});

	it('drops action replies once their token expired', async () => {
		vi.spyOn(Illusi.Ingest, 'genius_not_found').mockResolvedValue(offline());
		await RequestQueue.send('genius_not_found', genius_action(Date.now() + 1_000));
		const [row] = await ex.select().from(request_queue_table);
		expect(row.expires_at).toBeLessThanOrEqual(Date.now() + 1_000);
		await ex.update(request_queue_table).set({ expires_at: Date.now() - 1 });
		await RequestQueue.drain();
		expect(Illusi.Ingest.genius_not_found).toHaveBeenCalledTimes(1);
		expect(await RequestQueue.pending()).toBe(0);
	});

	it('waits while logged out', async () => {
		const report = vi.spyOn(Illusi.Backpack, 'report').mockResolvedValue(offline());
		await RequestQueue.send('backpack_report', 'a', 'youtube');
		vi.mocked(Illusi.get_session).mockReturnValue(null);
		await RequestQueue.drain();
		expect(report).toHaveBeenCalledTimes(1);
		expect(await RequestQueue.pending()).toBe(1);
	});

	it('keeps SoundCloud batches that couldn\'t be sent', async () => {
		vi.spyOn(Illusi.Ingest, 'soundcloud').mockResolvedValue(offline());
		IllusiIngest.soundcloud(...Array.from({ length: 501 }, (_, id) => ({ kind: 'track', id })));
		await IllusiIngest.flush();
		const rows = await ex.select().from(request_queue_table);
		expect(rows.map(row => row.op)).toEqual(['ingest_soundcloud', 'ingest_soundcloud']);
		expect(rows.map(row => (row.args[0] as unknown[]).length)).toEqual([500, 1]);
		expect(IllusiIngest.pending()).toBe(0);
	});
});
