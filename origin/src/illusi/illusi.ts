import rozfetch, { type RoZFetchRequestInit } from '@common/rozfetch';
import { fs, load_native_fs } from '@native/fs/fs';
import type { PromiseResult, ResponseError } from '@common/types';
import type { ErrorSeverity } from '@common/utils/error_util';
import { generror } from '@common/utils/error_util';
import { encode_params } from '@common/utils/fetch_util';
import type {
	Action, ActionOf, ActionType, AlbumDetail, AlbumView, ApiErrorBody, ArtistAlbumsQuery, ArtistTracksQuery, ArtistView, ArtworkFile,
	ArtworkResult, AuthMe, AvatarResult, BackpackRequestsQuery, ChangeEmailBody, ChangeEmailResult, ChangePasswordBody, ContributionGraph, ContributionPayload, ContributionResult, CopiedPlaylist, Cursor, DeleteAccountBody,
	CatalogIngestBody, CatalogIngestResult, CatalogItem, EntityPatchBody, EntityPatchResult, ExportJob, ForgotPasswordBody, GeniusIngestBody, LogoutBody, ResetPasswordBody, SessionResponse, IllusiId, IngestAccepted, LibraryQuery, LinkedPlaylist, LoginBody, LyricsResponse, Me, MediaFile,
	MediaRequestsQuery, MediaUploadOpts, MediaUploadResult, MyPlaylistsQuery, NewReleases, NewReleasesIngestBody, NewReleasesIngestResult,
	NewReleasesQuery, Page, PageQuery, PlaylistView, PlayView, PublicPlaylistsQuery, PullBody, PullResponse, PushBody, PushChanges,
	PushResponse, RecentSearch, RefreshBody, RegisterBody, ReleaseService, ResearchService, ResolveBody, ResolveItem, ResolveResponse,
	ReviewApplyBody, ReviewApplyResult, ReviewDismissResult, ReviewList, ReviewListQuery, SearchQuery, SearchResponse, SearchSuggestions,
	SearchSuggestionsQuery, SearchType,
	SharedEntityTable, SimilarQuery, SoundCloudIngestBody, SoundCloudIngestItem, TempRef, TokenPair, TrackBatchBody, TrackBatchResponse,
	TrackAlignment, TrackResearchBody, TrackResearchResult, TrackView, TrackVocals, UnavailableReportBody, UnavailableReportResult, DurationReportBody, DurationReportResult, UserLyricsBody, UUID, YouTubeMusicLyricsIngestBody,
	YouTubeMusicLyricsPayload
} from '@origin/illusi/types';
import type { LyricsPreloadedState } from '@origin/genius/types/Lyrics';

export namespace Illusi {
	export const API_PREFIX = '/api/v1';

	export type Session = TokenPair;
	export interface Config {
		/** Server origin, e.g. https://api.example.com; API_PREFIX is added automatically */
		base_url: string;
		headers?: Record<string, string>;
		fetch_opts?: RoZFetchRequestInit;
		/** Called whenever tokens are issued, rotated, or cleared, so the app can persist them */
		on_session_change?: (session: Session | null) => void;
	}
	/** body is the server's JSON error body, e.g. the running export on a 409 */
	export type IllusiError = ResponseError & { status?: number; code?: string; issues?: unknown; body?: unknown };

	let config: Config = { base_url: '' };
	let session: Session | null = null;

	export function configure(opts: Partial<Config>) {
		const base_url = (opts.base_url ?? config.base_url).replace(/\/+$/, '');
		config = { ...config, ...opts, base_url: base_url.endsWith(API_PREFIX) ? base_url.slice(0, -API_PREFIX.length) : base_url };
	}
	export function set_session(new_session: Session | null) {
		session = new_session;
		config.on_session_change?.(new_session);
	}
	export function get_session(): Session | null {
		return session;
	}
	export function is_error<T>(result: T | ResponseError): result is ResponseError {
		return typeof result === 'object' && result !== null && 'error' in result && result.error instanceof Error;
	}
	function api_url(path: string): string {
		return `${config.base_url}${API_PREFIX}${path}`;
	}

	export interface Routes {
		'POST /auth/register': { body: RegisterBody; response: SessionResponse };
		'POST /auth/login': { body: LoginBody; response: SessionResponse };
		'POST /auth/refresh': { body: RefreshBody; response: TokenPair };
		'POST /auth/logout': { body: LogoutBody; response: null };
		'POST /auth/logout_all': { response: null };
		'GET /auth/me': { response: AuthMe };
		'POST /auth/resend_verification': { response: null };
		'POST /auth/forgot_password': { body: ForgotPasswordBody; response: null };
		'POST /auth/reset_password': { body: ResetPasswordBody; response: SessionResponse };
		'POST /auth/change_password': { body: ChangePasswordBody; response: null };
		'POST /auth/change_email': { body: ChangeEmailBody; response: ChangeEmailResult };

		'GET /me': { response: Me };
		'GET /me/library': { query: LibraryQuery; response: Page<TrackView> };
		'GET /me/playlists': { query: MyPlaylistsQuery; response: { items: PlaylistView[] } };
		'GET /me/plays': { query: PageQuery; response: Page<PlayView> };
		'GET /me/recent_searches': { query: { limit?: number }; response: { items: RecentSearch[] } };
		'GET /me/linked_playlists': { response: { items: LinkedPlaylist[] } };
		'DELETE /me': { body: DeleteAccountBody; response: null };
		'POST /me/export': { response: ExportJob };
		'GET /me/exports': { response: { items: ExportJob[] } };
		'GET /me/export/:id': { response: ExportJob };
		'PUT /me/avatar': { body: FormData; response: AvatarResult };
		'DELETE /me/avatar': { response: AvatarResult };

		'GET /playlists/public': { query: PublicPlaylistsQuery; response: Page<PlaylistView> };
		'GET /playlists/:id': { response: PlaylistView };
		'GET /playlists/:id/tracks': { query: PageQuery; response: Page<TrackView> };
		'POST /playlists/:id/copy': { response: CopiedPlaylist };
		'GET /users/:id/playlists': { query: PageQuery; response: Page<PlaylistView> };
		'PUT /playlists/:id/artwork': { body: FormData; response: ArtworkResult };
		'DELETE /playlists/:id/artwork': { query: { edited_at?: string }; response: ArtworkResult };

		'GET /tracks/:id': { response: TrackView };
		'POST /tracks/batch': { body: TrackBatchBody; response: TrackBatchResponse };
		'GET /tracks/:id/similar': { query: SimilarQuery; response: { items: TrackView[] } };
		'GET /tracks/:id/lyrics': { response: LyricsResponse };
		'PUT /tracks/:id/lyrics/user': { body: UserLyricsBody; response: LyricsResponse };
		'GET /tracks/:id/vocals': { response: TrackVocals };
		'GET /tracks/:id/alignment': { response: TrackAlignment };
		'GET /albums/:id': { response: AlbumDetail };
		'GET /artists/:id': { response: ArtistView };
		'GET /artists/:id/albums': { query: ArtistAlbumsQuery; response: Page<AlbumView> };
		'GET /artists/:id/tracks': { query: ArtistTracksQuery; response: Page<TrackView> };
		'GET /artists/:id/similar': { query: SimilarQuery; response: { items: ArtistView[] } };

		'GET /search': { query: SearchQuery; response: SearchResponse };
		'GET /search/suggestions': { query: SearchSuggestionsQuery; response: SearchSuggestions };

		'GET /new-releases': { query: Pick<NewReleasesQuery, 'limit'>; response: NewReleases };
		'GET /new-releases/me': { query: NewReleasesQuery; response: NewReleases };

		'POST /ingest/soundcloud': { body: SoundCloudIngestBody; response: IngestAccepted };
		'POST /ingest/service': { body: CatalogIngestBody; response: CatalogIngestResult };
		'POST /ingest/genius': { body: GeniusIngestBody; response: LyricsResponse };
		'POST /ingest/youtube_music_lyrics': { body: YouTubeMusicLyricsIngestBody; response: LyricsResponse };
		'POST /ingest/new_releases': { body: NewReleasesIngestBody; response: NewReleasesIngestResult };
		'POST /ingest/track_research': { body: TrackResearchBody; response: TrackResearchResult };

		'POST /contribute': { body: ContributionPayload; response: ContributionResult };
		'POST /resolve': { body: ResolveBody; response: ResolveResponse };

		'POST /sync/pull': { body: PullBody; response: PullResponse };
		'POST /sync/push': { body: PushBody; response: PushResponse };

		'POST /tracks/:id/media': { body: FormData; response: MediaUploadResult };
		'GET /media/requests': { query: MediaRequestsQuery; response: { actions: ActionOf<'UPLOAD_MEDIA'>[]; next_cursor: IllusiId | null } };

		'POST /tracks/:id/unavailable': { body: UnavailableReportBody; response: UnavailableReportResult };
		'POST /tracks/:id/duration': { body: DurationReportBody; response: DurationReportResult };
		'GET /backpack/requests': { query: BackpackRequestsQuery; response: { actions: ActionOf<'RESEARCH_TRACK'>[] } };

		'GET /admin/review': { query: ReviewListQuery; response: ReviewList };
		'POST /admin/review/:id/apply': { body: ReviewApplyBody; response: ReviewApplyResult };
		'POST /admin/review/:id/dismiss': { response: ReviewDismissResult };
		'PATCH /admin/entities/:table/:id': { body: EntityPatchBody; response: EntityPatchResult };
	}
	export type Route = keyof Routes;

	/** Sent without an access token. Logout names its login by refresh token, so it works after logging out offline. */
	const PUBLIC_ROUTES = new Set<Route>(['POST /auth/register', 'POST /auth/login', 'POST /auth/refresh', 'POST /auth/logout', 'POST /auth/forgot_password', 'POST /auth/reset_password']);

	type RoutePath<R extends string> = R extends `${string} ${infer P}` ? P : never;
	type PathParamNames<P extends string> = P extends `${string}:${infer Param}/${infer Rest}`
		? Param | PathParamNames<Rest>
		: P extends `${string}:${infer Param}` ? Param : never;
	type ParamsPart<R extends Route> = [PathParamNames<RoutePath<R>>] extends [never] ? {} : { params: Record<PathParamNames<RoutePath<R>>, string> };
	type BodyPart<S> = S extends { body: infer B } ? { body: B } : {};
	type QueryPart<S> = S extends { query: infer Q } ? {} extends Q ? { query?: Q } : { query: Q } : {};
	export type RouteInput<R extends Route> = ParamsPart<R> & BodyPart<Routes[R]> & QueryPart<Routes[R]>;
	export type RouteResponse<R extends Route> = Routes[R]['response'];
	type OptionalIfEmpty<T> = {} extends T ? [input?: T] : [input: T];

	interface AnyInput {
		params?: Record<string, string>;
		body?: unknown;
		query?: object;
		headers?: Record<string, string>;
	}

	function api_error(route: string, message: string, severity: ErrorSeverity, status?: number, extra: { code?: string; issues?: unknown; body?: unknown } = {}): IllusiError {
		return { ...generror(`Illusi ${route} failed${status === undefined ? '' : ` (${status})`}: ${message}`, severity, { route, status, code: extra.code, issues: extra.issues }), status, ...extra };
	}

	function fill_path(path: string, params: Record<string, string>): string {
		return path.replace(/:(\w+)/g, (_, name: string) => encodeURIComponent(params[name] ?? ''));
	}

	function query_string(query: object | undefined): string {
		if (query === undefined) return '';
		const clean: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(query)) if (value !== undefined && value !== null) clean[key] = value;
		return Object.keys(clean).length === 0 ? '' : `?${encode_params(clean)}`;
	}

	function auth_headers(): Record<string, string> {
		return session === null ? {} : { Authorization: `Bearer ${session.access_token}` };
	}
	/** Headers for fetching authenticated files (media, artwork, exports) with a native player or downloader */
	export function file_headers(): Record<string, string> {
		return { ...config.headers, ...auth_headers() };
	}

	async function error_from_response(route: string, response: Response & { json: () => PromiseResult<unknown> }): Promise<IllusiError> {
		const body = await response.json();
		const api_body = typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string' ? body as ApiErrorBody : undefined;
		return api_error(route, api_body?.error ?? response.statusText, response.status === 404 ? 'INFO' : 'LOW', response.status, { code: api_body?.code, issues: api_body?.issues, body: api_body });
	}

	/** A { uri, name, type } file goes in as a Blob read from disk: the global fetch may only take Blob parts */
	async function append_file(form: FormData, file: MediaFile) {
		if (!('uri' in file)) {
			form.append('file', file);
			return;
		}
		await load_native_fs();
		form.append('file', await fs().file_blob(file.uri, file.type), file.name);
	}

	let refreshing: Promise<boolean> | null = null;
	/** Rotates the refresh token (single-flight). Clears the session only if the server rejected it. */
	export async function refresh_session(): Promise<boolean> {
		const current = session;
		if (current === null) return false;
		refreshing ??= (async () => {
			const result = await request('POST /auth/refresh', { body: { refresh_token: current.refresh_token } }, false);
			if (is_error(result)) {
				const status = (result as IllusiError).status;
				if (status === 401 || status === 403) set_session(null);
				return false;
			}
			set_session(result as TokenPair);
			return true;
		})().finally(() => { refreshing = null; });
		return refreshing;
	}

	type RawResponse = Response & { json: () => PromiseResult<unknown> };
	/** Sends a request, refreshing the session once on a 401; the caller reads the response */
	async function send(route: Route, input: AnyInput, extra_headers: Record<string, string> = {}, retry_on_401 = true): PromiseResult<RawResponse> {
		const space = route.indexOf(' ');
		const method = route.slice(0, space);
		const path = fill_path(route.slice(space + 1), input.params ?? {});
		const is_public = PUBLIC_ROUTES.has(route);
		if (!is_public && session === null) return api_error(route, 'not logged in', 'LOW', 401);

		const multipart = typeof FormData !== 'undefined' && input.body instanceof FormData;
		const headers: Record<string, string> = {
			Accept: 'application/json',
			...config.headers,
			...(input.body !== undefined && !multipart ? { 'Content-Type': 'application/json' } : {}),
			...(is_public ? {} : auth_headers()),
			...input.headers,
			...extra_headers
		};
		const response = await rozfetch<unknown>(`${api_url(path)}${query_string(input.query)}`, {
			...config.fetch_opts,
			method,
			headers,
			body: input.body === undefined ? undefined : multipart ? input.body as FormData : JSON.stringify(input.body),
			ignore_fail_request: true
		});
		if ('error' in response) return response;
		if (response.status === 401 && !is_public && retry_on_401 && await refresh_session()) return send(route, input, extra_headers, false);
		return response;
	}

	async function request(route: Route, input: AnyInput, retry_on_401 = true): PromiseResult<unknown> {
		const response = await send(route, input, {}, retry_on_401);
		if ('error' in response) return response;
		if (!response.ok) return error_from_response(route, response);
		if (response.status === 204) return null;
		return response.json();
	}

	const ETAG_CACHE_MAX = 200;
	const etag_cache = new Map<string, { etag: string; body: unknown }>();
	/** A GET that revalidates with If-None-Match, so an unchanged answer costs the server a 304 and no body */
	async function conditional<R extends Route>(route: R, input: AnyInput): PromiseResult<RouteResponse<R>> {
		const key = `${route} ${JSON.stringify(input)}`;
		const cached = etag_cache.get(key);
		const response = await send(route, input, cached === undefined ? {} : { 'If-None-Match': cached.etag });
		if ('error' in response) return response;
		if (response.status === 304 && cached !== undefined) {
			etag_cache.delete(key);
			etag_cache.set(key, cached);
			return cached.body as RouteResponse<R>;
		}
		if (!response.ok) return error_from_response(route, response);
		const body = await response.json();
		if (is_error(body)) return body;
		const etag = response.headers.get('etag');
		if (etag !== null) {
			etag_cache.delete(key);
			etag_cache.set(key, { etag, body });
			if (etag_cache.size > ETAG_CACHE_MAX) etag_cache.delete(etag_cache.keys().next().value!);
		}
		return body as RouteResponse<R>;
	}

	/** Downloads an authenticated binary file, refreshing the session once on a 401 */
	async function download_file(route: string, url: string, extra_headers: Record<string, string> = {}, retry_on_401 = true): PromiseResult<ArrayBuffer> {
		if (session === null) return api_error(route, 'not logged in', 'LOW', 401);
		const response = await rozfetch<unknown>(url, { ...config.fetch_opts, method: 'GET', headers: { ...file_headers(), ...extra_headers }, ignore_fail_request: true });
		if ('error' in response) return response;
		if (response.status === 401 && retry_on_401 && await refresh_session()) return download_file(route, url, extra_headers, false);
		if (!response.ok) return error_from_response(route, response);
		return response.arrayBuffer();
	}

	/** Calls any endpoint with compile-time checked params, body, query, and response */
	export async function call<R extends Route>(route: R, ...args: OptionalIfEmpty<RouteInput<R>>): PromiseResult<RouteResponse<R>> {
		return request(route, (args[0] ?? {}) as AnyInput) as PromiseResult<RouteResponse<R>>;
	}

	/** Follows next_cursor until the last page, handing each page's items to on_items in order */
	export async function paginate<T>(fetch_page: (cursor: Cursor | undefined) => PromiseResult<Page<T>>, on_items: (items: T[]) => unknown): PromiseResult<number> {
		let cursor: Cursor | undefined;
		let total = 0;
		while (true) {
			const page = await fetch_page(cursor);
			if (is_error(page)) return page;
			total += page.items.length;
			await on_items(page.items);
			if (page.next_cursor === null) return total;
			cursor = page.next_cursor;
		}
	}

	export function uuid_v4(): UUID {
		const native = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto?.randomUUID;
		if (native !== undefined) return native.call((globalThis as { crypto?: object }).crypto);
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
			const random = Math.floor(Math.random() * 16);
			return (char === 'x' ? random : (random & 0x3) | 0x8).toString(16);
		});
	}

	export type ActionHandlers = { [T in ActionType]?: (action: ActionOf<T>) => unknown };
	/** Dispatches each action to its typed handler. Unknown or unhandled actions are ignored. */
	export async function handle_actions(actions: Action[] | undefined, handlers: ActionHandlers): Promise<void> {
		for (const action of actions ?? []) {
			const handler = handlers[action.type] as ((action: Action) => unknown) | undefined;
			if (handler !== undefined) await handler(action);
		}
	}

	export namespace Auth {
		async function with_session<T extends TokenPair>(result: T | ResponseError) {
			if (!is_error(result)) set_session({ access_token: result.access_token, refresh_token: result.refresh_token });
			return result;
		}
		export async function register(body: RegisterBody) {
			return with_session(await call('POST /auth/register', { body }));
		}
		export async function login(body: LoginBody) {
			return with_session(await call('POST /auth/login', { body }));
		}
		/**
		 * Ends this login on the server and clears the local session either way. If the server couldn't be reached, the
		 * error carries no status: keep the refresh token and call logout_token with it later.
		 */
		export async function logout() {
			const current = session;
			if (current === null) return null;
			set_session(null);
			return logout_token(current.refresh_token);
		}
		/** Ends the login a refresh token belongs to, without needing a session */
		export async function logout_token(refresh_token: string) {
			return call('POST /auth/logout', { body: { refresh_token } });
		}
		export async function logout_all() {
			const result = await call('POST /auth/logout_all');
			set_session(null);
			return result;
		}
		/** Works before the email is confirmed */
		export async function me() {
			return call('GET /auth/me');
		}
		export async function resend_verification() {
			return call('POST /auth/resend_verification');
		}
		/** Emails a 6-digit code if the address has an account (the answer is the same either way) */
		export async function forgot_password(email: string) {
			return call('POST /auth/forgot_password', { body: { email } });
		}
		/** Sets the new password with the emailed code and signs this device in (every other login is ended) */
		export async function reset_password(body: ResetPasswordBody) {
			return with_session(await call('POST /auth/reset_password', { body }));
		}
		/** Every other login is ended; this one stays */
		export async function change_password(current_password: string, new_password: string) {
			return call('POST /auth/change_password', { body: { current_password, new_password } });
		}
		/** The new address gets a confirmation link and replaces the old one once it's followed */
		export async function change_email(password: string, email: string) {
			return call('POST /auth/change_email', { body: { password, email } });
		}
	}

	export namespace User {
		export async function me() {
			return call('GET /me');
		}
		export async function library(query: LibraryQuery = {}) {
			return call('GET /me/library', { query });
		}
		export async function playlists(query: MyPlaylistsQuery = {}) {
			return call('GET /me/playlists', { query });
		}
		export async function plays(query: PageQuery = {}) {
			return call('GET /me/plays', { query });
		}
		export async function recent_searches(limit?: number) {
			return call('GET /me/recent_searches', { query: { limit } });
		}
		export async function linked_playlists() {
			return call('GET /me/linked_playlists');
		}
	}

	export namespace Playlists {
		export async function get(playlist_id: UUID) {
			return call('GET /playlists/:id', { params: { id: playlist_id } });
		}
		/** The resolved track list, inheritance included, in the playlist's sort_mode */
		export async function tracks(playlist_id: UUID, query: PageQuery = {}) {
			return call('GET /playlists/:id/tracks', { params: { id: playlist_id }, query });
		}
		export async function all_tracks(playlist_id: UUID, on_items: (items: TrackView[]) => unknown) {
			return paginate(async cursor => tracks(playlist_id, { cursor, limit: 200 }), on_items);
		}
		export async function public_list(query: PublicPlaylistsQuery = {}) {
			return call('GET /playlists/public', { query });
		}
		export async function of_user(user_id: UUID, query: PageQuery = {}) {
			return call('GET /users/:id/playlists', { params: { id: user_id }, query });
		}
		export async function copy(playlist_id: UUID) {
			return call('POST /playlists/:id/copy', { params: { id: playlist_id } });
		}
		/** JPEG, PNG or WebP up to 10 MB; edited_at is when the change was made on this device */
		export async function set_artwork(playlist_id: UUID, file: ArtworkFile, edited_at?: Date) {
			const form = new FormData();
			await append_file(form, file);
			if (edited_at !== undefined) form.append('edited_at', edited_at.toISOString());
			return call('PUT /playlists/:id/artwork', { params: { id: playlist_id }, body: form });
		}
		export async function remove_artwork(playlist_id: UUID, edited_at?: Date) {
			return call('DELETE /playlists/:id/artwork', { params: { id: playlist_id }, query: { edited_at: edited_at?.toISOString() } });
		}
		/** Needs file_headers(); artwork files never change, so a downloaded copy can be kept forever */
		export function artwork_url(artwork_id: string): string {
			return api_url(`/artwork/${encodeURIComponent(artwork_id)}`);
		}
		export async function download_artwork(artwork_id: string) {
			return download_file('GET /artwork/:artwork_id', artwork_url(artwork_id));
		}
	}

	export namespace Account {
		/** A 409 (already running) or 429 (cooldown) error carries the existing job in body.export */
		export async function request_export() {
			return call('POST /me/export');
		}
		export async function exports() {
			return call('GET /me/exports');
		}
		export async function export_status(export_id: UUID) {
			return call('GET /me/export/:id', { params: { id: export_id } });
		}
		/** Needs file_headers(); a gzipped JSON document */
		export function export_file_url(export_id: UUID): string {
			return api_url(`/me/export/${encodeURIComponent(export_id)}/file`);
		}
		export async function download_export(export_id: UUID) {
			return download_file('GET /me/export/:id/file', export_file_url(export_id));
		}
		/** JPEG, PNG or WebP up to 10 MB, stored as a WebP of at most 512 px a side; replaces the current avatar */
		export async function set_avatar(file: ArtworkFile) {
			const form = new FormData();
			await append_file(form, file);
			return call('PUT /me/avatar', { body: form });
		}
		export async function remove_avatar() {
			return call('DELETE /me/avatar');
		}
		/**
		 * Needs file_headers(); avatar files never change (a new avatar gets a new id), so a downloaded copy can be kept
		 * forever. Others' avatars are visible where they are: next to a playlist of theirs.
		 */
		export function avatar_url(avatar_id: string): string {
			return api_url(`/avatars/${encodeURIComponent(avatar_id)}`);
		}
		export async function download_avatar(avatar_id: string) {
			return download_file('GET /avatars/:avatar_id', avatar_url(avatar_id));
		}
		/** Asks for the password again even with a valid session; the local session is cleared on success */
		export async function delete_account(password: string) {
			const result = await call('DELETE /me', { body: { password } });
			if (!is_error(result)) set_session(null);
			return result;
		}
	}

	export namespace Tracks {
		export async function get(track_id: IllusiId) {
			return call('GET /tracks/:id', { params: { id: track_id } });
		}
		export async function batch(ids: IllusiId[]) {
			return call('POST /tracks/batch', { body: { ids } });
		}
		export async function similar(track_id: IllusiId, limit?: number) {
			return call('GET /tracks/:id/similar', { params: { id: track_id }, query: { limit } });
		}
		export async function lyrics(track_id: IllusiId) {
			return call('GET /tracks/:id/lyrics', { params: { id: track_id } });
		}
		/** Stores the user's edit as their one version of the track's lyrics, ranked with the rest */
		export async function user_lyrics(track_id: IllusiId, body: UserLyricsBody) {
			return call('PUT /tracks/:id/lyrics/user', { params: { id: track_id }, body });
		}
		/** 404 until the track has uploaded media that the analyzer has processed. */
		export async function vocals(track_id: IllusiId) {
			return call('GET /tracks/:id/vocals', { params: { id: track_id } });
		}
		/**
		 * 404 until the analyzer has separated the track's vocals; asking while a user plays a track whose lyrics are all
		 * unsynced is what queues that analysis.
		 */
		export async function alignment(track_id: IllusiId) {
			return call('GET /tracks/:id/alignment', { params: { id: track_id } });
		}
	}

	export namespace Albums {
		export async function get(album_id: IllusiId) {
			return call('GET /albums/:id', { params: { id: album_id } });
		}
	}

	export namespace Artists {
		export async function get(artist_id: IllusiId) {
			return call('GET /artists/:id', { params: { id: artist_id } });
		}
		export async function albums(artist_id: IllusiId, query: ArtistAlbumsQuery = {}) {
			return call('GET /artists/:id/albums', { params: { id: artist_id }, query });
		}
		export async function tracks(artist_id: IllusiId, query: ArtistTracksQuery = {}) {
			return call('GET /artists/:id/tracks', { params: { id: artist_id }, query });
		}
		export async function similar(artist_id: IllusiId, limit?: number) {
			return call('GET /artists/:id/similar', { params: { id: artist_id }, query: { limit } });
		}
	}

	export interface SearchOpts extends Omit<SearchQuery, 'q' | 'types'> { types?: SearchType[] }
	export async function search(q: string, opts: SearchOpts = {}) {
		const { types, ...rest } = opts;
		return call('GET /search', { query: { ...rest, q, types: types?.join(',') } });
	}
	/** Close tracks, artists, albums and text completions; cheap enough to call per keystroke */
	export async function search_suggestions(q: string, limit?: number) {
		return conditional('GET /search/suggestions', { query: { q, limit } });
	}

	export namespace NewReleasesApi {
		export async function all(limit?: number) {
			return call('GET /new-releases', { query: { limit } });
		}
		/** Each named service adds FETCH_NEW_RELEASES actions for library artists due a check */
		export async function mine(services: ReleaseService[] = [], limit?: number) {
			return call('GET /new-releases/me', { query: { limit, services: services.length === 0 ? undefined : services.join(',') } });
		}
	}

	export namespace Ingest {
		export async function soundcloud(items: SoundCloudIngestItem[]) {
			return call('POST /ingest/soundcloud', { body: { items } });
		}
		export async function service(items: CatalogItem[]) {
			return call('POST /ingest/service', { body: { items } });
		}
		export async function genius(action: ActionOf<'CHECK_GENIUS'>, preloaded_state: LyricsPreloadedState) {
			return call('POST /ingest/genius', { body: { token: action.token, track_id: action.track_id, preloaded_state } });
		}
		/** A page found without being asked; the server still matches it against the track */
		export async function genius_found(track_id: IllusiId, preloaded_state: LyricsPreloadedState) {
			return call('POST /ingest/genius', { body: { track_id, preloaded_state } });
		}
		export async function genius_not_found(action: ActionOf<'CHECK_GENIUS'>) {
			return call('POST /ingest/genius', { body: { token: action.token, track_id: action.track_id, result: 'NOT_FOUND' } });
		}
		/** lyrics is sent exactly as YouTube Music returned it */
		export async function youtube_music_lyrics(action: ActionOf<'CHECK_YOUTUBE_MUSIC'>, lyrics: YouTubeMusicLyricsPayload, youtube_id?: string) {
			return call('POST /ingest/youtube_music_lyrics', { body: { token: action.token, track_id: action.track_id, youtube_id: youtube_id ?? action.youtube_id, lyrics } });
		}
		export async function youtube_music_not_found(action: ActionOf<'CHECK_YOUTUBE_MUSIC'>) {
			return call('POST /ingest/youtube_music_lyrics', { body: { token: action.token, track_id: action.track_id, result: 'NOT_FOUND' } });
		}
		/** An empty submission records that the artist had nothing new */
		export async function new_releases(action: ActionOf<'FETCH_NEW_RELEASES'>, found: { releases?: ContributionGraph; soundcloud_items?: SoundCloudIngestItem[]; contribution_id?: UUID } = {}) {
			return call('POST /ingest/new_releases', { body: { token: action.token, artist_id: action.artist_id, service: action.service, ...found } });
		}
		/** service_id may be an id or a link on action.service */
		export async function track_research(action: ActionOf<'RESEARCH_TRACK'>, service_id: string) {
			return call('POST /ingest/track_research', { body: { token: action.token, track_id: action.track_id, service: action.service, service_id } });
		}
		export async function track_research_not_found(action: ActionOf<'RESEARCH_TRACK'>) {
			return call('POST /ingest/track_research', { body: { token: action.token, track_id: action.track_id, service: action.service, result: 'NOT_FOUND' } });
		}
	}

	export namespace Backpack {
		/** Call when a track can't be played or downloaded from service */
		export async function report(track_id: IllusiId, service: ResearchService, reason?: string) {
			return call('POST /tracks/:id/unavailable', { params: { id: track_id }, body: { service, reason } });
		}
		export async function requests(limit?: number) {
			return call('GET /backpack/requests', { query: { limit } });
		}
	}

	export namespace Durations {
		/** Call with a track's measured length; the server fills, confirms or (once users agree) corrects its duration */
		export async function report(track_id: IllusiId, body: DurationReportBody) {
			return call('POST /tracks/:id/duration', { params: { id: track_id }, body });
		}
	}

	/** Pass a stable contribution_id when retrying so the server applies it once */
	export async function contribute(graph: ContributionGraph, contribution_id: UUID = uuid_v4()) {
		return call('POST /contribute', { body: { ...graph, contribution_id } });
	}
	export async function resolve(items: ResolveItem[]) {
		return call('POST /resolve', { body: { items } });
	}

	export namespace Sync {
		export async function pull(cursor?: Cursor | null) {
			return call('POST /sync/pull', { body: { cursor } });
		}
		/** Pulls every page, handing each to on_page in order. Returns the cursor to store for the next sync. */
		export async function pull_all(cursor: Cursor | null | undefined, on_page: (page: PullResponse) => unknown): PromiseResult<Cursor> {
			let current = cursor;
			while (true) {
				const page = await pull(current);
				if (is_error(page)) return page;
				await on_page(page);
				current = page.next_cursor;
				if (!page.has_more) return page.next_cursor;
			}
		}
		/** Pass a stable push_id when retrying so the server applies it once. client_now is read at send time, retries included. */
		export async function push(changes: PushChanges, base_cursor: Cursor | null, push_id: UUID = uuid_v4()) {
			return call('POST /sync/push', { body: { push_id, base_cursor, client_now: Date.now(), changes } });
		}
		export interface ImportChunk {
			push_id: UUID;
			changes: PushChanges;
		}
		/** Sends chunks in order; save the returned id map before relying on temp refs from earlier chunks */
		export async function import_chunks(chunks: ImportChunk[], base_cursor: Cursor | null, on_chunk: (index: number, result: PushResponse) => unknown): PromiseResult<Record<TempRef, IllusiId>> {
			const id_map: Record<TempRef, IllusiId> = {};
			for (let i = 0; i < chunks.length; i++) {
				const result = await push(chunks[i].changes, base_cursor, chunks[i].push_id);
				if (is_error(result)) return result;
				Object.assign(id_map, result.id_map);
				await on_chunk(i, result);
			}
			return id_map;
		}
	}

	export namespace MediaFiles {
		/**
		 * The token goes in a header (and the fields before the file), so the server refuses an upload it doesn't want
		 * (TRACK_HAS_MEDIA, NOT_IN_LIBRARY, a bad token) before the file is sent.
		 */
		export async function upload(track_id: IllusiId, file: MediaFile, opts: MediaUploadOpts = {}) {
			const form = new FormData();
			if (opts.quality !== undefined) form.append('quality', opts.quality);
			if (opts.token !== undefined) form.append('token', opts.token);
			await append_file(form, file);
			const headers = opts.token === undefined ? undefined : { 'X-Action-Token': opts.token };
			return request('POST /tracks/:id/media', { params: { id: track_id }, body: form, headers }) as PromiseResult<MediaUploadResult>;
		}
		export async function fulfil(action: ActionOf<'UPLOAD_MEDIA'>, file: MediaFile, quality?: string) {
			return upload(action.track_id, file, { quality, token: action.token });
		}
		export async function requests(query: MediaRequestsQuery = {}) {
			return call('GET /media/requests', { query });
		}
		/** Public: a resource id is unguessable, so its URL streams without a session or headers */
		export function url(resource_id: string): string {
			return api_url(`/media/${encodeURIComponent(resource_id)}`);
		}
		/** Media needs no headers; kept for callers that pass them to a native player */
		export function stream_headers(): Record<string, string> {
			return {};
		}
		/** Where url(resource_id) streams from: media moved to the public bucket redirects there */
		export async function resolve(resource_id: string): PromiseResult<{ url: string; headers: Record<string, string> }> {
			const route = 'GET /media/:resource_id';
			const media_url = url(resource_id);
			const response = await rozfetch<unknown>(media_url, { ...config.fetch_opts, method: 'GET', headers: { ...config.headers, Range: 'bytes=0-0' }, ignore_fail_request: true });
			if ('error' in response) return response;
			if (!response.ok) return error_from_response(route, response);
			return { url: response.url === '' ? media_url : response.url, headers: {} };
		}
		export async function download(resource_id: string, range?: { start: number; end?: number }): PromiseResult<ArrayBuffer> {
			const route = 'GET /media/:resource_id';
			const response = await rozfetch<unknown>(url(resource_id), {
				...config.fetch_opts, method: 'GET', headers: { ...config.headers, ...(range === undefined ? {} : { Range: `bytes=${range.start}-${range.end ?? ''}` }) }, ignore_fail_request: true
			});
			if ('error' in response) return response;
			if (!response.ok) return error_from_response(route, response);
			return response.arrayBuffer();
		}
	}

	export namespace Admin {
		export async function review_list(query: ReviewListQuery = {}) {
			return call('GET /admin/review', { query });
		}
		export async function review_apply(review_id: number, body: ReviewApplyBody = {}) {
			return call('POST /admin/review/:id/apply', { params: { id: String(review_id) }, body });
		}
		export async function review_dismiss(review_id: number) {
			return call('POST /admin/review/:id/dismiss', { params: { id: String(review_id) } });
		}
		export async function patch_entity(table: SharedEntityTable, entity_id: string, patch: EntityPatchBody) {
			return call('PATCH /admin/entities/:table/:id', { params: { table, id: entity_id }, body: patch });
		}
	}
}
