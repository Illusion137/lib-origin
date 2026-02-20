import { test, expect, describe, beforeEach } from "vitest"
import { CookieJar } from "@common/utils/cookie_util";
import { YouTube } from "@origin/youtube/youtube";
import { expect_error, expect_no_error } from "@common/testing.test";

let failed = false;
beforeEach(() => { if (failed) throw new Error("Prior test failed — bailing"); });
async function bail_no_error(value: unknown) {
	try { expect_no_error(value); } catch (e) { failed = true; throw e; }
}
async function bail_error(value: unknown) {
	try { expect_error(value); } catch (e) { failed = true; throw e; }
}

const youtube_mock = {
	cookie_jar: CookieJar.fromString(process.env.YOUTUBE_COOKIE_JAR)
}
const playlist_id = "PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI";
const artist_id = "UCq2QwnKW79w4a55ZQKRxHfg";
const search_query = "Lelo new detroit";

describe("YouTube", () => {
	test("get_home with cookies", async() => bail_no_error(await YouTube.get_home(youtube_mock)));
	test("get_home without cookies", async() => bail_no_error(await YouTube.get_home({})));

	test("get_playlist with cookies", async() => bail_no_error(await YouTube.get_playlist(youtube_mock, playlist_id)));
	test("get_playlist without cookies", async() => bail_no_error(await YouTube.get_playlist({}, playlist_id)));

	test("get_artist with cookies", async() => bail_no_error(await YouTube.get_artist(youtube_mock, artist_id)));
	test("get_artist without cookies", async() => bail_no_error(await YouTube.get_artist({}, artist_id)));

	test("search with cookies", async() => bail_no_error(await YouTube.search(youtube_mock, search_query)));
	test("search without cookies", async() => bail_no_error(await YouTube.search({}, search_query)));

	test("get_library with cookies", async() => bail_no_error(await YouTube.get_library(youtube_mock)));
	test("get_library without cookies", async() => bail_error(await YouTube.get_library({})));
});
