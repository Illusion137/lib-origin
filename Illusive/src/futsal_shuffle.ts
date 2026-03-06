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
        icache.max_plays_in_library = Math.max(...GLOBALS.global_var.sql_tracks.map(track => track.meta?.plays ?? 0));
        icache.most_recent_played_ms = Math.max(...GLOBALS.global_var.sql_tracks.map(track => track.meta?.last_played_date ? new Date(track.meta.last_played_date).getTime() : 0));
        icache.most_recent_added_ms = Math.max(...GLOBALS.global_var.sql_tracks.map(track => track.meta?.added_date ? new Date(track.meta.added_date).getTime() : 0));
        icache.plays_from_albums.clear();
        icache.plays_from_artist.clear();
        icache.plays_in_past_month.clear();
        GLOBALS.global_var.sql_tracks.forEach(track => {
            if (track.album?.uri)
                icache.plays_from_albums.set(track.album.uri, (icache.plays_from_albums.get(track.album.uri) ?? 0) + 1);
            if (track.artists?.[0]?.uri)
                icache.plays_from_artist.set(track.artists[0].uri, (icache.plays_from_artist.get(track.artists[0].uri) ?? 0) + 1);
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

        return;
    }

    const boolean_weight = 10;
    const too_long_duration = seconds_of({ minutes: 4 });
    const too_short_duration = seconds_of({ minutes: 1 });
    function get_track_weight(track: Track): number {
        let weight = 1;
        const bias = Prefs.get_pref('track_shuffle_bias');
        weight += bias.too_long_duration * (track.duration > too_long_duration ? Math.log2(track.duration - too_long_duration) : 0);
        weight += bias.too_short_duration * (track.duration < too_short_duration ? Math.log2(too_short_duration - track.duration) : 0);
        weight += bias.explicit * (track.explicit !== "EXPLICIT" ? 0 : boolean_weight);
        weight += bias.no_explicit * (track.explicit === "EXPLICIT" ? 0 : boolean_weight);
        weight += bias.has_lyrics_dl * (is_empty(track.lyrics_uri) ? 0 : boolean_weight);
        weight += bias.has_thumbnail_dl * (is_empty(track.thumbnail_uri) ? 0 : boolean_weight);
        weight += bias.is_downloaded * (is_empty(track.media_uri) ? 0 : boolean_weight);
        weight += bias.last_played * (track.meta?.last_played_date
            ? boolean_weight : Math.min(days_of(
                {
                    milliseconds:
                        icache.most_recent_played_ms - new Date(track.meta?.last_played_date ?? 0).getTime()
                }), 20));
        weight += bias.plays_from_album * (icache.plays_from_albums.get(track.album?.uri ?? "") ?? 0);
        weight += bias.plays_from_artist * (icache.plays_from_artist.get(track.artists?.[0]?.uri ?? "") ?? 0);
        // TODO see if I want to keep this
        // weight += bias.plays_in_past_month * (icache.plays_in_past_month.get(track.uid) ?? 0);
        weight += bias.recent_add_date *
            (!track.meta?.added_date || new Date(track.meta.added_date ?? 0).getTime() === 0
                ? 0
                : Math.min(days_of(
                    {
                        milliseconds:
                            icache.most_recent_added_ms - new Date(track.meta?.last_played_date ?? 0).getTime()
                    }), 20));
        weight += bias.total_plays * 100 * ((track.meta?.plays ?? 0) / icache.max_plays_in_library);
        return weight;
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