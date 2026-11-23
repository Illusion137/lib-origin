import { describe, expect, it } from 'vitest';
import type { YTNodes } from 'youtubei.js';
import { parse_lockup_track } from '@origin/youtube/parser';

interface Part { text: string; browse_id?: string }
function lockup(rows: Part[][]): YTNodes.LockupView {
	return {
		content_id: 'vid',
		metadata: {
			title: { text: 'Artist - Song' },
			metadata: {
				metadata_rows: rows.map(row => ({
					metadata_parts: row.map(part => ({
						text: { text: part.text, runs: [{ text: part.text }], endpoint: part.browse_id === undefined ? undefined : { payload: { browseId: part.browse_id } } }
					}))
				}))
			}
		}
	} as unknown as YTNodes.LockupView;
}

describe('parse_lockup_track artists', () => {
	it('takes the channel row', () => {
		expect(parse_lockup_track(lockup([[{ text: 'Channel', browse_id: 'UCabc' }], [{ text: '1.2M views' }, { text: '3 years ago' }]])).artists)
			.toEqual([{ name: 'Channel', channel_id: 'UCabc' }]);
	});
	it('skips a stats row placed before the channel', () => {
		expect(parse_lockup_track(lockup([[{ text: '1.2M views' }, { text: '3 years ago' }], [{ text: 'Channel' }]])).artists)
			.toEqual([{ name: 'Channel', channel_id: undefined }]);
	});
	it('never uses stats as the artist', () => {
		expect(parse_lockup_track(lockup([[{ text: '532K views' }, { text: 'Streamed 2 weeks ago' }]])).artists).toEqual([{ name: '' }]);
		expect(parse_lockup_track(lockup([[{ text: '1,024 views' }]])).artists).toEqual([{ name: '' }]);
	});
});
