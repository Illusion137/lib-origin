import { PromiseResult } from "../utils/types";
import { CookieJar } from "../utils/cookie_util";
import { AmznMusic } from "./types/AmznMusic";
import { ShowHome } from "./types/ShowHome";
import { ShowLibraryHome } from "./types/ShowLibraryHome";
import { CreateAndBindMethod } from "./types/ShowHomeCreateAndBindMethod";
import { SearchResult } from "./types/SearchResult";
import { extract_string_from_pattern, urlid } from "../utils/util";

export namespace AmazonMusic {
    interface AuthHeader {
        interface: string,
        token: string,
        expirationMS: number
    }
    type Opts = { cookie_jar?: CookieJar, client?: AmznMusic };

    export async function get_amzn_music_data(url: string, opts: Opts): PromiseResult<AmznMusic>{
        try {
            const headers = {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "sec-ch-ua": "\"Google Chrome\";v=\"117\", \"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"117\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "cookie": opts.cookie_jar?.toString() as string
            };
            const result = await fetch(url, {
                headers,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET"
            });

            const config_body = await result.text();
            
            const amzn_music_regex = /window.amznMusic = ({.+});/s
            const extracted_text = extract_string_from_pattern(config_body, amzn_music_regex);
            //Fixing the shitty json
            if(typeof extracted_text === "object") throw "Couldn't parse AmznMusic body";
            const amzn_music_text = extracted_text.replace(/\n\s+/g,'')
                                .replace("appConfig", "\"appConfig\"")
                                .replace("ssr:", "\"ssr\":")
                                .replace("isInContainerApp: true,","\"isInContainerApp\": true")
                                .replace("isInContainerApp: false,","\"isInContainerApp\": false");
            const amzn_music: AmznMusic = JSON.parse(amzn_music_text);
            return amzn_music;
        } catch (error) { return { "error": String(error) }; }
    }

    export async function get_show_home_data(amzn_music: AmznMusic, url: string): PromiseResult<ShowHome>{
        try {
            const trimmed_url = urlid(url, "music.amazon.com");
            const deeplink = {
                "interface": "DeeplinkInterface.v1_0.DeeplinkClientInformation",
                "deeplink": trimmed_url
            };
            const x_amzn_authentication = {
                "interface": "ClientAuthenticationInterface.v1_0.ClientTokenElement",
                "accessToken": amzn_music.appConfig.accessToken
            };
            const x_amzn_csrf = {
                "interface": "CSRFInterface.v1_0.CSRFHeaderElement",
                "token": amzn_music.appConfig.csrf.token,
                "timestamp": amzn_music.appConfig.csrf.ts,
                "rndNonce": amzn_music.appConfig.csrf.rnd
            };
            const headers = {
                "x-amzn-authentication": JSON.stringify(x_amzn_authentication),
                "x-amzn-device-model": "WEBPLAYER",
                "x-amzn-device-width": "1920",
                "x-amzn-device-family": "WebPlayer",
                "x-amzn-device-id": amzn_music.appConfig.deviceId,
                "x-amzn-user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "x-amzn-session-id": amzn_music.appConfig.sessionId,
                "x-amzn-device-height": "1080",
                "x-amzn-request-id": "dfefb1b8-4ae6-4d38-973b-a4964eefbd76",
                "x-amzn-device-language": amzn_music.appConfig.displayLanguage,
                "x-amzn-currency-of-preference": "USD",
                "x-amzn-os-version": "1.0",
                "x-amzn-application-version": amzn_music.appConfig.version,
                "x-amzn-device-time-zone": "America/Phoenix",
                "x-amzn-timestamp": amzn_music.appConfig.csrf.ts,
                "x-amzn-csrf": JSON.stringify(x_amzn_csrf),
                "x-amzn-music-domain": "music.amazon.com",
                "x-amzn-referer": "",
                "x-amzn-affiliate-tags": "",
                "x-amzn-ref-marker": "",
                "x-amzn-page-url": url,
                "x-amzn-weblab-id-overrides": "",
                "x-amzn-video-player-token": "",
                "x-amzn-feature-flags": "hd-supported,uhd-supported"
            };
            
            const body = JSON.stringify({"deeplink": JSON.stringify(deeplink), "headers": JSON.stringify(headers)});

            const show_home_body = await fetch("https://na.mesk.skill.music.a2z.com/api/showHome", {'method': 'POST', 'headers': {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "text/plain;charset=UTF-8",
                    "priority": "u=1, i",
                    "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "cross-site",
                    "Referer": "https://music.amazon.com/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                'body': body
            });
            const show_home: ShowHome = await show_home_body.json();
            return show_home;
        } catch (error) { return { "error": String(error) }; }
    }
    export function get_x_amzn_auth(amzn_music: AmznMusic){
        return {
            "interface": "ClientAuthenticationInterface.v1_0.ClientTokenElement",
            "accessToken": amzn_music.appConfig.accessToken
        }
    } 
    export function get_amzn_csrf(amzn_music: AmznMusic){
        return {
            "interface": "CSRFInterface.v1_0.CSRFHeaderElement",
            "token": amzn_music.appConfig.csrf.token,
            "timestamp": amzn_music.appConfig.csrf.ts,
            "rndNonce": amzn_music.appConfig.csrf.rnd
        }
    }
    export function get_amzn_video_player_token(auth_header: AuthHeader){
        return {
            "interface": auth_header?.interface ?? {},
            "token": auth_header?.token ?? "",
            "expirationMS": auth_header?.expirationMS ?? 0
        }
    }
    export function get_amzn_music_headers(cookie_jar: CookieJar | undefined = undefined){
        return {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "text/plain;charset=UTF-8",
            "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "Referer": "https://music.amazon.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "cache-control": "max-age=0",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": cookie_jar?.toString() as string,
        }
    }
    export async function get_amzn_music_request_headers_default(amzn_music: AmznMusic, playlist_url: string){
        try {
            const show_home = await get_show_home_data(amzn_music, playlist_url);
            if("error" in show_home) throw show_home.error;
            // if(show_home.methods[0].interface !== "VideoPlayerAuthenticationInterface.v1_0.SetVideoPlayerTokenMethod")
                // throw "SetVideoPlayerTokenMethod not found in Show Home method interface";
            const auth_header = "header" in show_home.methods[0] ? JSON.parse(show_home.methods[0].header) : undefined;
            const x_amzn_auth = get_x_amzn_auth(amzn_music);
            const amzn_csrf = get_amzn_csrf(amzn_music);
            const x_amzn_video_player_token = get_amzn_video_player_token(auth_header);
            const request_headers = get_amzn_music_request_headers(x_amzn_auth, amzn_music, amzn_csrf, x_amzn_video_player_token, playlist_url);
            return request_headers;
        } catch (error) { return { "error": String(error) }; }
    }
    export function get_amzn_music_request_headers(x_amzn_auth: ReturnType<typeof get_x_amzn_auth>, amzn_music: AmznMusic, x_amzn_csrf: ReturnType<typeof get_amzn_csrf>, x_amzn_video_player_token: ReturnType<typeof get_amzn_video_player_token>, playlist_url = "https://music.amazon.com/my/library"){
        return {
            "x-amzn-authentication": JSON.stringify(x_amzn_auth),
            "x-amzn-device-model": "WEBPLAYER",
            "x-amzn-device-width": "1920",
            "x-amzn-device-family": "WebPlayer",
            "x-amzn-device-id": amzn_music.appConfig.deviceId,
            "x-amzn-user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
            "x-amzn-session-id": amzn_music.appConfig.sessionId,
            "x-amzn-device-height": "1080",
            "x-amzn-request-id": "449fef43-8891-44ab-896c-6ed4c9ec1e77",
            "x-amzn-device-language": amzn_music.appConfig.displayLanguage,
            "x-amzn-currency-of-preference": "USD",
            "x-amzn-os-version": "1.0",
            "x-amzn-application-version": amzn_music.appConfig.version,
            "x-amzn-device-time-zone": "America/Phoenix",
            "x-amzn-timestamp": amzn_music.appConfig.csrf.ts,
            "x-amzn-csrf": JSON.stringify(x_amzn_csrf),
            "x-amzn-music-domain": "music.amazon.com",
            "x-amzn-referer": "",
            "x-amzn-affiliate-tags": "",
            "x-amzn-ref-marker": "",
            "x-amzn-page-url": playlist_url,
            "x-amzn-weblab-id-overrides": "",
            "x-amzn-video-player-token": JSON.stringify(x_amzn_video_player_token),
            "x-amzn-feature-flags": "hd-supported,uhd-supported"
        }
    }
    export function get_user_hash(){
        return {'level': 'SONIC_RUSH_MEMBER'}
    }
    export async function account_playlists(opts: Opts){
        try {
            const amzn_music = opts.client ?? await get_amzn_music_data("https://music.amazon.com/my/library", opts);
            if("error" in amzn_music) throw amzn_music.error;
            const request_headers = await get_amzn_music_request_headers_default(amzn_music, "https://music.amazon.com/my/library");
            if("error" in  request_headers) throw request_headers.error;
            const user_hash = get_user_hash();
            const request_payload = {'headers': JSON.stringify(request_headers), 'userHash': JSON.stringify(user_hash)};
            const show_library: ShowLibraryHome = await (await fetch("https://na.mesk.skill.music.a2z.com/api/showLibraryHome", {'method': 'POST', 'headers': get_amzn_music_headers(opts.cookie_jar),
                'body': JSON.stringify(request_payload)
            })).json();
            if(show_library.methods[0].interface !== "TemplateListInterface.v1_0.BindTemplateMethod")
                throw "TemplateListInterface not found in Show Library Home method interface";
            const playlists = show_library.methods[0].template.widgets[1].items;
            return playlists;
        } catch (error) { return { "error": String(error) }; }
    }

    export function get_track_id(track: {"primaryLink": {"deeplink": string}}){
        return track.primaryLink.deeplink.replace(/\/.+?\/.+?\?trackAsin=/, '');
    }

    export async function get_playlist(playlist_url: string, opts: Opts){
        try {
            const amzn_music = opts.client ?? await get_amzn_music_data(playlist_url, opts);
            if("error" in amzn_music) throw amzn_music.error;
            const show_home = await get_show_home_data(amzn_music, playlist_url);
            if("error" in show_home) throw show_home.error;
        
            const template_list_index = show_home.methods.findIndex(method => method.interface === "TemplateListInterface.v1_0.CreateAndBindTemplateMethod");
            if (template_list_index === -1) throw "Unable to find TemplateListInterface.v1_0.CreateAndBindTemplateMethod";
            const amzn_track_data = (show_home.methods[template_list_index] as CreateAndBindMethod).template.widgets[0].items;
           
            return {"title": (show_home.methods[template_list_index] as CreateAndBindMethod).template.headerImageAltText, "tracks": amzn_track_data};
        } catch (error) { return { "error": String(error) }; }
    }

    export async function search(query: string, opts: Opts){
        try {		
            const url = `https://music.amazon.com/search/${query.replace(/\s+/g, '+').replace(/[^A-Za-z0-9+]+/g, '')}`
            const filter = {'IsLibrary': ["false"]};
            const keyword = {
                "interface": "Web.TemplatesInterface.v1_0.Touch.SearchTemplateInterface.SearchKeywordClientInformation",
                "keyword": ""
            }
            
            const amzn_music = opts.client ?? await get_amzn_music_data(url, opts);
            if("error" in amzn_music) throw amzn_music.error;
        
            const user_hash = get_user_hash();
            const request_headers = await get_amzn_music_request_headers_default(amzn_music, url);
            if("error" in  request_headers) throw request_headers.error;

            const request_payload = {
                "filter":JSON.stringify(filter),
                "keyword": JSON.stringify(keyword),
                "suggestedKeyword": query,
                "userHash":	JSON.stringify(user_hash),
                "headers": JSON.stringify(request_headers)
            }
            const response: SearchResult = await (await fetch("https://na.mesk.skill.music.a2z.com/api/showSearch", {'method': 'POST', 'headers': get_amzn_music_headers(opts.cookie_jar), 'body': JSON.stringify(request_payload)})).json();
            
            let song_widgets_index = 2;
            const widgets = response.methods[0].template.widgets
            for(let i = 0; i < widgets.length; i++){
                if(widgets[i].header == "Songs"){
                    song_widgets_index = i;
                }
            }
            const tracks = response.methods[0].template.widgets[song_widgets_index].items;
            return tracks;
        } catch (error) { return {"error": String(error)}; }
    }
    export async function add_to_playlist(playlist_url: string, playlist_name: string, uids: string[], opts: Opts){
        try {
            const playlist_id = playlist_url.replace(/(https?:\/\/)?(www\.)?music\.amazon\.com\/my\/playlists\//, '');
        
            const amzn_music = opts.client ?? await get_amzn_music_data(playlist_url, opts);
            if("error" in amzn_music) throw amzn_music.error;
        
            const user_hash = get_user_hash();
            const request_headers = await get_amzn_music_request_headers_default(amzn_music, playlist_url);
            if("error" in request_headers) throw request_headers.error;
            
            const selected_ids = {
                "interface": "Web.PageInterface.v1_0.SelectedItemsClientInformation",
                "ids": uids
            };
    
            const request_payload = {
                "headers": JSON.stringify(request_headers),
                "playlistId": playlist_id,
                "playlistTitle": playlist_name,
                "rejectDuplicate": "true",
                "selectedIds": JSON.stringify(selected_ids),
                "userHash": JSON.stringify(user_hash),
                "version": "14",
            };
            const response = await fetch("https://na.mesk.skill.music.a2z.com/api/add_tracks_to_playlist", {'method': 'POST', 'headers': get_amzn_music_headers(opts.cookie_jar),
                'body': JSON.stringify(request_payload)
            });
            return response;
        } catch (error) { return { "error": error }; }
    }
    function pause(ms: number) { return new Promise( resolve => setTimeout(resolve, ms) ); }
    export async function delete_from_playlist(playlist_url: string, track_ids: string[], delay: number, opts: Opts){
        try {
            const playlist_id = playlist_url.replace(/(https?:\/\/)?(www\.)?music\.amazon\.com\/my\/playlists\//, '');
        
            const amzn_music = opts.client ?? await get_amzn_music_data(playlist_url, opts);
            if("error" in amzn_music) throw amzn_music.error;

            const playlist = await get_playlist(playlist_url, {"client": amzn_music});
            if("error" in playlist) throw playlist.error;
            
            const user_hash = get_user_hash();
            const request_headers = await get_amzn_music_request_headers_default(amzn_music, playlist_url);
            if("error" in request_headers) throw request_headers.error;
            
            let result = {"ok": true};
            for(const track_id in track_ids){
                try {
                    const playlist_item = playlist.tracks.find((item) => get_track_id(item) === track_id);
                    const request_payload = {
                        "headers": JSON.stringify(request_headers),
                        "playlistId": playlist_id,
                        "trackEntryId": playlist_item?.id,
                        "trackId": track_id,
                        "userHash": JSON.stringify(user_hash),
                    };
                    const response = await fetch("https://na.mesk.skill.music.a2z.com/api/removeTrackFromPlaylist", {'method': 'POST', 'headers': get_amzn_music_headers(opts.cookie_jar),
                        'body': JSON.stringify(request_payload)
                    });
                    if(!response.ok) result.ok = false;
                } catch (error) { result.ok = false; }
                finally { if(delay > 0) pause(delay); }
            }
            return result;
        } catch (error) { return { "error": error }; }
    }
    export async function create_playlist(playlist_name: string, opts: Opts){
        const url = "https://music.amazon.com/my/library";
        const amzn_music = opts.client ?? await get_amzn_music_data(url, opts);
        if("error" in amzn_music) throw amzn_music.error;
    
        const user_hash = get_user_hash();
        const request_headers = await get_amzn_music_request_headers_default(amzn_music, url);
        if("error" in request_headers) throw request_headers.error;
        
        const playlist_info = { "interface":"Web.TemplatesInterface.v1_0.Touch.PlaylistTemplateInterface.PlaylistClientInformation", "name": playlist_name, "path":"/my/library" };

        const request_payload = {
            "headers": JSON.stringify(request_headers),
            "playlistInfo": JSON.stringify(playlist_info),
            "userHash": JSON.stringify(user_hash)
        };
        const response = await fetch("https://na.mesk.skill.music.a2z.com/api/create_playlist", {'method': 'POST', 'headers': get_amzn_music_headers(opts.cookie_jar),
            'body': JSON.stringify(request_payload)
        });
        return response;
    }
    export async function delete_playlist(playlist_url: string, opts: Opts){
        const amzn_music = opts.client ?? await get_amzn_music_data(playlist_url, opts);
        if("error" in amzn_music) throw amzn_music.error;
    
        const user_hash = get_user_hash();
        const request_headers = await get_amzn_music_request_headers_default(amzn_music, playlist_url);
        if("error" in request_headers) throw request_headers.error;

        const playlist_id = playlist_url.replace("https://", "").replace("www.", "music.amazon.com/").replace("my/playlists/", "");
        
        const request_payload = {
            "headers": JSON.stringify(request_headers),
            "id": playlist_id,
            "userHash": JSON.stringify(user_hash)
        };
        const response = await fetch("https://na.mesk.skill.music.a2z.com/api/removePlaylist", {'method': 'POST', 'headers': get_amzn_music_headers(opts.cookie_jar),
            'body': JSON.stringify(request_payload)
        });
        return response;
    }
}