import { mkdtempSync, writeFileSync } from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Illusi } from './illusi';

afterEach(() => {
	vi.unstubAllGlobals();
	Illusi.set_session(null);
});

describe('Illusi uploads', () => {
	it('sends a { uri, name, type } file as a Blob, which spec fetch implementations require', async () => {
		const file_path = path.join(mkdtempSync(path.join(os.tmpdir(), 'illusi-upload-')), 'song.m4a');
		writeFileSync(file_path, Buffer.from('audio bytes'));
		let body: FormData | undefined;
		vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
			body = init.body as FormData;
			return new Response(JSON.stringify({ duplicate: false }), { status: 201, headers: { 'content-type': 'application/json' } });
		}));
		Illusi.configure({ base_url: 'https://api.example.test' });
		Illusi.set_session({ access_token: 'a', refresh_token: 'r' });

		await Illusi.MediaFiles.upload('track-1', { uri: `file://${file_path}`, name: 'song.m4a', type: 'audio/mp4' }, { token: 'tok' });
		const part = body!.get('file');
		expect(part).toBeInstanceOf(Blob);
		expect((part as File).name).toBe('song.m4a');
		expect(await (part as Blob).text()).toBe('audio bytes');
		expect(body!.get('token')).toBe('tok');
	});
});
