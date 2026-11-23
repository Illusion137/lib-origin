import { describe, expect, it } from 'vitest';
import { date_from } from '@illusive/illusive_utils';
import { ytm_album } from '@illusive/parsers/youtube_music_parser';
import type { YTMAlbum } from '@origin/youtube/parser';

const album = (year: string | undefined) => ({ title: 'Grave Shift', year, artists: [], thumbnails: [] }) as unknown as YTMAlbum;

describe('YouTube Music release dates', () => {
	it('starts a year-only date at January 1st, not today', () => {
		expect(date_from({ year: 2026 }).toISOString()).toBe('2026-01-01T00:00:00.000Z');
		expect(date_from({ year: 2026, month: 4, day: 22 }).toISOString()).toBe('2026-05-22T00:00:00.000Z');
		expect(ytm_album(album('2026'), 'PLAYLIST').date).toBe('2026-01-01T00:00:00.000Z');
	});

	it('leaves the date out when the year is missing or not a year', () => {
		for (const year of [undefined, '', 'Album', '12']) expect(ytm_album(album(year), 'PLAYLIST').date).toBeUndefined();
	});
});
