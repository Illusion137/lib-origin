import { is_empty } from "../../../../../origin/src/utils/util";
import { all_promises } from "../../../illusive_utilts";
import { Prefs } from "../../../prefs";
import { SQLTrack, Track } from "../../../types";
import { ExampleObj } from "../example_objs";
import { sql_track_to_track, track_from_uid, track_to_sqllite_insertion, track_uid_exists } from "./sql_tracks";
import { db_exec_async, db_get_all_async, db_run_async, sql_delete_from, sql_insert_values, sql_select, sql_where } from "./sql_utils";

export async function insert_recently_played_track(track: Track) {
    await db_run_async(`${sql_delete_from("recently_played_tracks")} ${sql_where<Track>(["uid", track.uid])}`);
    await db_run_async(sql_insert_values("recently_played_tracks", ExampleObj.track_example0), track_to_sqllite_insertion(track));
}
export async function recently_played_tracks(limit?: number): Promise<Track[]> {
    const recently_played_sql_tracks: SQLTrack[] = await db_get_all_async<SQLTrack>(sql_select<Track>("recently_played_tracks", "*", limit, "DESC"));
    const recently_played_tracks = recently_played_sql_tracks.map(track => sql_track_to_track(track));
    for(let i = 0; i < recently_played_tracks.length; i++) {
        const exists = await track_uid_exists(recently_played_tracks[i]);
        if(exists)
            recently_played_tracks[i] = await track_from_uid(recently_played_tracks[i].uid);
        else if(!is_empty(recently_played_tracks[i].imported_id)) recently_played_tracks.splice(i, 1);
    }
    return recently_played_tracks;
}
export async function cleanup_recently_played() {
    const recently_played_max_size = Prefs.get_pref('recently_played_max_size');
    const recently_played_data = (await recently_played_tracks()).slice(0, recently_played_max_size);
    
    if(recently_played_data.length === recently_played_max_size) {
        await db_exec_async(sql_delete_from("recently_played_tracks"));
        await all_promises( recently_played_data.map(async(track) => 
            insert_recently_played_track(
                {
                    uid:track.uid,
                    title: track.title,
                    artists: track.artists,
                    duration: track.duration,
                    album: track.album,
                    explicit: track.explicit,
                    illusi_id: track.illusi_id,
                    imported_id: track.imported_id,
                    youtube_id: track.youtube_id,
                    youtubemusic_id: track.youtubemusic_id,
                    spotify_id: track.spotify_id,
                    amazonmusic_id: track.amazonmusic_id,
                    applemusic_id: track.applemusic_id,
                    soundcloud_id: track.soundcloud_id
                }
            )
        ) );
    }
}