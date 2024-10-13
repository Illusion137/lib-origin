import AsyncStorage from '@react-native-async-storage/async-storage';
import { is_empty } from '../../../../../../origin/src/utils/util';

export let prefs = get_default_prefs();

export async function get_legacy_prefs(): Promise<typeof prefs|null>{
    const prefs_item = await AsyncStorage.getItem("Prefs");
    if(is_empty(prefs_item)) return null;
    return JSON.parse(prefs_item as string);
}
export async function clear_prefs(){
    await AsyncStorage.removeItem("Prefs");
}

export async function is_prefs_empty(){
    let prefs = await AsyncStorage.getItem("Prefs");
    if(prefs == null || prefs == undefined){
        return true;
    }
    return false;
}

export async function fetch_prefs(){
    if(await is_prefs_empty())
        await reset_prefs();
    prefs = JSON.parse(await AsyncStorage.getItem("Prefs") as string);
}

export function cookies_to_json(cookies: string): Record<string, any>{
    let cookie_json: Record<string, any> = {};
    let cookie_set = cookies.split('; ');
    cookie_set.forEach((cookie: any) => {
        let cookie_key_value = cookie.split('=')
        cookie_json[cookie_key_value[0]] = cookie_key_value[1]
    })
    return cookie_json;
}

export function update_cookies(cookies: string, new_cookies: any){
    const cookies_obj = cookies_to_json(cookies);
    new_cookies.forEach((cookie: any) => {
        let cookieKeyValue = cookie[0].split('=')
        cookies_obj[cookieKeyValue[0]] = cookieKeyValue[1]
    });
    return format_cookies(cookies);
}

function format_cookies(cookie_data: any){
    try {
        let cookieKeys: string[] = []
        let formated_cookies = ""
        for (const key in cookie_data) {
            cookieKeys.push(key);
        }
        cookieKeys.forEach((key) => {
            formated_cookies += `${key}=${cookie_data[key].value}; `;
        })
        formated_cookies = formated_cookies.slice(0, formated_cookies.length-2)
    
        return formated_cookies;
    } catch (error) {}
}
function format_cookies_json(cookie_data: Record<string, any>){
    try {
        let formatedCookies = "";
        for(const cookie of Object.entries(cookie_data)){
            formatedCookies += `${cookie[0]}=${cookie[1]}; `;
            formatedCookies = formatedCookies.slice(0, formatedCookies.length-2)
        }
        return formatedCookies;
    } catch (error) {}
}
export async function set_cookies_json(unformated_cookies: Record<string, any>, service: string){
    let cookies = format_cookies_json(unformated_cookies);
    (<any>prefs.external_services)[service] = cookies;
    await AsyncStorage.setItem('Prefs', JSON.stringify(prefs));
}
export async function set_cookies(unformated_cookies: Record<string, any>, service: string){
    let cookies = format_cookies(unformated_cookies);
    (<any>prefs.external_services)[service] = cookies;
    await AsyncStorage.setItem('Prefs', JSON.stringify(prefs));
}

export function get_experimental_feature_enabled(feature: string): boolean{
    return prefs.settings.enable_experimental_features && (<any>prefs.experimental_features)[feature]
}

export const dark_theme_default = {
    dark: true,
    colors: {
        primary: '#7400fe',
        secondary: '#fc00c9',
        background: '#0d1016',
        card: '#131213',
        text: '#ffffff',
        subtext: '#8c939d',
        border: '#222222',
        notification: '#1313ff',
        shelf: '#161B22',
        tabInactive: '#cad1d8',
        line: '#303040',
        searchInput: '#404254',
        searchPlaceholder: '#8080a0',
        inactive: '#8080a0',
        red: '#FF0000',
        green: '#00FF00',
        playingSong: '#141722',
        playScreen: '#141722',
        track: '#141722',
        highlightPressColor: '#bbaaff'
    },
}

function get_default_prefs(){
    return {
        'experimental_features':{
            'get_account_playlists_in_get_playlist': true,
            'auto_cache_thumbnails': false,
            'smart_remove_cached_thumbnails': false,
        },
        'settings': {
            'default_playlists_size': 200,
            'download_queue_max_length': 6,
            'spotify_library_limit': 20,
            'spotify_playlist_limit': 200,
            'always_shuffle': true,
            'only_play_downloaded': false,
            'show_track_duration': true,
            'ask_where_to_save': false,
            'edit_mode_disables_playing': true,
            'use_cookies_on_playback': false,
            'use_cookies_on_download': false,
            // 'alphascroll_hitslop': 20,
            // 'cache_backpack_ids': false,
            'enable_dev_features': false,
            'enable_experimental_features': false
        },
        'sleep_timer_time': 0,
        'external_services': {
            'youtube_cookies' : '',
            'youtube_music_cookies' : '',
            'spotify_cookies' : '',
            'amazon_music_cookies' : '',
        },
        'linker': {
            'linked_playlists': []
        },
        'search': {
            'recent_searches': [] as string[]
        }
    }
} 
export function snake_case_to_plain_text(text: string){
    text = text.replace(/_/g,' ');
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++)
        words[i] = words[i][0].toUpperCase() + words[i].substring(1);
    return words.join(" ");
}

export async function reset_prefs(){ 
    prefs = get_default_prefs();
    await AsyncStorage.setItem('Prefs', JSON.stringify(prefs));
}
export async function save_prefs(){
    await AsyncStorage.setItem('Prefs', JSON.stringify(prefs));
}