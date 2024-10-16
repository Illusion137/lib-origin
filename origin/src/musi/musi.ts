import { ResponseError } from "../utils/types";
import { Explore } from "./types/Explore";
import { PlaylistResponseSuccessParsed, PlaylistResponseSuccess, PlaylistSuccessData, PlaylistResponse } from "./types/Playlist";
import { Support } from "./types/Support";

// GET /api/v4/support%@
// GET /api/v4/search/explore/@ld
// /api/v4/analytics/event/%@
// /api/v4/airbuds/check-connection/%@
// /api/v4/airbuds/connect/%@Illusion137
// /api/v4/airbuds/track-play
// /api/v4/backups/fetch/%@
// /api/v4/backups/create
// /api/v4/manifest/fetch
// GET /api/v4/playlists/fetch/%@
// /api/v4/playlists/fetch_updates
// /api/v4/playlists/share
// /api/v4/playlists/update
// /api/v4/playlists/image/generate_signature
// /api/v4/parsing/v9


export namespace Musi {


    export async function support(){
        const response = await fetch(`https://feelthemusi.com/api/v4/support/`);
        return <Support>await response.json();
    }
    export async function explore(){
        const response = await fetch(`https://feelthemusi.com/api/v4/search/explore`);
        return <Explore>await response.json();
    }
    
    export async function get_playlist(url: string): Promise<PlaylistResponse>{
        try {            
            const playlist_param = url.replace('https://feelthemusi.com/playlist/', '')
            const response = await fetch(`https://feelthemusi.com/api/v4/playlists/fetch/${playlist_param}`);
            
            const playlist_response = await response.json() as PlaylistResponseSuccess|ResponseError;
            if("error" in playlist_response) throw playlist_response.error;
            
            const playlist_response_parsed_data: PlaylistResponseSuccessParsed = {
                'success': {
                    'code': playlist_response.success.code,
                    'data': <PlaylistSuccessData>JSON.parse(playlist_response.success.data),
                    'hash': playlist_response.success.hash,
                    'title': playlist_response.success.title
                }
            };
            return playlist_response_parsed_data;
        } catch (error) {
            return { 'error': String(error) };
        }
    }
}