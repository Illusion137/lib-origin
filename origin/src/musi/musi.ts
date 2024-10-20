import { Explore } from "./types/Explore";
import { Track } from "./types/types";
import { PlaylistResponseSuccessParsed, PlaylistSuccessData, PlaylistResponse } from "./types/Playlist";
import { Support } from "./types/Support";
import { urlid } from "../utils/util";

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
    export async function support(){
        const response = await fetch(`https://feelthemusi.com/api/v4/support/`);
        return <Support>await response.json();
    }
    export async function explore(){
        const response = await fetch(`https://feelthemusi.com/api/v4/search/explore`);
        return <Explore>await response.json();
    }
    
    export async function get_playlist(url: string){
        const playlist_param = urlid(url, "feelthemusi.com/", "api/v4/playlists/fetch/", "playlist/");
        const response = await fetch(`https://feelthemusi.com/api/v4/playlists/fetch/${playlist_param}`);
        const playlist_response = <PlaylistResponse>await response.json();
        if("error" in playlist_response) return playlist_response;
        const playlist_response_parsed_data: PlaylistResponseSuccessParsed = {
            'success': {
                ...playlist_response.success, 
                'data': <PlaylistSuccessData>JSON.parse(playlist_response.success.data)
            }
        };
        return playlist_response_parsed_data;
    }
}