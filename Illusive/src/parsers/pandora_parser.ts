import { generate_new_uid } from "@common/utils/util";
import { create_uri } from "@illusive/illusive_utils";
import type { Track } from "@illusive/types";
import type { PandoraTrack } from "@origin/pandora/types";

export function pandora_parse_track(track: PandoraTrack): Track {
	return {
		uid: generate_new_uid(track.name),
		title: track.name,
		artists: [{ name: track.artistName, uri: create_uri("pandora", track.artistId) }],
		duration: track.duration,
		pandora_id: track.pandoraId,
		artwork_url: track.icon.artUrl || undefined,
		explicit: track.isExplicit ? "EXPLICIT" : "NONE",
		album: { name: track.albumName, uri: create_uri("pandora", track.albumId) }
	};
}
