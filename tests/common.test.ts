import { encode_params } from "@common/utils/fetch_util";
import { GCC } from "../admin/gcc";
import { CookieJar } from "../common/utils/cookie_util";
import { is_empty } from "@common/utils/util";

const mock_cookie_strings = {
    youtube: GCC.dotenv_of("YOUTUBE_COOKIE_JAR"),
    youtube_music: GCC.dotenv_of("YOUTUBE_MUSIC_COOKIE_JAR"),
    spotify: GCC.dotenv_of("SPOTIFY_COOKIE_JAR"),
    soundcloud: GCC.dotenv_of("SOUNDCLOUD_COOKIE_JAR"),
    amazon_music: GCC.dotenv_of("AMAZON_MUSIC_COOKIE_JAR"),
    apple_music: GCC.dotenv_of("APPLE_MUSIC_COOKIE_JAR"),
    jnovel: GCC.dotenv_of("JNOVEL_COOKIE_JAR"),
    instagram: GCC.dotenv_of("INSTRAGRAM_COOKIE_JAR"),
    google_translate: GCC.dotenv_of("GOOGLE_TRANSLATE_COOKIE_JAR"),
};

for(const key of Object.keys(mock_cookie_strings)){
    test("cookie_jar from_string " + key, () => {
        expect(CookieJar.fromString(mock_cookie_strings[key]).toString()).toBe(mock_cookie_strings[key]);
    });
}

test("encode_params", () => {
	expect(encode_params({ q: "lelo camelot" })).toBe("q=lelo%20camelot");
	expect(encode_params({ e: "" })).toBe("e=");
	expect(encode_params({ n: 500 })).toBe("n=500");
	expect(encode_params({ b: false })).toBe("b=false");
	expect(encode_params({ o: [0, 1] })).toBe("o=%5B0%2C1%5D");
});

test("is_empty", () => {
	expect(is_empty("")).toBeTruthy();
	expect(is_empty("   ")).toBeTruthy();
	expect(is_empty(undefined)).toBeTruthy();
	expect(is_empty(null)).toBeTruthy();
	expect(is_empty(0)).toBeTruthy();
	expect(is_empty([])).toBeTruthy();
	expect(is_empty({})).toBeTruthy();
	expect(is_empty("str")).toBeFalsy();
	expect(is_empty(false)).toBeFalsy();
	expect(is_empty(true)).toBeFalsy();
	expect(is_empty(1)).toBeFalsy();
	expect(is_empty(-1)).toBeFalsy();
	expect(is_empty([0, 1])).toBeFalsy();
	expect(is_empty([0])).toBeFalsy();
	expect(is_empty([{ a: "b" }])).toBeFalsy();
});