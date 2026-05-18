import rozfetch from "@common/rozfetch";
import type { BaseOpts, PromiseResult } from "@common/types";
import { encode_params } from "@common/utils/fetch_util";
import { generror } from "@common/utils/error_util";
import { is_empty } from "@common/utils/util";
import { Audiomack } from "@origin/audiomack/audiomack";

export namespace AudiomackDL {
	const PLAY_BASE = "https://api.audiomack.com/v1/music/play";
	const dl_cache = { dls: [] as { track_id: string, url: string }[], enabled: true };

	export function enable_cache(enable: boolean) { dl_cache.enabled = enable; }
	export function dl_cache_full() { return dl_cache.enabled; }

	export async function get_stream_url(opts: BaseOpts & { track_id: string, section?: string }): PromiseResult<string> {
		let cached: typeof dl_cache.dls[0]|undefined;
		if (dl_cache_full() && !is_empty(cached = dl_cache.dls.find(d => d.track_id === opts.track_id))) return cached!.url;
		const play_url = `${PLAY_BASE}/${opts.track_id}`;
		const params: Record<string, string> = { environment: "desktop-web", hq: "true" };
		if (opts.section) params.section = opts.section;
		const signed = Audiomack.sign_params("GET", play_url, params);
		const response = await rozfetch<{ stream_url: string }>(`${play_url}?${encode_params(signed)}`, {
			method: "GET",
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
				"Accept": "application/json",
				"Origin": "https://audiomack.com",
				"Referer": "https://audiomack.com/"
			},
			...opts.fetch_opts
		});
		if ("error" in response) return response;
		const data = await response.json();
		if ("error" in data) return data;
		if (!data.stream_url) return generror("No stream_url in audiomack play response", "MEDIUM", { track_id: opts.track_id });
		if (dl_cache_full() && is_empty(dl_cache.dls.find(d => d.track_id === opts.track_id)))
			dl_cache.dls.push({ track_id: opts.track_id, url: data.stream_url });
		return data.stream_url;
	}

	export async function get_stream_url_from_permalink(permalink: string, opts?: BaseOpts) {
		const slug = Audiomack.url_to_slug(permalink);
		const parts = slug.split("/");
		if (parts.length < 3 || parts[1] !== "song")
			return generror("Invalid audiomack song permalink", "LOW", { permalink });
		const [artist_slug, , song_slug] = parts;
		const track = await Audiomack.get_song({ artist_slug, song_slug, ...opts });
		if ("error" in track) return track;
		return get_stream_url({ track_id: String(track.id), ...opts });
	}
}
