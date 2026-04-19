import { CookieJar } from "@common/utils/cookie_util";
import { Prefs } from "@illusive/prefs";
import * as fs from 'fs';

export default function load_cookies_env(){
    const env = fs.readFileSync(".env").toString();
    const lines = env.split("\n");
    const pairs: any[] = [];
    for(const line of lines) {
        const split_index = line.indexOf("=");
        pairs.push([line.slice(0, split_index), line.slice(split_index + 2, line.length - 2).replace(/\\/g, '') ]);
    }
    Prefs.prefs.youtube_cookie_jar.current_value       = CookieJar.fromString(pairs[2+0][1]);
    Prefs.prefs.youtube_music_cookie_jar.current_value = CookieJar.fromString(pairs[2+1][1]);
    Prefs.prefs.spotify_cookie_jar.current_value       = CookieJar.fromString(pairs[2+2][1]);
    Prefs.prefs.soundcloud_cookie_jar.current_value    = CookieJar.fromString(pairs[2+3][1]);
    Prefs.prefs.amazon_music_cookie_jar.current_value  = CookieJar.fromString(pairs[2+4][1]);
    Prefs.prefs.apple_music_cookie_jar.current_value   = CookieJar.fromString(pairs[2+5][1]);
    Prefs.prefs.bandlab_cookie_jar.current_value       = CookieJar.fromString(pairs[2+5+4][1]);
}