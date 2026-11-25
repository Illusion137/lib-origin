import type { PromiseResult, ResponseError } from '@common/types';
import { catch_log, generror } from '@common/utils/error_util';
import { fs } from '@native/fs/fs';
import { Illusi } from '@origin/illusi/illusi';
import type { ArtworkFile, AuthMe, AvatarResult, ChangeEmailResult, ExportJob, LoginBody, Me, RegisterBody, ResetPasswordBody, SessionResponse, TokenPair, UserSettings } from '@origin/illusi/types';
import { Prefs } from '@illusive/prefs';
import { db } from '@illusive/db/database';
import { report_downloads } from './push';

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
		if (session === null) current_account = null;
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

	/** The server knows downloads per login, so a fresh one starts by hearing what this device has */
	async function logged_in(result: SessionResponse | ResponseError) {
		if (!Illusi.is_error(result)) {
			current_account = null;
			email_verified = result.email_verified ?? null;
			await report_downloads(db).catch(catch_log);
		}
		return result;
	}
	export async function register(body: RegisterBody): PromiseResult<SessionResponse> {
		configure();
		return logged_in(await Illusi.Auth.register(body));
	}
	export async function login(body: LoginBody): PromiseResult<SessionResponse> {
		configure();
		return logged_in(await Illusi.Auth.login(body));
	}

	function pending_logouts(): string[] {
		try {
			const parsed: unknown = JSON.parse(Prefs.get_pref('illusi_pending_logouts') || '[]');
			return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === 'string') : [];
		} catch {
			return [];
		}
	}
	async function save_pending_logouts(tokens: string[]) {
		await Prefs.save_pref('illusi_pending_logouts', tokens.length === 0 ? '' : JSON.stringify(tokens.slice(-20)));
	}
	/** A logout that never reached the server leaves that login alive there; it's ended once the server is reachable */
	function is_unreached(result: unknown): boolean {
		if (!Illusi.is_error(result)) return false;
		const status = (result as Illusi.IllusiError).status;
		return status === undefined || status === 429 || status >= 500;
	}
	export async function flush_pending_logouts() {
		const tokens = pending_logouts();
		if (tokens.length === 0) return;
		const left: string[] = [];
		for (const token of tokens) if (is_unreached(await Illusi.Auth.logout_token(token))) left.push(token);
		await save_pending_logouts(left);
	}

	/** Signs this device out. The local session is cleared at once; the server is told now, or on a later sync if offline. */
	export async function logout() {
		const refresh_token = Illusi.get_session()?.refresh_token;
		email_verified = null;
		const result = await Illusi.Auth.logout();
		if (refresh_token !== undefined && is_unreached(result)) await save_pending_logouts([...pending_logouts(), refresh_token]).catch(catch_log);
		return result;
	}
	export async function me(): PromiseResult<Me> {
		return Illusi.User.me();
	}

	/** Null until known. The server refuses everything but /auth until the address is confirmed. */
	let email_verified: boolean | null = null;
	let current_account: AuthMe | null = null;
	export function is_email_verified(): boolean | null {
		return email_verified;
	}
	/** Works before the email is confirmed; refreshes is_email_verified() */
	export async function account(): PromiseResult<AuthMe> {
		const result = await Illusi.Auth.me();
		if (!Illusi.is_error(result)) {
			email_verified = result.email_verified;
			current_account = result;
		}
		return result;
	}
	/** The logged in account, fetched once per login; null when logged out or unreachable */
	export async function cached_account(): Promise<AuthMe | null> {
		if (!is_logged_in()) return null;
		if (current_account !== null) return current_account;
		const result = await account();
		return Illusi.is_error(result) ? null : result;
	}
	export async function resend_verification(): PromiseResult<null> {
		return Illusi.Auth.resend_verification();
	}
	export async function forgot_password(email: string): PromiseResult<null> {
		configure();
		return Illusi.Auth.forgot_password(email.trim());
	}
	/** Sets the new password with the emailed code and signs this device in */
	export async function reset_password(body: ResetPasswordBody): PromiseResult<SessionResponse> {
		configure();
		return logged_in(await Illusi.Auth.reset_password({ ...body, email: body.email.trim() }));
	}
	export async function change_password(current_password: string, new_password: string): PromiseResult<null> {
		return Illusi.Auth.change_password(current_password, new_password);
	}
	export async function change_email(password: string, email: string): PromiseResult<ChangeEmailResult> {
		return Illusi.Auth.change_email(password, email.trim());
	}

	/**
	 * Deletes the account on the server; the password is asked again even with a valid session. On success this
	 * device is logged out (the sync engine goes idle) but keeps its local library.
	 */
	export async function delete_account(password: string): PromiseResult<null> {
		return Illusi.Account.delete_account(password);
	}

	/** JPEG, PNG or WebP up to 10 MB; replaces the current avatar */
	export async function set_avatar(file: ArtworkFile): PromiseResult<AvatarResult> {
		return Illusi.Account.set_avatar(file);
	}
	export async function remove_avatar(): PromiseResult<AvatarResult> {
		return Illusi.Account.remove_avatar();
	}
	/** Whether other users can see the tracks this account imported, on its profile */
	export async function set_public_imports(public_imports: boolean): PromiseResult<UserSettings> {
		return Illusi.Account.update_settings({ public_imports });
	}
	/** An image source for an avatar (expo-image and the like); the id changes with every new avatar, so it caches forever */
	export function avatar_source(avatar_id: string): { uri: string; headers: Record<string, string> } {
		return { uri: Illusi.Account.avatar_url(avatar_id), headers: Illusi.file_headers() };
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
