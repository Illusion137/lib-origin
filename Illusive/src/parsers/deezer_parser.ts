import { generate_new_uid } from "@common/utils/util";
import { create_uri } from "@illusive/illusive_utils";
import type { Track } from "@illusive/types";
import type { DeezerTrack } from "@origin/deezer/types";

export function deezer_parse_track(track: DeezerTrack): Track {
	const artists = (track.contributors?.length ? track.contributors : [track.artist]).map(a => ({
		name: a.name,
		uri: create_uri("deezer", String(a.id))
	}));
	return {
		uid: generate_new_uid(track.title),
		title: track.title,
		artists,
		duration: track.duration,
		deezer_id: String(track.id),
		artwork_url: track.album.cover_xl || track.album.cover_big || undefined,
		plays: track.rank,
		explicit: track.explicit_lyrics ? "EXPLICIT" : "NONE",
		album: { name: track.album.title, uri: create_uri("deezer", String(track.album.id)) }
	};
}
