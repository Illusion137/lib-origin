import { describe, expect, it } from 'vitest';
import type { Track } from './types';
import { TrackMatch } from './track_match';

const track = (title: string, ...artists: string[]): Track => ({ uid: 'u', title, artists: artists.map(name => ({ name, uri: null })), duration: 200 });

describe('TrackMatch.matches', () => {
	it('matches the same song', () => {
		expect(TrackMatch.matches('Groundhog Day', 'Lelo', track('Groundhog Day', 'Lelo'))).toBe(true);
		expect(TrackMatch.matches('Lost in the Sauce', 'BabyTron', track('Lost In The Sauce', 'BabyTron - Topic'))).toBe(true);
	});

	it('ignores brackets, features, and an artist prefix in the title', () => {
		expect(TrackMatch.matches('Groundhog Day', 'Lelo', track('Lelo - Groundhog Day [Official Video]', 'Lelo'))).toBe(true);
		expect(TrackMatch.matches('Home (Ft. BabyTron)', 'Lelo (Ft. BabyTron)', track('Home feat. BabyTron', 'Lelo'))).toBe(true);
	});

	it('reads censored words, curly quotes, and accents', () => {
		expect(TrackMatch.matches('Fuck the Bag Up', 'Lelo', track('F*** The Bag Up [Official Visualizer]', 'Lelo'))).toBe(true);
		expect(TrackMatch.matches('Don’t Stop', 'Lelo', track('Don\'t Stop', 'Lelo'))).toBe(true);
		expect(TrackMatch.matches('Beyoncé', 'Lelo', track('Beyonce', 'Lelo'))).toBe(true);
	});

	it('needs one artist in common', () => {
		expect(TrackMatch.matches('Home', 'Drake', track('Home', 'Lelo'))).toBe(false);
		expect(TrackMatch.matches('Home', 'Lelo & BabyTron', track('Home', 'Lelo'))).toBe(true);
		expect(TrackMatch.matches('Home', ['BabyTron', 'Lelo'], track('Home', 'Lelo', 'BabyTron'))).toBe(true);
	});

	it('rejects a different title', () => {
		expect(TrackMatch.matches('Groundhog Day 2', 'Lelo', track('Groundhog Day', 'Lelo'))).toBe(false);
		expect(TrackMatch.matches('Groundhog', 'Lelo', track('Groundhog Day', 'Lelo'))).toBe(false);
	});
});

describe('TrackMatch.best', () => {
	it('picks the closest candidate, not the first that passes', () => {
		const candidates = [{ title: 'Groundhog Day (Remix)', artists: 'Lelo' }, { title: 'Groundhog Day', artists: 'Drake' }, { title: 'Groundhog Day', artists: 'Lelo' }];
		expect(TrackMatch.best(candidates, c => c, track('Groundhog Day', 'Lelo'))).toBe(candidates[2]);
		expect(TrackMatch.best(candidates, c => c, track('Groundhog Day (Remix)', 'Lelo'))).toBe(candidates[0]);
	});

	it('gives nothing when no candidate is the track', () => {
		expect(TrackMatch.best([{ title: 'Home', artists: 'Drake' }], c => c, track('Home', 'Lelo'))).toBeUndefined();
	});
});
