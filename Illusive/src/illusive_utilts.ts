import { is_empty, remove, remove_special_chars, remove_topic, urlid } from "../../origin/src/utils/util";
import { Run3 } from "../../origin/src/youtube/types/PlaylistResults_0";
import { Prefs } from "./prefs";
import { QUERY_FLAGS } from "./query_flags";
import { CompactPlaylistType, GroupSection, IllusiveThumbnail, IllusiveURI, IntString, MusicServiceType, MusicServiceURI, NamedUUID, ParsedUri, Playlist, PrefEntry, Promises, Track } from "./types";

export function extract_file_extension(path: string) { return '.' + path.replace(/(.+\/)*.+?\./, ''); }
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
export function track_section_map(tracks: Track[]): { "char_data": string[], "section_map": Track[][] } {
    const sections_map = new Map<string, Track[]>();
    for(const track of tracks) {
        let char = track.title[0].toUpperCase();
        if(!(/[A-Z]/).test(char)) char = '#';
        if( !sections_map.has(char) ) {
            sections_map.set(char, [track])
        } else {
            const new_tracks = sections_map.get(char)!;
            new_tracks.push(track)
            sections_map.set(char, new_tracks)
        }
    }
    const sections: Track[][] = []
    const section_chars: string[] = []
    const sorted_sections_map = [...sections_map].sort()
    for(const value of sorted_sections_map) { 
        sections.push( value[1] )
        section_chars.push(value[0])
    }
    return {char_data: section_chars, section_map: [...sections]};
}

export function track_query_filter(tracks: Track[], query?: string) {
    if(!is_empty(query)) {
        const matched_query_flags = QUERY_FLAGS.filter(flag => query?.includes(flag.flag));

        query = remove(query!, ...matched_query_flags.map(flag => RegExp(`${flag.flag} ?`, 'gi')));

        return tracks.filter(track => {
            if(is_empty(query)) return false;
            const title = Prefs.get_pref('alt_titles') && !is_empty(track.alt_title) ? track.alt_title! : track.title;
            const includes_title = remove_special_chars(title.toUpperCase()).includes(remove_special_chars(query!).toUpperCase());
            if(includes_title) return true;
            const includes_artist = artist_string(track).toUpperCase().includes(query!.toUpperCase());
            if(includes_artist) return true;
            const includes_album = track.album?.name.toUpperCase().includes(query?.toUpperCase() ?? "") ?? false;
            if(includes_album) return true;
            
            const matches_any_flag = matched_query_flags.some(flag =>  flag.condition(track));
            return matches_any_flag;
        });
    }
    return tracks;
}
export function playlist_query_filter(playlists: Playlist[], query?: string) {
    if(!is_empty(query))
        return playlists.filter(playlist => playlist.title.toLowerCase().includes(query!.toLowerCase()));
    return playlists;
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
        case "Illusi":        return "illusi";;
        case "Musi":          return "musi";;
        case "YouTube":       return "youtube";;
        case "YouTube Music": return "youtubemusic";;
        case "Spotify":       return "spotify";;
        case "Amazon Music":  return "amazonmusic";;
        case "Apple Music":   return "applemusic";;
        case "SoundCloud":    return "soundcloud";;
        case "API":           return "api";;
    }
}
export function is_duration_string(str: string|undefined){
    if(str === undefined) return false;
    return /^((\d+:)?\d{1,2}:)?\d{2}$/gm.test(str);
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
    const named_uris: NamedUUID[] = [];
    if(runs.length === 1) named_uris.push({name: runs[0].text, uri: runs[0].navigationEndpoint !== undefined ? create_uri("youtubemusic", runs[0].navigationEndpoint.browseEndpoint.browseId) : null });
    else
    for(const run of runs) {
        if(!run.text.includes(",") && !run.text.includes("&") && !run.text.includes("and"))
            named_uris.push({name: runs[0].text, uri: runs[0].navigationEndpoint !== undefined ? create_uri("youtubemusic", runs[0].navigationEndpoint.browseEndpoint.browseId) : null });
    }
    return named_uris;
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
export function empty_join(vals: any[], join_with: string) {
    return vals.filter(vals => !is_empty(vals)).join(join_with);
}
export function empty_join_dot(vals: any[]) {
    return empty_join(vals, " • ");
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

export function prefs_settings_groupby_filter(show_in_type_check: Prefs.Pref<any>['show_in_type']): GroupSection<PrefEntry>[]{
	const entries = (Object.entries(Prefs.prefs) as PrefEntry[]).filter(item => (item[1].show_in_settings ?? false) && (item[1].show_in_type === show_in_type_check));
    const groups = groupby(entries, (item) => item[1].section ?? 'Other');
	return Object.keys(groups).map((key: string) => ({title: key, data: groups[key]}));
}

export function artist_string(track: Track): string{
    if(is_empty(track)) return "";
    if(track.artists.length <= 1) return remove_topic(track.artists[0].name).trim();
    const names = track.artists.map(artist => remove_topic(artist.name).trim());
    const final_name = names.pop()!;
    return names.length
        ? names.join(', ') + ' & ' + final_name
            : final_name;
}