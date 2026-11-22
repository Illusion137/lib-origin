import { describe, expect, it } from 'vitest';
import type { Track } from './types';
import { track_query_filter } from './playlist_resolution';

const track = (title: string, artist: string, extra: Partial<Track> = {}): Track => ({ uid: `${artist}-${title}`, title, artists: [{ name: artist, uri: null }], duration: 1, ...extra });
const titles = (tracks: Track[]) => tracks.map(({ title }) => title);

describe('track_query_filter', () => {
	const library = [
		track('Humble Beginnings', 'Someone'),
		track('HUMBLE.', 'Kendrick Lamar', { album: { name: 'DAMN.', uri: null } }),
		track('DNA.', 'Kendrick Lamar', { album: { name: 'DAMN.', uri: null } }),
		track('Hum Along', 'Other'),
		track('Héroes', 'David Bowie'),
		track('Blinding Lights', 'The Weeknd', { meta: { plays: 500, last_played_date: new Date().toISOString() } as never }),
		track('Blind', 'Korn')
	];

	it('ranks an exact title match first', () => {
		expect(titles(track_query_filter(library, 'humble'))[0]).toBe('HUMBLE.');
	});

	it('matches words across title and artist', () => {
		expect(titles(track_query_filter(library, 'humble kendrick'))[0]).toBe('HUMBLE.');
		expect(titles(track_query_filter(library, 'kendr dna'))[0]).toBe('DNA.');
	});

	it('ignores accents and punctuation', () => {
		expect(titles(track_query_filter(library, 'heroes'))[0]).toBe('Héroes');
		expect(titles(track_query_filter(library, 'dna'))[0]).toBe('DNA.');
	});

	it('does not let plays outrank a better text match', () => {
		expect(titles(track_query_filter(library, 'blind'))[0]).toBe('Blind');
	});

	it('ranks title matches above album-only matches', () => {
		const results = titles(track_query_filter(library, 'damn'));
		expect(results).toContain('HUMBLE.');
		expect(results).toContain('DNA.');
	});

	it('drops weak fuzzy matches below the threshold', () => {
		expect(titles(track_query_filter(library, 'hbl', 100))).toEqual([]);
	});
});
