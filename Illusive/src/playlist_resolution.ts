// Pure playlist resolution helpers (tracks in → tracks out).
// MUST stay importable from plain Node: no React Native / MMKV / SQLite / stores / Prefs imports here (directly or transitively).
import { remove_topic } from '@common/utils/clean_util';
import { is_empty } from '@common/utils/util';
import { extract_query_flags, TRACK_QUERY_FLAGS } from '@illusive/query_flags';
import type { CompactPlaylist, IllusiveThumbnail, InheritedPlaylist, InheritedSearch, NamedUUID, PlaylistInheritanceMode, QueryFlag, SortType, Track } from '@illusive/types';
import fuzzysort from 'fuzzysort';

/** Default of the `fuzzy_search_threshold` pref (0-100) */
export const DEFAULT_FUZZY_SEARCH_THRESHOLD = 50;

export function best_thumbnail(thumbnails: IllusiveThumbnail[] | undefined) {
	if (thumbnails === undefined || thumbnails === null) return undefined;
	interface Max {
		index: number;
		value: number;
	}
	let best: Max = { index: 0, value: 0 };
	for (let i = 0; i < thumbnails.length; i++) {
		const dimension = thumbnails[i].width * thumbnails[i].height;
		const current: Max = { index: i, value: isNaN(dimension) ? 1 : dimension };
		if (current.value > best.value) best = current;
	}
	return thumbnails[best.index];
}

export function artist_string(track_or_compact_playlist_or_artist: NamedUUID | Track | CompactPlaylist): string {
	if (is_empty(track_or_compact_playlist_or_artist)) return '';
	if ('name' in track_or_compact_playlist_or_artist) return remove_topic(track_or_compact_playlist_or_artist.name).trim();

	const artists = 'artist' in track_or_compact_playlist_or_artist ? track_or_compact_playlist_or_artist.artist : track_or_compact_playlist_or_artist.artists;
	if (artists.length === 0) return '';
	if (artists.length <= 1) return remove_topic(artists?.[0].name ?? '').trim();
	const names = artists.map(artist => remove_topic(artist?.name ?? '').trim());
	const final_name = names.pop()!;
	return names.length ? names.join(', ') + ' & ' + final_name : final_name;
}

export function tracks_include(original: Track[], incoming: Track[]): Track[] {
	const original_seen_uid_set = new Set(original.map(({ uid }) => uid));
	return [...original, ...incoming.filter(({ uid }) => !original_seen_uid_set.has(uid))];
}
export function tracks_exclude(original: Track[], incoming: Track[]): Track[] {
	const incoming_seen_uid_set = new Set(incoming.map(({ uid }) => uid));
	return original.filter(({ uid }) => !incoming_seen_uid_set.has(uid));
}
export function tracks_mask(original: Track[], incoming: Track[]): Track[] {
	const original_seen_uid_set = new Set(original.map(({ uid }) => uid));
	const incoming_seen_uid_set = new Set(incoming.map(({ uid }) => uid));
	const to_add = incoming.filter(({ uid }) => !original_seen_uid_set.has(uid));
	const to_remove = new Set(original.filter(({ uid }) => incoming_seen_uid_set.has(uid)).map(({ uid }) => uid));
	return [...original.filter(({ uid }) => !to_remove.has(uid)), ...to_add];
}
export function tracks_intersection(original: Track[], incoming: Track[]): Track[] {
	const incoming_seen_uid_set = new Set(incoming.map(({ uid }) => uid));
	return original.filter(({ uid }) => incoming_seen_uid_set.has(uid));
}

export function times_played_multiplier(plays: number, max_plays: number): number {
	return Math.max(plays / max_plays + 1, 1);
}
export function time_since_last_played_multiplier(date: Date): number {
	const time_difference = Date.now() - date.getTime();
	const days_difference = time_difference / (1000 * 60 * 60 * 24);
	return Math.max((7 - days_difference) / 2, 1);
}

export function filter_with_query_flags<T>(query: string, obj: T[], query_flags: QueryFlag<T>[]) {
	const extracted_query_flags = extract_query_flags<T>(query, query_flags);

	query = extracted_query_flags.new_query;

	return {
		filtered_data: obj.filter((track) => {
			if (is_empty(query) && extracted_query_flags.extracted_query_flags.length === 0) return false;
			const matches_any_flag = extracted_query_flags.extracted_query_flags.every(([flag, args, anti]) => (anti ? !flag.condition(track, args) : flag.condition(track, args)));
			return matches_any_flag;
		}),
		new_query: query
	};
}

const QUERY_SPLIT_OR = ' OR ';

type SearchKey = 'title' | 'alt_title' | 'artist' | 'album';
const SEARCH_KEYS: SearchKey[] = ['title', 'alt_title', 'artist', 'album'];
const SEARCH_KEY_WEIGHTS: Record<SearchKey, number> = { title: 1, alt_title: 0.95, artist: 0.85, album: 0.6 };

const MATCH_TIER = { FUZZY: 0, SUBSTRING: 1, WORD_PREFIX: 2, TITLE_PREFIX: 3, TITLE_EXACT: 4 } as const;
type MatchTier = typeof MATCH_TIER[keyof typeof MATCH_TIER];

function normalize_search_text(text: string): string {
	return text
		.replace(/\p{Script=Latin}+/gu, match => match.normalize('NFD'))
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim();
}

function search_key_text(track: Track, key: SearchKey): string {
	switch (key) {
		case 'title': return track.title ?? '';
		case 'alt_title': return track.alt_title ?? '';
		case 'artist': return artist_string(track);
		case 'album': return track.album?.name ?? '';
	}
}

function match_tier(track: Track, normalized_query: string, query_tokens: string[]): MatchTier {
	const titles = [track.title, track.alt_title].filter(Boolean).map(title => normalize_search_text(title!));
	if (titles.some(title => title === normalized_query)) return MATCH_TIER.TITLE_EXACT;
	if (titles.some(title => title.startsWith(normalized_query))) return MATCH_TIER.TITLE_PREFIX;

	const haystack = SEARCH_KEYS.map(key => normalize_search_text(search_key_text(track, key))).join(' ');
	const words = haystack.split(' ');
	if (query_tokens.every(token => words.some(word => word.startsWith(token)))) return MATCH_TIER.WORD_PREFIX;
	if (query_tokens.every(token => haystack.includes(token))) return MATCH_TIER.SUBSTRING;
	return MATCH_TIER.FUZZY;
}

function text_relevance(result: Fuzzysort.KeysResult<Track>, multi_word: boolean): number {
	if (multi_word) return result.score;
	return Math.max(...SEARCH_KEYS.map((key, i) => result[i].score * SEARCH_KEY_WEIGHTS[key]));
}

function engagement_multiplier(track: Track, max_plays: number): number {
	const plays = track.meta?.plays ?? 0;
	const plays_boost = max_plays > 0 ? 0.15 * Math.log1p(plays) / Math.log1p(max_plays) : 0;
	const last_played = track.meta?.last_played_date ? new Date(track.meta.last_played_date).getTime() : NaN;
	const days_since_played = (Date.now() - last_played) / (1000 * 60 * 60 * 24);
	const recency_boost = Number.isFinite(days_since_played) ? 0.1 * Math.max(0, 1 - days_since_played / 30) : 0;
	return 1 + plays_boost + recency_boost;
}

/** @param fuzzy_search_threshold 0-100 (the `fuzzy_search_threshold` pref) */
export function track_query_filter(tracks: Track[], query?: string, fuzzy_search_threshold: number = DEFAULT_FUZZY_SEARCH_THRESHOLD): Track[] {
	if (is_empty(query)) return tracks;

	if (query!.includes(QUERY_SPLIT_OR)) {
		return query!.split(QUERY_SPLIT_OR)
			.map(split_query => track_query_filter(tracks, split_query, fuzzy_search_threshold))
			.reduce((tracks_a, tracks_b) => tracks_include(tracks_a, tracks_b));
	}

	const queried_result = filter_with_query_flags(query!, tracks, TRACK_QUERY_FLAGS);

	query = queried_result.new_query.trim();
	tracks = queried_result.filtered_data;

	if (is_empty(query)) return tracks;

	const normalized_query = normalize_search_text(query);
	const query_tokens = normalized_query.split(' ').filter(Boolean);
	const multi_word = query_tokens.length > 1;
	const threshold = fuzzy_search_threshold / 100;
	const max_plays = tracks.reduce((max, track) => Math.max(max, track.meta?.plays ?? 0), 0);

	return fuzzysort
		.go(query, tracks, { all: false, keys: SEARCH_KEYS.map(key => (track: Track) => search_key_text(track, key)) })
		.map((result) => {
			const tier = query_tokens.length > 0 ? match_tier(result.obj, normalized_query, query_tokens) : MATCH_TIER.FUZZY;
			const relevance = text_relevance(result, multi_word);
			return { track: result.obj, tier, relevance, score: relevance * engagement_multiplier(result.obj, max_plays) };
		})
		.filter(({ tier, relevance }) => tier !== MATCH_TIER.FUZZY || relevance >= threshold)
		.sort((a, b) => b.tier - a.tier || b.score - a.score)
		.map(({ track }) => track);
}

function date_time(date?: string): number {
	if (date) return new Date(date).getTime();
	return 0;
}

export function sort_playlist_tracks(sort_mode: SortType, tracks: Track[]): Track[] {
	switch (sort_mode) {
		case undefined:
		case 'OLDEST': return tracks;
		case 'NEWEST': return tracks.slice().reverse();
		case 'ALPHABETICAL': return tracks.sort((a, b) => a.title.localeCompare(b.title));
		case 'ALPHABETICAL_REVERSE': return tracks.sort((a, b) => b.title.localeCompare(a.title));
		case 'DURATION_HILOW': return tracks.sort((a, b) => b.duration - a.duration);
		case 'DURATION_LOWHI': return tracks.sort((a, b) => a.duration - b.duration);
		case 'PLAYS_HILOW': return tracks.sort((a, b) => (b.meta?.plays ?? 0) - (a.meta?.plays ?? 0));
		case 'PLAYS_LOWHI': return tracks.sort((a, b) => (a.meta?.plays ?? 0) - (b.meta?.plays ?? 0));
		case 'VIEWS_HILOW': return tracks.sort((a, b) => (b.service_plays ?? 0) - (a.service_plays ?? 0));
		case 'VIEWS_LOWHI': return tracks.sort((a, b) => (a.service_plays ?? 0) - (b.service_plays ?? 0));
		case 'ADDED_DATE_HILOW': return tracks.sort((a, b) => date_time(b.meta?.added_date) - date_time(a.meta?.added_date));
		case 'ADDED_DATE_LOWHI': return tracks.sort((a, b) => date_time(a.meta?.added_date) - date_time(b.meta?.added_date));
		case 'DOWNLOAD_DATE_HILOW': return tracks.sort((a, b) => date_time(b.meta?.downloaded_date) - date_time(a.meta?.downloaded_date));
		case 'DOWNLOAD_DATE_LOWHI': return tracks.sort((a, b) => date_time(a.meta?.downloaded_date) - date_time(b.meta?.downloaded_date));
		case 'LAST_PLAYED_DATE_HILOW': return tracks.sort((a, b) => date_time(b.meta?.last_played_date) - date_time(a.meta?.last_played_date));
		case 'LAST_PLAYED_DATE_LOWHI': return tracks.sort((a, b) => date_time(a.meta?.last_played_date) - date_time(b.meta?.last_played_date));
		case 'LAST_SAMPLED_DATE_HILOW': return tracks.sort((a, b) => date_time(b.meta?.last_sampled_date) - date_time(a.meta?.last_sampled_date));
		case 'LAST_SAMPLED_DATE_LOWHI': return tracks.sort((a, b) => date_time(a.meta?.last_sampled_date) - date_time(b.meta?.last_sampled_date));
		case 'LONGEST_PLAYED_HILOW': return tracks.sort((a, b) => (b.duration * (b.meta?.plays ?? 0)) - (a.duration * (a.meta?.plays ?? 0)));
		case 'LONGEST_PLAYED_LOWHI': return tracks.sort((a, b) => (a.duration * (a.meta?.plays ?? 0)) - (b.duration * (b.meta?.plays ?? 0)));
		default: return tracks;
	}
}

export function apply_inherited_mode(mode: PlaylistInheritanceMode, tracks: Track[], inherited_tracks: Track[]): Track[] {
	switch (mode) {
		case 'INCLUDE' : return tracks_include(tracks, inherited_tracks);
		case 'EXCLUDE' : return tracks_exclude(tracks, inherited_tracks);
		case 'MASK' : return tracks_mask(tracks, inherited_tracks);
		case 'INTERSECTION': return tracks_intersection(tracks, inherited_tracks);
		default : return tracks;
	}
}

export interface InheritedTracks {
	mode: PlaylistInheritanceMode;
	tracks: Track[];
}

export function combine_inherited_tracks(own_tracks: Track[], inherited_playlists: InheritedTracks[], inherited_searchs: InheritedTracks[], sort_mode: SortType): Track[] {
	let tracks = own_tracks;
	for (const inherited_playlist of inherited_playlists) tracks = apply_inherited_mode(inherited_playlist.mode, tracks, inherited_playlist.tracks);
	for (const inherited_search of inherited_searchs) tracks = apply_inherited_mode(inherited_search.mode, tracks, inherited_search.tracks);
	return sort_playlist_tracks(sort_mode, tracks);
}

export interface ResolvablePlaylist {
	/** The playlist's own tracks, in insertion (id) order */
	tracks: Track[];
	inherited_playlists?: InheritedPlaylist[];
	inherited_searchs?: InheritedSearch[];
	sort?: SortType;
}
export interface PlaylistResolutionOpts {
	/** Returns the playlist's own data, or undefined if unknown (it then resolves to no tracks) */
	get_playlist: (playlist_uuid: string) => ResolvablePlaylist | undefined | Promise<ResolvablePlaylist | undefined>;
	/** The whole library, used for inherited searches */
	library_tracks: Track[] | (() => Track[] | Promise<Track[]>);
	/** 0-100, defaults to DEFAULT_FUZZY_SEARCH_THRESHOLD */
	fuzzy_search_threshold?: number;
}
export interface PureResolutionSession {
	resolved_playlists: Map<string, Promise<Track[]>>;
	search_results: Map<string, Track[]>;
	library_tracks?: Track[];
}
export function create_pure_resolution_session(): PureResolutionSession {
	return { resolved_playlists: new Map(), search_results: new Map() };
}
/**
 * Recursively resolves a playlist's tracks (own tracks + inherited playlists/searches, then sorted), mirroring the
 * client's SQLPlaylists.playlist_tracks resolution: cycles are cut via ancestors, each playlist/search resolves once per session.
 */
export async function resolve_playlist_tracks(playlist_uuid: string, opts: PlaylistResolutionOpts, session: PureResolutionSession = create_pure_resolution_session(), ancestor_uuids: ReadonlySet<string> = new Set<string>()): Promise<Track[]> {
	const existing = session.resolved_playlists.get(playlist_uuid);
	if (existing !== undefined) return (await existing).slice();
	const resolution = (async () => {
		const playlist = await opts.get_playlist(playlist_uuid);
		if (playlist === undefined) return [];
		const child_ancestor_uuids = new Set([...ancestor_uuids, playlist_uuid]);
		const inherited_playlists = (playlist.inherited_playlists ?? []).filter(inherited_playlist => !child_ancestor_uuids.has(inherited_playlist.uuid));
		const inherited_playlist_results = await Promise.all(inherited_playlists.map(async inherited_playlist => ({
			mode: inherited_playlist.mode,
			tracks: await resolve_playlist_tracks(inherited_playlist.uuid, opts, session, child_ancestor_uuids)
		})));
		const inherited_search_results: InheritedTracks[] = [];
		for (const inherited_search of playlist.inherited_searchs ?? []) {
			let search_tracks = session.search_results.get(inherited_search.query);
			if (search_tracks === undefined) {
				if (session.library_tracks === undefined) session.library_tracks = typeof opts.library_tracks === 'function' ? await opts.library_tracks() : opts.library_tracks;
				search_tracks = track_query_filter(session.library_tracks, inherited_search.query, opts.fuzzy_search_threshold);
				session.search_results.set(inherited_search.query, search_tracks);
			}
			inherited_search_results.push({ mode: inherited_search.mode, tracks: search_tracks });
		}
		return combine_inherited_tracks(playlist.tracks.slice(), inherited_playlist_results, inherited_search_results, playlist.sort!);
	})();
	session.resolved_playlists.set(playlist_uuid, resolution);
	return (await resolution).slice();
}
