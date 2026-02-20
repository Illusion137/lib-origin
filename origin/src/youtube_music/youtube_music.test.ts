import { test, expect, describe, beforeEach } from "vitest"
import { CookieJar } from "@common/utils/cookie_util";
import { YouTubeMusic } from "@origin/youtube_music/youtube_music";
import { expect_error, expect_no_error } from "@common/testing.test";

let failed = false;
beforeEach(() => { if (failed) throw new Error("Prior test failed — bailing"); });
async function bail_no_error(value: unknown) {
	try { expect_no_error(value); } catch (e) { failed = true; throw e; }
}
async function bail_error(value: unknown) {
	try { expect_error(value); } catch (e) { failed = true; throw e; }
}

const youtube_music_mock = {
	cookie_jar: CookieJar.fromString(process.env.YOUTUBE_COOKIE_JAR)
}
const playlist_id = "PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI";
const artist_id = "UCq2QwnKW79w4a55ZQKRxHfg";
const search_query = "Lelo new detroit";

describe("YouTube Music", () => {
	test("get_home with cookies", async() => bail_no_error(await YouTubeMusic.get_home(youtube_music_mock)));
	test("get_home without cookies", async() => bail_no_error(await YouTubeMusic.get_home({})));

	test("get_playlist with cookies", async() => bail_no_error(await YouTubeMusic.get_playlist(youtube_music_mock, playlist_id)));
	test("get_playlist without cookies", async() => bail_no_error(await YouTubeMusic.get_playlist({}, playlist_id)));

	test("get_artist with cookies", async() => bail_no_error(await YouTubeMusic.get_artist(youtube_music_mock, artist_id)));
	test("get_artist without cookies", async() => bail_no_error(await YouTubeMusic.get_artist({}, artist_id)));

	test("search with cookies", async() => bail_no_error(await YouTubeMusic.search(youtube_music_mock, search_query)));
	test("search without cookies", async() => bail_no_error(await YouTubeMusic.search({}, search_query)));

	test("get_explore with cookies", async() => bail_no_error(await YouTubeMusic.get_explore(youtube_music_mock)));
	test("get_explore without cookies", async() => bail_no_error(await YouTubeMusic.get_explore({})));

	test("new_releases_albums with cookies", async() => bail_no_error(await YouTubeMusic.new_releases_albums(youtube_music_mock)));
	test("new_releases_albums without cookies", async() => bail_no_error(await YouTubeMusic.new_releases_albums({})));

	test("get_library with cookies", async() => bail_no_error(await YouTubeMusic.get_library(youtube_music_mock)));
	test("get_library without cookies", async() => bail_error(await YouTubeMusic.get_library({})));

	test("search_suggestions with cookies", async() => bail_no_error(await YouTubeMusic.search_suggestions(youtube_music_mock, search_query)));
	test("search_suggestions without cookies", async() => bail_no_error(await YouTubeMusic.search_suggestions({}, search_query)));
});
