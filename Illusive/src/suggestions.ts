import type { CompactArtist, CompactPlaylist, MusicServiceType, Track } from "./types";
import * as Origin from '@origin/index';
import { parse_youtube_music_track } from "./parsers/youtube_music_parser";
import { Prefs } from "./prefs";
import { supabase } from "./db/supabase";
import { parse_spotify_search_album, parse_spotify_search_artist, parse_spotify_search_track } from "./parsers/spotify_parser";
import type { SpotifySearchTrack } from "@origin/spotify/types/SearchResult";
import { reinterpret_cast } from '@common/cast';
import { generror_catch } from "@common/utils/error_util";

export namespace Suggestions {
    export type SuggestionItem = (string | Track | CompactPlaylist | CompactArtist);
    export async function get_google_suggestions(query: string): Promise<SuggestionItem[]>{
        return await Origin.Google.get_suggestions(query);
    }
    export async function get_youtube_music_suggestions(query: string): Promise<SuggestionItem[]>{
        const suggestions = await Origin.YouTubeMusic.search_suggestions({}, query);
        return suggestions.map(s => typeof s === "string" ? s : parse_youtube_music_track(s));
    }
    export async function get_soundcloud_suggestions(query: string): Promise<SuggestionItem[]>{
        const suggestions = await Origin.SoundCloud.query_suggestions({query});
        if("error" in suggestions) return [];
        return suggestions.data.collection.map(({output}) => output);
    }
    export async function get_spotify_suggestions(query: string): Promise<SuggestionItem[]>{
        const cookie_jar = Prefs.get_pref('spotify_cookie_jar');
        const suggestions = await Origin.Spotify.get_query_suggestions({cookie_jar, var: {query}});
        if("error" in suggestions) return [];
        const items = suggestions.data.searchV2.topResultsV2.itemsV2;
        return items.map((hit): SuggestionItem | undefined => {
                try {
                    switch (hit.item.__typename) {
                        case "SearchAutoCompleteEntity":
                            return hit.item.data.text;
                        case "TrackResponseWrapper":
                            return parse_spotify_search_track(reinterpret_cast<SpotifySearchTrack>(hit));
                        case "ArtistResponseWrapper":
                            return parse_spotify_search_artist(hit.item.data);
                        case "AlbumResponseWrapper":
                            return parse_spotify_search_album(hit.item);
                        case "PlaylistResponseWrapper":
                            return undefined; // playlists not needed in suggestions typically
                        default:
                            return undefined;
                    }
                }
                catch(e){
                    generror_catch(e, "Failed to parse Spotify suggestion item", "MEDIUM", {hit, query})
                    return undefined;
                }
        }).filter(item => item !== undefined);
    }
    export async function get_illusi_suggestions(query: string): Promise<SuggestionItem[]>{
        const { data: { session } } = await supabase().auth.getSession();
        if(session?.access_token === undefined) return [];
        const suggestions = await Origin.Illusi.get_search_suggestions(query, {jwt: session.access_token});
        if("error" in suggestions) return [];
        return suggestions;
    }
    export async function get_music_service_suggestions(query: string, music_service_type: MusicServiceType){
        switch(music_service_type){
            case "Musi": 
            case "YouTube":
            case "YouTube Music":
                return await get_youtube_music_suggestions(query);
            case "SoundCloud": 
                return await get_soundcloud_suggestions(query);
            case "Spotify": 
                return await get_spotify_suggestions(query);
            case "Illusi": 
            case "Amazon Music":
            case "Apple Music":
            case "BandLab": 
            case "API": 
            default:
                return await get_illusi_suggestions(query);
        }
    }
}