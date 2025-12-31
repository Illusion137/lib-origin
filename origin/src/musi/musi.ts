import { milliseconds_of, urlid } from "@common/utils/util";
import type { Explore, ExploreSuccess } from "@origin/musi/types/Explore";
import type { PlaylistResponse, PlaylistResponseSuccessParsed, PlaylistSuccessData } from "@origin/musi/types/Playlist";
import type { Support } from "@origin/musi/types/Support";
import type { Track } from "@origin/musi/types/types";
import rozfetch from "@common/rozfetch";
import { try_json_parse } from "@common/utils/parse_util";

// GET   /api/v4/support%@
// GET   /api/v4/search/explore/@ld
//       /api/v4/analytics/event/%@
//       /api/v4/airbuds/check-connection/%@
//       /api/v4/airbuds/connect/%@Illusion137
// POST  /api/v4/airbuds/track-play
//       /api/v4/backups/fetch/%@
// POST  /api/v4/backups/create
//       /api/v4/manifest/fetch
// GET   /api/v4/playlists/fetch/%@
// POST  /api/v4/playlists/fetch_updates
// POST  /api/v4/playlists/share
// POST  /api/v4/playlists/update
//       /api/v4/playlists/image/generate_signature
// GET   /api/v4/parsing/v9     ->  https://cdn.feelthemusi.com/parsing/parsing_source.min.js
// POST  /api/v4/debug-support/save-files {identifier: e, files: r}

export namespace Musi {
    export type MusiTrack = Track;
    export type MusiExplore = ExploreSuccess;
    export async function support() {
        const response = await rozfetch<Support>(`https://feelthemusi.com/api/v4/support/`, {cache_opts: {
            cache_ms: milliseconds_of({months: 1}),
            cache_ms_fail: milliseconds_of({minutes: 1}),
            cache_mode: "file"
        }});
        if("error" in response) return response;
        return await response.json();
    }
    export async function explore() {
        const response = await rozfetch<Explore>(`https://feelthemusi.com/api/v4/search/explore`, {cache_opts: {
            cache_ms: milliseconds_of({hours: 6}),
            cache_ms_fail: milliseconds_of({minutes: 1}),
            cache_mode: "file"
        }});
        if("error" in response) return response;
        return await response.json();
    }
    
    export async function get_playlist(url: string) {
        const playlist_param = urlid(url, "feelthemusi.com/", "api/v4/playlists/fetch/", "playlist/");
        const response = await rozfetch<PlaylistResponse>(`https://feelthemusi.com/api/v4/playlists/fetch/${playlist_param}`);
        if("error" in response) return response;
        const playlist_response = await response.json();
        if("error" in playlist_response) return playlist_response;
        const data = try_json_parse<PlaylistSuccessData>(playlist_response.success.data);
        if("error" in data) return data;
        const playlist_response_parsed_data: PlaylistResponseSuccessParsed = {
            success: {
                ...playlist_response.success, 
                data: data
            }
        };
        return playlist_response_parsed_data;
    }
}