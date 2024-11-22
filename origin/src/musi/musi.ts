import { urlid } from "../utils/util";
import { Explore } from "./types/Explore";
import { PlaylistResponse, PlaylistResponseSuccessParsed, PlaylistSuccessData } from "./types/Playlist";
import { Support } from "./types/Support";
import { Track } from "./types/types";

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
    export async function support() {
        const response = await fetch(`https://feelthemusi.com/api/v4/support/`);
        return await response.json() as Support;
    }
    export async function explore() {
        const response = await fetch(`https://feelthemusi.com/api/v4/search/explore`);
        return await response.json() as Explore;
    }
    
    export async function get_playlist(url: string) {
        const playlist_param = urlid(url, "feelthemusi.com/", "api/v4/playlists/fetch/", "playlist/");
        const response = await fetch(`https://feelthemusi.com/api/v4/playlists/fetch/${playlist_param}`);
        const playlist_response = await response.json() as PlaylistResponse;
        if("error" in playlist_response) return playlist_response;
        const playlist_response_parsed_data: PlaylistResponseSuccessParsed = {
            success: {
                ...playlist_response.success, 
                data: JSON.parse(playlist_response.success.data) as PlaylistSuccessData
            }
        };
        return playlist_response_parsed_data;
    }
}