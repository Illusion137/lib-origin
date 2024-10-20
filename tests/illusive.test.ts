import { Illusive } from "../Illusive/src/illusive";
import { Prefs } from "../Illusive/src/prefs";
import { MusicService, MusicServiceType } from "../Illusive/src/types";
import { CookieJar } from "../origin/src/utils/cookie_util";
import { gcc } from "../admin/gcc";

const illusive_music_services: MusicServiceType[] = ["YouTube", "YouTube Music", "Spotify", "SoundCloud", "Amazon Music", "Apple Music"];
const timeout_ms = 15000;

const gcc_mode: ("dotenv"|"gcc") = "dotenv";

Prefs.prefs.youtube_cookie_jar.current_value       = CookieJar.fromString(gcc.cookie_of(gcc_mode, 'youtube_cookie_jar'));
Prefs.prefs.youtube_music_cookie_jar.current_value = CookieJar.fromString(gcc.cookie_of(gcc_mode, 'youtube_music_cookie_jar'));
Prefs.prefs.spotify_cookie_jar.current_value       = CookieJar.fromString(gcc.cookie_of(gcc_mode, 'spotify_cookie_jar'))
Prefs.prefs.soundcloud_cookie_jar.current_value    = CookieJar.fromString(gcc.cookie_of(gcc_mode, 'soundcloud_cookie_jar'));
Prefs.prefs.amazon_music_cookie_jar.current_value  = CookieJar.fromString(gcc.cookie_of(gcc_mode, 'amazon_music_cookie_jar'));
Prefs.prefs.apple_music_cookie_jar.current_value   = CookieJar.fromString(gcc.cookie_of(gcc_mode, 'apple_music_cookie_jar'));

function is_okay(result: any){
    const ok_object = typeof result === "object" && result !== null && !("error" in result);
    const ok_boolean = typeof result === "boolean" && result;
    const ok = ok_boolean || ok_object;
    return ok;
}
function illusive_expect_ok(result: any): void{
    let ok = is_okay(result);
    if(!ok) console.log(typeof result === "object" ? result?.error : result);
    expect(ok).toBe(true);
    return ok as unknown as void;
}
// function illusive_test_sync(name: string, result_callback: () => any){ test(name, () => illusive_expect_ok(result_callback())); }
function illusive_test_async(name: string, result_callback: () => Promise<any>){ test.concurrent(name, async() => illusive_expect_ok(await result_callback()), timeout_ms); }

function test_music_services_list(name: string, service_names: MusicServiceType[], key_value: [keyof MusicService, any[]]){
    for(const service_name of service_names){
        const music_service = Illusive.music_service.get(service_name)!;
        if(music_service[key_value[0]] === undefined) continue;
        describe(service_name, () => {
            illusive_test_async(name, async() => await (<(...arg0: any[]) => Promise<any>>music_service[key_value[0]])!(...key_value[1]));
        });
    }
}

function test_fetch_playlists(service_name: MusicServiceType, playlist_ids: string[]){
    describe(service_name, () => {
        const music_service = Illusive.music_service.get(service_name)!;
        for(let i = 0; i < playlist_ids.length; i++){
            test.concurrent(`${playlist_ids[i]}-${i}`, async() => {
                let result: any = await music_service.get_playlist(playlist_ids[i]);
                let ok = <boolean><unknown>illusive_expect_ok(result);
                while(ok && result !== null && result?.playlist_continuation !== null){
                    result = await music_service.get_playlist_continuation!(result.playlist_continuation);
                    if(result.playlist_continuation === null) break;
                    ok = <boolean><unknown>illusive_expect_ok(result);
                }
            }, timeout_ms);
        }
    });
}
// function test_playlist_cycle(service_name: MusicServiceType, tracks: Track[]){}

function test_search(service_names: MusicServiceType[], query: string){ test_music_services_list(query, service_names, ["search", [query]]); }
function test_user_playlists(service_names: MusicServiceType[]){ test_music_services_list("library", service_names, ["user_playlists_map", []]); }

test_search(illusive_music_services, "Lelo camelot");
test_user_playlists(illusive_music_services);

test_fetch_playlists("YouTube", [
    "PLnIB0XeUqT-iV1eQbPGps-aE8dwoi2ujJ",
    "PLnIB0XeUqT-j6HkmTcOlhtkAS4cbpsLeA",
    "PLpBymDh5XkKT8RfHiXz9cnWsc6F1pa7W3",
    "OLAK5uy_lUjNfp9_FGk7abrMc7c8LP54quOgCyacY"
])
test_fetch_playlists("YouTube Music", [
    "PLnIB0XeUqT-iV1eQbPGps-aE8dwoi2ujJ",
    "PLnIB0XeUqT-j6HkmTcOlhtkAS4cbpsLeA"
])
test_fetch_playlists("Spotify", [
    "https://open.spotify.com/playlist/4uNs2lqeO0Ec43d2Sp3yp4",
    "https://open.spotify.com/album/7zezk3hbEWlOooKBLuLJKp",
    "https://open.spotify.com/collection/tracks"
])
test_fetch_playlists("SoundCloud", [
    "https://soundcloud.com/primal-illusion/sets/illusno",
    "https://soundcloud.com/elit3xxredtiger/sets/yktvow",
])
test_fetch_playlists("Amazon Music", [
    "https://music.amazon.com/my/playlists/a5dc1cff-2ccb-4e52-8144-d5adae28e33d"
])
test_fetch_playlists("Apple Music", [
    "https://music.apple.com/us/library/playlist/p.7Pkeq4PcVPLK7Ae?l=en-US",
    "https://music.apple.com/us/library/playlist/p.B0A8O2Jie4KpRZA?l=en-US"
])