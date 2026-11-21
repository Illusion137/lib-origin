import { remove_topic } from '@common/utils/clean_util';
import { Constants } from '@illusive/constants';
import { db } from '@illusive/db/database';
import { artist_artwork_table } from '@illusive/db/schema';
import { Store } from '@illusive/db/store';
import { create_uri } from '@illusive/illusive_utils';
import { db as legacy_db } from '@illusive/legacy/1810/database';
import { artists_table as legacy_artists_table, type SQLArtist, type SQLArtistInsert } from '@illusive/legacy/1810/schema';
import type { ArtistSortMode, CompactArtist, NamedUUID, Track } from '@illusive/types';
import { and, eq } from 'drizzle-orm';

export namespace SQLArtists {
	export const default_profile_picture_url = 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg';
	export const artists_artwork_memo: Record<SQLArtist['uri'], SQLArtist['artwork_url'] | number | undefined> = {};
	export const artists_memo: Record<SQLArtist['uri'], SQLArtist> = {};

	let resolve_artists_memo_ready: () => void;
	export const artists_memo_ready = new Promise<void>((resolve) => { resolve_artists_memo_ready = resolve; });

	export async function get_all_sql_artists(): Promise<SQLArtist[]> {
		artists_artwork_memo[create_uri('illusi', Constants.import_uri_id)] = Constants.sudo_profile_picture_index;
		artists_artwork_memo[create_uri('illusi', Constants.local_illusi_uri_id)] = Constants.sumi_profile_picture_index;

		const artists = await load_artists();
		for (const artist of artists) {
			artists_artwork_memo[artist.uri] = artist.artwork_url;
			artists_memo[artist.uri] = artist;
		}
		resolve_artists_memo_ready();
		return artists;
	}

	export async function get_sql_artist_artwork_uri(uri: string): Promise<string | number | undefined> {
		const result = artists_artwork_memo[uri] ?? (await load_artists(uri))[0]?.artwork_url;
		artists_artwork_memo[uri] = result;
		return result;
	}

	export async function insert_sql_artists(sql_artist: SQLArtistInsert) {
		artists_artwork_memo[sql_artist.uri] = sql_artist.artwork_url;
		artists_memo[sql_artist.uri] = sql_artist as SQLArtist;
		await save_artists([sql_artist]);
	}

	export async function insert_all_into_sql_artists(sql_artists: SQLArtistInsert[]) {
		for (const sql_artist of sql_artists) {
			artists_artwork_memo[sql_artist.uri] = sql_artist.artwork_url;
			artists_memo[sql_artist.uri] = sql_artist as SQLArtist;
		}
		await save_artists(sql_artists);
	}

	export async function clear_all_sql_artists() {
		if (Store.legacy()) await legacy_db.delete(legacy_artists_table);
		else await db.delete(artist_artwork_table);
	}

	// Artwork is cached on the 1810 artists table, or on v2's artist_artwork (matched by the uri tracks reference).
	async function load_artists(uri?: string): Promise<SQLArtist[]> {
		if (Store.legacy()) {
			return legacy_db.select().from(legacy_artists_table)
				.where(and(eq(legacy_artists_table.deleted, false), uri === undefined ? undefined : eq(legacy_artists_table.uri, uri)));
		}
		const rows = await db.select().from(artist_artwork_table).where(uri === undefined ? undefined : eq(artist_artwork_table.uri, uri));
		return rows.map(row => ({ ...row, deleted: false }));
	}
	async function save_artists(sql_artists: SQLArtistInsert[]) {
		if (sql_artists.length === 0) return;
		if (Store.legacy()) {
			for (const sql_artist of sql_artists) {
				await legacy_db.insert(legacy_artists_table).values(sql_artist).onConflictDoUpdate({ set: sql_artist, target: legacy_artists_table.uri });
			}
			return;
		}
		const now = Date.now();
		for (const sql_artist of sql_artists) {
			await db.insert(artist_artwork_table)
				.values({ uri: sql_artist.uri, name: sql_artist.name, artwork_url: sql_artist.artwork_url, created_at: now, modified_at: now })
				.onConflictDoUpdate({ target: artist_artwork_table.uri, set: { name: sql_artist.name, artwork_url: sql_artist.artwork_url, modified_at: now } });
		}
	}

	export function sort_compact_artists(mode: ArtistSortMode, artists: NamedUUID[], global_tracks: Track[]): CompactArtist[] {
		switch (mode) {
			case 'NEWEST':
				return artists.slice().reverse().map(nammed_uuid_to_compact_artist);
			case 'OLDEST':
				return artists.map(nammed_uuid_to_compact_artist);
			case 'MOST_PLAYED':
				return sort_compact_artists_by_most_played(artists, global_tracks);
			case 'LEAST_PLAYED':
				return sort_compact_artists_by_most_played(artists, global_tracks).reverse();
			default:
				return artists.map(nammed_uuid_to_compact_artist);
		}
	}

	export function sort_compact_artists_by_most_played(artists: NamedUUID[], global_tracks: Track[]): CompactArtist[] {
		const name_plays: [string, number][] = global_tracks.map(track => [remove_topic(track.artists[0].name), track.meta?.plays ?? 0]);
		const name_plays_map = new Map<string, number>();
		for (const name_play of name_plays) {
			name_plays_map.set(name_play[0], (name_plays_map.get(name_play[0]) ?? 0) + name_play[1]);
		}
		return artists
			.slice()
			.sort((a, b) => (name_plays_map.get(remove_topic(b?.name ?? '')) ?? 0) - (name_plays_map.get(remove_topic(a?.name ?? '')) ?? 0))
			.map(nammed_uuid_to_compact_artist);
	}

	export function nammed_uuid_to_compact_artist(artist: NamedUUID): CompactArtist {
		return { name: artist, is_official_artist_channel: true, profile_artwork_url: artists_artwork_memo[artist.uri ?? ''] ?? default_profile_picture_url };
	}
}
