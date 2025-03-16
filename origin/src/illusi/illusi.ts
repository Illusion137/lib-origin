// import { SQLPlaylist, SQLTrack } from "../../../Illusive/src/types";
// import { encode_params } from "../utils/util";

export namespace Illusi {
//     export type Opts = {user_uuid: string};
//     export type RequestMode = "GET"|"POST"|"PUT";
//     export type Stamp = {timestamp: string, user_uuid: string};
//     export type StampedSQLTrack = Stamp & SQLTrack
//     export type StampedSQLPlaylist = Stamp & SQLPlaylist
//     export const illusi_base_domain = "https://illusi.dev/";

//     export function get_headers(opts: Opts){
//         return {
//             'authorization': 'Origin ' + opts.user_uuid,
//             'illusi-version': "1.0.0",
//             'origin-version': "1.0.0"
//         }
//     }

//     export async function request<Q extends Record<string, any>, P = any>(path: string, mode: RequestMode, opts: Opts & {
//         query_params?: Q,
//         payload?: P
//     }){
//         const query_url = opts.query_params ? `${illusi_base_domain}${path}?${encode_params(opts.query_params)}` : illusi_base_domain + path;
//         return await fetch(query_url, {
//             headers: get_headers(opts),
//             body: opts.payload ? JSON.stringify(opts.payload) : undefined
//         });
//     }

//     export async function checkout(){}

//     export async function get_library(): Promise<SQLTrack[]> {}
//     export async function get_playlists_list(): Promise<SQLPlaylist[]> {}
//     export async function get_short_playlist_tracks(): Promise<string[]> {}
//     export async function get_playlist_tracks(): Promise<SQLTrack[]> {}
//     // export async function get_backpack(): Promise<SQLTrack[]>{}

//     export async function add_tracks_to_library(){}
//     export async function add_tracks_to_playlist(){}
//     export async function add_tracks_to_backpack(){}
//     export async function create_playlist(){}

//     export async function delete_track(){}
//     export async function delete_track_from_playlist(){}
//     export async function delete_playlist(){}

//     export async function edit_playlist(){}
//     export async function edit_track(){}
}