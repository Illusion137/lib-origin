import { describe, expect, it } from 'vitest';
import { TrackAnalysis } from './track_analysis';

describe('TrackAnalysis', () => {
	it('reads analysis values from flat columns, treating zeros and blanks as unknown', () => {
		expect(TrackAnalysis.from_values({ acousticness: 0, energy: '0.7', valence: null, genre: ' Pop ', key: '', title: 'x' }))
			.toEqual({ acousticness: 0, energy: 0.7, genre: 'Pop' });
		expect(TrackAnalysis.from_values({ acousticness: 0, danceability: 0, genre: '' })).toBeUndefined();
		expect(TrackAnalysis.from_values(null)).toBeUndefined();
	});

	it('keeps everything the server analyzer measures', () => {
		const sample = { id: 'ill', mood: 'Energetic', tempo: 128, brightness: 0.4, key: 'A minor', acousticness: 0.1, arousal: 0.8, valence: 0.6, created_at: 'x' };
		expect(TrackAnalysis.from_values(sample)).toEqual({ mood: 'Energetic', tempo: 128, brightness: 0.4, key: 'A minor', acousticness: 0.1, arousal: 0.8, valence: 0.6 });
	});

	it('only counts sampled scores as scores', () => {
		expect(TrackAnalysis.has_scores({ genre: 'Pop', tempo: 120 })).toBe(false);
		expect(TrackAnalysis.has_scores({ energy: 0.2 })).toBe(true);
		expect(TrackAnalysis.has_scores(undefined)).toBe(false);
	});

	it('writes the 1810 columns', () => {
		expect(TrackAnalysis.to_columns({ energy: 0.7, genre: 'Pop', tempo: 120 })).toEqual({
			acousticness: 0, danceability: 0, energy: 0.7, instrumentalness: 0, liveness: 0, speechiness: 0, valence: 0, genre: 'Pop'
		});
		expect(TrackAnalysis.to_columns(undefined).genre).toBe('');
	});
});
