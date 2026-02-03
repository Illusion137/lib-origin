import { CookieJar } from "@common/utils/cookie_util";
import { AppleMusic } from "@origin/index";
import { expect_error, expect_no_error } from "@common/testing.test";

const apple_music_mock = {
    cookie_jar: CookieJar.fromString(process.env.APPLE_MUSIC_COOKIE_JAR)
}
const playlist_url = "https://music.apple.com/us/playlist/zayboy-loveish/pl.u-4JommGltMdrNMl";
const search_query = "Lelo new detroit";
const artist_url = "https://music.apple.com/us/artist/lelo/1443736146";

AppleMusic.enable_cache(false);

describe("Apple Music", () => {
    test("try_cached_client with cookies", async() => expect_no_error(await AppleMusic.try_cached_client(playlist_url, apple_music_mock)));
    test("try_cached_client without cookies", async() => expect_no_error(await AppleMusic.try_cached_client(playlist_url, {})));

    test("account_playlists with cookies", async() => expect_no_error(await AppleMusic.account_playlists(apple_music_mock)));
    test("account_playlists without cookies", async() => expect_error(await AppleMusic.account_playlists({})));

    test("search with cookies", async() => expect_no_error(await AppleMusic.search(search_query, apple_music_mock)));
    test("search without cookies", async() => expect_no_error(await AppleMusic.search(search_query, {})));

    test("artist with cookies", async() => expect_no_error(await AppleMusic.get_artist(artist_url, apple_music_mock)));
    test("artist without cookies", async() => expect_no_error(await AppleMusic.get_artist(artist_url, {})));
    test("get_artist_tracks with cookies", async() => expect_no_error(await AppleMusic.get_artist_tracks(artist_url, apple_music_mock)));
    test("get_artist_singles with cookies", async() => expect_no_error(await AppleMusic.get_artist_singles(artist_url, apple_music_mock)));
    test("get_artist_albums with cookies", async() => expect_no_error(await AppleMusic.get_artist_albums(artist_url, apple_music_mock)));
    test("get_artist_appears_on with cookies", async() => expect_no_error(await AppleMusic.get_artist_appears_on(artist_url, apple_music_mock)));
    test("get_artist_similar_artists with cookies", async() => expect_no_error(await AppleMusic.get_artist_similar_artists(artist_url, apple_music_mock)));
});