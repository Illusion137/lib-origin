import { describe, expect, it, vi } from 'vitest';
import { youtube_parse_videos } from './youtube_parser';

vi.mock('youtubei.js/agnostic', () => ({ YTNodes: {} }));

describe('youtube_parse_videos', () => {
	it('maps YouTube track DTOs into tracks with linked artists', () => {
		const [track] = youtube_parse_videos([{
			video_id: 'TOshH9f9l90',
			title: 'Nun But Drums',
			artists: [
				{ name: 'Nino Paid', channel_id: 'UC2hFKZgVRe1b2CpULVgaCDA' },
				{ name: 'VonOff1700', channel_id: 'UC023sB-A8vI7F3ByKMF9BGA' }
			],
			duration_seconds: 136,
			views: 255000,
			thumbnails: []
		}]);

		expect(track.title).toBe('Nun But Drums');
		expect(track.youtube_id).toBe('TOshH9f9l90');
		expect(track.duration).toBe(136);
		expect(track.service_plays).toBe(255000);
		expect(track.artists).toEqual([
			{ name: 'Nino Paid', uri: 'youtube:UC2hFKZgVRe1b2CpULVgaCDA' },
			{ name: 'VonOff1700', uri: 'youtube:UC023sB-A8vI7F3ByKMF9BGA' }
		]);
	});
});
