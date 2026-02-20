import { test, describe, beforeEach } from "vitest"
import { YouTubeDL } from "@origin/youtube_dl/index";
import { expect_error, expect_no_error } from "@common/testing.test";
import 'dotenv/config';

let failed = false;
beforeEach(() => { if (failed) throw new Error("Prior test failed — bailing"); });
async function bail_no_error(value: unknown) {
	try { expect_no_error(value); } catch (e) { failed = true; throw e; }
}
async function _bail_error(value: unknown) {
	try { expect_error(value); } catch (e) { failed = true; throw e; }
}

const video_url = "yMxOQSh6gGk";

describe("YouTube DL", () => {
	test("get_innertube_client", async () => bail_no_error(await YouTubeDL.get_innertube_client()));

	test("get_info", async () => bail_no_error(await YouTubeDL.get_info(video_url)));

	test("resolve_url", async () => bail_no_error(await YouTubeDL.resolve_url(video_url)));
});
