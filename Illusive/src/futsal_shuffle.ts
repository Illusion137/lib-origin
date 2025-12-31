import { days_of, is_empty, seconds_of } from "@common/utils/util";
import { Prefs } from "./prefs";
import type { Track } from "./types";
import { GLOBALS } from "./globals";

export namespace FutsalShuffle {
    const icache = {
        max_plays_in_library: 1,
        most_recent_played_ms: 0,
        most_recent_added_ms: 0,
        plays_from_albums: new Map<string, number>(),
        plays_from_artist: new Map<string, number>(),
        plays_in_past_month: new Map<string, number>(),
    };
    function internal_build_cache(){
        icache.max_plays_in_library = Math.max(...GLOBALS.global_var.sql_tracks.map(track => track.meta?.plays ?? 0));
        icache.most_recent_played_ms = 0;
        icache.most_recent_added_ms = 0;
        icache.plays_from_albums.clear();
        icache.plays_from_artist.clear();
        icache.plays_in_past_month.clear();
        GLOBALS.global_var.sql_tracks.forEach(track => {
            if(track.album?.uri)
                icache.plays_from_albums.set(track.album.uri, (icache.plays_from_albums.get(track.album.uri) ?? 0) + 1);
            if(track.artists?.[0]?.uri)
                icache.plays_from_artist.set(track.artists[0].uri, (icache.plays_from_artist.get(track.artists[0].uri) ?? 0) + 1);
            // TODO plays_in_past_month;
        });
        return;
    }
    const boolean_weight = 10;
    const too_long_duration = seconds_of({minutes: 4});
    const too_short_duration = seconds_of({minutes: 1});
    function get_track_weight(track: Track): number{
        let weight = 0;
        const bias = Prefs.get_pref('track_shuffle_bias');
        weight -= bias.too_long_duration * (track.duration > too_long_duration ? track.duration - too_long_duration : 0 );
        weight -= bias.too_short_duration * (track.duration < too_short_duration ? too_short_duration - track.duration : 0 );
        weight -= bias.explicit * (track.explicit !== "EXPLICIT" ? boolean_weight : 0);
        weight -= bias.no_explicit * (track.explicit === "EXPLICIT" ? boolean_weight : 0); 
        weight -= bias.has_lyrics_dl * (is_empty(track.lyrics_uri) ? boolean_weight : 0); 
        weight -= bias.has_thumbnail_dl * (is_empty(track.thumbnail_uri) ? boolean_weight : 0); 
        weight -= bias.is_downloaded * (is_empty(track.media_uri) ? boolean_weight : 0); 
        weight -= bias.last_played * (track.meta?.last_played_date 
            ? boolean_weight : Math.min(days_of(
                {milliseconds: 
                    icache.most_recent_played_ms - new Date(track.meta?.last_played_date ?? 0).getTime()
                }), 20) ); 
        weight -= bias.plays_from_album * (icache.plays_from_albums.get(track.album?.uri ?? "") ?? 0); 
        weight -= bias.plays_from_artist * (icache.plays_from_artist.get(track.artists?.[0]?.uri ?? "") ?? 0); 
        weight -= bias.plays_in_past_month * (icache.plays_in_past_month.get(track.uid) ?? 0); 
        weight -= bias.recent_add_date * 
            (!track.meta?.downloaded_date || new Date(track.meta.downloaded_date ?? 0).getTime() === 0 
                ? 0 
                : Math.min(days_of(
                    {milliseconds: 
                        icache.most_recent_added_ms - new Date(track.meta?.last_played_date ?? 0).getTime()
                    }), 20) ); 
        weight -= bias.total_plays * -((track.meta?.plays ?? 0) / icache.max_plays_in_library); 
        return weight;
    }

    export function shuffle_weighted<T>(data: {weight: number, value: T}[]): T[]{
        const n = data.length;

        // Preallocate typed array for keys
        const keys = new Float64Array(n);
      
        // Generate Gumbel-Max keys
        for (let i = 0; i < n; i++) {
            const w = data[i].weight;
            // Gumbel(0,1): -ln(-ln(U))
            const u = Math.random();
            const g = -Math.log(-Math.log(u));
            // log(w) + gumbel is the key
            keys[i] = Math.log(w) + g;
        }
      
        // Build array of indices for sorting
        // This is faster than sorting objects
        const idx = new Uint32Array(n);
        for (let i = 0; i < n; i++) idx[i] = i;
      
        // Sort indices by descending keys (highest key first)
        idx.sort((a, b) => keys[b] - keys[a]);
      
        // Build output (only allocation of T[])
        const out = new Array<T>(n);
        for (let i = 0; i < n; i++) {
            out[i] = data[idx[i]].value;
        }
      
        return out;
    }

    export function futsal_shuffle(tracks: Track[]){
        internal_build_cache();
        const weighted_tracks = tracks.map(track => ({value: track, weight: get_track_weight(track)}));
        return shuffle_weighted(weighted_tracks);
    }
}