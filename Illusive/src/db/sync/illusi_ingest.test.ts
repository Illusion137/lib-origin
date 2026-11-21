import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Illusi } from '@origin/illusi/illusi';
import type { Track } from '@illusive/types';
import { IllusiIngest } from './illusi_ingest';

describe('IllusiIngest.soundcloud', () => {
	beforeEach(() => {
		IllusiIngest.reset();
	});
	afterEach(() => {
		vi.restoreAllMocks();
		IllusiIngest.reset();
	});

	it('does nothing while logged out', () => {
		vi.spyOn(Illusi, 'get_session').mockReturnValue(null);
		IllusiIngest.soundcloud({ kind: 'track', id: 1 });
		expect(IllusiIngest.pending()).toBe(0);
	});

	it('dedupes objects already queued and sends them in one batch', async () => {
		vi.spyOn(Illusi, 'get_session').mockReturnValue({ access_token: 'a', refresh_token: 'r' } as Illusi.Session);
		const send = vi.spyOn(Illusi.Ingest, 'soundcloud').mockResolvedValue({ accepted: 2, rejected: 0 });
		IllusiIngest.soundcloud({ kind: 'track', id: 1 }, { kind: 'user', id: 1 }, null);
		IllusiIngest.soundcloud({ kind: 'track', id: 1 });
		expect(IllusiIngest.pending()).toBe(2);
		await IllusiIngest.flush();
		expect(send).toHaveBeenCalledTimes(1);
		expect(send.mock.calls[0][0]).toEqual([{ kind: 'track', id: 1 }, { kind: 'user', id: 1 }]);
		expect(IllusiIngest.pending()).toBe(0);
	});

	it('splits batches at the server\'s item limit', async () => {
		vi.spyOn(Illusi, 'get_session').mockReturnValue({ access_token: 'a', refresh_token: 'r' } as Illusi.Session);
		const send = vi.spyOn(Illusi.Ingest, 'soundcloud').mockResolvedValue({ accepted: 1, rejected: 0 });
		IllusiIngest.soundcloud(...Array.from({ length: 501 }, (_, id) => ({ kind: 'track', id })));
		await IllusiIngest.flush();
		expect(send.mock.calls.map(call => call[0].length)).toEqual([500, 1]);
	});
});

describe('IllusiIngest entities', () => {
	const session = { access_token: 'a', refresh_token: 'r' } as Illusi.Session;
	const track = { uid: 'u', title: 'Song', duration: 10, artists: [{ name: 'A', uri: 'deezer:1' }], deezer_id: '5' } as Track;

	beforeEach(() => {
		IllusiIngest.reset();
	});
	afterEach(() => {
		vi.restoreAllMocks();
		IllusiIngest.reset();
	});

	it('queues nothing while logged out and returns the parsed object either way', () => {
		vi.spyOn(Illusi, 'get_session').mockReturnValue(null);
		expect(IllusiIngest.track('deezer', track, {})).toBe(track);
		expect(IllusiIngest.pending_entities()).toBe(0);
		expect(IllusiIngest.pending_catalog()).toBe(0);
	});

	it('sends a contribution and the service copy, once per object', async () => {
		vi.spyOn(Illusi, 'get_session').mockReturnValue(session);
		const contribute = vi.spyOn(Illusi, 'contribute').mockResolvedValue({ refs: {}, created: [], matched: [], conflicts: [], rejected: [] });
		const service = vi.spyOn(Illusi.Ingest, 'service').mockResolvedValue({ accepted: 1, rejected: [] });
		IllusiIngest.track('deezer', track, { raw: true });
		IllusiIngest.track('deezer', track, { raw: true });
		expect(IllusiIngest.pending_catalog()).toBe(1);
		await IllusiIngest.flush();
		expect(contribute).toHaveBeenCalledTimes(1);
		expect(contribute.mock.calls[0][0].tracks).toHaveLength(1);
		expect(service.mock.calls[0][0]).toEqual([expect.objectContaining({ kind: 'track', service: 'deezer', id: '5', raw: { raw: true } })]);
		expect(IllusiIngest.pending_entities()).toBe(0);
	});

	it('contributes YouTube objects without a service copy', async () => {
		vi.spyOn(Illusi, 'get_session').mockReturnValue(session);
		const contribute = vi.spyOn(Illusi, 'contribute').mockResolvedValue({ refs: {}, created: [], matched: [], conflicts: [], rejected: [] });
		const service = vi.spyOn(Illusi.Ingest, 'service');
		IllusiIngest.track('youtube', { uid: 'y', title: 'V', duration: 1, artists: [{ name: 'C', uri: null }], youtube_id: 'dQw4w9WgXcQ' } as Track);
		IllusiIngest.artist('youtubemusic', { name: { name: 'C', uri: 'youtubemusic:UC1' }, is_official_artist_channel: true }, { ignored: true });
		await IllusiIngest.flush();
		expect(contribute).toHaveBeenCalledTimes(1);
		expect(service).not.toHaveBeenCalled();
	});

	it('splits contributions before they outgrow the server limit', async () => {
		vi.spyOn(Illusi, 'get_session').mockReturnValue(session);
		const contribute = vi.spyOn(Illusi, 'contribute').mockResolvedValue({ refs: {}, created: [], matched: [], conflicts: [], rejected: [] });
		for (let i = 0; i < 400; i++) IllusiIngest.track('youtube', { uid: `u${i}`, title: `T${i}`, duration: 1, artists: [], youtube_id: `id${i}` } as Track);
		await IllusiIngest.flush();
		expect(contribute.mock.calls.map(call => call[0].tracks!.length)).toEqual([300, 100]);
	});
});
