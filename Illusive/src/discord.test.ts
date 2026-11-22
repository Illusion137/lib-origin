import { describe, expect, it, vi } from 'vitest';
import { compress_object } from '@common/utils/compress_util';
import { decode_track, encode_track } from './discord';
import type { Track } from './types';

vi.mock('@origin/discord/discord', () => ({ Discord: {} }));
vi.mock('@illusive/illusive', () => ({
	Illusive: {
		music_service: new Map(['youtube_id', 'soundcloud_permalink', 'illusi_id', 'bandlab_id', 'audiomack_id'].map(id_field => [id_field, { downloadable: { id_field } }]))
	}
}));

const T = '2026-01-02T03:04:05.000Z';

function track(overrides: Partial<Track> = {}): Track {
	return {
		uid: 'uid',
		title: 'Song',
		artists: [{ name: 'Artist', uri: null }],
		duration: 200,
		...overrides
	};
}

describe('discord track payloads', () => {
	it('round-trips every downloadable id', () => {
		const decoded = decode_track(encode_track(track({ illusi_id: 'ill', youtube_id: 'yt', soundcloud_permalink: 'sc', bandlab_id: 'bl', audiomack_id: 'am' })));
		expect(decoded).toMatchObject({ title: 'Song', duration: 200, illusi_id: 'ill', youtube_id: 'yt', soundcloud_permalink: 'sc', bandlab_id: 'bl', audiomack_id: 'am' });
	});

	it('round-trips enddur and drops begdur', () => {
		const meta = { plays: 3, added_date: T, last_played_date: T } as Track['meta'];
		const decoded = decode_track(encode_track(track({ youtube_id: 'yt', meta: { ...meta!, begdur: 12.5, enddur: 150 } }))) as Track;
		expect(decoded).toMatchObject({ youtube_id: 'yt', meta: { enddur: 150 } });
		expect(decoded.meta?.begdur).toBeUndefined();
	});

	it('leaves meta off tracks with only begdur', () => {
		const meta = { plays: 0, added_date: T, last_played_date: T } as Track['meta'];
		const decoded = decode_track(encode_track(track({ meta: { ...meta!, begdur: 30 } }))) as Track;
		expect(decoded.meta).toBeUndefined();
	});

	it('leaves meta off untrimmed tracks', () => {
		const decoded = decode_track(encode_track(track({ youtube_id: 'yt' }))) as Track;
		expect(decoded.meta).toBeUndefined();
	});

	it('decodes positional payloads from before ids were keyed', () => {
		const legacy = compress_object(['Song', 'Artist', 200, ['yt', '', 'bl', 'am']]);
		const decoded = decode_track(legacy) as Track;
		expect(decoded).toMatchObject({ youtube_id: 'yt', bandlab_id: 'bl', audiomack_id: 'am' });
		expect(decoded.soundcloud_permalink).toBeUndefined();
		expect(decoded.illusi_id).toBeUndefined();
	});
});
