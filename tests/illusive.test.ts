import { Illusive } from "../Illusive/src/illusive";
import load_cookies_env from "../Illusive/src/load_cookies_env";
import { MusicService, MusicServiceType } from "../Illusive/src/types";

load_cookies_env();

const illusive_music_services: MusicServiceType[] = ["YouTube", "YouTube Music", "Spotify", "SoundCloud", "Amazon Music", "Apple Music"];
const timeout_ms = 15000;

function is_okay(result: any) {
	const ok_object = typeof result === "object" && result !== null && !("error" in result);
	const ok_boolean = typeof result === "boolean" && result;
	const ok = ok_boolean || ok_object;
	return ok;
}
function illusive_expect_ok(result: any): void {
	const ok = is_okay(result);
	if (!ok) console.log(typeof result === "object" ? result?.error : result);
	expect(ok).toBe(true);
	return ok as unknown as void;
}
// function illusive_test_sync(name: string, result_callback: () => any){ test(name, () => illusive_expect_ok(result_callback())); }
function illusive_test_async(name: string, result_callback: () => Promise<any>) { test.concurrent(name, async () => illusive_expect_ok(await result_callback()), timeout_ms); }

function test_music_services_list(name: string, service_names: MusicServiceType[], key_value: [keyof MusicService, any[]]) {
	for (const service_name of service_names) {
		const music_service = Illusive.music_service.get(service_name)!;
		if (music_service[key_value[0]] === undefined) continue;
		describe(service_name, () => {
			illusive_test_async(name, async () => await (music_service[key_value[0]] as (...arg0: any[]) => Promise<any>)(...key_value[1]));
		});
	}
}

function test_fetch_playlists(service_name: MusicServiceType, playlist_ids: string[]) {
	describe(service_name, () => {
		const music_service = Illusive.music_service.get(service_name)!;
		for (let i = 0; i < playlist_ids.length; i++) {
			test.concurrent(`${playlist_ids[i]}-${i}`, async () => {
				const result: any = await music_service.get_full_playlist(playlist_ids[i]);
				illusive_expect_ok(result) as unknown as boolean;
			}, timeout_ms);
		}
	});
}

function test_search(service_names: MusicServiceType[], query: string) { test_music_services_list(query, service_names, ["search", [query]]); }
function test_user_playlists(service_names: MusicServiceType[]) { test_music_services_list("library", service_names, ["user_playlists_map", []]); }

test_search(illusive_music_services, "Lelo camelot");
test_user_playlists(illusive_music_services);

test_fetch_playlists("YouTube", [
	    "PLnIB0XeUqT-j6HkmTcOlhtkAS4cbpsLeA",
	    "OLAK5uy_lUjNfp9_FGk7abrMc7c8LP54quOgCyacY"
])
test_fetch_playlists("YouTube Music", [
    "PLnIB0XeUqT-j6HkmTcOlhtkAS4cbpsLeA",
    "OLAK5uy_lUjNfp9_FGk7abrMc7c8LP54quOgCyacY"
])
test_fetch_playlists("Spotify", [
	"https://open.spotify.com/playlist/4uNs2lqeO0Ec43d2Sp3yp4",
	"https://open.spotify.com/album/7zezk3hbEWlOooKBLuLJKp",
	"https://open.spotify.com/collection/tracks"
])
test_fetch_playlists("SoundCloud", [
	"https://soundcloud.com/you/likes",
	"https://soundcloud.com/primal-illusion/sets/illusno",
	"https://soundcloud.com/elit3xxredtiger/sets/yktvow",
])
test_fetch_playlists("Amazon Music", [
	"https://music.amazon.com/my/playlists/a5dc1cff-2ccb-4e52-8144-d5adae28e33d"
])
test_fetch_playlists("Apple Music", [
	"https://music.apple.com/us/library/playlist/p.7Pkeq4PcVPLK7Ae?l=en-US",
	"https://music.apple.com/us/library/playlist/p.B0A8O2Jie4KpRZA?l=en-US",
	"https://music.apple.com/us/library/playlist/p.EYWrOa3FzYvagQD?l=en-US"
])