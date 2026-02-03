import { CookieJar } from "@common/utils/cookie_util";
import { AmazonMusic } from "@origin/index";
import { expect_error, expect_no_error } from "@common/testing.test";

const amzazon_music_mock = {
    cookie_jar: CookieJar.fromString(process.env.AMAZON_MUSIC_COOKIE_JAR)
}
const search_query = "Lelo new detroit";

AmazonMusic.enable_cache(false);

describe("Amazon Music", () => {
    test("get_amzn_music_data with cookies", async() => expect_no_error(await AmazonMusic.get_amzn_music_data(amzazon_music_mock)));
    test("get_amzn_music_data without cookies", async() => expect_no_error(await AmazonMusic.get_amzn_music_data({})));

    test("account_playlists with cookies", async() => expect_no_error(await AmazonMusic.account_playlists(amzazon_music_mock)));
    test("account_playlists without cookies", async() => expect_error(await AmazonMusic.account_playlists({})));

    test("search with cookies", async() => expect_no_error(await AmazonMusic.search_tracks(search_query, amzazon_music_mock)));
    test("search without cookies", async() => expect_error(await AmazonMusic.search_tracks(search_query, {})));
});