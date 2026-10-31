import { gen_uuid, is_empty } from '@common/utils/util';
import { Store } from '@illusive/db/store';
import { default_playlists } from '@illusive/default_playlists';
import { GLOBALS } from '@illusive/globals';
import { track_query_filter } from '@illusive/illusive_utils';
import { apply_inherited_mode, sort_playlist_tracks as pure_sort_playlist_tracks } from '@illusive/playlist_resolution';
import type { CompactPlaylistData, InheritedPlaylist, InheritedSearch, Playlist, PlaylistsTracks, SortType, SQLPlaylist, Track } from '@illusive/types';
import { SQLTracks } from './sql_tracks';
import { catch_ignore } from '@common/utils/error_util';
import { force_json_parse_array } from '@common/utils/parse_util';
import { track_store } from '@illusive/stores/track_store';

export namespace SQLPlaylists {
	export const sort_playlist_tracks = pure_sort_playlist_tracks;

	export async function track_exists_in_playlist(playlist_track: PlaylistsTracks) {
		return Store.get().playlists.has_track(playlist_track.uuid, playlist_track.track_uid);
	}
	export async function playlists_count() {
		return Store.get().playlists.count();
	}
	export async function playlists_containing_track(track_uid: PlaylistsTracks['track_uid']): Promise<Set<string>> {
		return Store.get().playlists.containing_track(track_uid);
	}
	export async function playlist_track_uid_set(playlist_uuid: string): Promise<Set<string>> {
		return Store.get().playlists.track_uid_set(playlist_uuid);
	}
	export async function add_saved_data_to_write_playlist_tracks(playlist_uuid: string, tracks: Track[]): Promise<void> {
		const saved_track_uids = await playlist_track_uid_set(playlist_uuid);
		for (const track of tracks) {
			track.downloading_data = { saved: true, progress: 0, playlist_saved: saved_track_uids.has(track.uid) };
		}
	}

	type IgnoreTracks = 'IGNORE' | 'PROMISE' | 'NO_IGNORE';
	export function sql_playlist_to_playlist_no_visual_data(sql_playlist: SQLPlaylist | Playlist): Playlist {
		return {
			...sql_playlist,
			inherited_playlists: typeof sql_playlist.inherited_playlists === 'object' ? sql_playlist.inherited_playlists : force_json_parse_array(sql_playlist.inherited_playlists ?? '[]'),
			linked_playlists: typeof sql_playlist.linked_playlists === 'object' ? sql_playlist.linked_playlists : force_json_parse_array(sql_playlist.linked_playlists ?? '[]'),
			inherited_searchs: typeof sql_playlist.inherited_searchs === 'object' ? sql_playlist.inherited_searchs : force_json_parse_array(sql_playlist.inherited_searchs ?? '[]'),
			visual_data: undefined,
			date: new Date(sql_playlist.date!).toISOString()
		};
	}
	export async function raw_playlist_tracks() {
		return Store.get().playlists.raw_tracks();
	}
	export async function unique_playlist_uuids_from_playlist_tracks() {
		const unique_uuids = new Set<string>((await raw_playlist_tracks()).map(p => p.uuid));
		return [...unique_uuids.values()];
	}
	export interface PlaylistResolutionSession {
		resolved_playlists: Map<string, Promise<Track[]>>;
		search_results: Map<string, Track[]>;
	}
	export function create_resolution_session(): PlaylistResolutionSession {
		return { resolved_playlists: new Map<string, Promise<Track[]>>(), search_results: new Map<string, Track[]>() };
	}

	async function hydrated_playlist_tracks(playlist_uuid: string): Promise<Track[]> {
		const tracks_by_uid = track_store.getState().tracks_by_uid;
		const track_uids = await Store.get().playlists.ordered_track_uids(playlist_uuid);
		if (tracks_by_uid.size === 0) return SQLTracks.sql_tracks_to_tracks(await Store.get().tracks.by_uids(track_uids));
		const tracks: Track[] = [];
		for (const track_uid of track_uids) {
			const track = tracks_by_uid.get(track_uid);
			if (track !== undefined) tracks.push(track);
		}
		return tracks;
	}

	const playlist_tracks_cache = new Map<string, { tracks: Track[]; cached_at: number }>();
	const playlist_tracks_cache_ttl_ms = 30_000;
	export function invalidate_playlist_tracks_cache() {
		playlist_tracks_cache.clear();
	}
	function get_cached_playlist_tracks(playlist_uuid: string): Track[] | undefined {
		const entry = playlist_tracks_cache.get(playlist_uuid);
		if (entry === undefined) return undefined;
		if (Date.now() - entry.cached_at > playlist_tracks_cache_ttl_ms) {
			playlist_tracks_cache.delete(playlist_uuid);
			return undefined;
		}
		return entry.tracks;
	}
	// Membership of search-inherited playlists changes with the library itself.
	track_store.subscribe(() => invalidate_playlist_tracks_cache());

	async function resolve_playlist_tracks(playlist_uuid: string, playlist_no_visual_data: Playlist | undefined, session: PlaylistResolutionSession, ancestor_uuids: ReadonlySet<string>): Promise<Track[]> {
		let tracks = await hydrated_playlist_tracks(playlist_uuid);
		const cplaylist_data = playlist_no_visual_data ? playlist_no_visual_data : await playlist_data(playlist_uuid, 'IGNORE');
		if (cplaylist_data === undefined) return tracks;
		const child_ancestor_uuids = new Set([...ancestor_uuids, playlist_uuid]);
		const inherited_playlists = (cplaylist_data.inherited_playlists ?? []).filter(inherited_playlist => !child_ancestor_uuids.has(inherited_playlist.uuid));
		const inherited_results = await Promise.all(inherited_playlists.map(async inherited_playlist => playlist_tracks(inherited_playlist.uuid, undefined, session, child_ancestor_uuids)));
		for (let i = 0; i < inherited_playlists.length; i++) {
			tracks = apply_inherited_mode(inherited_playlists[i].mode, tracks, inherited_results[i]);
		}
		for (const inherited_search of cplaylist_data.inherited_searchs ?? []) {
			let search_tracks = session.search_results.get(inherited_search.query);
			if (search_tracks === undefined) {
				search_tracks = track_query_filter(is_empty(GLOBALS.global_var.sql_tracks) ? await SQLTracks.get_tracks() : GLOBALS.global_var.sql_tracks, inherited_search.query);
				session.search_results.set(inherited_search.query, search_tracks);
			}
			tracks = apply_inherited_mode(inherited_search.mode, tracks, search_tracks);
		}
		return sort_playlist_tracks(cplaylist_data.sort!, tracks);
	}

	export async function playlist_tracks(playlist_uuid: string, playlist_no_visual_data?: Playlist, session?: PlaylistResolutionSession, ancestor_uuids: ReadonlySet<string> = new Set<string>(), skip_inheritance = false): Promise<Track[]> {
		const csession = session ?? create_resolution_session();
		const default_playlist = default_playlists.find(playlist => playlist.name === playlist_uuid);
		if (default_playlist !== undefined) {
			if (!csession.resolved_playlists.has(playlist_uuid)) csession.resolved_playlists.set(playlist_uuid, default_playlist.track_function());
			const default_resolved = await csession.resolved_playlists.get(playlist_uuid)!;
			return default_resolved.slice();
		}
		if (skip_inheritance) return await hydrated_playlist_tracks(playlist_uuid);
		if (csession.resolved_playlists.has(playlist_uuid)) return (await csession.resolved_playlists.get(playlist_uuid)!).slice();
		const cached = get_cached_playlist_tracks(playlist_uuid);
		if (cached !== undefined) return cached.slice();
		const resolution = resolve_playlist_tracks(playlist_uuid, playlist_no_visual_data, csession, ancestor_uuids);
		csession.resolved_playlists.set(playlist_uuid, resolution);
		const resolved = await resolution;
		playlist_tracks_cache.set(playlist_uuid, { tracks: resolved, cached_at: Date.now() });
		return resolved.slice();
	}
	export async function sql_playlist_to_playlist(sql_playlist: SQLPlaylist | Playlist, ignore_tracks: IgnoreTracks = 'NO_IGNORE', ignore_inheritance = true, session?: PlaylistResolutionSession): Promise<Playlist> {
		const playlist_no_visual_data = sql_playlist_to_playlist_no_visual_data(sql_playlist);
		const tracks = ignore_tracks === 'IGNORE'
			? []
			: ignore_tracks === 'PROMISE'
				? playlist_tracks(sql_playlist.uuid, playlist_no_visual_data, session, new Set<string>(), ignore_inheritance)
				: await playlist_tracks(sql_playlist.uuid, playlist_no_visual_data, session, new Set<string>(), ignore_inheritance);
		return {
			...playlist_no_visual_data,
			visual_data: ignore_tracks === 'PROMISE'
				? { four_track: tracks as Track[], track_count: 0 }
				: { four_track: tracks as Track[], track_count: (tracks as Track[]).length }
		};
	}

	let all_playlist_data_memo: Playlist[] = [];
	export function get_all_playlist_data_memo() {
		return all_playlist_data_memo;
	}
	export async function resolve_all_playlist_data_memo() {
		all_playlist_data_memo = await Promise.all(all_playlist_data_memo.map(async playlist => ({ ...playlist, visual_data: { ...playlist.visual_data ?? {}, four_track: await Promise.resolve(playlist.visual_data!.four_track ?? []) } })));
	}
	export async function all_playlists_data(ignore_tracks?: IgnoreTracks) {
		const playlists = await Store.get().playlists.all();
		// One shared session — the whole batch resolves the inheritance DAG in a single pass.
		const session = create_resolution_session();
		all_playlist_data_memo = await Promise.all(playlists.map(async playlist => sql_playlist_to_playlist(playlist, ignore_tracks ?? 'PROMISE', playlist.archived ?? false, session)));
		resolve_all_playlist_data_memo().catch(catch_ignore);
		return all_playlist_data_memo;
	}

	export async function compact_playlists() {
		const playlists: CompactPlaylistData[] = [];
		for (const playlist of await all_playlists_data()) {
			playlists.push({
				title: playlist.title,
				four_track: playlist.visual_data!.four_track!,
				track_count: playlist.visual_data!.track_count!,
				track_callback: async () => await playlist_tracks(playlist.uuid),
				type: 'PLAYLIST',
				thumbnail_uri: playlist.thumbnail_uri,
				pinned: playlist.pinned ?? false
			});
		}
		return playlists;
	}

	export async function deep_track_exists_in_playlist(playlist_uuid: string, track: Track) {
		const tracks = await playlist_tracks(playlist_uuid, undefined, undefined, new Set<string>(), true);
		return SQLTracks.track_exist_in_other(tracks, track);
	}

	export async function deep_tracks_exists_in_playlist(playlist_uuid: string, tracks: Track[]): Promise<boolean[]> {
		const ptracks = await playlist_tracks(playlist_uuid, undefined, undefined, new Set<string>(), true);
		return tracks.map(track => SQLTracks.track_exist_in_other(ptracks, track));
	}

	export async function insert_all_tracks_playlist(many_playlist_tracks: PlaylistsTracks[]) {
		if (many_playlist_tracks.length === 0) return;
		await Store.write(async repos => repos.playlists.add_tracks(many_playlist_tracks));
		invalidate_playlist_tracks_cache();
	}
	export async function insert_track_playlist(playlist_track: PlaylistsTracks) {
		await insert_all_tracks_playlist([playlist_track]);
	}

	export async function delete_all_tracks_playlist(many_playlist_tracks: PlaylistsTracks[]) {
		if (many_playlist_tracks.length === 0) return;
		await Store.write(async repos => repos.playlists.remove_tracks(many_playlist_tracks));
		invalidate_playlist_tracks_cache();
	}
	export async function delete_track_playlist(playlist_track: PlaylistsTracks) {
		await delete_all_tracks_playlist([playlist_track]);
	}
	export async function delete_track_from_all_playlists(track_uid: PlaylistsTracks['track_uid']) {
		await Store.write(async repos => repos.playlists.remove_track_everywhere(track_uid));
		invalidate_playlist_tracks_cache();
	}
	export async function all_playlists_names(): Promise<{ title: string }[]> {
		return Store.get().playlists.titles();
	}
	const playlist_name_memo: Record<string, string> = {};
	export function get_playlist_name_sync(playlist_uuid: Playlist['uuid']) {
		const default_playlist_names = default_playlists.map(playlist => playlist.name);
		const try_default_playlist_name_find = default_playlist_names.find(name => name === playlist_uuid);
		if (try_default_playlist_name_find) return try_default_playlist_name_find;
		if (playlist_name_memo[playlist_uuid]) return playlist_name_memo[playlist_uuid];
		const found_playlist = all_playlist_data_memo.find(playlist => playlist.uuid === playlist_uuid);
		if (found_playlist) return found_playlist.title;

		Store.get().playlists.get(playlist_uuid).then((result) => {
			if (result) playlist_name_memo[playlist_uuid] = result.title;
		}).catch(catch_ignore);

		return undefined;
	}
	export async function playlist_data(playlist_uuid: Playlist['uuid'], ignore_tracks: IgnoreTracks = 'NO_IGNORE') {
		const found = all_playlist_data_memo.find(playlist => playlist.uuid === playlist_uuid);
		if (found) return found;

		const playlist = await Store.get().playlists.get(playlist_uuid);
		if (!playlist) return undefined;
		return await sql_playlist_to_playlist(playlist, ignore_tracks);
	}
	export async function update_playlist(playlist_uuid: Playlist['uuid'], new_playlist: Playlist) {
		await set_fields(playlist_uuid, new_playlist);
	}
	export async function create_playlist(title: string, cuuid?: string): Promise<string> {
		const playlist_names = await all_playlists_names();
		let count = 2;
		if (playlist_names.findIndex(item => item.title === title) !== -1) {
			while (playlist_names.findIndex(item => item.title === `${title} ${count}`) !== -1 && count <= 100)
				count++;
			if (count > 0)
				title = `${title} ${count}`;
		}
		const playlist_uuid = cuuid ?? gen_uuid();
		await Store.write(async repos => repos.playlists.create(playlist_uuid, title));
		invalidate_playlist_tracks_cache();
		return playlist_uuid;
	}
	export async function delete_playlist(playlist_uuid: string) {
		await Store.write(async repos => repos.playlists.remove(playlist_uuid));
		invalidate_playlist_tracks_cache();
	}
	export async function delete_all_playlists() {
		const playlists = await all_playlists_data();
		await Promise.all(playlists.map(async playlist => delete_playlist(playlist.uuid)));
	}
	async function set_fields(playlist_uuid: string, fields: Partial<Playlist>) {
		await Store.write(async repos => repos.playlists.update(playlist_uuid, fields));
		invalidate_playlist_tracks_cache();
	}
	export async function pin_unpin_playlist(playlist_uuid: string, pin: boolean) {
		await set_fields(playlist_uuid, { pinned: pin });
	}
	export async function public_private_playlist(playlist_uuid: string, is_public: boolean) {
		await set_fields(playlist_uuid, { public: is_public });
	}
	export async function archive_playlist(playlist_uuid: string, archive: boolean) {
		await set_fields(playlist_uuid, { archived: archive });
	}
	export async function is_playlist_pinned(playlist_uuid: string): Promise<boolean> {
		return Boolean((await Store.get().playlists.get(playlist_uuid))?.pinned);
	}
	export async function update_playlist_title(playlist_uuid: string, title: string) {
		await set_fields(playlist_uuid, { title });
	}
	export async function update_playlist_description(playlist_uuid: string, description: string) {
		await set_fields(playlist_uuid, { description });
	}
	export async function update_playlist_sort_mode(playlist_uuid: string, sort_mode: SortType) {
		await set_fields(playlist_uuid, { sort: sort_mode });
	}
	export async function update_playlist_inherited_playlists(playlist_uuid: string, inherited_playlists: InheritedPlaylist[]) {
		await set_fields(playlist_uuid, { inherited_playlists });
	}
	export async function update_playlist_inherited_searchs(playlist_uuid: string, inherited_searchs: InheritedSearch[]) {
		await set_fields(playlist_uuid, { inherited_searchs });
	}
	export function inherited_playlists_action(inherited_playlists: InheritedPlaylist[], new_iplaylist: InheritedPlaylist, action: 'ADD' | 'REMOVE'): InheritedPlaylist[] {
		if (action === 'ADD') return inherited_playlists.concat(new_iplaylist);
		else return inherited_playlists.filter(item => !(item.uuid === new_iplaylist.uuid && item.mode === new_iplaylist.mode));
	}
	export function inherited_searches_action(inherited_searches: InheritedSearch[], new_isearch: InheritedSearch, action: 'ADD' | 'REMOVE'): InheritedSearch[] {
		if (action === 'ADD') return inherited_searches.concat(new_isearch);
		else return inherited_searches.filter(item => !(item.query === new_isearch.query && item.mode === new_isearch.mode));
	}
}
