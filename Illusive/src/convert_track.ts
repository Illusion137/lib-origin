import * as Origin from "../../origin/src/index";
import { PromiseResult } from "../../origin/src/utils/types";
import { remove_topic } from "../../origin/src/utils/util";
import { Illusive } from "./illusive";
import { all_words, one_includes_word_not_other, random_of, str_or_include } from "./illusive_utilts";
import { Prefs } from "./prefs";
import { MusicServiceType, Track } from "./types";

interface ConvertTrackOptsNull {
    to_music_service?: MusicServiceType;
    deep_convert?: boolean;
    proxies?: Origin.Proxy.Proxy[];
    possible_services?: MusicServiceType[];
}
interface ConvertTrackOpts {
    to_music_service: MusicServiceType;
    deep_convert: boolean;
    proxies: Origin.Proxy.Proxy[];
    possible_services: MusicServiceType[];
}

function convert_track_default_opts(opts: ConvertTrackOptsNull): ConvertTrackOpts {
    const yt_music = Prefs.get_pref('prefer_youtube_music') && Illusive.music_service.get("YouTube Music")!.has_credentials();
    opts.to_music_service = opts.to_music_service ?? (
        Prefs.get_pref('prefer_soundcloud') ? 
            "SoundCloud" : 
                yt_music ? 
                "YouTube Music" : 
            "YouTube");
    opts.deep_convert = opts.deep_convert ?? false;
    opts.proxies = opts.proxies ?? [];
    opts.possible_services = opts.possible_services ?? (
        yt_music ?
            opts.deep_convert ?
                ["YouTube Music", "SoundCloud"] :
                ["YouTube Music", "SoundCloud", "YouTube"] :
            ["YouTube", "SoundCloud"]);
    return opts as ConvertTrackOpts;
}

export function is_youtube(track: Track) {
    return !!track.youtube_id && !track.amazonmusic_id && !track.applemusic_id && !track.soundcloud_id && !track.spotify_id;
}

function conversion_search_query(track: Track): string {
    if (is_youtube(track) && /^.+? - .+/gm.test(track.title))
        return track.title;
    return `${remove_topic(track.artists[0].name)} ${track.title}` + (track.artists.length > 1 ? `ft ${track.artists.slice(1).map(item => remove_topic(item.name)).join(', ')}` : "");
}

function conversion_score(i: number, track: Track, convert_track: Track, to: MusicServiceType) {
    let score = 0;

    if(track.artists.length === 0 || convert_track.artists.length === 0) return -1;

    const track_title = track.title.toLowerCase();
    const track_artist = remove_topic(track.artists[0].name.toLowerCase());
    const tracK_words = all_words(track_title);

    const current_title = convert_track.title.toLowerCase();
    const current_artist = convert_track.artists[0].name.toLowerCase();
    const current_words = all_words(current_title);

    if(to === "YouTube Music" && Prefs.get_pref('force_explicit_conversion') && track.explicit === "EXPLICIT" && convert_track.explicit !== "EXPLICIT")
        score -= 100;

    if (one_includes_word_not_other(tracK_words, current_words, "instrumental")) score -= 50;
    if (one_includes_word_not_other(tracK_words, current_words, "spedup")) score -= 50;
    if (one_includes_word_not_other(tracK_words, current_words, "speedup")) score -= 50;
    if (one_includes_word_not_other(tracK_words, current_words, "sped") && one_includes_word_not_other(tracK_words, current_words, "up")) score -= 50;
    if (one_includes_word_not_other(tracK_words, current_words, "speed") && one_includes_word_not_other(tracK_words, current_words, "up")) score -= 50;

    if (str_or_include(current_title, track_title)) score += 30;
    if (str_or_include(current_title, track_title) && str_or_include(current_title, track_artist)) score += 40;
    if (str_or_include(current_title, track_title) && str_or_include(current_artist, track_artist)) score += 55;
    if (str_or_include(current_artist, remove_topic(track_artist))) score += 15;
    if (to === "YouTube" && current_artist.includes(" - Topic")) score += 15;
    if (current_title.includes("Official Audio")) score += 10;
    if (current_title.includes("Official Music Video")) score += 8;
    if (current_title.includes("Official Video")) score += 8;
    if (current_title.includes("Official Visualizer")) score += 8;
    if (current_title.includes("Music Video")) score += 5;
    if (!isNaN(track.duration) && !isNaN(convert_track.duration))
        score += (6 - Math.abs(convert_track.duration - track.duration)) * 4;
    if (score > 80) score += 5 * i;
    return score;
}

export interface MaxTrack { track?: Track, score: number };
export async function convert_track(track: Track, _opts_: ConvertTrackOptsNull): PromiseResult<MaxTrack> {
    const opts = convert_track_default_opts(_opts_);
    const music_service = Illusive.music_service.get(opts.to_music_service);

    if (music_service?.search === undefined) return { error: new Error(`Can't convert to this music-service; ${opts.to_music_service} lacks a search property`) };

    opts.possible_services = opts.possible_services.filter(service => service !== opts.to_music_service);

    const query = conversion_search_query(track);
    let best: MaxTrack = { score: 30 };
    let all_negative_values = true;

    const search_tracks = await music_service.search(query, { proxy: random_of(opts.proxies) });
    if (search_tracks.tracks.length === 0) {
        return opts.possible_services.length === 0 ?
            { error: new Error("Unable to convert track; No tracks found") } :
            convert_track(track, { ...opts, to_music_service: opts.possible_services[0] });
    }
    if ("error" in search_tracks) {
        return opts.possible_services.length === 0 ?
            search_tracks.error![0] :
            convert_track(track, { ...opts, to_music_service: opts.possible_services[0] });
    }
    search_tracks.tracks.sort((a, b) => (a.plays ?? 0) - (b.plays ?? 0));
    for (let i = 0; i < search_tracks.tracks.length; i++) {
        const score = conversion_score(i, track, search_tracks.tracks[i], opts.to_music_service);

        if (score > 30) all_negative_values = false;
        if (score > best.score) best = { track: search_tracks.tracks[i], score };
    }

    if (all_negative_values) {
        if (opts.possible_services.length === 0)
            return { error: new Error("Unable to find good conversion") };
        else return convert_track(track, { ...opts, to_music_service: opts.possible_services[0] });
    }
    else if (opts.deep_convert) {
        const deep_best = await convert_track(track, { ...opts, to_music_service: opts.possible_services[0] });
        if (!("error" in deep_best) && deep_best.score > best.score)
            best = deep_best;
    }

    return best;
}