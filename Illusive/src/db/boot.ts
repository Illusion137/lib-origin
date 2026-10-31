import { catch_log } from '@common/utils/error_util';
import { migrate } from 'drizzle-orm/op-sqlite/migrator';
import * as V2 from './database';
import * as Legacy from '@illusive/legacy/1810/database';
import { legacy_repos } from '@illusive/legacy/1810/repos';
import legacy_migrations from '@illusive/drizzle/mobile/migrations';
import v2_migrations from '@illusive/drizzle/v2/migrations';
import { LegacyMigration, mark_migration_done, migration_phase, type MigrationPhase } from './migration/migrator';
import { Store } from './store';
import { v2_repos } from './v2/repos';
import { AccountDatabase } from './account_database';

/** The pre-1810 database file; its presence means the 1810 update still has to import it */
const LEGACY_1400_PATH = 'illusi-db-1400.sqlite3';

export namespace DatabaseBoot {
	let migration: LegacyMigration | null = null;
	let running: Promise<MigrationPhase> | null = null;
	let stop_requested = false;

	/**
	 * Opens the databases and picks the one the app uses: v2 once the 1810 migration finished (or on a fresh
	 * install), otherwise 1810 until the background migration swaps it out.
	 */
	export async function open(): Promise<boolean> {
		if (!V2.is_database_connected()) {
			V2.use_database_file(AccountDatabase.saved_file());
			V2.load_database();
		}
		if (!V2.is_database_connected()) return false;
		await migrate(V2.db, v2_migrations);
		Store.register('v2', v2_repos);

		// Only the default database descends from the 1810 one; other accounts start empty
		if (!V2.is_default_database()) {
			await mark_migration_done(V2.db);
			Store.set_mode('v2');
			return true;
		}
		if (await migration_phase(V2.db) === 'DONE') {
			Store.set_mode('v2');
			return true;
		}
		const has_legacy = await Legacy.legacy_database_exists() || await V2.database_file_exists(LEGACY_1400_PATH);
		if (!has_legacy) {
			// Nothing to migrate; mark it done so a later 1810 file (e.g. a restored backup) isn't picked up by accident
			await mark_migration_done(V2.db);
			Store.set_mode('v2');
			return true;
		}
		if (!Legacy.is_database_connected()) Legacy.load_database();
		if (!Legacy.is_database_connected()) return false;
		await migrate(Legacy.db, legacy_migrations).catch(catch_log);
		Store.register('legacy', legacy_repos);
		Store.set_mode('legacy');
		return true;
	}

	/**
	 * Points the app at another database file (created and migrated on first use) once its account is known.
	 * Writes wait while the connection changes; on failure the current database stays in use.
	 */
	export async function switch_database(file: string): Promise<boolean> {
		if (V2.db_path === file) return true;
		const release = await Store.pause_writes();
		const previous = { db: V2.db, file: V2.db_path };
		try {
			V2.use_database_file(file);
			const loaded = V2.load_database();
			if ('error' in loaded || V2.db === previous.db) throw new Error(`Unable to open ${file}`);
			await migrate(V2.db, v2_migrations);
			await mark_migration_done(V2.db);
			V2.close_database_of(previous.db);
			return true;
		} catch (error) {
			catch_log(error);
			if (V2.db !== previous.db) V2.close_database_of(V2.db);
			V2.use_database(previous.db);
			V2.use_database_file(previous.file);
			return false;
		} finally {
			release();
		}
	}

	export function migrating(): boolean {
		return Store.legacy();
	}

	export async function report() {
		return migration?.report();
	}

	/**
	 * Runs (or resumes) the 1810 -> v2 migration in the background. on_swapped runs once the app reads and writes
	 * v2. Closing the app mid-way is fine; the next call picks up where it stopped.
	 */
	export async function run_migration(on_swapped: () => Promise<void>): Promise<MigrationPhase> {
		if (!Store.legacy()) return 'DONE';
		if (running !== null) return running;
		stop_requested = false;
		migration = new LegacyMigration(Legacy.db, V2.db);
		running = migration.run({
			pause_writes: Store.pause_writes,
			swap: async () => { Store.set_mode('v2'); },
			should_stop: () => stop_requested
		}).then(async (phase) => {
			if (phase === 'DONE') await on_swapped();
			return phase;
		}).finally(() => { running = null; });
		return running;
	}

	/** Pauses the background migration after its current chunk (resumable) */
	export async function stop_migration() {
		stop_requested = true;
		await running?.catch(() => undefined);
	}
}
