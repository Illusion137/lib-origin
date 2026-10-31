import { describe, expect, it } from 'vitest';
import type { AlbumView, NewReleaseSoundCloudTrack, PlaylistView, SearchSuggestions, TrackView } from '@origin/illusi/types';
import { IllusiViews } from './illusi_views';
import type { Track } from './types';

const T = '2026-01-02T03:04:05.000Z';

function track_view(overrides: Partial<TrackView> = {}): TrackView {
	return {
		id: '11111111-1111-4111-8111-111111111111',
		title: 'Song',
		album_id: '22222222-2222-4222-8222-222222222222',
		duration_ms: 185_500,
		explicit: true,
		imported: false,
		backpacked: false,
		backpacked_at: null,
		created_at: T,
		modified_at: T,
		artists: [{ id: '33333333-3333-4333-8333-333333333333', name: 'Artist' }],
		album: { id: '22222222-2222-4222-8222-222222222222', name: 'Album', album_type: 'ALBUM', release_date: T },
		track_number: 1,
		service_ids: { youtube_id: 'yt1', spotify_id: null, soundcloud_id: 42 },
		thumbnails: [{ url: 'small', width: 100, height: 100 }, { url: 'big', width: 600, height: 600 }],
		itunes: null,
		sample_data: null,
		producers: [],
		has_media: false,
		has_lyrics: false,
		user: null,
		...overrides
	};
}

describe('IllusiViews.track', () => {
	it('maps catalog fields, service ids and the best thumbnail', () => {
		const track = IllusiViews.track(track_view());
		expect(track).toMatchObject({
			uid: '11111111-1111-4111-8111-111111111111',
			illusi_id: '11111111-1111-4111-8111-111111111111',
			title: 'Song',
			duration: 185.5,
			explicit: 'EXPLICIT',
			youtube_id: 'yt1',
			soundcloud_id: 42,
			artwork_url: 'big',
			artists: [{ name: 'Artist', uri: 'illusi:33333333-3333-4333-8333-333333333333' }],
			album: { name: 'Album', uri: 'illusi:album.22222222-2222-4222-8222-222222222222' }
		});
		expect(track.spotify_id).toBeUndefined();
		expect(track.meta?.plays).toBe(0);
	});

	it('applies the caller\'s library overlay', () => {
		const track = IllusiViews.track(track_view({
			user: { title: 'My Title', downloaded_at: T, start_at: 1500, end_at: 90_000, added_at: T, plays: 7, last_played_at: T }
		}));
		expect(track.title).toBe('My Title');
		expect(track.meta).toMatchObject({ plays: 7, added_date: T, last_played_date: T, downloaded_date: T, begdur: 1.5, enddur: 90 });
	});
});

describe('IllusiViews uris', () => {
	it('round-trips album ids through the playlist uri', () => {
		expect(IllusiViews.album_uri('abc')).toBe('illusi:album.abc');
		expect(IllusiViews.album_id_of('album.abc')).toBe('abc');
		expect(IllusiViews.album_id_of('4b0c6f7e-1d2a-4c3b-8e9f-000000000000')).toBeNull();
	});
});

describe('IllusiViews.prefer_local', () => {
	it('swaps in library tracks by illusi_id', () => {
		const remote = IllusiViews.track(track_view());
		const local = { uid: 'local-uid', illusi_id: remote.illusi_id, title: 'Local', artists: [], duration: 1, media_uri: 'file.m4a' } as Track;
		const other = IllusiViews.track(track_view({ id: '44444444-4444-4444-8444-444444444444' }));
		expect(IllusiViews.prefer_local([remote, other], [local])).toEqual([local, other]);
	});
});

describe('IllusiViews compact views', () => {
	it('builds playlists, albums and SoundCloud singles', () => {
		const playlist = IllusiViews.playlist({
			id: 'p1', user_id: 'u1', title: 'Mix', description: null, pinned: false, archived: false, public: true, sort_mode: 'OLDEST', deleted: false,
			edited_at: null, artwork_id: null, artwork_edited_at: null, created_at: T, modified_at: T, owner: { id: 'u1', username: 'sumi' }, is_owner: false, track_count: 3,
			thumbnails: []
		} satisfies PlaylistView);
		expect(playlist).toMatchObject({ title: { name: 'Mix', uri: 'illusi:p1' }, artist: [{ name: 'sumi', uri: null }], type: 'PLAYLIST' });

		const album = IllusiViews.album({
			id: 'a1', artist_id: 'ar1', name: 'One', album_type: 'SINGLE', release_date: T, track_count: 1, explicit: false, created_at: T, modified_at: T,
			artist: null, artists: [{ id: 'ar1', name: 'Artist' }], service_ids: {}, thumbnails: [], itunes: null
		} satisfies AlbumView);
		expect(album).toMatchObject({ title: { uri: 'illusi:album.a1' }, album_type: 'SONG', explicit: 'CLEAN', date: T, type: 'ALBUM' });

		const release: NewReleaseSoundCloudTrack = {
			id: 9, illusi_id: null, title: 'Drop', permalink: 'https://soundcloud.com/dj/drop', artwork_url: null, duration: 60_000, genre: null, explicit: null,
			release_date: T, user: { id: 1, username: 'dj', permalink: 'dj', avatar_url: 'avatar', verified: null }
		};
		const single = IllusiViews.soundcloud_release(release);
		expect(single?.song_track).toMatchObject({ soundcloud_id: 9, duration: 60, artwork_url: 'avatar' });
		expect(IllusiViews.soundcloud_release({ ...release, permalink: null })).toBeNull();
	});
});

describe('IllusiViews suggestions', () => {
	it('lists text completions first, then tracks, artists and albums', () => {
		const result: SearchSuggestions = {
			text: [{ text: 'drake hotline bling', kind: 'track' }, { text: 'drake', kind: 'recent' }],
			tracks: [{
				id: 't1', title: 'Hotline Bling', artists: [{ id: 'ar1', name: 'Drake' }], album: { id: 'al1', name: 'Views' }, duration_ms: 267_000, explicit: false,
				thumbnail: { url: 'thumb', width: 120, height: 120 }, in_library: true
			}],
			artists: [{ id: 'ar1', name: 'Drake', thumbnail: null, in_library: false }],
			albums: [{
				id: 'al1', name: 'Views', artists: [{ id: 'ar1', name: 'Drake' }], album_type: 'ALBUM', release_date: '2016-04-29T00:00:00.000Z', track_count: 20, explicit: true,
				thumbnail: { url: 'cover', width: null, height: null }, in_library: false
			}]
		};
		const items = IllusiViews.suggestions(result);
		expect(items.slice(0, 2)).toEqual(['drake hotline bling', 'drake']);
		expect(items[2]).toMatchObject({
			uid: 't1', illusi_id: 't1', title: 'Hotline Bling', artists: [{ name: 'Drake', uri: 'illusi:ar1' }], album: { name: 'Views', uri: 'illusi:album.al1' },
			duration: 267, explicit: 'CLEAN', artwork_url: 'thumb'
		});
		expect(items[3]).toEqual({ name: { name: 'Drake', uri: 'illusi:ar1' }, is_official_artist_channel: false });
		expect(items[4]).toMatchObject({
			title: { name: 'Views', uri: 'illusi:album.al1' }, artist: [{ name: 'Drake', uri: 'illusi:ar1' }], type: 'ALBUM', album_type: 'ALBUM', explicit: 'EXPLICIT',
			date: '2016-04-29T00:00:00.000Z', artwork_thumbnails: [{ url: 'cover', width: 0, height: 0 }]
		});
		expect(IllusiViews.suggestions({ text: [], tracks: [], artists: [], albums: [] })).toEqual([]);
	});
});
