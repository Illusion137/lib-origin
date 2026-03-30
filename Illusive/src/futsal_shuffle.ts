import { days_of, is_empty, seconds_of } from "@common/utils/util";
import { Prefs } from "./prefs";
import type { Track } from "./types";
import { GLOBALS } from "./globals";

export namespace FutsalShuffle {
    export const icache = {
        cache_built: false,
        max_plays_in_library: 1,
        most_recent_played_ms: 0,
        most_recent_added_ms: 0,
        plays_from_albums: new Map<string, number>(),
        plays_from_artist: new Map<string, number>(),
        plays_in_past_month: new Map<string, number>(),

        track_uid_to_weight: new Map<string, number>()
    };
    export function build_cache() {
        icache.max_plays_in_library = Math.max(1, ...GLOBALS.global_var.sql_tracks.map(track => track.meta?.plays ?? 0));
        icache.most_recent_played_ms = Math.max(...GLOBALS.global_var.sql_tracks.map(track => track.meta?.last_played_date ? new Date(track.meta.last_played_date).getTime() : 0));
        icache.most_recent_added_ms = Math.max(...GLOBALS.global_var.sql_tracks.map(track => track.meta?.added_date ? new Date(track.meta.added_date).getTime() : 0));
        icache.plays_from_albums.clear();
        icache.plays_from_artist.clear();
        icache.plays_in_past_month.clear();
        GLOBALS.global_var.sql_tracks.forEach(track => {
            if (track.album?.uri)
                icache.plays_from_albums.set(track.album.uri, (icache.plays_from_albums.get(track.album.uri) ?? 0) + (track.meta?.plays ?? 0));
            if (track.artists?.[0]?.uri)
                icache.plays_from_artist.set(track.artists[0].uri, (icache.plays_from_artist.get(track.artists[0].uri) ?? 0) + (track.meta?.plays ?? 0));
            // TODO plays_in_past_month;
        });

        const weights: number[] = [];
        GLOBALS.global_var.sql_tracks.forEach(track => {
            const weight = get_track_weight(track);
            weights.push(weight);
            icache.track_uid_to_weight.set(track.uid, weight);
        });

        const min_weight = Math.min(...weights);
        if (min_weight < 1) {
            for (const key of icache.track_uid_to_weight.keys()) {
                const weight = icache.track_uid_to_weight.get(key) ?? 1;
                icache.track_uid_to_weight.set(key, weight + Math.abs(min_weight) + 1);
            }
        }

        icache.cache_built = true;
    }

    const boolean_weight = 10;
    const too_long_duration = seconds_of({ minutes: 4 });
    const too_short_duration = seconds_of({ minutes: 1 });

    type RawBiasFactors = Record<keyof typeof Prefs.default_track_shuffle_bias, number>;

    function get_raw_bias_factors(track: Track): RawBiasFactors {
        return {
            too_long_duration: track.duration > too_long_duration ? Math.log2(track.duration - too_long_duration) : 0,
            too_short_duration: track.duration < too_short_duration ? Math.log2(too_short_duration - track.duration) : 0,
            explicit: track.explicit !== "EXPLICIT" ? 0 : boolean_weight,
            no_explicit: track.explicit === "EXPLICIT" ? 0 : boolean_weight,
            has_lyrics_dl: is_empty(track.lyrics_uri) ? 0 : boolean_weight,
            has_thumbnail_dl: is_empty(track.thumbnail_uri) ? 0 : boolean_weight,
            is_downloaded: is_empty(track.media_uri) ? 0 : boolean_weight,
            last_played: !track.meta?.last_played_date
                ? boolean_weight
                : Math.min(days_of({ milliseconds: icache.most_recent_played_ms - new Date(track.meta.last_played_date).getTime() }), 20),
            plays_from_album: icache.plays_from_albums.get(track.album?.uri ?? "") ?? 0,
            plays_from_artist: icache.plays_from_artist.get(track.artists?.[0]?.uri ?? "") ?? 0,
            // plays_in_past_month: icache.plays_in_past_month.get(track.uid) ?? 0,
            recent_add_date: !track.meta?.added_date || new Date(track.meta.added_date).getTime() === 0
                ? 0
                : Math.min(days_of({ milliseconds: icache.most_recent_added_ms - new Date(track.meta.added_date).getTime() }), 20),
            total_plays: 100 * ((track.meta?.plays ?? 0) / icache.max_plays_in_library),
        };
    }

    function get_track_weight(track: Track): number {
        const bias = Prefs.get_pref('track_shuffle_bias');
        const factors = get_raw_bias_factors(track);
        let weight = 1;
        for (const key of Object.keys(factors) as (keyof RawBiasFactors)[]) {
            weight += bias[key] * factors[key];
        }
        return weight;
    }

    export type BiasInfluence = RawBiasFactors;

    function get_bias_influence(tracks: Track[]): Map<string, BiasInfluence> {
        build_cache();

        const bias_keys = Object.keys(Prefs.default_track_shuffle_bias) as (keyof RawBiasFactors)[];
        const raw: Map<string, RawBiasFactors> = new Map<string, RawBiasFactors>();
        for (const track of tracks) {
            raw.set(track.uid, get_raw_bias_factors(track));
        }

        const mins: Partial<Record<keyof RawBiasFactors, number>> = {};
        const maxs: Partial<Record<keyof RawBiasFactors, number>> = {};
        for (const key of bias_keys) {
            let min = Infinity, max = -Infinity;
            for (const factors of raw.values()) {
                const v = factors[key];
                if (v < min) min = v;
                if (v > max) max = v;
            }
            mins[key] = min;
            maxs[key] = max;
        }

        const result = new Map<string, BiasInfluence>();
        for (const track of tracks) {
            const factors = raw.get(track.uid)!;
            const influence = {} as BiasInfluence;
            for (const key of bias_keys) {
                const min = mins[key]!;
                const max = maxs[key]!;
                influence[key] = max === min ? 0 : (factors[key] - min) / (max - min);
            }
            result.set(track.uid, influence);
        }
        return result;
    }

    export function get_bias_visualizer_data(tracks: Track[]) {
        const influences = get_bias_influence(tracks);
        const bias = Prefs.get_pref('track_shuffle_bias');
        const influences_values = [...influences.values()];
        const keys = Object.keys(Prefs.default_track_shuffle_bias) as (keyof RawBiasFactors)[];
        const data = new Array<number>(keys.length).fill(0);
        for (const value of influences_values) {
            for (let i = 0; i < keys.length; i++) {
                data[i] += value[keys[i]] * Math.abs(bias[keys[i]]);
            }
        }
        const max = Math.max(...data);
        for (let i = 0; i < keys.length; i++) {
            data[i] = max > 0 ? data[i] / max : 0;
            if (isNaN(data[i])) data[i] = 0;
        }
        return data;
    }

    export function shuffle_weighted<T>(data: { weight: number, value: T }[]): T[] {
        const n = data.length;
        const keys = new Float64Array(n);

        for (let i = 0; i < n; i++) {
            const w = data[i].weight;
            const u = Math.random();
            const g = -Math.log(-Math.log(u));
            keys[i] = Math.log(w) + g;
        }

        const idx = new Uint32Array(n);
        for (let i = 0; i < n; i++) idx[i] = i;

        idx.sort((a, b) => keys[b] - keys[a]);

        const out = new Array<T>(n);
        for (let i = 0; i < n; i++) {
            out[i] = data[idx[i]].value;
        }

        return out;
    }

    export function futsal_shuffle(tracks: Track[]) {
        if (!icache.cache_built) build_cache();
        const weighted_tracks = tracks.map(track => ({ value: track, weight: icache.track_uid_to_weight.get(track.uid) ?? 1 }));

        // console.log(weighted_tracks.map(t => t.weight).sort());

        return shuffle_weighted(weighted_tracks);
    }
}
