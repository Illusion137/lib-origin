import { describe, expect, it } from 'vitest';
import type { CompactPlaylist, NamedUUID, Track } from '@illusive/types';
import { release_graph } from './release_graph';

const target: NamedUUID = { name: 'Target', uri: 'spotify:artist1' };
const guest: NamedUUID = { name: 'Guest', uri: 'spotify:artist2' };

function track(title: string, artists: NamedUUID[], extra: Partial<Track> = {}): Track {
	return { uid: title, title, artists, duration: 200, explicit: 'EXPLICIT', spotify_id: `sp_${title}`, ...extra } as Track;
}
const album: CompactPlaylist = {
	title: { name: 'New Album', uri: 'spotify:album1' },
	artist: [target],
	date: '2026-10-01T00:00:00.000Z' as CompactPlaylist['date'],
	album_type: 'EP',
	artwork_url: 'art'
};

describe('release_graph', () => {
	it('credits albums to the target and keeps track credits', () => {
		const graph = release_graph({
			target_ref: 'illusi-target',
			is_target: named => named.uri === target.uri,
			releases: [{ album, tracks: [track('One', [target]), track('Two', [target, guest])] }, { album: { ...album, title: { name: 'Empty', uri: null } }, tracks: [] }]
		});
		expect(graph.albums).toHaveLength(1);
		expect(graph.albums![0]).toMatchObject({ name: 'New Album', artist_ref: 'illusi-target', album_type: 'EP', track_count: 2, thumbnails: [{ url: 'art' }] });
		expect(graph.tracks!.map(t => t.title)).toEqual(['One', 'Two']);
		expect(graph.tracks![0]).toMatchObject({ duration_ms: 200_000, explicit: true, service_ids: { spotify_id: 'sp_One' } });
		expect(graph.artists).toEqual([{ ref: expect.stringMatching(/^ar_/), name: 'Guest' }]);
		const guest_ref = graph.artists![0].ref;
		expect(graph.relations?.tracks_artists).toEqual([
			{ track_ref: graph.tracks![0].ref, artist_ref: 'illusi-target' },
			{ track_ref: graph.tracks![1].ref, artist_ref: 'illusi-target' },
			{ track_ref: graph.tracks![1].ref, artist_ref: guest_ref }
		]);
		expect(graph.relations?.album_tracks?.map(r => r.track_number)).toEqual([1, 2]);
		expect(graph.relations?.artist_albums).toEqual([{ artist_ref: 'illusi-target', album_ref: graph.albums![0].ref }]);
	});

	it('credits uncredited tracks to the target', () => {
		const graph = release_graph({ target_ref: 't', is_target: () => false, releases: [{ album, tracks: [track('Solo', [])] }] });
		expect(graph.relations?.tracks_artists).toEqual([{ track_ref: graph.tracks![0].ref, artist_ref: 't' }]);
	});
});
