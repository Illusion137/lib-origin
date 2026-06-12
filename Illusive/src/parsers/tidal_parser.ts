import { generate_new_uid } from "@common/utils/util";
import { create_uri } from "@illusive/illusive_utils";
import type { Track } from "@illusive/types";
import type { TidalTrack } from "@origin/tidal/types";

export function tidal_cover_url(cover: string | null): string | undefined {
	if (!cover) return undefined;
	return `https://resources.tidal.com/images/${cover.replace(/-/g, "/")}/640x640.jpg`;
}

export function tidal_parse_track(track: TidalTrack): Track {
	return {
		uid: generate_new_uid(track.title),
		title: track.title,
		artists: track.artists.map(a => ({ name: a.name, uri: create_uri("tidal", String(a.id)) })),
		duration: track.duration,
		tidal_id: String(track.id),
		artwork_url: tidal_cover_url(track.album.cover),
		explicit: track.explicit ? "EXPLICIT" : "NONE",
		album: { name: track.album.title, uri: create_uri("tidal", String(track.album.id)) }
	};
}
