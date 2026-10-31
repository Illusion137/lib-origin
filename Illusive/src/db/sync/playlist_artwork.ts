import type { PromiseResult } from '@common/types';
import { catch_log, generror, generror_catch } from '@common/utils/error_util';
import { fs } from '@native/fs/fs';
import { image_webp } from '@native/image_webp/image_webp';
import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import { Illusi } from '@origin/illusi/illusi';
import type { ArtworkFile, ArtworkResult, Playlist as ServerPlaylist } from '@origin/illusi/types';
import { outbox_table, playlists_table, type OutboxRow, type PlaylistRow } from '@illusive/db/schema';
import { SQLfs } from '@illusive/sql/sql_fs';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { Outbox } from '../v2/outbox';
import { IDS_PER_QUERY, transaction } from '../v2/sqlite';
import { chunkify } from '@common/utils/util';

/**
 * Keeps custom playlist artwork in step with the server, on its own last-write-wins clock (artwork_edited_at):
 * local changes upload (or remove) the image, and newer server artwork is downloaded into the custom thumbnail
 * directory. thumbnail_uri stays the local file the UI shows; artwork_id is the server image it mirrors.
 */
export namespace PlaylistArtwork {
	/** The server keeps at most 1024px on the longest side */
	export const UPLOAD_SIZE = 1024;
	const WEBP_QUALITY = 90;
	const BATCH = 20;
	const MAX_ATTEMPTS = 5;
	/** Downloaded server artwork is saved as `<prefix><artwork_id>` in the custom thumbnail directory */
	export const FILE_PREFIX = 'illusi_artwork_';

	type ServerArtwork = Pick<ServerPlaylist, 'id' | 'artwork_id' | 'artwork_edited_at'>;
	type Outcome = 'done' | 'retry' | 'stop';

	const time = (iso: string | null | undefined): number | null => (iso === null || iso === undefined ? null : new Date(iso).getTime());

	function array_buffer_to_base64(buffer: ArrayBuffer): string {
		const bytes = new Uint8Array(buffer);
		let binary = '';
		for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
		return btoa(binary);
	}

	/** File access and image conversion; tests replace these */
	export const io = {
		/** Converts the playlist's local artwork to a square WebP the server accepts (HEIC and the like included) */
		async prepare_upload(thumbnail_uri: string): PromiseResult<{ path: string; file: ArtworkFile }> {
			try {
				const remote = /^https?:/.test(thumbnail_uri);
				const source = remote ? thumbnail_uri : SQLfs.custom_thumbnail_directory(thumbnail_uri);
				if (!remote && !(await fs().get_info(source)).exists) return generror('Playlist artwork file is missing', 'LOW', { thumbnail_uri });
				const webp = await image_webp().to_square_webp(source, UPLOAD_SIZE, WEBP_QUALITY);
				if ('error' in webp) return webp;
				const path = await fs().temp_directory(`artwork_upload_${Date.now()}.webp`);
				const written = await fs().write_file_as_string(path, webp.base64, { encoding: 'base64' });
				if (typeof written === 'object' && written !== null && 'error' in written) return written;
				return { path, file: { uri: path, name: 'artwork.webp', type: 'image/webp' } };
			} catch (e) {
				return generror_catch(e, 'Preparing playlist artwork failed', 'LOW', { thumbnail_uri });
			}
		},
		async discard(path: string) {
			await Promise.resolve(fs().remove(path)).catch(() => undefined);
		},
		/** Saves a downloaded server image as a custom thumbnail and returns its thumbnail_uri */
		async save_download(artwork_id: string, data: ArrayBuffer): PromiseResult<string> {
			const name = `${FILE_PREFIX}${artwork_id}`;
			const written = await fs().write_file_as_string(SQLfs.custom_thumbnail_directory(name), array_buffer_to_base64(data), { encoding: 'base64' });
			if (typeof written === 'object' && written !== null && 'error' in written) return written;
			return name;
		},
		async has_download(artwork_id: string): Promise<boolean> {
			return (await fs().get_info(SQLfs.custom_thumbnail_directory(`${FILE_PREFIX}${artwork_id}`))).exists;
		},
		async remove_download(thumbnail_uri: string) {
			if (thumbnail_uri.startsWith(FILE_PREFIX)) await Promise.resolve(fs().remove(SQLfs.custom_thumbnail_directory(thumbnail_uri))).catch(() => undefined);
		}
	};

	async function pending(ex: DrizzleDB, kind: 'playlist' | 'playlist_artwork', keys: readonly string[]): Promise<Set<string>> {
		const result = new Set<string>();
		for (const chunk of chunkify([...new Set(keys)], IDS_PER_QUERY)) {
			const rows = await ex.select({ key: outbox_table.key }).from(outbox_table).where(and(eq(outbox_table.kind, kind), inArray(outbox_table.key, chunk)));
			for (const row of rows) result.add(row.key);
		}
		return result;
	}

	/** Whose artwork stands: a newer local change still waiting to upload wins, otherwise the server's */
	export function winner(local: Pick<PlaylistRow, 'artwork_id' | 'artwork_edited_at'>, server_id: string | null, server_at: number | null, local_pending: boolean): 'local' | 'server' | 'same' {
		if (server_at === null) return 'local';
		if (local_pending && local.artwork_edited_at !== null && local.artwork_edited_at > server_at) return 'local';
		if (!local_pending && local.artwork_id === server_id && local.artwork_edited_at === server_at) return 'same';
		return 'server';
	}

	/**
	 * Takes the server's artwork for playlists a pull returned, where it wins. A new image is queued for download
	 * (the old one stays on screen until then); a removed one clears the thumbnail. Returns whether anything changed.
	 */
	export async function apply_server(ex: DrizzleDB, rows: readonly ServerArtwork[]): Promise<boolean> {
		const relevant = rows.filter(row => row.artwork_edited_at !== null && row.artwork_edited_at !== undefined);
		if (relevant.length === 0) return false;
		const waiting = await pending(ex, 'playlist_artwork', relevant.map(row => row.id));
		const now = Date.now();
		let changed = false;
		for (const row of relevant) {
			const [local] = await ex.select({ artwork_id: playlists_table.artwork_id, artwork_edited_at: playlists_table.artwork_edited_at, thumbnail_uri: playlists_table.thumbnail_uri })
				.from(playlists_table).where(eq(playlists_table.uuid, row.id));
			if (local === undefined) continue;
			const server_at = time(row.artwork_edited_at);
			if (winner(local, row.artwork_id, server_at, waiting.has(row.id)) !== 'server') continue;
			if (local.artwork_id === row.artwork_id && local.artwork_edited_at === server_at) {
				// Same image already here; only a stale local upload is left to drop
				await ex.delete(outbox_table).where(and(eq(outbox_table.kind, 'playlist_artwork'), eq(outbox_table.key, row.id)));
				continue;
			}
			await ex.update(playlists_table)
				.set({ artwork_id: row.artwork_id, artwork_edited_at: server_at, ...(row.artwork_id === null ? { thumbnail_uri: '' } : {}), modified_at: now })
				.where(eq(playlists_table.uuid, row.id));
			await ex.delete(outbox_table).where(and(eq(outbox_table.kind, 'playlist_artwork'), eq(outbox_table.key, row.id)));
			if (row.artwork_id === null) {
				await ex.delete(outbox_table).where(and(eq(outbox_table.kind, 'artwork_download'), eq(outbox_table.key, row.id)));
				await io.remove_download(local.thumbnail_uri);
			} else {
				await Outbox.enqueue(ex, 'artwork_download', [row.id]);
			}
			changed = true;
		}
		return changed;
	}

	/**
	 * Queues every playlist with custom artwork that the server doesn't have yet, once per account. Playlists keep
	 * their artwork clock when they have one; migrated ones use when the playlist was last edited.
	 */
	export async function queue_existing(ex: DrizzleDB) {
		const rows = await ex.select({
			uuid: playlists_table.uuid, thumbnail_uri: playlists_table.thumbnail_uri, artwork_edited_at: playlists_table.artwork_edited_at,
			edited_at: playlists_table.edited_at, created_at: playlists_table.created_at
		}).from(playlists_table).where(and(eq(playlists_table.deleted, false), isNull(playlists_table.artwork_id)));
		const keys: string[] = [];
		for (const row of rows) {
			if (row.thumbnail_uri === '') continue;
			if (row.artwork_edited_at === null) {
				await ex.update(playlists_table).set({ artwork_edited_at: row.edited_at ?? row.created_at }).where(eq(playlists_table.uuid, row.uuid));
			}
			keys.push(row.uuid);
		}
		await Outbox.enqueue(ex, 'playlist_artwork', keys);
	}

	async function push_one(ex: DrizzleDB, entry: OutboxRow): Promise<Outcome> {
		const [row] = await ex.select().from(playlists_table).where(eq(playlists_table.uuid, entry.key));
		if (row === undefined || row.deleted) return 'done';
		const edited_at = new Date(row.artwork_edited_at ?? Date.now());
		let result: ArtworkResult | Illusi.IllusiError;
		if (row.thumbnail_uri === '') {
			result = await Illusi.Playlists.remove_artwork(row.uuid, edited_at);
		} else {
			const prepared = await io.prepare_upload(row.thumbnail_uri);
			// An image that can't be read or converted never will be; it stays local only
			if ('error' in prepared) {
				catch_log(prepared.error);
				return 'done';
			}
			result = await Illusi.Playlists.set_artwork(row.uuid, prepared.file, edited_at);
			await io.discard(prepared.path);
		}
		if (Illusi.is_error(result)) {
			const { status } = result;
			if (status === undefined || status >= 500 || status === 401 || status === 429) return 'stop';
			// The playlist hasn't reached the server yet
			if (status === 404) return 'retry';
			catch_log(result.error);
			return 'done';
		}
		const accepted = result;
		await transaction(ex, async (tx) => {
			if (accepted.applied) {
				// Unless a newer local change arrived during the upload
				const same_edit = row.artwork_edited_at === null ? isNull(playlists_table.artwork_edited_at) : eq(playlists_table.artwork_edited_at, row.artwork_edited_at);
				await tx.update(playlists_table)
					.set({ artwork_id: accepted.playlist.artwork_id, artwork_edited_at: time(accepted.playlist.artwork_edited_at), modified_at: Date.now() })
					.where(and(eq(playlists_table.uuid, row.uuid), same_edit, eq(playlists_table.thumbnail_uri, row.thumbnail_uri)));
			} else {
				await apply_server(tx, [accepted.playlist]);
			}
		});
		return 'done';
	}

	/** Uploads or removes queued artwork, once the playlist itself has been pushed */
	export async function push(ex: DrizzleDB): Promise<void> {
		const entries = await Outbox.take(ex, BATCH, ['playlist_artwork']);
		if (entries.length === 0) return;
		const waiting = await pending(ex, 'playlist', entries.map(entry => entry.key));
		const done: OutboxRow[] = [];
		const failed: OutboxRow[] = [];
		for (const entry of entries) {
			if (waiting.has(entry.key)) continue;
			const outcome = await push_one(ex, entry);
			if (outcome === 'stop') break;
			if (outcome === 'done' || entry.attempts + 1 >= MAX_ATTEMPTS) done.push(entry);
			else failed.push(entry);
		}
		await Outbox.ack(ex, done);
		if (failed.length > 0) await Outbox.fail(ex, failed.map(entry => entry.id), 'playlist not on the server yet');
	}

	/** Downloads server artwork queued by apply_server. Returns whether a thumbnail changed. */
	export async function download_pending(ex: DrizzleDB): Promise<boolean> {
		const entries = await Outbox.take(ex, BATCH, ['artwork_download']);
		if (entries.length === 0) return false;
		const done: OutboxRow[] = [];
		const failed: OutboxRow[] = [];
		let changed = false;
		for (const entry of entries) {
			const [row] = await ex.select({ artwork_id: playlists_table.artwork_id, thumbnail_uri: playlists_table.thumbnail_uri, deleted: playlists_table.deleted })
				.from(playlists_table).where(eq(playlists_table.uuid, entry.key));
			if (row === undefined || row.deleted || row.artwork_id === null) {
				done.push(entry);
				continue;
			}
			const artwork_id = row.artwork_id;
			let thumbnail_uri = `${FILE_PREFIX}${artwork_id}`;
			if (!await io.has_download(artwork_id)) {
				const data = await Illusi.Playlists.download_artwork(artwork_id);
				if (Illusi.is_error(data)) {
					const status = (data as Illusi.IllusiError).status;
					if (status === undefined || status >= 500 || status === 401 || status === 429) break;
					// Replaced or removed on the server since; the next pull brings the current one
					if (status === 404) done.push(entry);
					else (entry.attempts + 1 >= MAX_ATTEMPTS ? done : failed).push(entry);
					continue;
				}
				const saved = await io.save_download(artwork_id, data);
				if (typeof saved !== 'string') {
					catch_log(saved.error);
					(entry.attempts + 1 >= MAX_ATTEMPTS ? done : failed).push(entry);
					continue;
				}
				thumbnail_uri = saved;
			}
			const updated = await ex.update(playlists_table).set({ thumbnail_uri, modified_at: Date.now() })
				.where(and(eq(playlists_table.uuid, entry.key), eq(playlists_table.artwork_id, artwork_id)))
				.returning({ uuid: playlists_table.uuid });
			if (updated.length > 0 && row.thumbnail_uri !== thumbnail_uri) {
				await io.remove_download(row.thumbnail_uri);
				changed = true;
			}
			done.push(entry);
		}
		await Outbox.ack(ex, done);
		if (failed.length > 0) await Outbox.fail(ex, failed.map(entry => entry.id), 'artwork download failed');
		return changed;
	}
}
