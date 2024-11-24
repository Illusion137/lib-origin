import { gcc } from "../../admin/gcc";
import { CookieJar } from "../../origin/src/utils/cookie_util";
import { Prefs } from "./prefs";

const gcc_mode: ("dotenv" | "gcc") = "dotenv";

export default function load_cookies_env(){
    Prefs.prefs.youtube_cookie_jar.current_value       = CookieJar.fromString(gcc.cookie_of(gcc_mode, 'YOUTUBE_COOKIE_JAR'));
    Prefs.prefs.youtube_music_cookie_jar.current_value = CookieJar.fromString(gcc.cookie_of(gcc_mode, 'YOUTUBE_MUSIC_COOKIE_JAR'));
    Prefs.prefs.spotify_cookie_jar.current_value       = CookieJar.fromString(gcc.cookie_of(gcc_mode, 'SPOTIFY_COOKIE_JAR'))
    Prefs.prefs.soundcloud_cookie_jar.current_value    = CookieJar.fromString(gcc.cookie_of(gcc_mode, 'SOUNDCLOUD_COOKIE_JAR'));
    Prefs.prefs.amazon_music_cookie_jar.current_value  = CookieJar.fromString(gcc.cookie_of(gcc_mode, 'AMAZON_MUSIC_COOKIE_JAR'));
    Prefs.prefs.apple_music_cookie_jar.current_value   = CookieJar.fromString(gcc.cookie_of(gcc_mode, 'APPLE_MUSIC_COOKIE_JAR'));
}