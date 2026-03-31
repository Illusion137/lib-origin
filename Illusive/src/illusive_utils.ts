import { seeded_rand } from "@common/seeding";
import { TimedCacheValue } from "@common/types";
import { remove, remove_topic } from "@common/utils/clean_util";
import { groupby, is_empty, milliseconds_of, seeded_random_of, urlid } from "@common/utils/util";
import { Constants } from "@illusive/constants";
import { Prefs } from "@illusive/prefs";
import { COMPACT_ARTIST_QUERY_FLAGS, COMPACT_PLAYLIST_QUERY_FLAGS, extract_query_flags, PLAYLIST_QUERY_FLAGS, TRACK_QUERY_FLAGS } from "@illusive/query_flags";
import type { AlbumSortMode, Artwork, CompactArtist, CompactPlaylist, CompactPlaylistType, GroupSection, HexColor, IllusiveThumbnail, IllusiveURI, MusicServiceType, MusicServiceURI, NamedUUID, ParsedUri, Playlist, PrefEntry, QueryFlag, Track } from "@illusive/types";
import type { Run3 } from "@origin/youtube/types/PlaylistResults_0";
import fuzzysort from "fuzzysort";
import { reinterpret_cast } from '../../common/cast';
import type { BasePref } from "@native/mmkv/mmkv_utils";

export function duration_to_string(track_duration: number): string {
	if(isNaN(track_duration) || track_duration <= 0) return "";
	if (track_duration / 3600 >= 1) {
		const hours = Math.floor(track_duration / 3600);
		const minutes = Math.floor((track_duration % 3600) / 60);
		const seconds = Math.floor((track_duration % 3600) % 60);
		return `${String(hours)}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	} else if (track_duration / 60 >= 1) {
		const minutes = Math.floor(track_duration / 60);
		const seconds = Math.floor(track_duration % 60);
		return `${String(minutes)}:${String(seconds).padStart(2, "0")}`;
	} else return `0:${String(track_duration).padStart(2, "0")}`;
}
export function playlist_duration_to_string(playlist_duration: number): string {
	if (playlist_duration / 3600 >= 1) return `${Math.floor(playlist_duration / 3600).toString()}h ${Math.floor((playlist_duration % 3600) / 60).toString()}m`;
	else if (playlist_duration / 60 >= 1) return `${Math.floor(playlist_duration / 60).toString()}m`;
	return "< 1m";
}
export function create_thumbnails(url: string, width = NaN, height = NaN): IllusiveThumbnail[] {
	return [{ url: url, width: width, height: height }];
}
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

export function date_from(date: { year?: number; month?: number; day?: number; hour?: number; minute?: number; second?: number; ms?: number }) {
	const new_date = new Date();
	if (date.year) new_date.setFullYear(date.year);
	if (date.month) new_date.setMonth(date.month);
	if (date.day) new_date.setDate(date.day);
	if (date.hour) new_date.setHours(date.hour);
	if (date.minute) new_date.setMinutes(date.minute);
	if (date.second) new_date.setSeconds(date.second);
	if (date.ms) new_date.setMilliseconds(date.ms);
	return new_date;
}

export function get_unique_artists_tracks(global_tracks: Track[]) {
	const seen_artists = new Set<IllusiveURI>();
	const seen_artists_names = new Set<string>();
	return global_tracks
		.filter((track) => !is_empty(track.artists[0].uri))
		.filter((track) => {
			if (seen_artists.has(track.artists[0].uri!)) return false;
			seen_artists.add(track.artists[0].uri!);
			return true;
		})
		.filter((track) => {
			if (seen_artists_names.has(track.artists[0].name)) return false;
			seen_artists_names.add(track.artists[0].name);
			return true;
		});
}
export function get_unique_artists(global_tracks: Track[]) {
	return get_unique_artists_tracks(global_tracks).map((track) => track.artists[0]);
}
export function get_most_played_artists(global_tracks: Track[]) {
	return get_unique_artists_tracks(global_tracks)
		.sort((a, b) => (b.meta?.plays ?? 0) - (a.meta?.plays ?? 0))
		.map((track) => track.artists[0]);
}

export type ArtworkNamedUUID = NamedUUID & {artwork: Artwork};
export function get_unique_album_names_with_uris(global_tracks: Track[]): ArtworkNamedUUID[]{
	const seen_uris: Set<string> = new Set<string>();
	const album_names: ArtworkNamedUUID[] = [];
	for(const track of global_tracks){
		if(!track.album?.uri) continue;
		if(seen_uris.has(track.album.uri)) continue;
		seen_uris.add(track.album.uri);
		album_names.push({...track.album, artwork: track.playback?.artwork ?? 0});
	}
	return album_names;
}

export function sort_compact_playlist_by_most_played_artists(albums: CompactPlaylist[], global_tracks: Track[]): CompactPlaylist[] {
	const name_plays: [string, number][] = global_tracks.map((track) => [remove_topic(track.artists[0].name), track.meta?.plays ?? 0]);
	const name_plays_map = new Map<string, number>();
	for (const name_play of name_plays) {
		name_plays_map.set(name_play[0], (name_plays_map.get(name_play[0]) ?? 0) + name_play[1]);
	}
	return albums.slice().sort((a, b) => (name_plays_map.get(remove_topic(b.artist?.[0]?.name ?? "")) ?? 0) - (name_plays_map.get(remove_topic(a.artist?.[0]?.name ?? "")) ?? 0));
}

export function compact_artist_to_nammed_uuid(artist: CompactArtist): NamedUUID {
	return { name: artist.name.name, uri: artist.name.uri ?? null };
}
export function sort_compact_playlists(mode: AlbumSortMode, albums: CompactPlaylist[], global_tracks: Track[]): CompactPlaylist[] {
	switch (mode) {
		case "NEWEST":
			return albums;
		case "OLDEST":
			return albums.slice().reverse();
		case "MOST_PLAYED_ARTISTS":
			return sort_compact_playlist_by_most_played_artists(albums, global_tracks);
		case "LEAST_PLAYED_ARTISTS":
			return sort_compact_playlist_by_most_played_artists(albums, global_tracks).reverse();
		default:
			return albums;
	}
}
export function track_section_map(tracks: Track[], queried: boolean): { char_data: string[]; section_map: Track[][] } {
	const sections_map = new Map<string, Track[]>();
	const best_results: Track[] = queried ? tracks.slice(0, Constants.best_search_result_amount) : [];
	if (queried) tracks = tracks.slice(Constants.best_search_result_amount);
	for (const track of tracks) {
		let char = track.title[0].toUpperCase();
		if (!/[A-Z]/.test(char)) char = "#";
		if (!sections_map.has(char)) {
			sections_map.set(char, [track]);
		} else {
			const new_tracks = sections_map.get(char)!;
			new_tracks.push(track);
			sections_map.set(char, new_tracks);
		}
	}
	const sections: Track[][] = [];
	const section_chars: string[] = [];
	const sorted_sections_map = [...sections_map].sort();
	if (queried) {
		sorted_sections_map.unshift(["$", best_results]);
	}
	for (const value of sorted_sections_map) {
		sections.push(value[1]);
		section_chars.push(value[0]);
	}
	return { char_data: section_chars, section_map: [...sections] };
}

function times_played_multiplier(plays: number, max_plays: number): number {
	return Math.max(plays / max_plays + 1, 1);
}
function time_since_last_played_multiplier(date: Date): number {
	const time_difference = Date.now() - date.getTime();
	const days_difference = time_difference / (1000 * 60 * 60 * 24);
	return Math.max((7 - days_difference) / 2, 1);
}

function filter_with_query_flags<T>(query: string, obj: T[], query_flags: QueryFlag<T>[]) {
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

const QUERY_SPLIT_OR = " OR ";
export function track_query_filter(tracks: Track[], query?: string): Track[] {
	if (is_empty(query)) return tracks;

	if(query!.includes(QUERY_SPLIT_OR)){
		return query!.split(QUERY_SPLIT_OR)
			.map(split_query => track_query_filter(tracks, split_query))
			.reduce((tracks_a, tracks_b) => tracks_include(tracks_a, tracks_b));
	}

	const max_plays = Math.max(...tracks.map((t) => t.meta?.plays ?? 0));

	const queried_result = filter_with_query_flags(query!, tracks, TRACK_QUERY_FLAGS);

	query = queried_result.new_query;
	tracks = queried_result.filtered_data;

	if (is_empty(query)) return tracks;

	return fuzzysort
		.go(query, tracks, {
			all: false,
			keys: ["title", (obj) => artist_string(obj), (obj) => obj.album?.name ?? "---------"],
			threshold: Prefs.get_pref("fuzzy_search_threshold") / 100,
			scoreFn: (r) => r.score * times_played_multiplier(r.obj.meta?.plays ?? 0, max_plays) * time_since_last_played_multiplier(r.obj.meta?.last_played_date ? new Date(r.obj.meta.last_played_date) : new Date())
		})
		.map((r) => r.obj);
}
export function playlist_query_filter(playlists: Playlist[], query?: string) {
	if (is_empty(query)) return playlists;

	const queried_result = filter_with_query_flags(query!, playlists, PLAYLIST_QUERY_FLAGS);

	query = queried_result.new_query;
	playlists = queried_result.filtered_data;

	if (is_empty(query)) return playlists;

	return fuzzysort
		.go(query, playlists, {
			all: false,
			threshold: Prefs.get_pref("fuzzy_search_threshold") / 100,
			keys: [(obj) => obj.title, (obj) => obj.description ?? "---------"]
		})
		.map((r) => r.obj);
}
export function album_query_filter(compact_playlists: CompactPlaylist[], query?: string) {
	if (is_empty(query)) return compact_playlists;

	const queried_result = filter_with_query_flags(query!, compact_playlists, COMPACT_PLAYLIST_QUERY_FLAGS);

	query = queried_result.new_query;
	compact_playlists = queried_result.filtered_data;

	if (is_empty(query)) return compact_playlists;

	return fuzzysort
		.go(query, compact_playlists, {
			all: false,
			threshold: Prefs.get_pref("fuzzy_search_threshold") / 100,
			keys: [(obj) => obj.title.name, (obj) => artist_string(obj)]
		})
		.map((r) => r.obj);
}
export function artist_query_filter(compact_artists: CompactArtist[], query?: string) {
	if (is_empty(query)) return compact_artists;

	const queried_result = filter_with_query_flags(query!, compact_artists, COMPACT_ARTIST_QUERY_FLAGS);

	query = queried_result.new_query;
	compact_artists = queried_result.filtered_data;

	if (is_empty(query)) return compact_artists;

	return fuzzysort
		.go(query, compact_artists, {
			all: false,
			threshold: Prefs.get_pref("fuzzy_search_threshold") / 100,
			keys: [(obj) => obj.name.name]
		})
		.map((r) => r.obj);
}
export function time_to_timestamp(time_seconds: number): string {
	const time_ms = Math.floor(time_seconds * 1000);
	const time_min = Math.floor(time_ms / 60000);
	const time_sec = Math.floor((time_ms - time_min * 60000) / 1000);

	return String(time_min).padStart(2, "0") + ":" + String(time_sec).padStart(2, "0");
}
export function path_to_directory(path: string) {
	return path.split("/").slice(0, -1).join("/");
}

export function track_to_illusive_uri(track: Track): IllusiveURI{
	const primary_key_to_music_service_uri: Record<keyof Track, MusicServiceURI> = {
		id: "illusi",
		uid: "illusi",
		title: "illusi",
		alt_title: "illusi",
		artists: "illusi",
		duration: "illusi",
		prods: "illusi",
		genre: "illusi",
		tags: "illusi",
		explicit: "illusi",
		unreleased: "illusi",
		album: "illusi",
		plays: "illusi",
		imported_id: "illusi",
		illusi_id: "illusi",
		youtube_id: "youtube",
		youtubemusic_id: "youtubemusic",
		soundcloud_id: "soundcloud",
		soundcloud_permalink: "soundcloud",
		spotify_id: "spotify",
		amazonmusic_id: "amazonmusic",
		applemusic_id: "applemusic",
		bandlab_id: "bandlab",
		artwork_url: "illusi",
		thumbnail_uri: "illusi",
		media_uri: "illusi",
		lyrics_uri: "illusi",
		synced_lyrics_uri: "illusi",
		meta: "illusi",
		playback: "illusi",
		downloading_data: "illusi"
	};
	const primary_key = track_primary_key(track);
	const music_service_uri = primary_key_to_music_service_uri[primary_key];
	return create_uri(music_service_uri, String(reinterpret_cast<string|number>(track[primary_key])));
}

export function create_uri(music_service_uri: MusicServiceURI, id: string): IllusiveURI {
	return `${music_service_uri}:${urlid(id)}`;
}
export function spotify_uri_to_uri(spotify_uri?: string): IllusiveURI | null {
	if (spotify_uri === undefined) return null;
	const [, , id] = spotify_uri.split(":");
	return create_uri("spotify", id);
}
export function spotify_uri_to_type(spotify_uri?: string): CompactPlaylistType | undefined {
	if (spotify_uri === undefined) return undefined;
	const [, type] = spotify_uri.split(":");
	switch (type) {
		case "playlist":
			return "PLAYLIST";
		case "album":
			return "ALBUM";
		case "collection":
			return "SAVED";
		default:
			return undefined;
	}
}
export function split_uri(uri: string): ParsedUri {
	return uri.split(":") as ParsedUri;
}
export function make_https(s: string) {
	return "https://" + s;
}
export function music_service_uri_to_music_service(music_service_uri: MusicServiceURI): MusicServiceType {
	switch (music_service_uri) {
		case "illusi":
			return "Illusi";
		case "musi":
			return "Musi";
		case "youtube":
			return "YouTube";
		case "youtubemusic":
			return "YouTube Music";
		case "spotify":
			return "Spotify";
		case "amazonmusic":
			return "Amazon Music";
		case "applemusic":
			return "Apple Music";
		case "soundcloud":
			return "SoundCloud";
		case "bandlab":
			return "BandLab";
		case "api":
			return "API";
	}
}
export function music_service_to_music_service_uri(music_service_uri: MusicServiceType): MusicServiceURI {
	switch (music_service_uri) {
		case "Illusi":
			return "illusi";
		case "Musi":
			return "musi";
		case "YouTube":
			return "youtube";
		case "YouTube Music":
			return "youtubemusic";
		case "Spotify":
			return "spotify";
		case "Amazon Music":
			return "amazonmusic";
		case "Apple Music":
			return "applemusic";
		case "SoundCloud":
			return "soundcloud";
		case "BandLab":
			return "bandlab";
		case "API":
			return "api";
	}
}
export function is_duration_string(str: string | undefined) {
	if (is_empty(str)) return false;
	return /^((\d+:)?\d{1,2}:)?\d{2}$/gm.test(str!);
}
export function is_number(str: string) {
	return !isNaN(parseFloat(str));
}
export function youtube_views_number(views_string?: string): number {
	if (is_empty(views_string)) return 0;
	views_string = remove(views_string!, " views", " view", " plays", " play");
	const last_char = views_string[views_string.length - 1];

	switch (last_char) {
		case "B":
			return parseFloat(views_string) * 1000000000;
		case "M":
			return parseFloat(views_string) * 1000000;
		case "K":
			return parseFloat(views_string) * 1000;
		default:
			return parseFloat(views_string);
	}
}
export function youtube_music_split_artists(runs: Run3[]): NamedUUID[] {
	if (is_empty(runs)) return [];
	const named_uris: NamedUUID[] = [];
	if (runs.length === 1) named_uris.push({ name: runs[0].text, uri: runs[0].navigationEndpoint !== undefined ? create_uri("youtubemusic", runs[0].navigationEndpoint.browseEndpoint.browseId) : null });
	else
		for (const run of runs) {
			const is_year = run.text.length === 4 && !isNaN(parseInt(run.text));
			if (!run.text.includes(",") && !run.text.includes("&") && !run.text.includes("and") && !run.text.includes(" • ") && !is_year) named_uris.push({ name: run.text, uri: run.navigationEndpoint !== undefined ? create_uri("youtubemusic", run.navigationEndpoint.browseEndpoint.browseId) : null });
		}
	return named_uris;
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
export function array_include<T>(a: T[], b: T[], compare_same: (a: T, b: T) => boolean) {
	const array: T[] = [...a];
	for (const b0 of b) {
		let included = false;
		for (const a0 of array)
			if (compare_same(a0, b0)) {
				included = true;
				break;
			}
		if (!included) array.push(b0);
	}
	return array;
}
export function array_exclude<T>(a: T[], b: T[], compare_same: (a: T, b: T) => boolean) {
	const array: T[] = [...a];
	return array.filter((arri) => {
		for (const b0i of b) if (compare_same(arri, b0i)) return false;
		return true;
	});
}
export function array_mask<T>(a: T[], b: T[], compare_same: (a: T, b: T) => boolean) {
	const array: T[] = [...a];
	for (let b0i = 0; b0i < b.length; b0i++) {
		const included = { included: false, i: 0 };
		for (const a0i of array) {
			if (compare_same(a0i, b[b0i])) {
				included.included = true;
				included.i = b0i;
				break;
			}
		}
		if (!included.included) array.push(b[b0i]);
		else array.splice(included.i, 1);
	}
	return array;
}
export function escape_regexpresion(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
// playlist_duration_to_string(tracks.map(({duration}) => duration).reduce(function(prev, cur) { return prev + cur; }, 0))
export function track_durations(tracks: Track[]) {
	return tracks.map(({ duration }) => duration);
}
export function sum(nums: number[]) {
	return nums.reduce((prev, cur) => prev + cur, 0);
}
export function tracks_duration_string(tracks: Track[]) {
	return playlist_duration_to_string(sum(track_durations(tracks)));
}
export function number_epsilon_distance(num: number, expected: number, plus_minus = 0) {
	const distance = Math.abs(num - expected);
	return distance <= plus_minus;
}

export function all_words(str: string) {
	return str.split(" ").map((word) => remove(word, /[^a-zA-Z\d\s:]/g));
}
export function str_or_include(str1: string, str2: string) {
	return str1.includes(str2) || str2.includes(str1);
}
export function one_includes_word_not_other(word_group_1: string[], word_group_2: string[], needle: string) {
	return (!word_group_1.includes(needle) && word_group_2.includes(needle)) || (word_group_1.includes(needle) && !word_group_2.includes(needle));
}

export function get_album_artwork(album_data: CompactPlaylist): Artwork{
	if(album_data.artwork_url) return album_data.artwork_url;
	if(album_data.artwork_index) return album_data.artwork_index;
	return best_thumbnail(album_data.artwork_thumbnails)?.url ?? 0;
}

export function music_service_track_primary_key(type: MusicServiceType): keyof Track {
	switch (type) {
		case "Musi":
		case "YouTube Music":
		case "YouTube":
			return "youtube_id";
		case "Spotify":
			return "spotify_id";
		case "SoundCloud":
			return "soundcloud_id";
		case "Apple Music":
			return "applemusic_id";
		case "Amazon Music":
			return "amazonmusic_id";
		case "Illusi":
			return "illusi_id";
		case "BandLab":
			return "bandlab_id"
		case "API":
			return "uid";
		default:
			return "uid";
	}
}

export function track_primary_key(track: Track): keyof Track {
	if (!is_empty(track.youtube_id)) return "youtube_id";
	if (!is_empty(track.soundcloud_id)) return "soundcloud_id";
	if (!is_empty(track.spotify_id)) return "spotify_id";
	if (!is_empty(track.applemusic_id)) return "applemusic_id";
	if (!is_empty(track.youtubemusic_id)) return "youtube_id";
	if (!is_empty(track.amazonmusic_id)) return "amazonmusic_id";
	if (!is_empty(track.imported_id)) return "imported_id";
	return "illusi_id";
}

export function all_track_ids(track: Track){
    return [track.illusi_id!, track.youtube_id!, track.spotify_id!, track.amazonmusic_id!, track.applemusic_id!, String(track.soundcloud_id ?? ""), track.imported_id!].filter(item => !is_empty(item));
}
const cached_ids_set = new TimedCacheValue<Set<string>>(Constants.cached_ids_duration_milliseconds);
export function track_exists(track: Track, global_tracks: Track[]) {
    const evil_set = cached_ids_set.update(() => new Set<string>(global_tracks.map(all_track_ids).flat()));
    for(const id of all_track_ids(track)){
        if(evil_set.has(id)) return true;
    }
    return false;
}

export function prefs_settings_groupby_filter(show_in_type_check: BasePref<any>["show_type"]): GroupSection<PrefEntry>[] {
	const entries = (Object.entries(Prefs.prefs) as PrefEntry[]).filter((item) => (item[1].visible ?? false) && item[1].show_type === show_in_type_check);
	const groups = groupby(entries, (item) => item[1].section ?? "Other");
	return Object.keys(groups).map((key: string) => ({ title: key, data: groups[key] }));
}

export function artist_string(track_or_compact_playlist_or_artist: NamedUUID | Track | CompactPlaylist): string {
	if (is_empty(track_or_compact_playlist_or_artist)) return "";
	if("name" in track_or_compact_playlist_or_artist) return remove_topic(track_or_compact_playlist_or_artist.name).trim();

	const artists = "artist" in track_or_compact_playlist_or_artist ? track_or_compact_playlist_or_artist.artist : track_or_compact_playlist_or_artist.artists;
	if (artists.length === 0) return "";
	if (artists.length <= 1) return remove_topic(artists?.[0].name ?? "").trim();
	const names = artists.map((artist) => remove_topic(artist?.name ?? "").trim());
	const final_name = names.pop()!;
	return names.length ? names.join(", ") + " & " + final_name : final_name;
}

export function tracks_with_artist(tracks: Track[], artist_name: string) {
	if (is_empty(artist_name)) return [];
	return tracks.filter(
		(track) => {
			for(const artist of track.artists){
				if(artist_string(artist).toLowerCase() == remove_topic(artist_name).toLowerCase().trim()){
					return true;
				}
			}
			return false;
		}
	);
}

// https://mokole.com/palette.html
const tint_color_list: HexColor[] = ["#a9a9a9", "#2f4f4f", "#556b2f", "#a0522d", "#800000", "#006400", "#808000", "#483d8b", "#3cb371", "#008b8b", "#4682b4", "#000080", "#9acd32", "#32cd32", "#daa520", "#8b008b", "#b03060", "#ff4500", "#ff8c00", "#ffd700", "#0000cd", "#00ff00", "#00fa9a", "#dc143c", "#00ffff", "#00bfff", "#f4a460", "#9370db", "#a020f0", "#adff2f", "#ff00ff", "#1e90ff", "#f0e68c", "#fa8072", "#dda0dd", "#afeeee", "#ee82ee", "#ffdab9", "#ff69b4", "#ffb6c1"];

export function generate_unique_track_tints(tracks: Track[], tint_table: Map<Track["uid"], HexColor>) {
	const with_album = tracks.filter((track) => !is_empty(track.album?.name));
	const grouped = groupby(with_album, (track) => track.album?.name);
	for (const key of Object.keys(grouped)) {
		if (grouped[key].length > 1) {
			const tints_clone = [...tint_color_list];
			const gen = seeded_rand(grouped[key][0].album?.name ?? "");
			for (const track of grouped[key]) {
				const tint = seeded_random_of(gen, tints_clone);
				tints_clone.splice(tints_clone.indexOf(tint), 1);
				tint_table.set(track.uid, tint);
			}
		}
	}
}

export function is_topic(str: string) {
	return str.endsWith(" - Topic");
}

export function clean_track_info(info: string) {
	const cleaned = remove_topic(remove(info, /\(.+?\)/gi, /\[.+?\]/gi)).trim();
	return cleaned;
}

export function should_automatic_refresh(last_refreshed: Date): boolean {
	const cdate = new Date();
	return cdate.getTime() - last_refreshed.getTime() >= milliseconds_of({ days: 1 }) || (cdate.getFullYear() >= last_refreshed.getFullYear() && cdate.getMonth() >= last_refreshed.getMonth() && cdate.getDay() >= last_refreshed.getDay() && cdate.getHours() - last_refreshed.getHours() >= 1);
}

export function small_track(track: Track): Track{
	return {
		uid: "...",
		title: track.title,
		artists: track.artists,
		duration: track.duration,
		album: track.album
	}
}