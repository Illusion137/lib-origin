import { is_empty, make_topic, remove, remove_special_chars } from "../../origin/src/utils/util";
import { Run3 } from "../../origin/src/youtube/types/PlaylistResults_0";
import { IllusiveThumbnail, IllusiveURI, IntString, ISOString, MusicServiceType, MusicServiceURI, MusicServiceURIPath, NamedUUID, ParsedUri, Playlist, Track } from "./types";

export function extract_file_extension(path: string){ return '.' + path.replace(/(.+\/)*.+?\./, ''); }
export function playlist_name_sql_friendly(playlist_name: string){ return playlist_name.replace(/\s/g, '_'); }
export function shuffle_array<T>(array: T[]) {
    var m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}
export function duration_to_string(track_duration: number): {left: number, duration: string}{
    if(track_duration/3600 >= 1){
        const hours = Math.floor(track_duration / 3600);
        const minutes = Math.floor(track_duration % 3600 / 60);
        const seconds = Math.floor(track_duration % 3600 % 60);
        return {"left": 40, "duration": `${String(hours)}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`};
    } 
    else if(track_duration / 60 >= 1){
        const minutes = Math.floor(track_duration / 60);
        const seconds = Math.floor(track_duration % 60);
        return {"left": 50, "duration": `${String(minutes)}:${String(seconds).padStart(2,'0')}`}
    }
    else return {'left': 58, 'duration': String(track_duration).padStart(2,'0')};
}
export function playlist_duration_to_string(playlist_duration: number): string{
    if(playlist_duration/3600 >= 1)
        return `${Math.floor(playlist_duration/3600).toString()}h ${Math.floor((playlist_duration % 3600) / 60).toString()}m`;
    else if(playlist_duration/60 >= 1)
        return `${Math.floor(playlist_duration/60).toString()}m`;
    return "< 1m"; 
}
export function create_thumbnails(url: string, width = NaN, height = NaN): IllusiveThumbnail[]{
    return [{"url": url, "width": width, "height": height}];
}
export function best_thumbnail(thumbnails: IllusiveThumbnail[]){
    if(thumbnails === undefined) return undefined;
    type Max = {"index": number, "value": number};
    let best: Max = {"index": 0, "value": 0};
    for(let i = 0; i < thumbnails.length; i++){
        const dimension = thumbnails[i].width * thumbnails[i].height;
        const current: Max = {"index": i, "value": isNaN(dimension) ? 1 : dimension};
        if(current.value > best.value) best = current;
    }
    return thumbnails[best.index];
}
export function pad_number_left(num: number, padding: number): IntString{
    return String(num).padStart(padding, "0") as IntString;
}
export function date_from(date: {year?: number, month?: number, day?: number}){
    const new_date = new Date();
    const iso_string: ISOString = `${pad_number_left(date.year ?? new_date.getFullYear(), 4)}-${pad_number_left(date.month ?? new_date.getMonth(), 2)}-${pad_number_left(date.day ?? new_date.getDay(), 2)}T00:00:00.000Z`;
    return new Date(iso_string);
}
export function track_section_map(tracks: Track[]): { "char_data": string[], "section_map": Track[][] }{
    const sections_map = new Map<string, Track[]>();
    for(const track of tracks){
        let char = track.title[0].toUpperCase();
        if(!(/[A-Z]/).test(char)) char = '#';
        if( !sections_map.has(char) ) {
            sections_map.set(char, [track])
        }
        else {
            const new_tracks = sections_map.get(char)!;
            new_tracks.push(track)
            sections_map.set(char, new_tracks)
        }
    }
    const sections: Track[][] = []
    const section_chars: string[] = []
    const sorted_sections_map = [...sections_map].sort()
    for(const value of sorted_sections_map){ 
        sections.push( value[1] )
        section_chars.push(value[0])
    }
    return {"char_data": section_chars, "section_map": [...sections]};
}
export function track_query_filter(tracks: Track[], query?: string){
    if(!is_empty(query)){
        const jp_flag = query!.includes("@jp");
        const jp_regex = /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤]+/gi;

        query = remove(query!, "@jp");
        
        return tracks.filter(track => (
            track.artists[0].name.toUpperCase().includes(query!.toUpperCase()) 
                || remove_special_chars(track.title.toUpperCase()).includes(remove_special_chars(query!).toUpperCase()) 
                || (jp_flag && (jp_regex.test(track.title)||jp_regex.test(track.artists[0].name))) 
            ))
    }
    return tracks;
}
export function playlist_query_filter(playlists: Playlist[], query?: string){
    if(!is_empty(query))
        return playlists.filter(playlist => playlist.title.toLowerCase().includes(playlist.title.toLowerCase()));
    return playlists;
}
export function cycle<T>(value: T, values: T[]): T{
    const value_index = values.findIndex(item => item === value);
    if(value_index === values.length - 1) return values[0];
    return values[value_index + 1];
}
export function character_count(haystack: string, needle: string){
    let count = 0;
    for(const char of haystack) if(char === needle) count++;
    return count;
}
export function time_to_timestamp(time_seconds: number): string{
    const time_ms = Math.floor(time_seconds * 1000);
    const time_min = Math.floor(time_ms / 60000);
    const time_sec = Math.floor((time_ms - time_min * 60000) / 1000);
    
    return String(time_min).padStart(2, '0') + ':' + String(time_sec).padStart(2, '0');
}
export function path_to_directory(path: string){ return path.split("/").slice(0,-1).join("/"); }
export function create_uri(music_service_uri: MusicServiceURI, id: string): IllusiveURI {
    return `${music_service_uri}:${id}`;
}
export function spotify_uri_to_uri(spotify_uri?: string): IllusiveURI|null {
    if(spotify_uri === undefined) return null;
    const [spotify, type, id] = spotify_uri.split(":");
    return create_uri("spotify", id);
}
export function split_uri(uri: string): ParsedUri {
    return uri.split(':') as ParsedUri;
}
export function music_service_uri_to_music_service(music_service_uri: MusicServiceURI): MusicServiceType{
    switch(music_service_uri){
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
export function youtube_views_number(views_string: string): number{
    if(is_empty(views_string)) return 0;
    views_string = views_string.replace(" views", '');
    const last_char = views_string[views_string.length - 1];
    const sliced = views_string.slice(0, views_string.length - 1);
    switch(last_char){
        case 'B': return parseFloat(sliced) * 1000000000;
        case 'M': return parseFloat(sliced) * 1000000;
        case 'K': return parseFloat(sliced) * 1000;
        default: return parseFloat(sliced);
    }
}
export function youtube_music_split_artists(runs: Run3[]): NamedUUID[] {
    const named_uris: NamedUUID[] = [];
    if(runs.length === 1) named_uris.push({"name": runs[0].text, "uri": runs[0].navigationEndpoint !== undefined ? create_uri("youtubemusic", runs[0].navigationEndpoint.browseEndpoint.browseId) : null });
    else
    for(const run of runs){
        if(!run.text.includes(",") && !run.text.includes("&") && !run.text.includes("and"))
            named_uris.push({"name": runs[0].text, "uri": runs[0].navigationEndpoint !== undefined ? create_uri("youtubemusic", runs[0].navigationEndpoint.browseEndpoint.browseId) : null });
    }
    return named_uris;
}
export function array_include<T>(a: T[], b: T[], compare_same: (a: T, b: T) => boolean){
    const array: T[] = [...a];
    for(const b0 of b){
        let included = false;
        for(const a0 of array)
            if(compare_same(a0, b0)) { included = true; break; };
        if(!included) array.push(b0);
    }
    return array;
}
export function array_exclude<T>(a: T[], b: T[], compare_same: (a: T, b: T) => boolean){
    const array: T[] = [...a];
    for(let b0i = 0; b0i < b.length; b0i++)
        for(let a0i = 0; a0i < array.length; a0i++)
            if(compare_same(array[a0i], b[b0i])) { array.splice(b0i, 1); break; };
    return array;
}
export function array_mask<T>(a: T[], b: T[], compare_same: (a: T, b: T) => boolean){
    const array: T[] = [...a];
    for(let b0i = 0; b0i < b.length; b0i++){
        const included = {included: false, i: 0};
        for(let a0i = 0; a0i < array.length; a0i++){
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