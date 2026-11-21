import { is_empty } from '@common/utils/util';
import { Store } from '@illusive/db/store';
import { GLOBALS } from '@illusive/globals';
import { Prefs } from '@illusive/prefs';
import type { Track } from '@illusive/types';
import { SQLTracks } from './sql_tracks';

export namespace SQLRecentlyPlayed {
	export async function insert_recently_played_track(track: Track) {
		await Store.write(async repos => repos.recently_played.insert(track));
	}
	export async function delete_recently_played_track(track: Track) {
		await Store.write(async repos => repos.recently_played.remove(track.uid));
	}
	export async function clear_recently_played_tracks() {
		await Store.write(async repos => repos.recently_played.clear());
	}
	export async function recently_played_tracks(limit?: number): Promise<Track[]> {
		const mapped_recently_played_tracks = SQLTracks.sql_tracks_to_tracks(await Store.get().recently_played.list(limit));
		const global_tracks_uuid_set = new Set<string>(GLOBALS.global_var.sql_tracks.map(({ uid }) => uid));
		const global_tracks_uuid_track_map = new Map<string, Track>(GLOBALS.global_var.sql_tracks.map(track => [track.uid, track]));
		for (let i = 0; i < mapped_recently_played_tracks.length; i++) {
			if (global_tracks_uuid_set.has(mapped_recently_played_tracks[i].uid))
				mapped_recently_played_tracks[i] = global_tracks_uuid_track_map.get(mapped_recently_played_tracks[i].uid)!;
			else if (!is_empty(mapped_recently_played_tracks[i].imported_id)) mapped_recently_played_tracks.splice(i, 1);
		}
		return mapped_recently_played_tracks;
	}
	export async function cleanup_recently_played() {
		await Store.write(async repos => repos.recently_played.trim(Prefs.get_pref('recently_played_max_size')));
	}
}
