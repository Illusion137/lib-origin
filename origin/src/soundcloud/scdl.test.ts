import { test, describe, beforeEach } from "vitest"
import { CookieJar } from "@common/utils/cookie_util";
import { SoundCloudDL } from "@origin/soundcloud/scdl";
import { expect_no_error } from "@common/testing.test";
import 'dotenv/config';

let failed = false;
beforeEach(() => { if (failed) throw new Error("Prior test failed — bailing"); });
async function bail_no_error(value: unknown) {
	try { expect_no_error(value); } catch (e) { failed = true; throw e; }
}

const soundcloud_cookie_jar = CookieJar.fromString(process.env.SOUNDCLOUD_COOKIE_JAR);
const permalink = "https://soundcloud.com/illusi/zayboy-loveish";

SoundCloudDL.enable_cache(false);

describe("SoundCloud DL", () => {
	test("get_download_info_from_permalink with cookies", async () => bail_no_error(await SoundCloudDL.get_download_info_from_permalink(permalink, soundcloud_cookie_jar)));
	test("get_download_info_from_permalink without cookies", async () => bail_no_error(await SoundCloudDL.get_download_info_from_permalink(permalink)));
});
