import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import { migration_state_table, user_tracks_table } from '@illusive/db/schema';
import { and, asc, eq, gt, ne } from 'drizzle-orm';
import { Outbox } from '../v2/outbox';
import { transaction } from '../v2/sqlite';
import { SANE_TIME } from './legacy_fixup';

// One-time fix for downloaded tracks: the download date becomes the media file's modified date, and the date added
// becomes that download date. The rows are queued so the server takes the corrected dates.

export const STATE_DOWNLOAD_DATES = 'download_dates_fixup';
const CHUNK = 500;

export async function download_dates_fixed(ex: DrizzleDB): Promise<boolean> {
	const [row] = await ex.select().from(migration_state_table).where(eq(migration_state_table.key, STATE_DOWNLOAD_DATES));
	return row?.value === true;
}

/** file_modified_at resolves a media_uri to its file's modified time, or null when the file is missing */
export async function fix_download_dates(db: DrizzleDB, file_modified_at: (media_uri: string) => Promise<number | null>, now = Date.now()) {
	if (await download_dates_fixed(db)) return;
	const fixes: { uid: string; at: number }[] = [];
	let after = '';
	for (;;) {
		const rows = await db.select({
			uid: user_tracks_table.uid, media_uri: user_tracks_table.media_uri, downloaded_at: user_tracks_table.downloaded_at, created_at: user_tracks_table.created_at
		}).from(user_tracks_table)
			.where(and(gt(user_tracks_table.uid, after), eq(user_tracks_table.deleted, false), ne(user_tracks_table.media_uri, '')))
			.orderBy(asc(user_tracks_table.uid)).limit(CHUNK);
		if (rows.length === 0) break;
		for (const row of rows) {
			const at = await file_modified_at(row.media_uri);
			if (at === null || at < SANE_TIME || (at === row.downloaded_at && at === row.created_at)) continue;
			fixes.push({ uid: row.uid, at });
		}
		after = rows[rows.length - 1].uid;
	}
	await transaction(db, async (tx) => {
		for (const fix of fixes) {
			await tx.update(user_tracks_table).set({ downloaded_at: fix.at, created_at: fix.at, edited_at: now, modified_at: now })
				.where(eq(user_tracks_table.uid, fix.uid));
		}
		await Outbox.enqueue(tx, 'user_track', fixes.map(fix => fix.uid));
		await tx.insert(migration_state_table).values({ key: STATE_DOWNLOAD_DATES, value: true })
			.onConflictDoUpdate({ target: migration_state_table.key, set: { value: true } });
	});
}
