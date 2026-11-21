import { describe, it, expect, vi, afterEach } from 'vitest';
import { reinterpret_cast } from './cast';
import { status_codes_descriptions } from './status_codes';
import { TimeLog } from './time_log';

describe('cast.ts', () => {
	it('reinterpret_cast returns the same value', () => {
		const value = { a: 1 };
		expect(reinterpret_cast<{ a: number }>(value)).toBe(value);
	});
});

describe('status_codes.ts', () => {
	it('maps known status codes to descriptions', () => {
		expect(status_codes_descriptions[200]).toBe('OK');
		expect(status_codes_descriptions[404]).toBe('Not Found');
		expect(status_codes_descriptions[500]).toBe('Internal Server Error');
		expect(status_codes_descriptions[418]).toContain('teapot');
	});
});

describe('time_log.ts', () => {
	afterEach(() => vi.restoreAllMocks());

	it('log_fn returns the wrapped value', () => {
		vi.spyOn(console, 'log').mockImplementation(() => {});
		expect(TimeLog.log_fn('msg', () => 42)).toBe(42);
	});

	it('log_fn_async awaits and returns the wrapped value', async () => {
		vi.spyOn(console, 'log').mockImplementation(() => {});
		expect(await TimeLog.log_fn_async('msg', async () => 7)).toBe(7);
	});
});
