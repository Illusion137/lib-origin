import { describe, expect, it } from 'vitest';
import type { CompactArtist, CompactPlaylist, Track } from '@illusive/types';
import { artist_service_ids, catalog_album, catalog_artist, catalog_track, EntityGraph, split_named_uri } from './illusi_entities';
import { ArtistLinks } from './artist_links';

const track = (extra: Partial<Track> = {}): Track => ({
	uid: 'u1', title: 'Song', duration: 200, artists: [{ name: 'A', uri: 'spotify:artist1' }], album: { name: 'Album', uri: 'spotify:album1' },
	spotify_id: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC', explicit: 'EXPLICIT', artwork_url: 'https://art/1.jpg', ...extra
});

describe('EntityGraph', () => {
	it('turns a track into a track, its artists and album, and the relations between them', () => {
		const graph = new EntityGraph();
		expect(graph.add_track(track({ artists: [{ name: 'A', uri: 'spotify:artist1' }, { name: 'B', uri: 'spotify:artist2' }] }))).toBe(true);
		const built = graph.build();
		expect(built.tracks).toEqual([expect.objectContaining({ title: 'Song', duration_ms: 200_000, explicit: true, service_ids: { spotify_id: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC' } })]);
		expect(built.artists?.map(a => [a.name, a.service_ids])).toEqual([['A', { spotify_id: 'artist1' }], ['B', { spotify_id: 'artist2' }]]);
		expect(built.albums).toEqual([expect.objectContaining({ name: 'Album', service_ids: { spotify_id: 'album1' } })]);
		expect(built.relations?.tracks_artists).toHaveLength(2);
		expect(built.relations?.album_tracks).toHaveLength(1);
		expect(built.relations?.artist_albums).toHaveLength(2);
		expect(built.tracks![0].album_ref).toBe(built.albums![0].ref);
	});

	it('relates an artist to the similar artists its page lists, in order, skipping ones without a service id', () => {
		const graph = new EntityGraph();
		const similar = (name: string, uri: string | null): CompactArtist => ({ name: { name, uri }, profile_artwork_url: `https://art/${name}.jpg` });
		expect(graph.add_similar_artists({ name: 'Lelo', uri: 'spotify:lelo' }, [
			similar('BabyTron', 'spotify:babytron'), similar('No Id', null), similar('Lelo', 'spotify:lelo'), similar('Cash Kidd', 'spotify:cashkidd')
		])).toBe(true);
		const built = graph.build();
		const name_of = new Map(built.artists!.map(a => [a.ref, a.name]));
		expect(built.relations?.similar_artists?.map(r => [name_of.get(r.artist_ref), name_of.get(r.similar_artist_ref)])).toEqual([['Lelo', 'BabyTron'], ['Lelo', 'Cash Kidd']]);
		expect(built.artists?.find(a => a.name === 'BabyTron')?.thumbnails).toEqual([{ url: 'https://art/BabyTron.jpg' }]);
		// An artist page without an id, or with nothing identifiable listed, adds nothing.
		const empty = new EntityGraph();
		expect(empty.add_similar_artists({ name: 'Lelo', uri: null }, [similar('BabyTron', 'spotify:babytron')])).toBe(false);
		expect(empty.add_similar_artists({ name: 'Lelo', uri: 'spotify:lelo' }, [similar('No Id', null)])).toBe(false);
		expect(empty.size()).toBe(0);
	});

	it('shares an artist between tracks instead of repeating it', () => {
		const graph = new EntityGraph();
		graph.add_track(track());
		graph.add_track(track({ uid: 'u2', title: 'Other', spotify_id: 'spotify:track:0000000000000000000000' }));
		expect(graph.build().artists).toHaveLength(1);
		expect(graph.build().tracks).toHaveLength(2);
	});

	it('skips tracks with no service id or title (imported files)', () => {
		const graph = new EntityGraph();
		expect(graph.add_track(track({ spotify_id: undefined }))).toBe(false);
		expect(graph.add_track(track({ title: '  ' }))).toBe(false);
		expect(graph.size()).toBe(0);
	});

	it('does not give YouTube artists or albums service ids, but keeps the track\'s', () => {
		const graph = new EntityGraph();
		graph.add_track(track({ spotify_id: undefined, youtube_id: 'dQw4w9WgXcQ', artists: [{ name: 'Y', uri: 'youtubemusic:UC123' }], album: { name: 'Al', uri: 'youtubemusic:MPREb_x' } }));
		const built = graph.build();
		expect(built.tracks![0].service_ids).toEqual({ youtube_id: 'dQw4w9WgXcQ' });
		expect(built.artists![0].service_ids).toBeUndefined();
		expect(built.albums![0].service_ids).toBeUndefined();
	});

	it('adds albums with their artist, type and date, and artists with artwork', () => {
		const graph = new EntityGraph();
		const album: CompactPlaylist = { title: { name: 'LP', uri: 'tidal:9' }, artist: [{ name: 'T', uri: 'tidal:1' }], album_type: 'SINGLE/EP', date: '2020-03-04T00:00:00.000Z' as never, explicit: 'CLEAN', type: 'ALBUM' };
		const artist: CompactArtist = { name: { name: 'T', uri: 'tidal:1' }, is_official_artist_channel: true, profile_artwork_url: 'https://a/t.jpg' };
		graph.add_album_playlist(album);
		graph.add_compact_artist(artist);
		const built = graph.build();
		expect(built.albums![0]).toMatchObject({ name: 'LP', album_type: 'SINGLE', explicit: false, release_date: '2020-03-04T00:00:00.000Z', artist_ref: built.artists![0].ref });
		expect(built.artists![0].thumbnails).toEqual([{ url: 'https://a/t.jpg' }]);
		expect(built.relations?.artist_albums).toHaveLength(1);
	});

	it('takes the numeric id from Apple Music links', () => {
		expect(split_named_uri('applemusic:/us/artist/drake/271256')).toEqual({ service: 'applemusic', id: '271256' });
		expect(split_named_uri('spotify:abc')).toEqual({ service: 'spotify', id: 'abc' });
		expect(split_named_uri(null)).toBeNull();
		expect(split_named_uri('nocolon')).toBeNull();
	});
});

describe('catalog items', () => {
	it('keeps the service\'s id and the raw object for a track', () => {
		const raw = { id: 'x' };
		expect(catalog_track('spotify', track(), raw)).toMatchObject({
			kind: 'track', service: 'spotify', id: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC', raw, title: 'Song', artist_names: ['A'], artist_ids: ['artist1'], album_title: 'Album', album_id: 'album1', duration_ms: 200_000, explicit: true
		});
		expect(catalog_track('deezer', track(), raw)).toBeNull();
	});

	it('requires the uri to belong to the same service', () => {
		const artist: CompactArtist = { name: { name: 'T', uri: 'tidal:1' }, is_official_artist_channel: false };
		expect(catalog_artist('tidal', artist, {})).toMatchObject({ kind: 'artist', id: '1', verified: false });
		expect(catalog_artist('deezer', artist, {})).toBeNull();
		const album: CompactPlaylist = { title: { name: 'LP', uri: 'tidal:9' }, artist: [] };
		expect(catalog_album('tidal', album, {})).toMatchObject({ kind: 'album', id: '9', title: 'LP' });
		expect(catalog_album('tidal', { ...album, title: { name: 'LP', uri: null } }, {})).toBeNull();
	});
});

describe('artist links', () => {
	const channel = 'UCX6OQ3DkcsbYNE6H8uQQuVA';

	it('maps artist uris to the ids the server stores', () => {
		expect(artist_service_ids({ uri: `youtubemusic:${channel}` })).toEqual({ youtube_id: channel });
		expect(artist_service_ids({ uri: `youtube:${channel}` })).toEqual({ youtube_id: channel });
		expect(artist_service_ids({ uri: 'youtube:@handle' })).toBeUndefined();
		expect(artist_service_ids({ uri: 'soundcloud:soundcloud.com/Ryc' })).toEqual({ soundcloud_permalink: 'ryc' });
		expect(artist_service_ids({ uri: 'soundcloud:soundcloud.com/ryc/a-track' })).toBeUndefined();
		expect(artist_service_ids({ uri: 'spotify:3TVXtAsR1Inumwj472S9r4' })).toEqual({ spotify_id: '3TVXtAsR1Inumwj472S9r4' });
		expect(artist_service_ids({ uri: null })).toBeUndefined();
	});

	it('collects the links of artists the server knows, from catalog and edited credits', () => {
		const snapshot = (artists: { name: string; uri?: string; illusi_id?: string }[]) => ({ artists }) as never;
		const links = ArtistLinks.collect([
			{ track: snapshot([{ name: 'Ryc', uri: `youtubemusic:${channel}`, illusi_id: 'a1' }, { name: 'New', uri: 'soundcloud:soundcloud.com/new' }]), artists_override: null },
			{ track: snapshot([{ name: 'Ryc', uri: 'soundcloud:soundcloud.com/ryc', illusi_id: 'a1' }]), artists_override: [{ name: 'Other', uri: 'spotify:abc', illusi_id: 'a2' }] }
		]);
		expect(Object.fromEntries(links)).toEqual({ a1: { youtube_id: channel, soundcloud_permalink: 'ryc' }, a2: { spotify_id: 'abc' } });
	});
});
