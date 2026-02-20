import { test, expect, describe, beforeEach } from "vitest"
import { CookieJar } from "@common/utils/cookie_util";
import { SoundCloud } from "@origin/soundcloud/soundcloud";
import { expect_error, expect_no_error } from "@common/testing.test";

let failed = false;
beforeEach(() => { if (failed) throw new Error("Prior test failed — bailing"); });
async function bail_no_error(value: unknown) {
	try { expect_no_error(value); } catch (e) { failed = true; throw e; }
}
async function bail_error(value: unknown) {
	try { expect_error(value); } catch (e) { failed = true; throw e; }
}

const soundcloud_mock = {
	cookie_jar: CookieJar.fromString(process.env.SOUNDCLOUD_COOKIE_JAR)
}
const search_query = "Lelo new detroit";
const artist_permalink = "https://soundcloud.com/637iso637";
const playlist_path = "/illusi/sets/zayboy-loveish";

SoundCloud.enable_cache(false);

describe("SoundCloud", () => {
	test("get_client_id with cookies", async () => bail_no_error(await SoundCloud.get_client_id(soundcloud_mock)));
	test("get_client_id without cookies", async () => bail_no_error(await SoundCloud.get_client_id({})));

	test("get_hydration with cookies", async () => bail_no_error(await SoundCloud.get_hydration("https://soundcloud.com/discover", soundcloud_mock)));
	test("get_hydration without cookies", async () => bail_no_error(await SoundCloud.get_hydration("https://soundcloud.com/discover", {})));

	test("search TRACKS with cookies", async () => bail_no_error(await SoundCloud.search("TRACKS", { ...soundcloud_mock, query: search_query })));
	test("search TRACKS without cookies", async () => bail_no_error(await SoundCloud.search("TRACKS", { query: search_query })));

	test("get_artist with cookies", async () => bail_no_error(await SoundCloud.get_artist("TRACKS", { ...soundcloud_mock, artist_permalink })));
	test("get_artist without cookies", async () => bail_no_error(await SoundCloud.get_artist("TRACKS", { artist_permalink })));

	test("get_playlist with cookies", async () => bail_no_error(await SoundCloud.get_playlist({ ...soundcloud_mock, playlist_path })));
	test("get_playlist without cookies", async () => bail_no_error(await SoundCloud.get_playlist({ playlist_path })));

	test("get_all_user_playlists with cookies", async () => bail_no_error(await SoundCloud.get_all_user_playlists(soundcloud_mock)));
	test("get_all_user_playlists without cookies", async () => bail_error(await SoundCloud.get_all_user_playlists({})));

	test("liked_music with cookies", async () => bail_no_error(await SoundCloud.liked_music(soundcloud_mock)));
	test("liked_music without cookies", async () => bail_error(await SoundCloud.liked_music({})));

	test("listening_history with cookies", async () => bail_no_error(await SoundCloud.listening_history(soundcloud_mock)));
	test("listening_history without cookies", async () => bail_error(await SoundCloud.listening_history({})));
});
