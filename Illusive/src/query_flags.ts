import { is_empty, remove_topic } from "../../origin/src/utils/util";
import { QueryFlag, Track } from "./types";

function artist_string(track: Track): string{
    if(is_empty(track)) return "";
    if(track.artists.length <= 1) return remove_topic(track.artists[0].name).trim();
    const names = track.artists.map(artist => remove_topic(artist.name).trim());
    const final_name = names.pop()!;
    return names.length
        ? names.join(', ') + ' & ' + final_name
            : final_name;
}

const jp_regex = /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤]+/gi;
export const QUERY_FLAGS: QueryFlag[] = [
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
        flag: '@uv',
        condition: (track) => track.meta?.unavailable ?? false,
        description: "All tracks that are downloaded but are now unavailable on YouTube"
    }
];