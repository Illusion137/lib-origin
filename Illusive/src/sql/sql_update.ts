import { extract_string_from_pattern, version_greater_equal_to } from "@common/utils/util";
import { SQLTracks } from "./sql_tracks";
import type { ISOString, Promises, Track } from "@illusive/types";
import { Constants } from "@illusive/constants";
import { create_uri } from "@illusive/illusive_utils";
import { is_empty } from '../../../common/utils/util';
import { GLOBALS } from "@illusive/globals";
import { generror_catch } from "@common/utils/error_util";
import { Prefs } from "@illusive/prefs";
import {
    db,
    load_legacy_1720_database
} from "@illusive/db/database";
import { DrizzleUtils } from "@common/utils/drizzle_utils";
import type { LT1720 } from "@illusive/legacy/1720/legacy_types";
import {
    artists_table,
    backpack_table,
    new_releases_table,
    playlists_table,
    playlists_tracks_table,
    tracks_table
} from "@illusive/db/schema";
import { LSQLParser } from "@illusive/legacy/1720/legacy_sql_parser";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { fs } from "@native/fs/fs";
import { ChangeTracker } from "@illusive/db/sync/change_tracker";
import { Illusive } from "@illusive/illusive";

export namespace SQLUpdate {
    type Version = `${number}.${number}.${number}`;
    async function update_to(version: Version, update_fn: () => Promise<boolean>) {
        const db_version = Prefs.get_pref('database_version');
        if (!version_greater_equal_to(db_version, version)) {
            let updated = false;
            try {
                updated = await update_fn();
            }
            catch (e) {
                GLOBALS.global_var.bottom_alert(`Failed to Update to ${version}`, "WARN", generror_catch(e, "", "CRITICAL", { db_version }));
                return;
            }
            if (updated) {
                await Prefs.save_pref('database_version', version);
                GLOBALS.global_var.bottom_alert(`Updated to ${version}`, "GOOD");
            }
        }
    }

    // TODO come back to this
    // async function fix_thumbnail(thumbnail_uri: string) {
    //     if (is_empty(thumbnail_uri)) return;
    //     const full_path = SQLfs.thumbnail_directory(thumbnail_uri);
    //     try {
    //         // eslint-disable-next-line @typescript-eslint/no-deprecated
    //         const { width, height } = await ImageManipulator.manipulateAsync(full_path, []);
    //         if (width > height) {
    //             // eslint-disable-next-line @typescript-eslint/no-deprecated
    //             await ImageManipulator.manipulateAsync(
    //                 full_path,
    //                 [{ crop: { originX: (width - height) / 2, originY: 0, width: height, height: height } }],
    //                 { compress: 1, format: ImageManipulator.SaveFormat.PNG }
    //             );
    //         }
    //     } catch (e) {
    //         console.error("Failed to fix thumbnail:", e);
    //     }
    // }

    export async function fix_to_new_update() {
        await update_to("17.2.0", async () => {
            let updated = false;
            const bad_imported_track = (track: Track): boolean => {
                const imported_or_yt = !is_empty(track.youtube_id) && !is_empty(track.imported_id);
                const imported_mismatch_uri = !is_empty(track.imported_id) && (track.artists[0].uri === null || !track.artists[0].uri?.includes("illusi"));
                return imported_or_yt || imported_mismatch_uri;
            }

            const tracks = await SQLTracks.get_tracks();
            if (tracks.some(bad_imported_track)) {
                const promises: Promises = [];
                for (const track of tracks) {
                    if (track.imported_id && bad_imported_track(track)) {
                        const new_track: Track = {
                            ...track,
                            youtube_id: "",
                            youtubemusic_id: "",
                            artists: [{ name: Constants.import_uri_id, uri: create_uri("illusi", Constants.import_uri_id) }]
                        }
                        promises.push(SQLTracks.update_track(track.uid, new_track));
                        updated = true;
                    }
                }
                await Promise.allSettled(promises);
            }
            return updated;
        });
        await update_to("18.1.0", async () => {
            let updated = true;

            let legacy_db;
            try {
                legacy_db = load_legacy_1720_database();
                if (legacy_db === undefined) return true;
            } catch (e) {
                console.error("Failed to load legacy database:", e);
                return true;
            }

            const $ = new DrizzleUtils<LT1720.SQLTables>(legacy_db);
            const tables = await $.get_all_async("select name from sqlite_master");
            if (tables.length === 0) return false;

            const legacy_tracks = LSQLParser.sql_tracks_to_tracks(await $.get_all_async<LT1720.SQLTrack>("SELECT * FROM tracks"));
            const legacy_playlists = (await $.get_all_async<LT1720.SQLPlaylist>("SELECT * FROM playlists")).map(LSQLParser.sql_playlist_to_playlist);
            const legacy_playlists_tracks = await $.get_all_async<LT1720.PlaylistsTracks>("SELECT * FROM playlists_tracks");
            const legacy_artists = await $.get_all_async<LT1720.SQLArtist>("SELECT * FROM artists");
            const legacy_backpack = LSQLParser.sql_tracks_to_tracks(await $.get_all_async<LT1720.SQLTrack>("SELECT * FROM backpack"));
            const legacy_new_releases = await Promise.all((await $.get_all_async<LT1720.SQLCompactPlaylist>("SELECT * FROM new_releases")).map(LSQLParser.sql_compact_playlist_to_compact_playlist));

            const should_redownload_artwork = (t: Track) => {
                if (!t.artwork_url) return false;
                if (!t.youtube_id) return false;
                if (t.spotify_id || t.amazonmusic_id || t.applemusic_id || t.soundcloud_id) return false;
                const [width_str, height_str] = [extract_string_from_pattern(t.artwork_url, /w(\d{2,})/g, "LOW"), extract_string_from_pattern(t.artwork_url, /h(\d{2,})/g, "LOW")];
                if (width_str === height_str) return false;
                return true;
            }

            for (const track of legacy_tracks) {
                if (track.meta) {
                    const added_date = track.meta.added_date ? new Date(track.meta.added_date).getTime() : 0;
                    const downloaded_date = track.meta.downloaded_date ? new Date(track.meta.downloaded_date).getTime() : 0;

                    if (added_date > 0 || downloaded_date > 0) {
                        const newest_date = new Date(Math.max(added_date, downloaded_date)).toISOString() as ISOString;
                        track.meta.added_date = newest_date;
                        track.meta.downloaded_date = newest_date;
                    }
                    else if (track.media_uri) {
                        const file_info = await fs().get_info(track.media_uri);
                        if (file_info.exists) {
                            const file_date = new Date(file_info.file_modified_ms).toISOString() as ISOString;
                            track.meta.added_date = file_date;
                            track.meta.downloaded_date = file_date;
                        }
                    }
                }
                if (should_redownload_artwork(track)) {
                    track.thumbnail_uri = "";
                    track.artwork_url = await Illusive.get_highest_quality_service_thumbnail_uri(track.artwork_url ?? "");
                }
                // TODO come back to this
                // if(track.thumbnail_uri) await fix_thumbnail(track.thumbnail_uri);
            }

            const fail_callback = (e: Error, tx: SQLiteTransaction<"async", unknown, any, any>) => {
                updated = false;
                console.error(e.message);
                tx.rollback();
            }
            await db.transaction(async (tx) => {
                // Do each on its own because of SQLITE_MAX_SQL_LENGTH.
                for (const track of legacy_tracks) {
                    const inserted_track = await tx.insert(tracks_table).values(track).returning().catch((e) => fail_callback(e, tx));
                    await ChangeTracker.log_change("tracks", "insert", inserted_track[0].uid, inserted_track[0]);
                }
                for (const playlist of legacy_playlists) {
                    const inserted_playlist = await tx.insert(playlists_table).values(playlist).returning().catch((e) => fail_callback(e, tx));
                    await ChangeTracker.log_change("playlists", "insert", inserted_playlist[0].uuid, inserted_playlist[0]);
                }
                for (const playlists_track of legacy_playlists_tracks) {
                    const inserted_playlists_track = await tx.insert(playlists_tracks_table).values(playlists_track).returning().catch((e) => fail_callback(e, tx));
                    await ChangeTracker.log_change("playlists_tracks", "insert", `${inserted_playlists_track[0].uuid}:${inserted_playlists_track[0].track_uid}`, inserted_playlists_track[0]);
                }
                for (const artist of legacy_artists) {
                    const inserted_artist = await tx.insert(artists_table).values(artist).returning().catch((e) => fail_callback(e, tx));
                    await ChangeTracker.log_change("artists", "insert", inserted_artist[0].uri, inserted_artist[0]);
                }
                for (const track of legacy_backpack) {
                    const inserted_backpack_track = await tx.insert(backpack_table).values(track).returning().catch((e) => fail_callback(e, tx));
                    await ChangeTracker.log_change("backpack", "insert", inserted_backpack_track[0].uid, inserted_backpack_track[0]);
                }
                for (const new_release of legacy_new_releases) {
                    const inserted_new_releases = await tx.insert(new_releases_table).values(new_release).returning().catch((e) => fail_callback(e, tx));
                    const nr_title = typeof inserted_new_releases[0].title === 'string' ? JSON.parse(inserted_new_releases[0].title) : inserted_new_releases[0].title;
                    await ChangeTracker.log_change("new_releases", "insert", nr_title?.uri ?? `nr_${inserted_new_releases[0].id}`, inserted_new_releases[0]);
                }
            });
            return updated;
        });
        await update_to("18.2.0", async () => {
            const seen_new_releases = new Set<string>();
            const new_releases = await db.select().from(new_releases_table);
            const unique_releases = new_releases.filter(release => {
                if (seen_new_releases.has(release.title?.uri ?? "")) {
                    return false;
                }
                seen_new_releases.add(release.title?.uri ?? "");
                return true;
            });
            await db.delete(new_releases_table);
            for (const release of unique_releases) {
                try {
                    await db.insert(new_releases_table).values(release);
                }
                catch (e) {
                    console.warn(e);
                }
            }
            return true;
        });
    }
}