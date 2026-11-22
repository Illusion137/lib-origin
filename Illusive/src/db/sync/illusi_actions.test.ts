import { afterEach, describe, expect, it, vi } from 'vitest';
import { Illusi } from '@origin/illusi/illusi';
import type { Action } from '@origin/illusi/types';
import { IllusiActions } from './illusi_actions';

vi.mock('@illusive/illusive', () => ({ Illusive: {} }));
vi.mock('@illusive/illusive_utils', () => ({}));
vi.mock('@illusive/sql/sql_fs', () => ({ SQLfs: {} }));
vi.mock('@illusive/wifi_utils', () => ({ Wifi: {} }));
vi.mock('@illusive/prefs', () => ({ Prefs: { get_pref: () => false } }));
vi.mock('@illusive/db/database', () => ({ db: {} }));
vi.mock('@illusive/db/store', () => ({ Store: {} }));
vi.mock('@origin/index', () => ({}));
vi.mock('./request_queue', () => ({ RequestQueue: {} }));
vi.mock('./release_graph', () => ({ release_graph: vi.fn() }));

const upload = (track_id: string): Action => ({ type: 'UPLOAD_MEDIA', track_id, token: 't' });
const genius = (track_id: string): Action => ({ type: 'CHECK_GENIUS', track_id, query: 'q', token: 't' });
const settle = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };

afterEach(() => {
	vi.restoreAllMocks();
	vi.useRealTimers();
});

describe('IllusiActions.handle', () => {
	it('keeps uploads moving past a lookup that never settles, and asks once per track', async () => {
		vi.useFakeTimers();
		const ran: string[] = [];
		vi.spyOn(Illusi, 'handle_actions').mockImplementation(async (actions) => {
			const [action] = actions!;
			ran.push(`${action.type}:${'track_id' in action ? action.track_id : ''}`);
			if (action.type === 'CHECK_GENIUS') await new Promise(() => undefined);
		});

		IllusiActions.handle([genius('g1'), genius('g2'), upload('a')]);
		IllusiActions.handle([upload('a'), upload('b')]);
		await settle();
		expect([...ran].sort()).toEqual(['CHECK_GENIUS:g1', 'UPLOAD_MEDIA:a', 'UPLOAD_MEDIA:b']);

		// The hung lookup is given up on, and the next one runs
		await vi.advanceTimersByTimeAsync(2 * 60_000);
		expect(ran).toContain('CHECK_GENIUS:g2');

		// Finished uploads can be asked for again
		IllusiActions.handle([upload('a')]);
		await settle();
		expect(ran.filter(r => r === 'UPLOAD_MEDIA:a')).toHaveLength(2);
	});
});
