import { generate_new_uid } from "@common/utils/util";
import { create_uri } from "@illusive/illusive_utils";
import type { Track } from "@illusive/types";
import type { Track as AudiomackTrack } from "@origin/audiomack/types";

export function audiomack_parse_track(track: AudiomackTrack): Track {
	return {
		uid: generate_new_uid(track.title),
		title: track.title,
		artists: [{ name: track.artist, uri: create_uri("audiomack", track.artist_slug) }],
		duration: track.duration,
		audiomack_id: String(track.id),
		artwork_url: track.image_large || track.image || undefined,
		plays: track.plays,
		explicit: track.explicit ? "EXPLICIT" : "NONE"
	};
}
