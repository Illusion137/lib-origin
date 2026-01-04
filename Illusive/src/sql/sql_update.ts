import { version_greater_equal_to } from "@common/utils/util";
import { SQLTracks } from "./sql_tracks";
import type { Promises, Track } from "@illusive/types";
import { Constants } from "@illusive/constants";
import { create_uri } from "@illusive/illusive_utils";
import { is_empty } from '../../../common/utils/util';
import { GLOBALS } from "@illusive/globals";
import { generror_catch } from "@common/utils/error_util";
import { Prefs } from "@illusive/prefs";
import { db,
load_legacy_1720_database } from "@illusive/db/database";
import { DrizzleUtils } from "@common/utils/drizzle_utils";
import type { LT1720 } from "@illusive/legacy/1720/legacy_types";
import { artists_table,
backpack_table,
new_releases_table,
playlists_table,
playlists_tracks_table,
tracks_table } from "@illusive/db/schema";
import { LSQLParser } from "@illusive/legacy/1720/legacy_sql_parser";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";

export namespace SQLUpdate {
    export async function fix_to_new_update(){
        const db_version = Prefs.get_pref('database_version');
        if (!version_greater_equal_to(db_version, "17.2.0")) {
            let updated = false;
            try {
                const bad_imported_track = (track: Track): boolean => {
                    const imported_or_yt = !is_empty(track.youtube_id) && !is_empty(track.imported_id);
                    const imported_mismatch_uri = !is_empty(track.imported_id) && (track.artists[0].uri === null || !track.artists[0].uri?.includes("illusi"));
                    return imported_or_yt || imported_mismatch_uri;
                }

                const tracks = await SQLTracks.get_tracks();
                if(tracks.some(bad_imported_track)){
                    const promises: Promises = [];
                    for(const track of tracks){
                        if(track.imported_id && bad_imported_track(track)){
                            const new_track: Track = {
                                ...track,
                                youtube_id: "",
                                youtubemusic_id: "",
                                artists: [{name: Constants.import_uri_id, uri: create_uri("illusi", Constants.import_uri_id)}]
                            }
                            promises.push(SQLTracks.update_track(track.uid, new_track));
                            updated = true;
                        }
                    }
                    await Promise.allSettled(promises);
                }
            }
            catch(e) {
                GLOBALS.global_var.bottom_alert("Failed to Update to 17.2.0", "WARN", generror_catch(e, "", {db_version}));
                return;
            }
            if(updated) {
                await Prefs.save_pref('database_version', "17.2.0");
                GLOBALS.global_var.bottom_alert("Updated to 17.2.0", "GOOD");
            }
        }
        if (!version_greater_equal_to(db_version, "18.0.0")) {
            let updated = true;
            try {
                // TODO check if error on load legacy_db
                // TODO fix bad thumbnails
                const legacy_db = load_legacy_1720_database();
                const $ = new DrizzleUtils<LT1720.SQLTables>(legacy_db);
                const legacy_tracks = LSQLParser.sql_tracks_to_tracks(await $.get_all_async<LT1720.SQLTrack>("SELECT * FROM tracks"));
                const legacy_playlists = (await $.get_all_async<LT1720.SQLPlaylist>("SELECT * FROM playlists")).map(LSQLParser.sql_playlist_to_playlist);
                const legacy_playlists_tracks = await $.get_all_async<LT1720.PlaylistsTracks>("SELECT * FROM playlists_tracks");
                const legacy_artists = await $.get_all_async<LT1720.SQLArtist>("SELECT * FROM artists");
                const legacy_backpack = LSQLParser.sql_tracks_to_tracks(await $.get_all_async<LT1720.SQLTrack>("SELECT * FROM backpack"));
                const legacy_new_releases = await Promise.all((await $.get_all_async<LT1720.SQLCompactPlaylist>("SELECT * FROM new_releases")).map(LSQLParser.sql_compact_playlist_to_compact_playlist));
                const fail_callback = (e: Error, tx: SQLiteTransaction<"async", unknown, any, any>) => {
                    updated = false;
                    console.error(e.message);
                    tx.rollback();
                }
                await db.transaction(async(tx) => {
                    // Do each on its own because of SQLITE_MAX_SQL_LENGTH.
                    for(const track of legacy_tracks) await tx.insert(tracks_table).values(track).catch((e) => fail_callback(e, tx));
                    for(const playlist of legacy_playlists) await tx.insert(playlists_table).values(playlist).catch((e) => fail_callback(e, tx));
                    for(const playlists_track of legacy_playlists_tracks) await tx.insert(playlists_tracks_table).values(playlists_track).catch((e) => fail_callback(e, tx));
                    for(const artist of legacy_artists) await tx.insert(artists_table).values(artist).catch((e) => fail_callback(e, tx));
                    for(const track of legacy_backpack) await tx.insert(backpack_table).values(track).catch((e) => fail_callback(e, tx));
                    for(const new_release of legacy_new_releases) await tx.insert(new_releases_table).values(new_release).catch((e) => fail_callback(e, tx));
                });
            }
            catch(e){
                GLOBALS.global_var.bottom_alert("Failed to Update to 18.0.0", "WARN", generror_catch(e, "", {db_version}));
            }
            if(updated){
                await Prefs.save_pref('database_version', "18.0.0");
                GLOBALS.global_var.bottom_alert("Updated to 18.0.0", "GOOD");
            }
            else {
                GLOBALS.global_var.bottom_alert("Failed to Update to 18.0.0", "WARN");
            }
        }
    }
}