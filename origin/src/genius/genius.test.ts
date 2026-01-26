import { Genius } from "@origin/index";
import { expect_no_error } from "@common/testing.test";

const search_query = "Babytron Half-Blood Prince";

describe("Genius", () => {
    test("search_songs without cookies", async() => expect_no_error(await Genius.search_songs(search_query, {})));
    test("get_lyrics without cookies", async() => expect_no_error(await Genius.get_lyrics({path: "/Babytron-lost-in-the-sauce-lyrics"} as any, {})));
});