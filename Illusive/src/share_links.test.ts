import { describe, expect, it, vi } from 'vitest';
import { compress_object } from '@common/utils/compress_util';
import { ShareLinks } from './share_links';
import type { Track } from './types';

vi.mock('@origin/discord/discord', () => ({ Discord: {} }));
vi.mock('@illusive/illusive', () => ({
	Illusive: {
		music_service: new Map(['youtube_id', 'soundcloud_permalink', 'illusi_id', 'bandlab_id', 'audiomack_id'].map(id_field => [id_field, { downloadable: { id_field } }]))
	}
}));

const T = '2026-01-02T03:04:05.000Z';
const ILLUSI_ID = '0b8f6c1e-3d2a-4f5b-9c7d-1e2f3a4b5c6d';
const PLAYLIST_UUID = '7a1b2c3d-4e5f-4a6b-8c9d-0e1f2a3b4c5d';

function track(overrides: Partial<Track> = {}): Track {
	return { uid: 'uid', title: 'Song', artists: [{ name: 'Artist', uri: null }], duration: 200, ...overrides };
}

/** The path an illusi:// link arrives with */
function path_of(link: string): string {
	return new URL(link).pathname;
}

function open(link: string) {
	return ShareLinks.parse(path_of(link));
}

function opened_track(link: string): Track {
	const incoming = open(link);
	if ('error' in incoming || incoming.type !== 'track') throw new Error(`expected a packed track from ${link}`);
	return incoming.track;
}

function payload_of(link: string): string {
	return path_of(link).replace(/^\/+track\//, '');
}

describe('sharing tracks', () => {
	const packed: [string, Partial<Track>][] = [
		['YouTube', { youtube_id: 'dQw4w9WgXcQ' }],
		['SoundCloud', { soundcloud_permalink: 'https://soundcloud.com/lelothecorpse/like-sunday' }],
		['BandLab', { bandlab_id: '3f0a9b0e-b0f1-ef11-90cb-000d3a41ef61' }],
		['Audiomack', { audiomack_id: '28411932' }],
		['Illusi with a source', { illusi_id: ILLUSI_ID, youtube_id: 'dQw4w9WgXcQ' }]
	];
	it.each(packed)('packs a %s track into the link and opens it with its ids', (_, ids) => {
		const link = ShareLinks.track(track(ids))!;
		expect(link.startsWith('illusi:///track/')).toBe(true);
		expect(opened_track(link)).toMatchObject({ title: 'Song', artists: [{ name: 'Artist' }], duration: 200, ...ids });
	});

	it.each([
		['Spotify', { spotify_id: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC' }],
		['Apple Music', { applemusic_id: '1440857781' }],
		['Amazon Music', { amazonmusic_id: 'B07FKR2ZZB' }],
		['Deezer', { deezer_id: '3135556' }],
		['Tidal', { tidal_id: '77640617' }]
	])('packs a %s track by title, artist and length so it can be found again', (_, ids) => {
		const opened = opened_track(ShareLinks.track(track({ ...ids, artists: [{ name: 'One', uri: null }, { name: 'Two', uri: null }] }))!);
		expect(opened).toMatchObject({ title: 'Song', duration: 200 });
		expect(opened.artists[0].name).toContain('One');
		expect(opened.artists[0].name).toContain('Two');
	});

	it('sends the Illusi id of a track only Illusi can play', () => {
		const link = ShareLinks.track(track({ illusi_id: ILLUSI_ID }));
		expect(link).toBe(`illusi:///track/${ILLUSI_ID}`);
		expect(open(link!)).toEqual({ type: 'illusi_track', illusi_id: ILLUSI_ID });
	});

	it('sends the Illusi id of an uploaded import, and nothing for one the server never got', () => {
		expect(ShareLinks.track(track({ imported_id: 'file.mp3', illusi_id: ILLUSI_ID }))).toBe(`illusi:///track/${ILLUSI_ID}`);
		const local = track({ imported_id: 'file.mp3' });
		expect(ShareLinks.can_share_track(local)).toBe(false);
		expect(ShareLinks.track(local)).toBeNull();
		expect(ShareLinks.source(local)).toBeNull();
	});

	it('keeps where a trimmed track ends', () => {
		const meta = { plays: 1, added_date: T, last_played_date: T, begdur: 5, enddur: 150 } as Track['meta'];
		expect(opened_track(ShareLinks.track(track({ youtube_id: 'yt', meta }))!).meta?.enddur).toBe(150);
	});

	it('makes links whose payload survives a URL path, whatever the title', () => {
		const titles = ['Heart', 'Ünïcödé ✨ 心 (feat. 사랑)', 'a/b+c=d?e#f&g', 'x'.repeat(300)];
		for (let i = 0; i < 200; i++) titles.push(`Track ${i} ${String.fromCharCode(0x30 + (i % 75)).repeat(i % 13)}`);
		for (const title of titles) {
			const link = ShareLinks.track(track({ title, youtube_id: `id${title.length}`, soundcloud_permalink: 'https://soundcloud.com/a/b' }))!;
			expect(payload_of(link)).toMatch(/^[A-Za-z0-9_=-]+$/);
			expect(opened_track(link).title).toBe(title);
		}
	});

	it('opens links shared before they were URL safe, slashes and all', () => {
		let legacy = '';
		for (let i = 0; !legacy.includes('/') && i < 5_000; i++) legacy = compress_object([`Song ${i}`, `Artist ${i * 7919}`, 200, { youtube_id: `yt${i}` }]);
		expect(legacy).toContain('/');
		const opened = opened_track(`illusi:///track/${legacy}`);
		expect(opened.youtube_id).toMatch(/^yt\d+$/);
	});

	it('opens links whose + became a space, or that were percent encoded', () => {
		let legacy = '';
		for (let i = 0; !legacy.includes('+') && i < 5_000; i++) legacy = compress_object([`Song ${i}`, 'Artist', 200, { youtube_id: 'yt' }]);
		expect(ShareLinks.parse(`track/${legacy.replace(/\+/g, ' ')}`)).toMatchObject({ type: 'track', track: { youtube_id: 'yt' } });
		expect(ShareLinks.parse(`track/${encodeURIComponent(legacy)}`)).toMatchObject({ type: 'track', track: { youtube_id: 'yt' } });
	});

	it('refuses broken payloads without throwing', () => {
		expect('error' in ShareLinks.parse('track/not-a-payload')).toBe(true);
		expect('error' in ShareLinks.parse('track/')).toBe(true);
		expect('error' in ShareLinks.parse(`track/${compress_object({ title: 'object' })}`)).toBe(true);
	});
});

describe('source links', () => {
	it.each([
		[{ youtube_id: 'dQw4w9WgXcQ' }, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
		[{ soundcloud_permalink: 'https://soundcloud.com/lelothecorpse/like-sunday' }, 'https://soundcloud.com/lelothecorpse/like-sunday'],
		[{ soundcloud_permalink: 'lelothecorpse/like-sunday' }, 'https://soundcloud.com/lelothecorpse/like-sunday'],
		[{ spotify_id: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC' }, 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC'],
		[{ spotify_id: '4uLU6hMCjMI75M1A2tKUQC' }, 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC'],
		[{ applemusic_id: '1440857781' }, 'https://music.apple.com/us/song/1440857781'],
		[{ deezer_id: '3135556' }, 'https://www.deezer.com/track/3135556'],
		[{ tidal_id: '77640617' }, 'https://tidal.com/browse/track/77640617']
	] as [Partial<Track>, string][])('links %o to its service', (ids, expected) => {
		expect(ShareLinks.source(track(ids))).toBe(expected);
	});

	it('has none for a track from nowhere it can link to', () => {
		expect(ShareLinks.source(track({ audiomack_id: '1', bandlab_id: 'b', illusi_id: ILLUSI_ID }))).toBeNull();
	});
});

describe('sharing playlists', () => {
	it('opens a shared playlist from the server', () => {
		expect(open(ShareLinks.playlist(PLAYLIST_UUID))).toEqual({ type: 'playlist', uri: `illusi:${PLAYLIST_UUID}` });
	});

	it('opens an Illusi album and service playlists', () => {
		expect(ShareLinks.parse(`playlist/album.${ILLUSI_ID}`)).toEqual({ type: 'playlist', uri: `illusi:album.${ILLUSI_ID}` });
		expect(ShareLinks.parse('playlist/youtube:PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG')).toEqual({ type: 'playlist', uri: 'youtube:PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG' });
	});

	it('shares playlists and albums opened by their uri', () => {
		for (const uri of [`illusi:${PLAYLIST_UUID}`, `illusi:album.${ILLUSI_ID}`, 'youtube:PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG', 'spotify:open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=a&b=c'])
			expect(open(ShareLinks.uri(uri))).toEqual({ type: 'playlist', uri });
	});

	it('refuses links it doesn\'t know', () => {
		expect('error' in ShareLinks.parse('playlist/not a playlist')).toBe(true);
		expect('error' in ShareLinks.parse(`artist/${ILLUSI_ID}`)).toBe(true);
	});
});
