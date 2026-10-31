import type { PromiseResult } from '@common/types';
import { catch_log, generror } from '@common/utils/error_util';
import { fs } from '@native/fs/fs';
import { Illusi } from '@origin/illusi/illusi';
import type { ExportJob, LoginBody, Me, RegisterBody, TokenPair } from '@origin/illusi/types';
import { Prefs } from '@illusive/prefs';

/** The Illusi account this device syncs with. The session is kept in prefs so it survives restarts. */
export namespace IllusiAccount {
	type Listener = (logged_in: boolean) => void;
	const listeners = new Set<Listener>();
	let configured = false;

	function parse_session(raw: string): TokenPair | null {
		if (raw === '') return null;
		try {
			const session = JSON.parse(raw) as Partial<TokenPair>;
			return typeof session.access_token === 'string' && typeof session.refresh_token === 'string' ? session as TokenPair : null;
		} catch {
			return null;
		}
	}

	function on_session_change(session: TokenPair | null) {
		Prefs.save_pref('illusi_session', session === null ? '' : JSON.stringify(session)).catch(catch_log);
		for (const listener of listeners) listener(session !== null);
	}

	/** Points the client at the configured server and restores the saved session. Prefs must be loaded. */
	export function configure() {
		const base_url = Prefs.get_pref('illusi_api_url');
		Illusi.configure({ base_url, on_session_change });
		if (!configured) {
			configured = true;
			const session = parse_session(Prefs.get_pref('illusi_session'));
			if (session !== null) Illusi.set_session(session);
		}
	}

	export function has_server(): boolean {
		return Prefs.get_pref('illusi_api_url').trim() !== '';
	}
	export function is_logged_in(): boolean {
		return Illusi.get_session() !== null;
	}

	/** Called with true on login and false on logout or when the server revokes the session */
	export function subscribe(listener: Listener): () => void {
		listeners.add(listener);
		return () => listeners.delete(listener);
	}

	export async function register(body: RegisterBody): PromiseResult<TokenPair> {
		configure();
		return Illusi.Auth.register(body);
	}
	export async function login(body: LoginBody): PromiseResult<TokenPair> {
		configure();
		return Illusi.Auth.login(body);
	}
	export async function logout() {
		const result = await Illusi.Auth.logout();
		// The local session is cleared even when the server can't be reached
		if (Illusi.get_session() !== null) Illusi.set_session(null);
		return result;
	}
	export async function me(): PromiseResult<Me> {
		return Illusi.User.me();
	}

	/**
	 * Deletes the account on the server; the password is asked again even with a valid session. On success this
	 * device is logged out (the sync engine goes idle) but keeps its local library.
	 */
	export async function delete_account(password: string): PromiseResult<null> {
		return Illusi.Account.delete_account(password);
	}

	function job_from_error(error: Illusi.IllusiError): ExportJob | undefined {
		const body = error.body as { export?: ExportJob } | undefined;
		return body?.export;
	}

	/**
	 * Starts a data export, or returns the one already running (or made too recently to start another); in that case
	 * retry_after_s says how long until a new one may be requested.
	 */
	export async function request_export(): PromiseResult<{ job: ExportJob; retry_after_s?: number }> {
		const result = await Illusi.Account.request_export();
		if (!Illusi.is_error(result)) return { job: result };
		const error = result as Illusi.IllusiError;
		const job = (error.status === 409 || error.status === 429) ? job_from_error(error) : undefined;
		if (job === undefined) return result;
		const retry_after_s = (error.body as { retry_after_s?: number } | undefined)?.retry_after_s;
		return { job, ...(retry_after_s === undefined ? {} : { retry_after_s }) };
	}

	export const EXPORT_DONE: readonly ExportJob['status'][] = ['READY', 'FAILED', 'EXPIRED'];
	/** Polls an export until it is ready, failed or expired, reporting each status; stop it with should_stop */
	export async function wait_for_export(export_id: string, opts: { interval_ms?: number; on_update?: (job: ExportJob) => void; should_stop?: () => boolean } = {}): PromiseResult<ExportJob> {
		const interval_ms = opts.interval_ms ?? 5000;
		while (true) {
			const job = await Illusi.Account.export_status(export_id);
			if (Illusi.is_error(job)) return job;
			opts.on_update?.(job);
			if (EXPORT_DONE.includes(job.status) || opts.should_stop?.()) return job;
			await new Promise(resolve => setTimeout(resolve, interval_ms));
		}
	}

	/** Saves a ready export (a gzipped JSON document) to to_path and returns the path */
	export async function download_export(export_id: string, to_path: string): PromiseResult<string> {
		// Checking the status first also refreshes an expired access token before the native download
		const job = await Illusi.Account.export_status(export_id);
		if (Illusi.is_error(job)) return job;
		if (job.status !== 'READY') return generror(`Export is ${job.status.toLowerCase()}`, 'LOW', { export_id });
		return fs().download_to_file(Illusi.Account.export_file_url(export_id), to_path, Illusi.file_headers());
	}
}
