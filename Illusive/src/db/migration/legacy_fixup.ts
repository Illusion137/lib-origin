import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import {
	migration_state_table, playlist_tracks_table, playlists_table, recently_played_table, track_plays_table, user_tracks_table, type SnapshotNamed, type TrackSnapshot
} from '@illusive/db/schema';
import { and, asc, eq, gt, lt, sql } from 'drizzle-orm';

// One-time cleanup of rows copied from the 1810 database, run once the copy is complete (and once on installs that
// finished the copy before this existed):
// - a downloaded track's date added is the day it was downloaded;
// - timestamps 1810 never recorded (0, or the epoch it used as "unset") get a real one, so they don't sort as 1970;
// - each playlist's tracks get strictly increasing add times in their order, since other devices order by them;
// - YouTube's " - Topic" channel suffix is removed from titles and artist names.

export const STATE_FIXUP = 'legacy_fixup';
/** Anything earlier is a missing timestamp, not a real one */
export const SANE_TIME = Date.UTC(2000, 0, 1);
const CHUNK = 500;

const TOPIC_SUFFIX = /\s+-\s+Topic$/iu;

/** "Artist - Topic" → "Artist"; a name that is nothing but the suffix stays as it is */
export function strip_topic(name: string): string {
	const stripped = name.replace(TOPIC_SUFFIX, '').trim();
	return stripped === '' ? name : stripped;
}

function strip_named<T extends { name: string }>(entries: readonly T[]): T[] {
	return entries.map(entry => ({ ...entry, name: strip_topic(entry.name) }));
}

const sane = (time: number | null | undefined): time is number => typeof time === 'number' && Number.isFinite(time) && time >= SANE_TIME;

/** The date added: the download date for a downloaded track, otherwise the first real time the row has */
export function added_at(row: { downloaded_at: number | null; created_at: number; modified_at: number }, now: number): number {
	if (sane(row.downloaded_at)) return row.downloaded_at;
	if (sane(row.created_at)) return row.created_at;
	return sane(row.modified_at) ? row.modified_at : now;
}

/**
 * Add times for one playlist's tracks, given in their order: missing ones are filled in around their neighbours,
 * then every time is made later than the one before, so ordering by add time keeps the playlist's order.
 */
export function ordered_add_times(times: readonly number[], fallback: number): number[] {
	const first_known = times.findIndex(sane);
	const base = first_known === -1 ? fallback : times[first_known];
	const leading = first_known === -1 ? times.length : first_known;
	const out: number[] = [];
	for (const [i, time] of times.entries()) {
		let at: number;
		if (i < leading) at = base - (leading - i);
		else at = sane(time) ? time : out[i - 1] + 1;
		if (i > 0 && at <= out[i - 1]) at = out[i - 1] + 1;
		out.push(at);
	}
	return out;
}

function same_json(a: unknown, b: unknown): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

async function fix_user_tracks(ex: DrizzleDB, now: number) {
	let after = '';
	for (;;) {
		const rows = await ex.select({
			uid: user_tracks_table.uid, track: user_tracks_table.track, title: user_tracks_table.title, artists_override: user_tracks_table.artists_override,
			downloaded_at: user_tracks_table.downloaded_at, created_at: user_tracks_table.created_at, modified_at: user_tracks_table.modified_at
		}).from(user_tracks_table).where(gt(user_tracks_table.uid, after)).orderBy(asc(user_tracks_table.uid)).limit(CHUNK);
		if (rows.length === 0) return;
		for (const row of rows) {
			const track: TrackSnapshot = { ...row.track, title: strip_topic(row.track.title), artists: strip_named(row.track.artists) };
			const title = row.title === null ? null : strip_topic(row.title);
			const artists_override: SnapshotNamed[] | null = row.artists_override === null ? null : strip_named(row.artists_override);
			const created_at = added_at(row, now);
			if (created_at === row.created_at && title === row.title && same_json(track, row.track) && same_json(artists_override, row.artists_override)) continue;
			await ex.update(user_tracks_table).set({ track, title, artists_override, created_at }).where(eq(user_tracks_table.uid, row.uid));
		}
		after = rows[rows.length - 1].uid;
	}
}

async function fix_playlist_tracks(ex: DrizzleDB, now: number) {
	const playlists = await ex.select({ uuid: playlists_table.uuid, created_at: playlists_table.created_at }).from(playlists_table);
	for (const playlist of playlists) {
		const rows = await ex.select({ track_uid: playlist_tracks_table.track_uid, created_at: playlist_tracks_table.created_at })
			.from(playlist_tracks_table).where(eq(playlist_tracks_table.playlist_uuid, playlist.uuid))
			.orderBy(asc(playlist_tracks_table.position), asc(playlist_tracks_table.created_at));
		const times = ordered_add_times(rows.map(row => row.created_at), sane(playlist.created_at) ? playlist.created_at : now);
		for (const [i, row] of rows.entries()) {
			if (times[i] === row.created_at) continue;
			await ex.update(playlist_tracks_table).set({ created_at: times[i] })
				.where(and(eq(playlist_tracks_table.playlist_uuid, playlist.uuid), eq(playlist_tracks_table.track_uid, row.track_uid)));
		}
	}
}

/** Plays without a time (backfilled from 1810's play counts, or never stamped) count from when the track was added */
async function fix_plays(ex: DrizzleDB) {
	await ex.update(track_plays_table)
		.set({ created_at: sql`coalesce((select ${user_tracks_table.created_at} from ${user_tracks_table} where ${user_tracks_table.uid} = ${track_plays_table.track_uid}), ${track_plays_table.created_at})` })
		.where(lt(track_plays_table.created_at, SANE_TIME));
}

async function fix_recently_played(ex: DrizzleDB) {
	const rows = await ex.select({ uid: recently_played_table.uid, track: recently_played_table.track }).from(recently_played_table);
	for (const row of rows) {
		const track = row.track as { title?: unknown; artists?: unknown };
		const title = typeof track.title === 'string' ? strip_topic(track.title) : track.title;
		const artists = Array.isArray(track.artists)
			? track.artists.map(a => (a !== null && typeof a === 'object' && typeof (a as { name?: unknown }).name === 'string' ? { ...a, name: strip_topic((a as { name: string }).name) } : a))
			: track.artists;
		const fixed = { ...track, title, artists };
		if (!same_json(fixed, track)) await ex.update(recently_played_table).set({ track: fixed }).where(eq(recently_played_table.uid, row.uid));
	}
}

/** Runs the cleanup and records that it ran; call inside a transaction */
export async function fix_legacy_rows(ex: DrizzleDB, now = Date.now()) {
	await fix_user_tracks(ex, now);
	await fix_playlist_tracks(ex, now);
	await fix_plays(ex);
	await fix_recently_played(ex);
	await ex.insert(migration_state_table).values({ key: STATE_FIXUP, value: true })
		.onConflictDoUpdate({ target: migration_state_table.key, set: { value: true } });
}

export async function legacy_fixup_done(ex: DrizzleDB): Promise<boolean> {
	const [row] = await ex.select().from(migration_state_table).where(eq(migration_state_table.key, STATE_FIXUP));
	return row?.value === true;
}
