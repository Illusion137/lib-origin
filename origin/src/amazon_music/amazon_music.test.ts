import { test, expect, describe, beforeEach } from "vitest"
import { CookieJar } from "@common/utils/cookie_util";
import { AmazonMusic } from "@origin/index";
import { expect_error, expect_no_error } from "@common/testing.test";

let failed = false;
beforeEach(() => { if (failed) throw new Error("Prior test failed — bailing"); });
async function bail_no_error(value: unknown) {
	try { expect_no_error(value); } catch (e) { failed = true; throw e; }
}
async function bail_error(value: unknown) {
	try { expect_error(value); } catch (e) { failed = true; throw e; }
}

const amazon_music_mock = {
	cookie_jar: CookieJar.fromString(process.env.AMAZON_MUSIC_COOKIE_JAR)
}
const search_query = "Lelo new detroit";
const playlist_url = "https://music.amazon.com/playlists/B07D9SGZMQ";

AmazonMusic.enable_cache(false);

describe("Amazon Music", () => {
	test("get_amzn_music_data with cookies", async() => bail_no_error(await AmazonMusic.get_amzn_music_data(amazon_music_mock)));
	test("get_amzn_music_data without cookies", async() => bail_no_error(await AmazonMusic.get_amzn_music_data({})));

	test("account_playlists with cookies", async() => bail_no_error(await AmazonMusic.account_playlists(amazon_music_mock)));
	test("account_playlists without cookies", async() => bail_error(await AmazonMusic.account_playlists({})));

	test("search with cookies", async() => bail_no_error(await AmazonMusic.search_tracks(search_query, amazon_music_mock)));
	test("search without cookies", async() => bail_error(await AmazonMusic.search_tracks(search_query, {})));

	test("get_playlist with cookies", async() => bail_no_error(await AmazonMusic.get_playlist(playlist_url, amazon_music_mock)));
});
