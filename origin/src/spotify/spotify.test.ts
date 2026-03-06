import { test, describe } from "vitest"
import { CookieJar } from "@common/utils/cookie_util";
import { Spotify } from "@origin/spotify/spotify";
import { expect_error, expect_no_error } from "@common/testing.test";
import 'dotenv/config';

const spotify_mock = {
    cookie_jar: CookieJar.fromString(process.env.SPOTIFY_COOKIE_JAR)
}
const playlist_url = "https://open.spotify.com/album/2WE1yHBWGqmJ3vhebImBmF";
const search_query = "Lelo new detroit";
const artist_url = "https://open.spotify.com/artist/6RcgNRwyY9YNTXd9luk8JW";

Spotify.enable_cache(false);

describe("Spotify", () => {
    test("try_cached_client without cookies", async () => expect_no_error(await Spotify.get_client(playlist_url, undefined)));
    test("try_cached_client with cookies", async () => expect_no_error(await Spotify.get_client(playlist_url, spotify_mock.cookie_jar)));

    test("account_playlists with cookies", async () => expect_no_error(await Spotify.account_playlists({ var: {}, cookie_jar: spotify_mock.cookie_jar })));
    test("account_playlists without cookies", async () => expect_error(await Spotify.account_playlists({ var: {} })));

    test("search with cookies", async () => expect_no_error(await Spotify.search({ var: { searchTerm: search_query }, cookie_jar: spotify_mock.cookie_jar })));
    test("search without cookies", async () => expect_no_error(await Spotify.search({ var: { searchTerm: search_query } })));

    test("artist with cookies", async () => expect_no_error(await Spotify.get_artist({ var: { uri: artist_url }, cookie_jar: spotify_mock.cookie_jar },)));
    test("artist without cookies", async () => expect_no_error(await Spotify.get_artist({ var: { uri: artist_url } })));
});