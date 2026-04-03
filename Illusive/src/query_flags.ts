import fuzzysort from "fuzzysort";
import { is_empty } from "@common/utils/util";
import type { CompactArtist, CompactPlaylist, Playlist, QueryFlag, Track } from "@illusive/types";
import { remove_topic } from "@common/utils/clean_util";

export const ANTI_QUERY_FLAG_PREFIX = '!';
const UNTIL_FLAG_ARG_AMOUNT = 8;

function artist_string(track_or_compact_playlist: Track|CompactPlaylist): string{
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

export function parse_words(query: string){
    return query?.split(' ');
}
export function get_first_word_str(args: string[], i: number): string{
    return (args?.[i] ?? "").trim();
}
export function get_word_num(args: string[], i: number): number{
    return parseInt((args?.[i] ?? "").trim());
}

export function included_in(str1: string, from_str: string): boolean{
    return from_str.trim().toLowerCase().includes(str1.trim().toLowerCase());
}

export function extract_query_flags<T>(query: string, QUERY_FLAGS: QueryFlag<T>[]){
    query ??= "";
    const words = parse_words(query);
    const query_flags_flags = QUERY_FLAGS.map(flag => flag.flag).concat(QUERY_FLAGS.map(flag => ANTI_QUERY_FLAG_PREFIX + flag.flag));
    const extracted_query_flags: [QueryFlag<T>, string[], boolean][] = [];
    for(let i = 0; i < words.length; i++){
        if(!query_flags_flags.includes(words[i])) continue;
        const found_flag = words.splice(i--, 1)[0];
        const is_antiflag: boolean = found_flag.includes(ANTI_QUERY_FLAG_PREFIX);
        const full_query_flag = QUERY_FLAGS.find(flag => flag.flag === found_flag.replace(ANTI_QUERY_FLAG_PREFIX, ''))!;
        const found_args: string[] = [];
        const end_on_flag = full_query_flag?.args === -1;
        const args_length = end_on_flag ? UNTIL_FLAG_ARG_AMOUNT : full_query_flag?.args ?? 0;
        for(let j = 0; j < args_length; j++){
            if(query_flags_flags.includes(words[i + 1])) break;
            i++;
            found_args.push(...words.splice(i--, 1));
        }
        extracted_query_flags.push([full_query_flag, found_args, is_antiflag])
    }
    return {
        new_query: words.join(' '),
        extracted_query_flags
    }
}

const jp_regex = /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤]+/gi;
export const TRACK_QUERY_FLAGS: QueryFlag<Track>[] = [
    {
        flag: '@en',
        condition: (track) => track.explicit === "NONE",
        description: "Not Clean or Explicit",
    },
    {
        flag: '@ex',
        condition: (track) => track.explicit === "EXPLICIT",
        description: "Explicit"
    },
    {
        flag: '@cl',
        condition: (track) => track.explicit === "CLEAN",
        description: "Clean"
    },
    {
        flag: '@jp',
        condition: (track) => jp_regex.test(track.title)||jp_regex.test(artist_string(track)),
        description: "Has Japanese characters"
    },
    {
        flag: '@sc',
        condition: (track) => !is_empty(track.soundcloud_id),
        description: "Has a Soundcloud ID"
    },
    {
        flag: '@yt',
        condition: (track) => !is_empty(track.youtube_id),
        description: "Has a YouTube ID"
    },
    {
        flag: '@ym',
        condition: (track) => !is_empty(track.youtubemusic_id),
        description: "Has a YouTube Music ID"
    },
    {
        flag: '@am',
        condition: (track) => !is_empty(track.amazonmusic_id),
        description: "Has a Amazon Music ID"
    },
    {
        flag: '@sp',
        condition: (track) => !is_empty(track.spotify_id),
        description: "Has a Spotify ID"
    },
    {
        flag: '@ap',
        condition: (track) => !is_empty(track.applemusic_id),
        description: "Has a Apple Music ID"
    },
    {
        flag: '@imp',
        condition: (track) => !is_empty(track.imported_id),
        description: "Imported"
    },
    {
        flag: '@dl',
        condition: (track) => !is_empty(track.media_uri),
        description: "Media Downloaded"
    },
    {
        flag: '@tdl',
        condition: (track) => !is_empty(track.thumbnail_uri),
        description: "Thumbnail Downloaded"
    },
    {
        flag: '@ldl',
        condition: (track) => !is_empty(track.lyrics_uri),
        description: "Lyrics Downloaded"
    },
    {
        flag: '@sldl',
        condition: (track) => !is_empty(track.synced_lyrics_uri),
        description: "Synced Lyrics Downloaded"
    },
    {
        flag: '@uv',
        condition: (track) => track.meta?.unavailable ?? false,
        description: "Unavailable on YouTube"
    },
    {
        flag: '@unr',
        condition: (track) => track.unreleased ?? false,
        description: "Unreleased"
    },
    {
        flag: '@age',
        condition: (track) => track.meta?.age_restricted ?? false,
        description: "Age-Restricted"
    },
    {
        flag: '@trim',
        condition: (track) => !is_empty(track.meta?.begdur) || !is_empty(track.meta?.enddur),
        description: "Trimmed"
    },
    {
        flag: '@eq',
        args: -1,
        condition: (track, args) => included_in(args.join(' '), track.title) || included_in(args.join(' '), artist_string(track)) || (track.album?.name ? included_in(args.join(' '), track.album?.name) : false),
        description: "Strong Equals"
    },
    {
        flag: '@tteq',
        args: -1,
        condition: (track, args) => included_in(args.join(' '), track.title),
        description: "Title Equals"
    },
    {
        flag: '@ttfzy',
        args: -1,
        condition: (track, args) => (fuzzysort.single(args.join(' '), track.title)?.score ?? 0) > 0.6,
        description: "Title Fuzzy Search"
    },
    {
        flag: '@arteq',
        args: -1,
        condition: (track, args) => included_in(args.join(' '), artist_string(track)),
        description: "Artists Equals"
    },
    {
        flag: '@artfzy',
        args: -1,
        condition: (track, args) => (fuzzysort.single(args.join(' '), artist_string(track))?.score ?? 0) > 0.6,
        description: "Artists Fuzzy Search"
    },
    {
        flag: '@albeq',
        args: -1,
        condition: (track, args) => track.album?.name ? included_in(args.join(' '), track.album?.name) : false,
        description: "Album Equals"
    },
    {
        flag: '@albfzy',
        args: -1,
        condition: (track, args) => track.album?.name ? (fuzzysort.single(args.join(' '), track.album?.name)?.score ?? 0) > 0.6  : false,
        description: "Album Fuzzy Search"
    },
    {
        flag: '@drg',
        condition: (track, args) => track.duration >= get_word_num(args, 0),
        description: "Duration (sec) greater than or equal to [x]",
        args: 1
    },
    {
        flag: '@drl',
        condition: (track, args) => track.duration <= get_word_num(args, 0),
        description: "Duration (sec) less than or equal to [x]",
        args: 1
    },
    {
        flag: '@vwg',
        condition: (track, args) => (track.plays ?? 0) >= get_word_num(args, 0),
        description: "Global views greater than or equal to [x]",
        args: 1
    },
    {
        flag: '@vwl',
        condition: (track, args) => (track.plays ?? 0) <= get_word_num(args, 0),
        description: "Global views less than or equal to [x]",
        args: 1
    },
    {
        flag: '@plg',
        condition: (track, args) => (track.meta?.plays ?? 0) >= get_word_num(args, 0),
        description: "Plays greater than or equal to [x]",
        args: 1
    },
    {
        flag: '@pll',
        condition: (track, args) => (track.meta?.plays ?? 0) <= get_word_num(args, 0),
        description: "Plays less than or equal to [x]",
        args: 1
    },
    {
        flag: '@lsdg',
        condition: (track, args) => (new Date(track.meta?.last_sampled_date ?? 0)).getTime() >= Date.now() - (get_word_num(args, 0) * 1000 * 60 * 60 * 24),
        description: "Sampled after [x] days ago",
        args: 1
    },
    {
        flag: '@lsdl',
        condition: (track, args) => (new Date(track.meta?.last_sampled_date ?? 0)).getTime() <= Date.now() - (get_word_num(args, 0) * 1000 * 60 * 60 * 24),
        description: "Sampled before [x] days ago",
        args: 1
    },
    {
        flag: '@addg',
        condition: (track, args) => (new Date(track.meta?.added_date ?? 0)).getTime() >= Date.now() - (get_word_num(args, 0) * 1000 * 60 * 60 * 24),
        description: "Added after [x] days ago",
        args: 1
    },
    {
        flag: '@addl',
        condition: (track, args) => (new Date(track.meta?.added_date ?? 0)).getTime() <= Date.now() - (get_word_num(args, 0) * 1000 * 60 * 60 * 24),
        description: "Added before [x] days ago",
        args: 1
    },
    {
        flag: '@lpdg',
        condition: (track, args) => (new Date(track.meta?.last_played_date ?? 0)).getTime() >= Date.now() - (get_word_num(args, 0) * 1000 * 60 * 60 * 24),
        description: "Played after [x] days ago",
        args: 1
    },
    {
        flag: '@lpdl',
        condition: (track, args) => (new Date(track.meta?.last_played_date ?? 0)).getTime() <= Date.now() - (get_word_num(args, 0) * 1000 * 60 * 60 * 24),
        description: "Played before [x] days ago",
        args: 1
    },
    {
        flag: '@ddg',
        condition: (track, args) => (new Date(track.meta?.downloaded_date ?? 0)).getTime() >= Date.now() - (get_word_num(args, 0) * 1000 * 60 * 60 * 24),
        description: "Downloaded after [x] days ago",
        args: 1
    },
    {
        flag: '@ddl',
        condition: (track, args) => (new Date(track.meta?.downloaded_date ?? 0)).getTime() <= Date.now() - (get_word_num(args, 0) * 1000 * 60 * 60 * 24),
        description: "Downloaded before [x] days ago",
        args: 1
    },
    {
        flag: '@ma',
        condition: (track) => track.artists.length > 1,
        description: "Multiple Artists",
    },
    {
        flag: '@prod',
        condition: (track) => !is_empty(track.prods),
        description: "Has a known prod",
    },
    {
        flag: '@prodby',
        condition: (track, args) => (track.prods ?? "").toLowerCase().includes(args?.[0]),
        description: "Search for [x] prod",
    },
];

export const PLAYLIST_QUERY_FLAGS: QueryFlag<Playlist>[] = [
    {
        flag: '@eq',
        args: -1,
        condition: (playlist, args) => included_in(args.join(' '), playlist.title),
        description: "Strong Equals"
    },
    {
        flag: '@pin',
        condition: (playlist) => playlist.pinned ?? false,
        description: "Pinned",
    },
    {
        flag: '@pub',
        condition: (playlist) => playlist.public ?? false,
        description: "Public",
    },
    {
        flag: '@inpl',
        condition: (playlist) => (playlist.inherited_playlists ?? []).length !== 0,
        description: "Has Inherited Playlists",
    },
    {
        flag: '@ins',
        condition: (playlist) => (playlist.inherited_searchs ?? []).length !== 0,
        description: "Has Inherited Searches",
    },
    {
        flag: '@tdl',
        condition: (playlist) => !is_empty(playlist.thumbnail_uri),
        description: "Downloaded Thumbnail",
    },
];

export const COMPACT_PLAYLIST_QUERY_FLAGS: QueryFlag<CompactPlaylist>[] = [
    {
        flag: '@eq',
        args: -1,
        condition: (album, args) => included_in(args.join(' '), album.title.name) || included_in(args.join(' '), artist_string(album)),
        description: "Strong Equals"
    },
    {
        flag: '@ex',
        condition: (album) => album.explicit === "EXPLICIT",
        description: "Is Explicit",
    },
    {
        flag: '@album',
        condition: (album) => album.album_type === "ALBUM",
        description: "Is Album",
    },
    {
        flag: '@single',
        condition: (album) => album.album_type === "SINGLE",
        description: "Is Single",
    },
    {
        flag: '@ep',
        condition: (album) => album.album_type === "SINGLE/EP" || album.album_type === "EP",
        description: "Is EP",
    },
    {
        flag: '@song',
        condition: (album) => album.album_type === "SONG",
        description: "Is Song",
    },
    {
        flag: '@ma',
        condition: (album) => album.artist.length > 1,
        description: "Multiple Artists",
    },
];

export const COMPACT_ARTIST_QUERY_FLAGS: QueryFlag<CompactArtist>[] = [
    {
        flag: '@eq',
        args: -1,
        condition: (artist, args) => included_in(args.join(' '), artist.name.name),
        description: "Strong Equals"
    },
    {
        flag: '@official',
        condition: (artist) => artist.is_official_artist_channel,
        description: "Is Official",
    },
];