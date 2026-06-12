import { extract_all_strings_from_pattern, is_empty } from "@common/utils/util";
import { remove_topic } from "@common/utils/clean_util";
import { GLOBALS } from "@illusive/globals";
import type { NamedUUID, Track } from "@illusive/types";

const FEAT_WORD = "(?:ft|feat(?:uring)?)";
// stop a bare (un-bracketed) segment at the next spaced dash, pipe, bracket or end of title
const BARE_END = "(?=\\s+[-–—~|]\\s+|\\s*[()[\\]]|\\s*$)";

const FEAT_BRACKET_RE = new RegExp(`[([] ?${FEAT_WORD}\\b\\.? *([^)\\]]+)[)\\]]`, "gi");
const FEAT_BARE_RE = new RegExp(`\\s${FEAT_WORD}\\b\\.? *(\\S.*?)${BARE_END}`, "gi");
const PROD_BRACKET_RE = /[([] ?prod(?:uced)?\b\.?\s*(?:by\b)?\s*([^)\]]+)[)\]]/gi;
const PROD_BARE_RE = new RegExp(`\\s(?:prod(?:uced)?\\b\\.?\\s*(?:by\\s+)?|p\\.\\s*)(\\S.*?)${BARE_END}`, "gi");
const WITH_BRACKET_RE = /[([] ?(?:with +|w\/ ?)([^)\]]+)[)\]]/gi;
const WITH_BARE_RE = new RegExp(`\\sw\\/ ?(\\S.*?)${BARE_END}`, "gi");
const REMIX_BRACKET_RE = /[([] ?([^)\]]+?) (?:remix|flip|edit|bootleg|remake|rework)e?s? ?[)\]]/gi;
const REMIX_JUNK_RE = /official|extended|original|radio|club|dance|bass|boost|sped|slowed|tik ?tok|nightcore|lyric|video|audio|cover|version|full|8d|3d/i;
const ARTIST_NAME_JUNK_RE = /^(?:lyrics?|audio|video|official|visuali[sz]ers?|mv|more|others)$/i;

const TITLE_JUNK_BRACKET_RE = new RegExp(` ?[([] ?(?:${[
    "(?:official|officiel|oficial)[^)\\]]*",
    "[^)\\]]*(?:official|officiel|oficial) ?(?:music )?(?:video|audio|visuali[sz]er|mv)[^)\\]]*",
    "[^)\\]]*music video[^)\\]]*",
    "[^)\\]]*lyric[^)\\]]*",
    "(?:full |music )?(?:video|audio|song)(?: version)?",
    "music",
    "visuali[sz]er",
    "(?:hd|hq|4k|8k)(?: (?:audio|video|quality))?",
    "m\\/?v",
    "unreleased",
    "explicit(?: version)?",
    "[^)\\]]*clean[^)\\]]*",
    "[^)\\]]*remix[^)\\]]*",
    "[^)\\]]*remaster[^)\\]]*",
    "[^)\\]]*\\bonly\\b[^)\\]]*",
    "by [^)\\]]*",
    "dir(?:\\.|ected)[^)\\]]*",
    "prod(?:uced)?\\.?(?: by)? [^)\\]]*",
    "prod\\.[^)\\]]*",
    `${FEAT_WORD}\\b\\.?[^)\\]]*`,
    "with [^)\\]]*",
    "w\\/[^)\\]]*",
    "legendado[^)\\]]*",
    "ost",
    "fan ?made",
    "extended",
    "tik ?tok[^)\\]]*",
    "amv",
    "full(?: (?:song|video|version))?",
    "best(?: version)?",
    "bass boosted",
    "reupload",
    "out now[^)\\]]*",
    "(?:day )?\\d{1,3} ?\\/ ?\\d{1,3}",
].join("|")}) ?[)\\]]`, "gi");

const PIPE_JUNK_RE = /\s*\|\s*(?:official[^|]*|(?:music |lyrics? )?(?:video|audio)|lyrics?|visuali[sz]er|hd|hq|4k|8k|mv|out now[^|]*|stream[^|]*|download[^|]*)\s*(?=\||$)/gi;
const TITLE_SEPARATOR_RE = /\s+[-–—~]\s+|\s*\|\s*|\s+\/\/\s+/;

function dedup_strings(strings: string[]): string[] {
    return [...new Set(strings.map(str => str.trim()).filter(str => !is_empty(str)))];
}
function normalize_artist_name(name: string): string {
    return remove_topic(name).toLowerCase().replace(/\s+/g, ' ').trim();
}
function loose_artist_key(name: string): string {
    return normalize_artist_name(name).replace(/[^a-z0-9]/g, '');
}
// "JuiceWRLDVEVO" / "Gunna Official" / "Juice WRLD - Topic" should all compare equal to "Juice WRLD"
function channel_artist_key(name: string): string {
    return loose_artist_key(name).replace(/(?:vevo|official)+$/, '');
}
// prefix match so suffixed channels like "Babytron SB" still match the artist "BabyTron"
function channel_keys_match(key_a: string, key_b: string): boolean {
    if (key_a === "" || key_b === "") return false;
    if (key_a === key_b) return true;
    return Math.min(key_a.length, key_b.length) >= 4 && (key_a.startsWith(key_b) || key_b.startsWith(key_a));
}

let known_artists_cache: { source: Track[], size: number, map: Map<string, NamedUUID> } | undefined;
export function known_sql_artists(): Map<string, NamedUUID> {
    const sql_tracks = GLOBALS.global_var.sql_tracks;
    if (known_artists_cache?.source !== sql_tracks || known_artists_cache?.size !== sql_tracks.length) {
        const map = new Map<string, NamedUUID>();
        for (const sql_track of sql_tracks) {
            for (const artist of sql_track.artists ?? []) {
                if (is_empty(artist?.name)) continue;
                const key = normalize_artist_name(artist.name);
                if (key === "") continue;
                const existing = map.get(key);
                if (existing === undefined || (is_empty(existing.uri) && is_empty(existing.uuid) && (!is_empty(artist.uri) || !is_empty(artist.uuid))))
                    map.set(key, artist);
            }
        }
        known_artists_cache = { source: sql_tracks, size: sql_tracks.length, map };
    }
    return known_artists_cache.map;
}

export function split_artist_names(names: string): string[] {
    return names
        .split(/\s*[,;&+]\s*|\s+(?:and|vs\.?|×)\s+/i)
        .flatMap(part => part.split(/\s+x\s+/))
        .map(name => name
            .replace(/\b(?:official|lyrics?|audio|video|hd|hq)\b.*$/i, '')
            .replace(/^["'“”‘’\s]+|["'“”‘’.\s]+$/g, ''))
        .filter(name => !is_empty(name) && !ARTIST_NAME_JUNK_RE.test(name));
}

// "Gunna Lil Baby" -> ["Gunna", "Lil Baby"] when every word is covered by known artists
function segment_known_artist_names(name: string, known: Map<string, NamedUUID>): string[] | undefined {
    const words = name.split(/\s+/);
    if (words.length < 2) return undefined;
    const segments: string[] = [];
    let start = 0;
    while (start < words.length) {
        let end = -1;
        for (let stop = words.length; stop > start; stop--) {
            if (known.has(normalize_artist_name(words.slice(start, stop).join(' ')))) { end = stop; break; }
        }
        if (end === -1) return undefined;
        segments.push(words.slice(start, end).join(' '));
        start = end;
    }
    return segments.length >= 2 ? segments : undefined;
}

function expand_artist_names(segment: string, known: Map<string, NamedUUID>): string[] {
    return split_artist_names(segment).flatMap(name =>
        known.has(normalize_artist_name(name)) ? [name] : (segment_known_artist_names(name, known) ?? [name]));
}

function trim_title_edges(title: string): string {
    return title
        .replace(/^[\s\-–—~|:]+|[\s\-–—~|:]+$/g, '')
        .replace(/^["“”](.+)["“”]$/, '$1')
        .trim();
}

function split_quoted_title(title: string): { artist_side: string, title_side: string } | undefined {
    let match = /^["“](.{2,}?)["”]\s+by\s+(.+)$/i.exec(title);
    if (match !== null) return { title_side: match[1], artist_side: match[2] };
    match = /^(.+?)\s+["“](.{2,}?)["”]$/.exec(title);
    if (match !== null) return { artist_side: match[1], title_side: match[2] };
    match = /^(.+?)\s+'(.{2,}?)'$/.exec(title);
    if (match !== null) return { artist_side: match[1], title_side: match[2] };
    return undefined;
}

function detect_artist_title(cleaned: string, channel_name: string, known: Map<string, NamedUUID>): { artist_names: string[], title: string } | undefined {
    const quoted = split_quoted_title(cleaned);
    if (quoted !== undefined) return { artist_names: expand_artist_names(trim_title_edges(quoted.artist_side), known), title: quoted.title_side.trim() };
    const separator = TITLE_SEPARATOR_RE.exec(cleaned);
    if (separator === null) return undefined;
    const left = cleaned.slice(0, separator.index).trim();
    const right = cleaned.slice(separator.index + separator[0].length).trim();
    if (is_empty(left) || is_empty(right)) return undefined;
    const channel_key = channel_artist_key(channel_name);
    const left_names = split_artist_names(left);
    const right_names = split_artist_names(right);
    const matches_channel = (side: string, names: string[]) => channel_keys_match(channel_key, channel_artist_key(side)) || names.some(name => channel_keys_match(channel_key, channel_artist_key(name)));
    const left_channel = matches_channel(left, left_names);
    const right_channel = matches_channel(right, right_names);
    const known_side = (names: string[]) => names.some(name => known.has(normalize_artist_name(name)));
    let artist_side: "left" | "right";
    if (right_channel && !left_channel) artist_side = "right";
    else if (left_channel) artist_side = "left";
    else if (known_side(left_names)) artist_side = "left";
    else if (known_side(right_names)) artist_side = "right";
    // no confident signal: leave the title whole rather than inventing an artist
    else return undefined;
    return {
        artist_names: expand_artist_names(artist_side === "left" ? left : right, known),
        title: artist_side === "left" ? right : left,
    };
}

export function extract_music_title_info(title: string) {
    const feats = dedup_strings([
        ...extract_all_strings_from_pattern(title, FEAT_BRACKET_RE),
        ...extract_all_strings_from_pattern(title, FEAT_BARE_RE),
        ...extract_all_strings_from_pattern(title, WITH_BRACKET_RE),
        ...extract_all_strings_from_pattern(title, WITH_BARE_RE),
    ]);
    const prods = dedup_strings([
        ...extract_all_strings_from_pattern(title, PROD_BRACKET_RE),
        ...extract_all_strings_from_pattern(title, PROD_BARE_RE),
    ].map(prod => prod.replace(/^by\s+/i, '')));
    const remixers = dedup_strings(extract_all_strings_from_pattern(title, REMIX_BRACKET_RE))
        .filter(remixer => !REMIX_JUNK_RE.test(remixer));
    const unreleased = /[([] ?unreleased ?[)\]]/i.test(title) || /\bunreleased\b/i.test(title);
    const explicit = /[([] ?explicit(?: version)? ?[)\]]/i.test(title);
    const clean = /[([][^)\]]*clean[^)\]]*[)\]]/i.test(title);
    return { feats, prods, remixers, unreleased, explicit, clean };
}

export function clean_music_title(title: string) {
    return title
        .replace(TITLE_JUNK_BRACKET_RE, '')
        .replace(PIPE_JUNK_RE, '')
        .replace(FEAT_BARE_RE, '')
        .replace(WITH_BARE_RE, '')
        .replace(PROD_BARE_RE, '')
        .replace(/ ?\bfull song\b ?/gi, ' ')
        .replace(/\bunreleased\b/gi, '')
        .replace(/\s+(?:m\/v|amv)\s*$/i, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

export function parse_track_title_artist(track: Track): Track {
    const known = known_sql_artists();
    const info = extract_music_title_info(track.title);
    const cleaned = clean_music_title(track.title);
    const channel_name = track.artists?.[0]?.name ?? "";
    const split = detect_artist_title(cleaned, channel_name, known);
    let title = trim_title_edges(split?.title ?? cleaned);
    if (title === "") title = cleaned !== "" ? cleaned : track.title;

    const artists: NamedUUID[] = track.artists.map(artist => {
        if (!is_empty(artist.uri) || !is_empty(artist.uuid)) return artist;
        const found = known.get(normalize_artist_name(artist.name));
        if (found !== undefined && (!is_empty(found.uri) || !is_empty(found.uuid))) return { ...found, name: artist.name } as NamedUUID;
        return artist;
    });
    const seen = new Set(artists.flatMap(artist => [loose_artist_key(artist.name), channel_artist_key(artist.name)]));
    const existing_keys = track.artists.map(artist => channel_artist_key(artist.name));
    const extra_names = [
        ...(split?.artist_names ?? []),
        ...info.feats.flatMap(feat => expand_artist_names(feat, known)),
        ...info.remixers.flatMap(remixer => expand_artist_names(remixer, known)),
    ];
    for (const name of extra_names) {
        const key = loose_artist_key(name);
        if (key === "" || seen.has(key) || seen.has(channel_artist_key(name))) continue;
        if (existing_keys.some(existing => channel_keys_match(existing, channel_artist_key(name)))) continue;
        seen.add(key);
        seen.add(channel_artist_key(name));
        const found = known.get(normalize_artist_name(name));
        artists.push(found !== undefined ? { ...found } : { name, uri: null });
    }

    const prods = dedup_strings(info.prods.flatMap(split_artist_names));
    return {
        ...track,
        title,
        alt_title: track.title,
        artists,
        explicit: info.explicit ? "EXPLICIT" :
            info.clean ? "CLEAN" :
                track.explicit ?? "NONE",
        unreleased: info.unreleased || track.unreleased,
        prods: prods.length > 0 ? prods.join(", ") : track.prods,
    }
}
