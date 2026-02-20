import { test, expect, describe, beforeEach } from "vitest"
import { CookieJar } from "@common/utils/cookie_util";
import { BandLab } from "@origin/bandlab/bandlab";
import { expect_error, expect_no_error } from "@common/testing.test";

let failed = false;
beforeEach(() => { if (failed) throw new Error("Prior test failed — bailing"); });
async function bail_no_error(value: unknown) {
	try { expect_no_error(value); } catch (e) { failed = true; throw e; }
}
async function bail_error(value: unknown) {
	try { expect_error(value); } catch (e) { failed = true; throw e; }
}

const bandlab_mock = {
	cookie_jar: CookieJar.fromString(process.env.BANDLAB_COOKIE_JAR)
}
const playlist_id = "c_cfac73b0-b6fa-ea11-a94c-0003ffd1fc76";
const artist_id = "illusi";
const song_id = "cfac73b0-b6fa-ea11-a94c-0003ffd1fc76";
const search_query = "illusi";

describe("BandLab", () => {
	test("get_client with cookies", async() => bail_no_error(await BandLab.get_client(bandlab_mock)));
	test("get_client without cookies", async() => bail_no_error(await BandLab.get_client({})));

	test("get_playlist with cookies", async() => bail_no_error(await BandLab.get_playlist(playlist_id, bandlab_mock)));
	test("get_playlist without cookies", async() => bail_no_error(await BandLab.get_playlist(playlist_id, {})));

	test("get_artist with cookies", async() => bail_no_error(await BandLab.get_artist(artist_id, bandlab_mock)));
	test("get_artist without cookies", async() => bail_no_error(await BandLab.get_artist(artist_id, {})));

	test("get_song_info with cookies", async() => bail_no_error(await BandLab.get_song_info(song_id, bandlab_mock)));
	test("get_song_info without cookies", async() => bail_no_error(await BandLab.get_song_info(song_id, {})));

	test("search_user with cookies", async() => bail_no_error(await BandLab.search_user(search_query, bandlab_mock)));
	test("search_user without cookies", async() => bail_no_error(await BandLab.search_user(search_query, {})));

	test("search_songs with cookies", async() => bail_no_error(await BandLab.search_songs(search_query, bandlab_mock)));
	test("search_songs without cookies", async() => bail_no_error(await BandLab.search_songs(search_query, {})));

	test("self_projects_list with cookies", async() => bail_no_error(await BandLab.self_projects_list(bandlab_mock)));
	test("self_projects_list without cookies", async() => bail_error(await BandLab.self_projects_list({})));
});
