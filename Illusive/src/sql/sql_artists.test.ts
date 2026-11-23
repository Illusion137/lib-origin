import { describe, expect, it, vi } from 'vitest';
import { SQLArtists } from './sql_artists';

vi.mock('@illusive/db/database', () => ({ db: {} }));
vi.mock('@illusive/legacy/1810/database', () => ({ db: {} }));
vi.mock('@illusive/db/store', () => ({ Store: { legacy: () => false } }));
vi.mock('@illusive/constants', () => ({ Constants: { import_uri_id: 'import', local_illusi_uri_id: 'local', sudo_profile_picture_index: 1, sumi_profile_picture_index: 2 } }));

describe('SQLArtists.nammed_uuid_to_compact_artist', () => {
	it('prefers the exact uri, then a picture the app found for the same name, then the default', async () => {
		const artwork = (uri: string, name: string) => SQLArtists.nammed_uuid_to_compact_artist({ name, uri: uri as 'illusi:x' }).profile_artwork_url;

		await SQLArtists.insert_sql_artists({ uri: 'youtube:channel.abc', name: 'Sumi - Topic', artwork_url: 'https://yt/sumi' }).catch(() => undefined);
		expect(artwork('illusi:11111111-1111-4111-8111-111111111111', 'sumi')).toBe('https://yt/sumi');

		await SQLArtists.insert_sql_artists({ uri: 'illusi:11111111-1111-4111-8111-111111111111', name: 'Sumi', artwork_url: 'https://illusi/sumi' }).catch(() => undefined);
		expect(artwork('illusi:11111111-1111-4111-8111-111111111111', 'Sumi')).toBe('https://illusi/sumi');
		expect(artwork('illusi:22222222-2222-4222-8222-222222222222', 'Nobody')).toBe(SQLArtists.default_profile_picture_url);
	});
});
