import type { ResponseError } from '@common/types';
import { catch_log, generror } from '@common/utils/error_util';
import { Illusi } from '@origin/illusi/illusi';
import { unavailable_service } from '@illusive/db/v2/track_codec';
import { is_empty } from '@common/utils/util';
import { Store } from '@illusive/db/store';
import { GLOBALS } from '@illusive/globals';
import { Illusive } from '@illusive/illusive';
import type { Track } from '@illusive/types';
import { RequestQueue } from '@illusive/db/sync/request_queue';
import { SQLGlobal } from './sql_global';
import { SQLTracks } from './sql_tracks';

export namespace SQLBackpack {
	export async function empty_backpack() {
		await Store.write(async repos => repos.backpack.empty());
	}
	export async function delete_from_backpack(track_uid: string) {
		await Store.write(async repos => repos.backpack.remove(track_uid));
	}
	export async function toss_from_backpack(replacement_track: Track) {
		if (Store.legacy()) {
			await Promise.all([
				SQLTracks.insert_track(replacement_track),
				delete_from_backpack(replacement_track.uid)
			]);
			return;
		}
		await delete_from_backpack(replacement_track.uid);
		await SQLTracks.update_track(replacement_track.uid, replacement_track);
		if (!GLOBALS.global_var.sql_tracks.some(track => track.uid === replacement_track.uid)) SQLGlobal.add_global_track_item(replacement_track);
	}

	export async function backpack_tracks() {
		const tracks: Track[] = SQLTracks.sql_tracks_to_tracks(await Store.get().backpack.list());
		for (const track of tracks) track.playback!.artwork = Illusive.illusi_dark_icon_index;
		return tracks;
	}
	export async function add_to_backpack(uid: string, error_callback?: (err: ResponseError) => void) {
		const legacy = Store.legacy();
		const track = GLOBALS.global_var.sql_tracks.find(t => t.uid === uid);
		const added = await Store.write(async repos => repos.backpack.add(uid));
		if (!added) {
			error_callback?.(generror('Track is not in the library', 'LOW', { uid }));
			return;
		}
		if (legacy || track === undefined || is_empty(track.media_uri)) SQLGlobal.delete_global_track_item(uid);
	}
	export async function report_unavailable(track: Track) {
		if (GLOBALS.global_var.sql_tracks.some(t => t.uid === track.uid)) {
			await add_to_backpack(track.uid);
			return;
		}
		const service = unavailable_service(track);
		if (!track.illusi_id || service === null || Illusi.get_session() === null) return;
		const result = await RequestQueue.send('backpack_report', track.illusi_id, service);
		if (result !== null && Illusi.is_error(result)) catch_log(result.error);
	}
}
