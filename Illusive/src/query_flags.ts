import { is_empty, remove_topic } from "../../origin/src/utils/util";
import { QueryFlag, Track } from "./types";

export const ANTI_QUERY_FLAG_PREFIX = '!';

function artist_string(track: Track): string{
    if(is_empty(track)) return "";
    if(track.artists.length <= 1) return remove_topic(track.artists[0].name).trim();
    const names = track.artists.map(artist => remove_topic(artist.name).trim());
    const final_name = names.pop()!;
    return names.length
        ? names.join(', ') + ' & ' + final_name
            : final_name;
}

export function parse_words(query: string){
    return query.split(' ');
}
export function get_first_word_str(query: string): string{
    return parse_words(query)[0].trim();
}
export function get_first_word_num(query: string): number{
    return parseInt(parse_words(query)[0].trim());
}

const jp_regex = /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤]+/gi;
export const QUERY_FLAGS: QueryFlag[] = [
    {
        flag: '@en',
        condition: (track) => track.explicit === "NONE",
        description: "All tracks that are found without a explicit tag",
    },
    {
        flag: '@ex',
        condition: (track) => track.explicit === "EXPLICIT",
        description: "All tracks that are marked as EXPLICIT"
    },
    {
        flag: '@cl',
        condition: (track) => track.explicit === "CLEAN",
        description: "All tracks that are marked as CLEAN"
    },
    {
        flag: '@jp',
        condition: (track) => jp_regex.test(track.title)||jp_regex.test(artist_string(track)),
        description: "All tracks that have Japanese characters in their titles or artists"
    },
    {
        flag: '@sc',
        condition: (track) => !is_empty(track.soundcloud_id),
        description: "All tracks that include a Soundcloud ID"
    },
    {
        flag: '@yt',
        condition: (track) => !is_empty(track.youtube_id),
        description: "All tracks that include a YouTube ID"
    },
    {
        flag: '@ym',
        condition: (track) => !is_empty(track.youtubemusic_id),
        description: "All tracks that include a YouTube Music ID"
    },
    {
        flag: '@am',
        condition: (track) => !is_empty(track.amazonmusic_id),
        description: "All tracks that include a Amazon Music ID"
    },
    {
        flag: '@sp',
        condition: (track) => !is_empty(track.spotify_id),
        description: "All tracks that include a Spotify ID"
    },
    {
        flag: '@ap',
        condition: (track) => !is_empty(track.applemusic_id),
        description: "All tracks that include a Apple Music ID"
    },
    {
        flag: '@imp',
        condition: (track) => !is_empty(track.imported_id),
        description: "All tracks that include a Imported ID"
    },
    {
        flag: '@dl',
        condition: (track) => !is_empty(track.media_uri),
        description: "All tracks that include a Media URI"
    },
    {
        flag: '@tdl',
        condition: (track) => !is_empty(track.thumbnail_uri),
        description: "All tracks that include a Thumbnail URI"
    },
    {
        flag: '@ldl',
        condition: (track) => !is_empty(track.lyrics_uri),
        description: "All tracks that include a Lyrics URI"
    },
    {
        flag: '@uv',
        condition: (track) => track.meta?.unavailable ?? false,
        description: "All tracks that are downloaded but are now unavailable on YouTube"
    },
    {
        flag: '@unr',
        condition: (track) => track.unreleased ?? false,
        description: "All tracks that are found as unreleased"
    },
    {
        flag: '@age',
        condition: (track) => track.meta?.age_restricted ?? false,
        description: "All tracks that are found to be age-restricted"
    },
    {
        flag: '@drg',
        condition: (track, query) => track.duration >= get_first_word_num(query),
        description: "All tracks that are found with a duration (in seconds) greater than or equal to the input"
    },
    {
        flag: '@drl',
        condition: (track, query) => track.duration <= get_first_word_num(query),
        description: "All tracks that are found with a duration (in seconds) less than or equal to the input"
    },
    {
        flag: '@vwg',
        condition: (track, query) => (track.plays ?? 0) >= get_first_word_num(query),
        description: "All tracks that are found with more views greater than or equal to the input"
    },
    {
        flag: '@vwl',
        condition: (track, query) => (track.plays ?? 0) <= get_first_word_num(query),
        description: "All tracks that are found with more views less than or equal to the input"
    },
    {
        flag: '@plg',
        condition: (track, query) => (track.meta?.plays ?? 0) >= get_first_word_num(query),
        description: "All tracks that are found with more plays greater than or equal to the input"
    },
    {
        flag: '@pll',
        condition: (track, query) => (track.meta?.plays ?? 0) <= get_first_word_num(query),
        description: "All tracks that are found with more plays less than or equal to the input"
    },
    {
        flag: '@lsdg',
        condition: (track, query) => (new Date(track.meta?.last_sampled_date ?? 0)).getTime() >= new Date().getTime() - (get_first_word_num(query) * 1000 * 60 * 60 * 24),
        description: "All tracks that are found to be sampled after (x) days ago"
    },
    {
        flag: '@lsdl',
        condition: (track, query) => (new Date(track.meta?.last_sampled_date ?? 0)).getTime() <= new Date().getTime() - (get_first_word_num(query) * 1000 * 60 * 60 * 24),
        description: "All tracks that are found to be sampled before (x) days ago"
    },
    {
        flag: '@addg',
        condition: (track, query) => (new Date(track.meta?.added_date ?? 0)).getTime() >= new Date().getTime() - (get_first_word_num(query) * 1000 * 60 * 60 * 24),
        description: "All tracks that are found to be added after (x) days ago"
    },
    {
        flag: '@addl',
        condition: (track, query) => (new Date(track.meta?.added_date ?? 0)).getTime() <= new Date().getTime() - (get_first_word_num(query) * 1000 * 60 * 60 * 24),
        description: "All tracks that are found to be added before (x) days ago"
    },
    {
        flag: '@lpdg',
        condition: (track, query) => (new Date(track.meta?.last_played_date ?? 0)).getTime() >= new Date().getTime() - (get_first_word_num(query) * 1000 * 60 * 60 * 24),
        description: "All tracks that are found to be played after (x) days ago"
    },
    {
        flag: '@lpdl',
        condition: (track, query) => (new Date(track.meta?.last_played_date ?? 0)).getTime() <= new Date().getTime() - (get_first_word_num(query) * 1000 * 60 * 60 * 24),
        description: "All tracks that are found to be played before (x) days ago"
    },
    {
        flag: '@ddg',
        condition: (track, query) => (new Date(track.meta?.downloaded_date ?? 0)).getTime() >= new Date().getTime() - (get_first_word_num(query) * 1000 * 60 * 60 * 24),
        description: "All tracks that are found to be downloaded after (x) days ago"
    },
    {
        flag: '@ddl',
        condition: (track, query) => (new Date(track.meta?.downloaded_date ?? 0)).getTime() <= new Date().getTime() - (get_first_word_num(query) * 1000 * 60 * 60 * 24),
        description: "All tracks that are found to be downloaded before (x) days ago"
    }
];