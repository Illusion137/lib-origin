import { extract_string_from_pattern, is_empty, remove, remove_topic, urlid } from "../../origin/src/utils/util";
import type { Run3 } from "../../origin/src/youtube/types/PlaylistResults_0";
import { Prefs } from "./prefs";
import { COMPACT_ARTIST_QUERY_FLAGS, COMPACT_PLAYLIST_QUERY_FLAGS, extract_query_flags, PLAYLIST_QUERY_FLAGS, TRACK_QUERY_FLAGS } from "./query_flags";
import fuzzysort from "fuzzysort";
import { seeded_rand } from "./seeding";
import type { AlbumSortMode, ArtistSortMode, CompactArtist, CompactPlaylist, CompactPlaylistType, GroupSection, HexColor, IllusiveThumbnail, IllusiveURI, IntString, MusicServiceType, MusicServiceURI, NamedUUID, ParsedUri, Playlist, PrefEntry, Promises, QueryFlag, Track } from "./types";
import { Constants } from "./constants";

export function has_file_extension(path: string){
    const extracted = extract_string_from_pattern(path, /(\.[0-9a-z]+$)/i);
    return typeof extracted === "string";
}
export function extract_file_extension(path: string, mime?: "photo"|"video"|"none") {
    const extracted = extract_string_from_pattern(path, /(\.[0-9a-z]+$)/i);
    if(typeof extracted === "object"){
        switch(mime){
            case "none": return "";
            case "photo": return ".jpg";
            case "video": return ".mp4";
            default: return ".txt";
        }
    }
    return extracted;
}
export function playlist_name_sql_friendly(playlist_name: string) { return playlist_name.replace(/\s/g, '_'); }
export function shuffle_array<T>(array: T[]) {
    let m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}
export function duration_to_string(track_duration: number): {left: number, duration: string} {
    if(track_duration/3600 >= 1) {
        const hours = Math.floor(track_duration / 3600);
        const minutes = Math.floor(track_duration % 3600 / 60);
        const seconds = Math.floor(track_duration % 3600 % 60);
        return {left: 40, duration: `${String(hours)}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`};
    } else if(track_duration / 60 >= 1) {
        const minutes = Math.floor(track_duration / 60);
        const seconds = Math.floor(track_duration % 60);
        return {left: 50, duration: `${String(minutes)}:${String(seconds).padStart(2,'0')}`};
    } else return {left: 58, duration: String(track_duration).padStart(2,'0')};
}
export function playlist_duration_to_string(playlist_duration: number): string {
    if(playlist_duration/3600 >= 1)
        return `${Math.floor(playlist_duration/3600).toString()}h ${Math.floor((playlist_duration % 3600) / 60).toString()}m`;
    else if(playlist_duration/60 >= 1)
        return `${Math.floor(playlist_duration/60).toString()}m`;
    return "< 1m"; 
}
export function create_thumbnails(url: string, width = NaN, height = NaN): IllusiveThumbnail[] {
    return [{url: url, width: width, height: height}];
}
export function best_thumbnail(thumbnails: IllusiveThumbnail[]|undefined) {
    if(thumbnails === undefined) return undefined;
    interface Max {"index": number, "value": number}
    let best: Max = {index: 0, value: 0};
    for(let i = 0; i < thumbnails.length; i++) {
        const dimension = thumbnails[i].width * thumbnails[i].height;
        const current: Max = {index: i, value: isNaN(dimension) ? 1 : dimension};
        if(current.value > best.value) best = current;
    }
    return thumbnails[best.index];
}
export function pad_number_left(num: number, padding: number): IntString {
    return String(num).padStart(padding, "0") as IntString;
}
export function date_from(date: {year?: number, month?: number, day?: number, hour?: number, minute?: number, second?: number, ms?: number}) {
    const new_date = new Date();
    if(date.year) new_date.setFullYear(date.year);
    if(date.month) new_date.setMonth(date.month);
    if(date.day) new_date.setDate(date.day);
    if(date.hour) new_date.setHours(date.hour);
    if(date.minute) new_date.setMinutes(date.minute);
    if(date.second) new_date.setSeconds(date.second);
    if(date.ms) new_date.setMilliseconds(date.ms);
    return new_date;
}

export function get_unique_artists_tracks(global_tracks: Track[]){
    const seen_artists = new Set<IllusiveURI>();
    const seen_artists_names = new Set<string>();
    return global_tracks
        .filter(track => !is_empty(track.artists[0].uri))
        .filter(track => {
            if(seen_artists.has(track.artists[0].uri!)) return false;
            seen_artists.add(track.artists[0].uri!)
            return true;
        })
        .filter(track => {
            if(seen_artists_names.has(track.artists[0].name)) return false;
            seen_artists_names.add(track.artists[0].name)
            return true;
        });
}
export function get_unique_artists(global_tracks: Track[]){
    return get_unique_artists_tracks(global_tracks)
        .map(track => track.artists[0]);
}
export function get_most_played_artists(global_tracks: Track[]){
    return get_unique_artists_tracks(global_tracks)
        .sort((a, b) => (b.meta?.plays ?? 0) - (a.meta?.plays ?? 0))
        .map(track => track.artists[0]);
}
export function sort_compact_artists_by_most_played(artists: NamedUUID[], global_tracks: Track[]): CompactArtist[]{
    const name_plays: [string, number][] = global_tracks.map(track => [track.artists[0].name, track.meta?.plays ?? 0]);
    const name_plays_map = new Map<string, number>();
    for(const name_play of name_plays){
        name_plays_map.set(name_play[0], (name_plays_map.get(name_play[0]) ?? 0) + name_play[1]);
    }
    return artists.slice().sort((a,b) => (name_plays_map.get(b?.name ?? "") ?? 0) - (name_plays_map.get(a?.name ?? "") ?? 0)).map(nammed_uuid_to_compact_artist);
}
export function sort_compact_playlist_by_most_played_artists(albums: CompactPlaylist[], global_tracks: Track[]): CompactPlaylist[]{
    const most_played_artists = get_most_played_artists(global_tracks);
    const most_played_artists_uris = new Map<string, number>(most_played_artists.map((artist, i) => [artist.uri ?? "", most_played_artists.length - (artist.uri ? i : 0)]));
    return albums.slice().sort((a, b) => (most_played_artists_uris.get(b.artist?.[0]?.uri ?? "") ?? 0) - (most_played_artists_uris.get(a.artist?.[0]?.uri ?? "") ?? 0));
}
export function nammed_uuid_to_compact_artist(artist: NamedUUID): CompactArtist{
    return ({name: artist, is_official_artist_channel: true, profile_artwork_url: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'});
}
export function compact_artist_to_nammed_uuid(artist: CompactArtist): NamedUUID{
    return ({name: artist.name.name, uri: artist.name.uri ?? null});
}
export function sort_compact_playlists(mode: AlbumSortMode, albums: CompactPlaylist[], global_tracks: Track[]): CompactPlaylist[]{
    switch(mode){
        case "NEWEST": return albums;
        case "OLDEST": return albums.slice().reverse();
        case "MOST_PLAYED_ARTISTS": return sort_compact_playlist_by_most_played_artists(albums, global_tracks);
        case "LEAST_PLAYED_ARTISTS": return sort_compact_playlist_by_most_played_artists(albums, global_tracks).reverse();
        default: return albums;
    }
}
export function sort_compact_artists(mode: ArtistSortMode, artists: NamedUUID[], global_tracks: Track[]): CompactArtist[]{
    switch(mode){
        case "NEWEST": return artists.slice().reverse().map(nammed_uuid_to_compact_artist);
        case "OLDEST": return artists.map(nammed_uuid_to_compact_artist);
        case "MOST_PLAYED": return sort_compact_artists_by_most_played(artists, global_tracks);
        case "LEAST_PLAYED": return sort_compact_artists_by_most_played(artists, global_tracks).reverse();
        default: return artists.map(nammed_uuid_to_compact_artist);
    }
}
export function track_section_map(tracks: Track[], queried: boolean): { "char_data": string[], "section_map": Track[][] } {
    const sections_map = new Map<string, Track[]>();
    const best_results: Track[] = queried ? tracks.slice(0, Constants.best_search_result_amount) : [];
    if(queried) tracks = tracks.slice(Constants.best_search_result_amount);
    for(const track of tracks) {
        let char = track.title[0].toUpperCase();
        if(!(/[A-Z]/).test(char)) char = '#';
        if( !sections_map.has(char) ) {
            sections_map.set(char, [track])
        } else {
            const new_tracks = sections_map.get(char)!;
            new_tracks.push(track);
            sections_map.set(char, new_tracks);
        }
    }
    const sections: Track[][] = [];
    const section_chars: string[] = [];
    const sorted_sections_map = [...sections_map].sort();
    if(queried){
        sorted_sections_map.unshift(['$', best_results])
    }
    for(const value of sorted_sections_map) { 
        sections.push( value[1] )
        section_chars.push(value[0])
    }
    return {char_data: section_chars, section_map: [...sections]};
}

function times_played_multiplier(plays: number, max_plays: number): number{
    return Math.max((plays / max_plays) + 1, 1);
}
function time_since_last_played_multiplier(date: Date): number{
    const time_difference = new Date().getTime() - date.getTime();
    const days_difference = time_difference / (1000 * 60 * 60 * 24);
    return Math.max((7 - days_difference) / 2, 1);
}

function filter_with_query_flags<T>(query: string, obj: T[], query_flags: QueryFlag<T>[]){
    const extracted_query_flags = extract_query_flags<T>(query, query_flags);

    query = extracted_query_flags.new_query;

    return {
        filtered_data: obj.filter(track => {
            if(is_empty(query) && extracted_query_flags.extracted_query_flags.length === 0) return false;
            const matches_any_flag = extracted_query_flags.extracted_query_flags.every(([flag, args, anti]) => anti ? !flag.condition(track, args) : flag.condition(track, args));
            return matches_any_flag;
        }),
        new_query: query
    };
}

export function track_query_filter(tracks: Track[], query?: string): Track[] {
    if(is_empty(query)) return tracks;
    const max_plays = Math.max(...tracks.map(t => t.meta?.plays ?? 0));

    const queried_result = filter_with_query_flags(query!, tracks, TRACK_QUERY_FLAGS);

    query = queried_result.new_query;
    tracks = queried_result.filtered_data;

    if(is_empty(query)) return tracks;

    return fuzzysort.go(
        query, 
        tracks,
        {
            all: false,
            keys: ['title', (obj) => artist_string(obj), (obj) => obj.album?.name ?? "---------"],
            scoreFn: r => r.score * times_played_multiplier(r.obj.meta?.plays ?? 0, max_plays) * time_since_last_played_multiplier(r.obj.meta?.last_played_date ? new Date(r.obj.meta.last_played_date) : new Date()),
        }
    ).map(r => r.obj);
}
export function playlist_query_filter(playlists: Playlist[], query?: string) {
    if(is_empty(query)) return playlists;
    
    const queried_result = filter_with_query_flags(query!, playlists, PLAYLIST_QUERY_FLAGS);

    query = queried_result.new_query;
    playlists = queried_result.filtered_data;

    if(is_empty(query)) return playlists;

    return fuzzysort.go(
        query, 
        playlists,
        {
            all: false,
            keys: [(obj) => obj.title, (obj) => obj.description ?? "---------"]
        }
    ).map(r => r.obj);
}
export function album_query_filter(compact_playlists: CompactPlaylist[], query?: string){
    if(is_empty(query)) return compact_playlists;
    
    const queried_result = filter_with_query_flags(query!, compact_playlists, COMPACT_PLAYLIST_QUERY_FLAGS);

    query = queried_result.new_query;
    compact_playlists = queried_result.filtered_data;

    if(is_empty(query)) return compact_playlists;

    return fuzzysort.go(
        query, 
        compact_playlists,
        {
            all: false,
            keys: [(obj) => obj.title.name, (obj) => artist_string(obj)]
        }
    ).map(r => r.obj);
}
export function artist_query_filter(compact_artists: CompactArtist[], query?: string){
    if(is_empty(query)) return compact_artists;
    
    const queried_result = filter_with_query_flags(query!, compact_artists, COMPACT_ARTIST_QUERY_FLAGS);

    query = queried_result.new_query;
    compact_artists = queried_result.filtered_data;

    if(is_empty(query)) return compact_artists;

    return fuzzysort.go(
        query, 
        compact_artists,
        {
            all: false,
            keys: [(obj) => obj.name.name]
        }
    ).map(r => r.obj);
}
export function cycle<T>(value: T, values: T[]): T {
    const value_index = values.findIndex(item => item === value);
    if(value_index === values.length - 1) return values[0];
    return values[value_index + 1];
}
export function character_count(haystack: string, needle: string) {
    let count = 0;
    for(const char of haystack) if(char === needle) count++;
    return count;
}
export function time_to_timestamp(time_seconds: number): string {
    const time_ms = Math.floor(time_seconds * 1000);
    const time_min = Math.floor(time_ms / 60000);
    const time_sec = Math.floor((time_ms - time_min * 60000) / 1000);
    
    return String(time_min).padStart(2, '0') + ':' + String(time_sec).padStart(2, '0');
}
export function path_to_directory(path: string) { return path.split("/").slice(0,-1).join("/"); }
export function create_uri(music_service_uri: MusicServiceURI, id: string): IllusiveURI {
    return `${music_service_uri}:${urlid(id)}`;
}
export function spotify_uri_to_uri(spotify_uri?: string): IllusiveURI|null {
    if(spotify_uri === undefined) return null;
    const [, , id] = spotify_uri.split(":");
    return create_uri("spotify", id);
}
export function spotify_uri_to_type(spotify_uri?: string): CompactPlaylistType|undefined {
    if(spotify_uri === undefined) return undefined;
    const [, type, ] = spotify_uri.split(":");
    switch(type) {
        case "playlist": return "PLAYLIST";
        case "album": return "ALBUM";
        case "collection": return "SAVED";
        default: return undefined;
    }
}
export function split_uri(uri: string): ParsedUri {
    return uri.split(':') as ParsedUri;
}
export function make_https(s: string) {
    return "https://" + s;
}
export function music_service_uri_to_music_service(music_service_uri: MusicServiceURI): MusicServiceType {
    switch(music_service_uri) {
        case "illusi":       return "Illusi";
        case "musi":         return "Musi";
        case "youtube":      return "YouTube";
        case "youtubemusic": return "YouTube Music";
        case "spotify":      return "Spotify";
        case "amazonmusic":  return "Amazon Music";
        case "applemusic":   return "Apple Music";
        case "soundcloud":   return "SoundCloud";
        case "api":          return "API";
    }
}
export function music_service_to_music_service_uri(music_service_uri: MusicServiceType): MusicServiceURI {
    switch(music_service_uri) {
        case "Illusi":        return "illusi";
        case "Musi":          return "musi";
        case "YouTube":       return "youtube";
        case "YouTube Music": return "youtubemusic";
        case "Spotify":       return "spotify";
        case "Amazon Music":  return "amazonmusic";
        case "Apple Music":   return "applemusic";
        case "SoundCloud":    return "soundcloud";
        case "API":           return "api";
    }
}
export function is_duration_string(str: string|undefined){
    if(is_empty(str)) return false;
    return /^((\d+:)?\d{1,2}:)?\d{2}$/gm.test(str!);
}
export function is_number(str: string){
    return !isNaN(parseFloat(str));
}
export function youtube_views_number(views_string?: string): number {
    if(is_empty(views_string)) return 0;
    views_string = remove(views_string!, " views",  " view", " plays", " play");
    const last_char = views_string[views_string.length - 1];

    switch(last_char) {
        case 'B': return parseFloat(views_string) * 1000000000;
        case 'M': return parseFloat(views_string) * 1000000;
        case 'K': return parseFloat(views_string) * 1000;
        default: return parseFloat(views_string);
    }
}
export function youtube_music_split_artists(runs: Run3[]): NamedUUID[] {
    if(is_empty(runs)) return [];
    const named_uris: NamedUUID[] = [];
    if(runs.length === 1) named_uris.push({name: runs[0].text, uri: runs[0].navigationEndpoint !== undefined ? create_uri("youtubemusic", runs[0].navigationEndpoint.browseEndpoint.browseId) : null });
    else
    for(const run of runs) {
        const is_year = run.text.length === 4 && !isNaN(parseInt(run.text));
        if(!run.text.includes(",") && !run.text.includes("&") && !run.text.includes("and") && !run.text.includes(" • ") && !is_year)
            named_uris.push({name: run.text, uri: run.navigationEndpoint !== undefined ? create_uri("youtubemusic", run.navigationEndpoint.browseEndpoint.browseId) : null });
    }
    return named_uris;
}
export function tracks_include(original: Track[], incoming: Track[]): Track[]{
    const original_seen_uid_set = new Set(original.map(({uid}) => uid));
    return [...original, ...incoming.filter(({uid}) => !original_seen_uid_set.has(uid))];
}
export function tracks_exclude(original: Track[], incoming: Track[]): Track[]{
    const incoming_seen_uid_set = new Set(incoming.map(({uid}) => uid));
    return original.filter(({uid}) => !incoming_seen_uid_set.has(uid));
}
export function tracks_mask(original: Track[], incoming: Track[]): Track[]{
    const original_seen_uid_set = new Set(original.map(({uid}) => uid));
    const incoming_seen_uid_set = new Set(incoming.map(({uid}) => uid));
    const to_add = incoming.filter(({uid}) => !original_seen_uid_set.has(uid));
    const to_remove = new Set(original.filter(({uid}) => incoming_seen_uid_set.has(uid)).map(({uid}) => uid));
    return [...original.filter(({uid}) => !to_remove.has(uid)), ...to_add];
}
export function tracks_intersection(original: Track[], incoming: Track[]): Track[]{
    const incoming_seen_uid_set = new Set(incoming.map(({uid}) => uid));
    return original.filter(({uid}) => incoming_seen_uid_set.has(uid));
}
export function array_include<T>(a: T[], b: T[], compare_same: (a: T, b: T) => boolean) {
    const array: T[] = [...a];
    for(const b0 of b) {
        let included = false;
        for(const a0 of array)
            if(compare_same(a0, b0)) { included = true; break; };
        if(!included) array.push(b0);
    }
    return array;
}
export function array_exclude<T>(a: T[], b: T[], compare_same: (a: T, b: T) => boolean) {
    const array: T[] = [...a];
    return array.filter(a => {
        for(let b0i = 0; b0i < b.length; b0i++)
            if(compare_same(a, b[b0i])) return false;
        return true;
    })
}
export function array_mask<T>(a: T[], b: T[], compare_same: (a: T, b: T) => boolean) {
    const array: T[] = [...a];
    for(let b0i = 0; b0i < b.length; b0i++) {
        const included = {included: false, i: 0};
        for(let a0i = 0; a0i < array.length; a0i++) {
            if(compare_same(array[a0i], b[b0i])) { included.included = true; included.i = b0i; break; };
        }
        if(!included.included) array.push(b[b0i]);
        else array.splice(included.i, 1);
    }
    return array;
}
export function escape_regexpresion(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
// playlist_duration_to_string(tracks.map(({duration}) => duration).reduce(function(prev, cur) { return prev + cur; }, 0))
export function track_durations(tracks: Track[]) {
    return tracks.map(({duration}) => duration);
}
export function sum(nums: number[]) {
    return nums.reduce((prev, cur) => prev + cur, 0);
}
export function tracks_duration_string(tracks: Track[]) {
    return playlist_duration_to_string( sum(track_durations(tracks)) );
}
export function number_epsilon_distance(num: number, expected: number, plus_minus = 0) {
    const distance = Math.abs(num - expected);
    return distance <= plus_minus;
}
export function random_of<T>(arr: T[]): T {
    const randidx = Math.floor(Math.random() * (Math.floor(arr.length) - 0) + 0);
    return arr[randidx];
}
export function seeded_random_of<T>(gen: () => number, arr: T[]): T {
    const randidx = Math.floor(gen() * (Math.floor(arr.length) - 0) + 0);
    return arr[randidx];
}
export async function all_promises(promises: Promises) {
    return await Promise.all(promises);
}
export function all_words(str: string) {
    return str.split(" ").map(word => remove(word, /[^a-zA-Z\d\s:]/g));
}
export function str_or_include(str1: string, str2: string) {
    return str1.includes(str2) || str2.includes(str1);
}
export function one_includes_word_not_other(word_group_1: string[], word_group_2: string[], needle: string){
    return (!word_group_1.includes(needle) &&  word_group_2.includes(needle)) 
        || ( word_group_1.includes(needle) && !word_group_2.includes(needle));
}

export function groupby<T>(items: T[], keyGetter: (t: T) => any): Record<string, T[]> {
    return items.reduce((accumulator: any, item) => {
        const key = keyGetter(item);
        (accumulator[key] = accumulator[key] || []).push(item);
        return accumulator;
    }, {});
};

export function music_service_track_primary_key(type: MusicServiceType): keyof Track{
    switch(type){
        case "Musi":
        case "YouTube Music":
        case "YouTube": return "youtube_id";
        case "Spotify": return "spotify_id";
        case "SoundCloud": return "soundcloud_id";
        case "Apple Music": return "applemusic_id";
        case "Amazon Music": return "amazonmusic_id";
        case "Illusi": return "illusi_id";
        case "API": return "uid";
        default: return "uid";
    }
}

export function track_primary_key(track: Track): keyof Track{
    if(is_empty(track.youtube_id)) return 'youtube_id';
    if(is_empty(track.soundcloud_id)) return 'soundcloud_id';
    if(is_empty(track.spotify_id)) return 'spotify_id';
    if(is_empty(track.applemusic_id)) return 'applemusic_id';
    if(is_empty(track.youtubemusic_id)) return 'youtube_id';
    if(is_empty(track.amazonmusic_id)) return 'amazonmusic_id';
    if(is_empty(track.imported_id)) return 'imported_id';
    return 'illusi_id';
}

export function prefs_settings_groupby_filter(show_in_type_check: Prefs.Pref<any>['show_in_type']): GroupSection<PrefEntry>[]{
	const entries = (Object.entries(Prefs.prefs) as PrefEntry[]).filter(item => (item[1].show_in_settings ?? false) && (item[1].show_in_type === show_in_type_check));
    const groups = groupby(entries, (item) => item[1].section ?? 'Other');
	return Object.keys(groups).map((key: string) => ({title: key, data: groups[key]}));
}

export function artist_string(track_or_compact_playlist: Track|CompactPlaylist): string{
    if(is_empty(track_or_compact_playlist)) return "";
    const artists = "artist" in track_or_compact_playlist ? track_or_compact_playlist.artist : track_or_compact_playlist.artists;
    if(artists.length === 0) return "";
    if(artists.length <= 1) return remove_topic(artists?.[0].name ?? "").trim();
    const names = artists.map(artist => remove_topic(artist?.name ?? "").trim());
    const final_name = names.pop()!;
    return names.length
        ? names.join(', ') + ' & ' + final_name
            : final_name;
}

export function version_greater_than(version: string, other_version: string): boolean{
    try {
        const [major, minor, patch] = version.split('.').map(item => parseInt(item));
        const [other_major, other_minor, other_patch] = other_version.split('.').map(item => parseInt(item));
        if(isNaN(major) || isNaN(minor) || isNaN(patch) || isNaN(other_major) || isNaN(other_minor) || isNaN(other_patch)) return false;
        if(major > other_major) return true;
        if(major === other_major && minor > other_minor) return true;
        if(major === other_major && minor === other_minor && patch > other_patch) return true;
        return false;
    }
    catch(e) {
        return false;
    }
}

export function single_case(str: string): string {
    if(str.length <= 2) return str.toUpperCase();
    const split = str.toLowerCase().split('');
    split[0] = split?.[0].toUpperCase();
    return split.join('');
}

export function tracks_with_artist(tracks: Track[], artist_name: string){
    if(is_empty(artist_name)) return [];
    return tracks.filter(track => artist_string(track).toLowerCase().includes(artist_name.toLowerCase()));
}

// https://mokole.com/palette.html
const tint_color_list: HexColor[] = [
    '#a9a9a9',
    '#2f4f4f',
    '#556b2f',
    '#a0522d',
    '#800000',
    '#006400',
    '#808000',
    '#483d8b',
    '#3cb371',
    '#008b8b',
    '#4682b4',
    '#000080',
    '#9acd32',
    '#32cd32',
    '#daa520',
    '#8b008b',
    '#b03060',
    '#ff4500',
    '#ff8c00',
    '#ffd700',
    '#0000cd',
    '#00ff00',
    '#00fa9a',
    '#dc143c',
    '#00ffff',
    '#00bfff',
    '#f4a460',
    '#9370db',
    '#a020f0',
    '#adff2f',
    '#ff00ff',
    '#1e90ff',
    '#f0e68c',
    '#fa8072',
    '#dda0dd',
    '#afeeee',
    '#ee82ee',
    '#ffdab9',
    '#ff69b4',
    '#ffb6c1',
];

export function generate_unique_track_tints(tracks: Track[], tint_table: Map<Track['uid'], HexColor>){
    const with_album = tracks.filter(track => !is_empty(track.album?.name));
    const grouped = groupby(with_album, track => track.album?.name);
    for(const key of Object.keys(grouped)){
        if(grouped[key].length > 1){
            const tints_clone = [...tint_color_list];
            const gen = seeded_rand(grouped[key][0].album?.name ?? "");
            for(const track of grouped[key]){
                const tint = seeded_random_of(gen, tints_clone);
                tints_clone.splice(tints_clone.indexOf(tint), 1);
                tint_table.set(track.uid, tint);
            }
        }
    }
}

export function is_topic(str: string){
    return str.endsWith(" - Topic");
}

export function clean_title(title: string){
    const cleaned = remove(title, /\(.+?\)/gi, /\[.+?\]/gi).trim();
    return cleaned;
}

export function recreate<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}