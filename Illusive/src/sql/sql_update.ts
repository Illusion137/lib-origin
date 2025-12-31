import { version_greater_than } from "@common/utils/util";
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
playlists_table,
playlists_tracks_table,
tracks_table } from "@illusive/db/schema";
import { LSQLParser } from "@illusive/legacy/1720/legacy_sql_parser";

export namespace SQLUpdate {
    export async function fix_to_new_update(version: string){
        if (!version_greater_than(version, "17.2.0")) {
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
                GLOBALS.global_var.bottom_alert("Failed to Update to 17.2.0", "WARN", generror_catch(e, "", {version}));
            }
            finally {
                if(updated) GLOBALS.global_var.bottom_alert("Updated to 17.2.0", "GOOD");
            }
        }
        if (!version_greater_than(version, "18.0.0") && !Prefs.get_pref('updated_to_1800')) {
            try {
                // TODO check if error on load legacy_db
                const legacy_db = load_legacy_1720_database();
                const $ = new DrizzleUtils<LT1720.SQLTables>(legacy_db);
                const legacy_tracks = LSQLParser.sql_tracks_to_tracks(await $.get_all_async<LT1720.SQLTrack>("SELECT * FROM tracks"));
                const legacy_playlists = (await $.get_all_async<LT1720.SQLPlaylist>("SELECT * FROM playlists")).map(LSQLParser.sql_playlist_to_playlist);
                const legacy_playlists_tracks = await $.get_all_async<LT1720.PlaylistsTracks>("SELECT * FROM playlists_tracks");
                const legacy_artists = await $.get_all_async<LT1720.SQLArtist>("SELECT * FROM artists");
                const legacy_backpack = LSQLParser.sql_tracks_to_tracks(await $.get_all_async<LT1720.SQLTrack>("SELECT * FROM backpack"));
                await db.transaction(async(tx) => {
                    await tx.insert(tracks_table).values(legacy_tracks);
                    await tx.insert(playlists_table).values(legacy_playlists);
                    await tx.insert(playlists_tracks_table).values(legacy_playlists_tracks);
                    await tx.insert(artists_table).values(legacy_artists);
                    await tx.insert(backpack_table).values(legacy_backpack);
                });
            }
            catch(e){
                GLOBALS.global_var.bottom_alert("Failed to Update to 18.0.0", "WARN", generror_catch(e, "", {version}));
            }
            finally {
                await Prefs.save_pref('updated_to_1800', true);
                GLOBALS.global_var.bottom_alert("Updated to 18.0.0", "GOOD");
            }
        }
    }
}