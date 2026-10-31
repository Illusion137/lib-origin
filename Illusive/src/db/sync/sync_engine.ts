import type { Cursor, ResearchService } from '@origin/illusi/types';
import { catch_log } from '@common/utils/error_util';
import { Illusi } from '@origin/illusi/illusi';
import { Prefs } from '@illusive/prefs';
import { Wifi } from '@illusive/wifi_utils';
import { db, db_path } from '@illusive/db/database';
import {
	outbox_table, playlist_inherited_playlists_table, playlist_inherited_searches_table, playlist_tracks_table, playlists_table, sync_state_table,
	request_queue_table, track_plays_table, user_tracks_table, type OutboxRow
} from '@illusive/db/schema';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { deterministic_uuid, playlist_track_key } from '../v2/keys';
import { Outbox } from '../v2/outbox';
import { IDS_PER_QUERY, transaction } from '../v2/sqlite';
import { apply_rows, type ApplyResult } from './apply';
import { IllusiActions } from './illusi_actions';
import { IllusiAccount } from './illusi_account';
import { AccountDatabase } from '../account_database';
import { DatabaseBoot } from '../boot';
import { NetworkMonitor } from './network_monitor';
import { PlaylistArtwork } from './playlist_artwork';
import { RequestQueue } from './request_queue';
import { apply_push_result, build_push, fail_push, MAX_ATTEMPTS, type PushBatch } from './push';
import { chunkify, milliseconds_of } from '@common/utils/util';

// Keeps the v2 database and the Illusi server in step: pushes the outbox, pulls other devices' changes, reports
// unavailable tracks and answers the server's actions. Only runs once the 1810 migration is done.

const PUSH_DEBOUNCE_MS = milliseconds_of({ seconds: 2 });
const PULL_INTERVAL_MS = milliseconds_of({ minutes: 5 });
const PUSH_ROUNDS_PER_SYNC = 50;
/** How often to ask the server which library artists need a new-release check on this device's services */
const RELEASE_CHECK_INTERVAL_MS = milliseconds_of({ hours: 6 });

const STATE_CURSOR = 'cursor';
const STATE_IMPORTED = 'imported';
const STATE_ARTWORK_IMPORTED = 'artwork_imported';
const STATE_ACCOUNT = 'account';
const STATE_IN_FLIGHT = 'in_flight_push';
const STATE_RELEASES_CHECKED = 'releases_checked_at';

interface InFlightPush {
	push_id: string;
	base_cursor: Cursor | null;
	batch: PushBatch;
}

async function get_state<T>(key: string): Promise<T | undefined> {
	const [row] = await db.select().from(sync_state_table).where(eq(sync_state_table.key, key));
	return row?.value as T | undefined;
}
async function set_state(ex: typeof db, key: string, value: unknown) {
	if (value === undefined) await ex.delete(sync_state_table).where(eq(sync_state_table.key, key));
	else await ex.insert(sync_state_table).values({ key, value }).onConflictDoUpdate({ target: sync_state_table.key, set: { value } });
}

export namespace SyncEngine {
	export type Status = 'IDLE' | 'SYNCING' | 'OFFLINE' | 'LOGGED_OUT' | 'ERROR';
	export interface Progress { status: Status; pending: number; last_synced_at: number | null; last_error?: string }
	type ProgressListener = (progress: Progress) => void;

	let started = false;
	let running: Promise<void> | null = null;
	let again = false;
	let push_timer: ReturnType<typeof setTimeout> | undefined;
	let pull_timer: ReturnType<typeof setInterval> | undefined;
	let unsubscribers: (() => void)[] = [];
	let library_changed_listener: (() => void) | undefined;
	const progress_listeners = new Set<ProgressListener>();
	let progress: Progress = { status: 'IDLE', pending: 0, last_synced_at: null };

	function set_progress(update: Partial<Progress>) {
		progress = { ...progress, ...update };
		for (const listener of progress_listeners) listener(progress);
	}
	export function get_progress(): Progress {
		return progress;
	}
	export function subscribe(listener: ProgressListener): () => void {
		progress_listeners.add(listener);
		return () => progress_listeners.delete(listener);
	}
	/** Reloads the in-memory library after a sync changed it */
	export function on_library_changed(listener: (() => void) | undefined) {
		library_changed_listener = listener;
	}

	/** Starts syncing in the background. Call once the database is in v2 mode. */
	export function start() {
		if (started) return;
		started = true;
		IllusiAccount.configure();
		RequestQueue.use(db);
		Outbox.set_listener(schedule_push);
		Prefs.on_recent_search((text) => {
			Outbox.enqueue(db, 'recent_search', [Illusi.uuid_v4()], { text, created_at: Date.now() }).catch(catch_log);
		});
		unsubscribers.push(IllusiAccount.subscribe((logged_in) => {
			if (logged_in) void sync_now();
			else set_progress({ status: 'LOGGED_OUT' });
		}));
		const network = NetworkMonitor.get_instance().on_network_change((good) => { if (good) void sync_now(); });
		unsubscribers.push(() => network());
		pull_timer = setInterval(() => { void sync_now(); }, PULL_INTERVAL_MS);
		void sync_now();
	}

	export function stop() {
		started = false;
		Outbox.set_listener(undefined);
		Prefs.on_recent_search(undefined);
		clearTimeout(push_timer);
		clearInterval(pull_timer);
		for (const unsubscribe of unsubscribers) unsubscribe();
		unsubscribers = [];
	}

	function schedule_push() {
		if (!started) return;
		clearTimeout(push_timer);
		push_timer = setTimeout(() => { void sync_now(); }, PUSH_DEBOUNCE_MS);
	}

	/** Runs a sync now, or right after the one in progress */
	export function sync_now(): Promise<void> {
		if (running !== null) {
			again = true;
			return running;
		}
		running = (async () => {
			do {
				again = false;
				await sync_once().catch((error: unknown) => {
					set_progress({ status: 'ERROR', last_error: String(error) });
					catch_log(error);
				});
			} while (again && started);
		})().finally(() => { running = null; });
		return running;
	}

	async function sync_once() {
		if (!IllusiAccount.has_server() || !IllusiAccount.is_logged_in()) {
			set_progress({ status: 'LOGGED_OUT', pending: await Outbox.count(db) });
			return;
		}
		if (!await Wifi.has_internet().catch(() => true)) {
			set_progress({ status: 'OFFLINE' });
			return;
		}
		set_progress({ status: 'SYNCING', last_error: undefined });
		if (!await check_account()) return;
		await RequestQueue.drain();
		await import_library();
		await import_artwork();

		let changed = false;
		let drained = false;
		for (let round = 0; round < PUSH_ROUNDS_PER_SYNC; round++) {
			const pushed = await push_once();
			if (pushed === null) {
				drained = true;
				break;
			}
			changed ||= pushed.library_changed;
		}
		// A big first import continues in the next run, after a pull
		if (!drained) again = true;
		await PlaylistArtwork.push(db);
		// Both always run; `changed ||= await ...` would skip them once something changed
		const pulled = await pull();
		const downloaded = await PlaylistArtwork.download_pending(db);
		changed = changed || pulled || downloaded;
		await report_unavailable();
		await request_release_checks().catch(catch_log);
		if (changed) library_changed_listener?.();
		set_progress({ status: 'IDLE', pending: await Outbox.count(db), last_synced_at: Date.now() });
	}

	/**
	 * The first account to sign in keeps the library already on the device; any other account gets a database of
	 * its own, created on first sign-in and swapped in here. Nothing is deleted when an account signs out.
	 */
	async function use_account_database(user_id: string): Promise<boolean> {
		const plan = AccountDatabase.for_account(user_id);
		const previous_file = db_path;
		if (!await DatabaseBoot.switch_database(plan.file)) {
			set_progress({ status: 'ERROR', last_error: 'Unable to open this account\'s library' });
			return false;
		}
		// db is now the account's database; point everything that kept the old connection at it
		RequestQueue.use(db);
		await AccountDatabase.remember(user_id, plan);
		if (plan.file !== previous_file) library_changed_listener?.();
		return true;
	}

	/** A different account on this device starts from a fresh cursor and imports the library into it */
	async function check_account(): Promise<boolean> {
		const me = await IllusiAccount.me();
		if (Illusi.is_error(me)) {
			set_progress({ status: 'ERROR', last_error: me.error.message });
			return false;
		}
		if (!await use_account_database(me.user.id)) return false;
		const previous = await get_state<string>(STATE_ACCOUNT);
		if (previous === me.user.id) return true;
		await transaction(db, async (tx) => {
			for (const key of [STATE_CURSOR, STATE_IMPORTED, STATE_ARTWORK_IMPORTED, STATE_IN_FLIGHT]) await set_state(tx, key, undefined);
			// Requests belong to the account that made them
			await tx.delete(request_queue_table);
			await set_state(tx, STATE_ACCOUNT, me.user.id);
		});
		return true;
	}

	/** Queues the whole local library once per account, parents before children */
	async function import_library() {
		if (await get_state<boolean>(STATE_IMPORTED) === true) return;
		await transaction(db, async (tx) => {
			const playlists = await tx.select({ uuid: playlists_table.uuid }).from(playlists_table).where(eq(playlists_table.deleted, false));
			await Outbox.enqueue(tx, 'playlist', playlists.map(p => p.uuid));
			const library = await tx.select({ uid: user_tracks_table.uid }).from(user_tracks_table).where(eq(user_tracks_table.deleted, false));
			await Outbox.enqueue(tx, 'user_track', library.map(t => t.uid));
			const playlist_tracks = await tx.select({ uuid: playlist_tracks_table.playlist_uuid, uid: playlist_tracks_table.track_uid }).from(playlist_tracks_table)
				.where(eq(playlist_tracks_table.deleted, false)).orderBy(asc(playlist_tracks_table.position));
			await Outbox.enqueue(tx, 'playlist_track', playlist_tracks.map(r => playlist_track_key(r.uuid, r.uid)));
			const searches = await tx.select({ id: playlist_inherited_searches_table.local_id }).from(playlist_inherited_searches_table).where(eq(playlist_inherited_searches_table.deleted, false));
			await Outbox.enqueue(tx, 'inherited_search', searches.map(r => r.id));
			const inherited = await tx.select({ id: playlist_inherited_playlists_table.local_id }).from(playlist_inherited_playlists_table).where(eq(playlist_inherited_playlists_table.deleted, false));
			await Outbox.enqueue(tx, 'inherited_playlist', inherited.map(r => r.id));
			const plays = await tx.select({ id: track_plays_table.client_id }).from(track_plays_table).orderBy(asc(track_plays_table.created_at));
			await Outbox.enqueue(tx, 'track_play', plays.map(r => r.id));
			// Recent searches only live in prefs, newest first and without times; keep their order
			const recent: string[] = Prefs.get_pref('recent_searches');
			const now = Date.now();
			for (const [i, text] of recent.entries()) {
				await Outbox.enqueue(tx, 'recent_search', [deterministic_uuid(`recent_search:${text}`)], { text, created_at: now - i * 1000 });
			}
			await set_state(tx, STATE_IMPORTED, true);
		});
	}

	/** Queues custom playlist artwork for upload once per account, including artwork carried over by the 1810 migration */
	async function import_artwork() {
		if (await get_state<boolean>(STATE_ARTWORK_IMPORTED) === true) return;
		await transaction(db, async (tx) => {
			await PlaylistArtwork.queue_existing(tx);
			await set_state(tx, STATE_ARTWORK_IMPORTED, true);
		});
	}

	/**
	 * Sends one push. The batch is saved before sending, so a push interrupted by the app closing is resent as-is
	 * with the same push_id and the server replays its result instead of applying it twice.
	 */
	async function push_once(): Promise<ApplyResult | null> {
		let in_flight = await get_state<InFlightPush>(STATE_IN_FLIGHT);
		if (in_flight === undefined) {
			const batch = await build_push(db);
			if (batch === null) return null;
			in_flight = { push_id: Illusi.uuid_v4(), base_cursor: await get_state<Cursor>(STATE_CURSOR) ?? null, batch };
			if (Object.keys(batch.changes).length === 0) {
				await Outbox.ack(db, batch.skipped);
				return { library_changed: false };
			}
			await set_state(db, STATE_IN_FLIGHT, in_flight);
		}
		const { push_id, base_cursor, batch } = in_flight;
		const response = await Illusi.Sync.push(batch.changes, base_cursor, push_id);
		if (Illusi.is_error(response)) {
			const status = (response as Illusi.IllusiError).status;
			// Network errors, 5xx and auth errors are retried later with the same push
			if (status === undefined || status >= 500 || status === 401 || status === 409 || status === 429) throw response.error;
			await transaction(db, async (tx) => {
				await fail_push(tx, batch, response.error.message);
				await set_state(tx, STATE_IN_FLIGHT, undefined);
			});
			return { library_changed: false };
		}
		return transaction(db, async (tx) => {
			const applied = await apply_push_result(tx, batch, response);
			if (response.cursor !== null) await set_state(tx, STATE_CURSOR, response.cursor);
			await set_state(tx, STATE_IN_FLIGHT, undefined);
			return applied;
		});
	}

	/** Pulls every page, saving the cursor with each page so an interrupted pull resumes where it stopped */
	async function pull(): Promise<boolean> {
		let changed = false;
		let cursor = await get_state<Cursor>(STATE_CURSOR) ?? null;
		while (true) {
			const page = await Illusi.Sync.pull(cursor);
			if (Illusi.is_error(page)) throw page.error;
			const applied = await transaction(db, async (tx) => {
				const result = await apply_rows(tx, page);
				await set_state(tx, STATE_CURSOR, page.next_cursor);
				return result;
			});
			changed ||= applied.library_changed;
			IllusiActions.handle(page.actions);
			cursor = page.next_cursor;
			if (!page.has_more) return changed;
		}
	}

	async function report_unavailable() {
		const entries = await Outbox.take(db, 50, ['unavailable']);
		if (entries.length === 0) return;
		const uids = entries.map(entry => entry.key);
		const ids = new Map<string, string | null>();
		for (const chunk of chunkify(uids, IDS_PER_QUERY)) {
			for (const row of await db.select({ uid: user_tracks_table.uid, illusi_id: user_tracks_table.illusi_id }).from(user_tracks_table).where(inArray(user_tracks_table.uid, chunk))) ids.set(row.uid, row.illusi_id);
		}
		const waiting = new Set((await db.select({ key: outbox_table.key }).from(outbox_table)
			.where(and(eq(outbox_table.kind, 'user_track'), inArray(outbox_table.key, uids)))).map(row => row.key));
		const done: OutboxRow[] = [];
		const failed: OutboxRow[] = [];
		for (const entry of entries) {
			const illusi_id = ids.get(entry.key);
			const service = entry.payload?.service as ResearchService | undefined;
			if (!ids.has(entry.key) || service === undefined) {
				done.push(entry);
				continue;
			}
			// The server learns the track from the library push first
			if (illusi_id === null || illusi_id === undefined) {
				if (!waiting.has(entry.key)) (entry.attempts + 1 >= MAX_ATTEMPTS ? done : failed).push(entry);
				continue;
			}
			const result = await Illusi.Backpack.report(illusi_id, service);
			if (!Illusi.is_error(result)) done.push(entry);
			else if (((result as Illusi.IllusiError).status ?? 500) >= 500) break;
			else (entry.attempts + 1 >= MAX_ATTEMPTS ? done : failed).push(entry);
		}
		await Outbox.ack(db, done);
		if (failed.length > 0) await Outbox.fail(db, failed.map(entry => entry.id), 'unavailable report not accepted');
	}

	/** Picks up FETCH_NEW_RELEASES checks for the services this device is logged into; they run in the background */
	async function request_release_checks() {
		const services = IllusiActions.release_services();
		if (services.length === 0) return;
		const last = await get_state<number>(STATE_RELEASES_CHECKED) ?? 0;
		if (Date.now() - last < RELEASE_CHECK_INTERVAL_MS) return;
		const result = await Illusi.NewReleasesApi.mine(services, 1);
		if (Illusi.is_error(result)) return;
		await set_state(db, STATE_RELEASES_CHECKED, Date.now());
		IllusiActions.handle(result.actions);
	}
}
