import { reinterpret_cast } from "@common/cast";
import { TimedCacheValue, type ResponseError } from "@common/types";
import { Constants } from "@illusive/constants";
import { catch_ignore, catch_log, generror_catch } from "@common/utils/error_util";
import { error_undefined, extract_file_extension, is_empty } from "@common/utils/util";
import { tracks_table, type SQLTrack } from "@illusive/db/schema";
import { GLOBALS } from "@illusive/globals";
import { Illusive } from "@illusive/illusive";
import { all_track_ids, track_exists, track_primary_key } from "@illusive/illusive_utils";
import { force_json_parse, force_json_parse_array } from "@common/utils/parse_util";
import { sqlite } from "@native/sqlite/sqlite";
import { get_native_platform } from "@native/native_mode";
import { clean_album_title } from "@illusive/parsers/apple_music_parser";
import { Prefs } from "@illusive/prefs";
import type { ISOString, NamedUUID, OnErrorCallback, Promises, Track, TrackMetaData } from "@illusive/types";
import { and, eq } from 'drizzle-orm';
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { fs } from "@native/fs/fs";
import { SQLfs } from "./sql_fs";
import { SQLGlobal } from "./sql_global";
import { db } from "@illusive/db/database";
import { ChangeTracker } from "@illusive/db/sync/change_tracker";
import type { Lyrics } from "@illusive/lyrics";

export namespace SQLTracks {
    // TODO remove this and preprocess tracks 
    const bad_artist_names = [',', '&', 'and'];

    export async function fixup(track: Track, t: Track) {
        let update = false;
        if (JSON.stringify(track.album).length > JSON.stringify(t.album).length || clean_album_title(t.album?.name ?? "--NULLISH--") === track.album?.name) {
            t.album = track.album;
            update = true;
        }
        if (JSON.stringify(track.artists).length > JSON.stringify(t.artists).length) {
            t.artists = track.artists;
            update = true;
        }
        if (update) await update_track(t.uid, t);
    }
    const fixerupper_maps_cache = new TimedCacheValue<{ applemusic: Map<string, Track[]>, youtube: Map<string, Track[]> }>(Constants.cached_ids_duration_milliseconds);
    export async function check_fixerupper_track(track: Track) {
        if (!Prefs.get_pref('quick_fixer_upper')) return;
        const maps = fixerupper_maps_cache.update(() => {
            const applemusic = new Map<string, Track[]>();
            const youtube = new Map<string, Track[]>();
            for (const t of GLOBALS.global_var.sql_tracks) {
                if (!is_empty(t.applemusic_id)) applemusic.set(t.applemusic_id!, [...(applemusic.get(t.applemusic_id!) ?? []), t]);
                if (!is_empty(t.youtube_id)) youtube.set(t.youtube_id!, [...(youtube.get(t.youtube_id!) ?? []), t]);
            }
            return { applemusic, youtube };
        });
        const candidates = new Set<Track>();
        if (!is_empty(track.applemusic_id)) for (const t of maps.applemusic.get(track.applemusic_id!) ?? []) candidates.add(t);
        if (!is_empty(track.youtube_id)) for (const t of maps.youtube.get(track.youtube_id!) ?? []) candidates.add(t);
        const promises: Promises = [];
        for (const t of candidates) {
            if (track.uid === t.uid) continue;
            promises.push(fixup(track, t));
        }
        return await Promise.all(promises);
    }

    const globals_track_key_map_cache = new TimedCacheValue<Map<string, Track>>(Constants.cached_ids_duration_milliseconds);
    const globals_track_map_keys: (keyof Track)[] = ["youtube_id", "soundcloud_id", "spotify_id", "applemusic_id", "youtubemusic_id", "amazonmusic_id", "imported_id", "illusi_id"];
    function track_key_map_key(key: keyof Track, value: Track[keyof Track]): string | undefined {
        if (typeof value !== "string" && typeof value !== "number") return undefined;
        return `${key}:${value}`;
    }
    function find_track_in_globals_with_key(track: Track, primary_key: keyof Track) {
        if (is_empty(track[primary_key])) return undefined;
        const lookup_key = track_key_map_key(primary_key, track[primary_key]);
        if (lookup_key === undefined) return undefined;
        const key_map = globals_track_key_map_cache.update(() => {
            const map = new Map<string, Track>();
            for (const t of GLOBALS.global_var.sql_tracks) {
                for (const key of globals_track_map_keys) {
                    if (is_empty(t[key])) continue;
                    const map_key = track_key_map_key(key, t[key]);
                    if (map_key !== undefined && !map.has(map_key)) map.set(map_key, t);
                }
            }
            return map;
        });
        return key_map.get(lookup_key);
    }

    export function add_playback_saved_data_to_track(track: Track): Track {
        const saved = track_exists(track, GLOBALS.global_var.sql_tracks);
        let new_track: Track = {
            ...track,
            playback: {
                artwork: Illusive.get_track_artwork(SQLfs.document_directory(""), track),
                added: false,
                successful: false
            },
            downloading_data: { saved: saved, progress: 0, playlist_saved: false }
        };
        if (saved && is_empty(track.media_uri) && is_empty(track.lyrics_uri) && is_empty(track.synced_lyrics_uri) && is_empty(track.thumbnail_uri)) {
            const primary_key = track_primary_key(track);
            const found_track = find_track_in_globals_with_key(track, primary_key);
            new_track = {
                ...new_track,
                uid: found_track ? found_track.uid : new_track.uid,
                media_uri: found_track?.media_uri,
                thumbnail_uri: found_track?.thumbnail_uri,
                lyrics_uri: found_track?.lyrics_uri,
                synced_lyrics_uri: found_track?.synced_lyrics_uri,
                meta: found_track?.meta
            };
        }
        check_fixerupper_track(new_track).catch(catch_ignore);
        return new_track;
    }

    export function add_playback_saved_data_to_tracks(tracks: Track[]) {
        return tracks.map(add_playback_saved_data_to_track);
    }
    export function merge_track_with_new_track(track: Track, new_track: Track): Track {
        return {
            uid: track.uid,
            title: track.title,
            alt_title: new_track.title ?? new_track.alt_title,
            artists: track.artists,
            duration: new_track.duration,
            album: is_empty(track.album) ? new_track.album : track.album,
            explicit: track.explicit,
            unreleased: track.unreleased,
            plays: is_empty(track.plays) ? new_track.plays : track.plays,
            media_uri: is_empty(track.media_uri) ? new_track.media_uri : track.media_uri,
            thumbnail_uri: is_empty(track.thumbnail_uri) ? new_track.thumbnail_uri : track.thumbnail_uri,
            lyrics_uri: is_empty(track.lyrics_uri) ? new_track.lyrics_uri : track.lyrics_uri,
            synced_lyrics_uri: is_empty(track.synced_lyrics_uri) ? new_track.synced_lyrics_uri : track.synced_lyrics_uri,
            imported_id: is_empty(track.imported_id) ? new_track.imported_id : track.imported_id,
            illusi_id: is_empty(track.illusi_id) ? new_track.illusi_id : track.illusi_id,
            youtube_id: is_empty(track.youtube_id) ? new_track.youtube_id : track.youtube_id,
            youtubemusic_id: is_empty(track.youtubemusic_id) ? new_track.youtubemusic_id : track.youtubemusic_id,
            spotify_id: is_empty(track.spotify_id) ? new_track.spotify_id : track.spotify_id,
            amazonmusic_id: is_empty(track.amazonmusic_id) ? new_track.amazonmusic_id : track.amazonmusic_id,
            applemusic_id: is_empty(track.applemusic_id) ? new_track.applemusic_id : track.applemusic_id,
            soundcloud_id: is_empty(track.soundcloud_id) ? new_track.soundcloud_id : track.soundcloud_id,
            soundcloud_permalink: is_empty(track.soundcloud_permalink) ? new_track.soundcloud_permalink : track.soundcloud_permalink,
            bandlab_id: is_empty(track.bandlab_id) ? new_track.bandlab_id : track.bandlab_id,
            audiomack_id: is_empty(track.audiomack_id) ? new_track.audiomack_id : track.audiomack_id,
            deezer_id: is_empty(track.deezer_id) ? new_track.deezer_id : track.deezer_id,
            tidal_id: is_empty(track.tidal_id) ? new_track.tidal_id : track.tidal_id,
            pandora_id: is_empty(track.pandora_id) ? new_track.pandora_id : track.pandora_id,
            artwork_url: is_empty(track.artwork_url) ? new_track.artwork_url : track.artwork_url,
            meta: track.meta
        }
    }
    export function sql_track_to_track(sql_track: Track): Track | ResponseError {
        try {
            delete sql_track.id;
            return {
                ...sql_track,
                artists: (sql_track.artists ?? [])?.filter((artist: NamedUUID) => !bad_artist_names.includes(artist.name.trim())),
                meta: {
                    ...sql_track.meta,
                    plays: sql_track.meta?.plays ?? 0,
                    added_date: sql_track.meta?.added_date ?? reinterpret_cast<ISOString>(new Date(0).toISOString()),
                    last_played_date: sql_track.meta?.last_played_date ?? reinterpret_cast<ISOString>(new Date(0).toISOString())
                },
                playback: { artwork: Illusive.get_track_artwork(SQLfs.document_directory(""), sql_track as unknown as Track), added: false, successful: false },
                downloading_data: { playlist_saved: true, progress: 0, saved: true }
            }
        } catch (error) {
            return generror_catch(error, "Failed to Parse SQLTrack", "CRITICAL", { sql_track });
        }
    }
    export function sql_tracks_to_tracks(sql_tracks: Track[], on_error?: OnErrorCallback): Track[] {
        const mapped = sql_tracks.map(sql_track_to_track);
        mapped.filter(track => "error" in track).forEach(err => { on_error?.(err); });
        return mapped.filter(track => !("error" in track)) as Track[];
    }
    export async function fix_track_added_metadata() {
        for (const track of GLOBALS.global_var.sql_tracks) {
            if (is_empty(track.media_uri)) continue;
            const downloaded_date = await SQLfs.file_created_at(SQLfs.media_directory(track.media_uri!));
            await update_track_meta_data(track.uid, { ...track.meta!, added_date: downloaded_date.toISOString() as ISOString, downloaded_date: downloaded_date.toISOString() as ISOString });
        }
    }
    export async function mark_track_downloaded(track_uid: Track['uid'], media_uri: string) {
        await db.update(tracks_table).set({ media_uri }).where(eq(tracks_table.uid, track_uid));
        await ChangeTracker.log_change('tracks', 'update', track_uid, { media_uri });
        SQLGlobal.update_global_track_property(track_uid, 'media_uri', media_uri);
        const track = GLOBALS.global_var.sql_tracks.find(t => t.uid === track_uid);
        if (track === undefined) return;
        await update_track_meta_data(track_uid, { ...track.meta!, downloaded_date: new Date().toISOString() as ISOString });
    }
    export async function mark_all_tracks_undownloaded() {
        const downloaded_tracks = GLOBALS.global_var.sql_tracks.filter(track => !is_empty(track.media_uri));
        await Promise.all(downloaded_tracks.map(async (track) => SQLfs.delete_item(SQLfs.media_directory(track.media_uri!))));
        await db.update(tracks_table).set({ media_uri: "" });
        await ChangeTracker.log_changes('tracks', 'update', downloaded_tracks.map(track => track.uid));
        SQLGlobal.update_global_track_all_property('media_uri', '');
    }
    export async function mark_track_undownloaded(track_uid: Track['uid'], media_uri: string) {
        if (is_empty(media_uri)) return;
        const found = GLOBALS.global_var.sql_tracks.find(track => track.uid === track_uid);
        if (found && !is_empty(found.imported_id)) return;
        await db.update(tracks_table).set({ media_uri: "" }).where(eq(tracks_table.uid, track_uid));
        await ChangeTracker.log_change('tracks', 'update', track_uid, { media_uri: "" });
        await SQLfs.delete_item(SQLfs.media_directory(media_uri));
        SQLGlobal.update_global_track_property(track_uid, 'media_uri', '');
    }
    export async function clear_track_youtube(track_uid: Track['uid']) {
        await db.update(tracks_table).set({ youtube_id: "" }).where(eq(tracks_table.uid, track_uid));
        await ChangeTracker.log_change('tracks', 'update', track_uid, { youtube_id: "" });
        SQLGlobal.update_global_track_property(track_uid, 'youtube_id', '');
    }


    export function track_exist_in_other(tracks: Track[], track: Track) {
        const evil_set = new Set<string>(tracks.map(all_track_ids).flat());
        for (const id of all_track_ids(track)) {
            if (evil_set.has(id)) return true;
        }
        return false;
    }
    export async function track_from_service_id(ftrack: Track) {
        const potential_keys: (keyof Track)[] = ["youtube_id", "youtubemusic_id", "spotify_id", "amazonmusic_id", "applemusic_id", "soundcloud_id"];
        let track_id = "";
        let key: keyof typeof tracks_table = "youtube_id";
        for (const k of potential_keys) {
            if (!is_empty(ftrack[k])) {
                track_id = reinterpret_cast<string>(ftrack[k]);
                key = reinterpret_cast<keyof typeof tracks_table>(k);
                break;
            }
        }
        if (is_empty(key) || is_empty(track_id)) return undefined;
        const track = await db.select().from(tracks_table).where(and(eq(tracks_table.deleted, false), eq(tracks_table[reinterpret_cast<never>(key)], track_id))).get();
        if (!track) return undefined;
        return sql_track_to_track(track);
    }
    export async function track_from_uid(track_uid: Track['uid']) {
        const track = await db.select().from(tracks_table).where(and(eq(tracks_table.deleted, false), eq(tracks_table.uid, track_uid))).get();
        if (track === undefined) return undefined;
        return sql_track_to_track(track);
    }
    export async function track_uid_exists(track: Track) {
        const count = await db.$count(tracks_table, and(eq(tracks_table.deleted, false), eq(tracks_table.uid, track.uid)));
        return count !== 0;
    }
    interface RawTrackRow extends Omit<SQLTrack, 'artists' | 'tags' | 'album' | 'meta' | 'unreleased' | 'deleted'> {
        artists: string;
        tags: string;
        album: string;
        meta: string;
        unreleased: number;
        deleted: number;
    }
    function raw_sql_track_to_track(row: RawTrackRow, document_directory: string): Track | ResponseError {
        try {
            const meta = force_json_parse<TrackMetaData>(row.meta ?? "{}");
            const track = reinterpret_cast<Track>({
                ...row,
                artists: force_json_parse_array<NamedUUID[]>(row.artists ?? "[]").filter(artist => !bad_artist_names.includes(artist.name.trim())),
                tags: force_json_parse_array<string[]>(row.tags ?? "[]"),
                album: force_json_parse<NamedUUID>(row.album ?? "{}"),
                unreleased: row.unreleased !== 0,
                deleted: row.deleted !== 0,
                meta: {
                    ...meta,
                    plays: meta.plays ?? 0,
                    added_date: meta.added_date ?? reinterpret_cast<ISOString>(new Date(0).toISOString()),
                    last_played_date: meta.last_played_date ?? reinterpret_cast<ISOString>(new Date(0).toISOString())
                },
                downloading_data: { playlist_saved: true, progress: 0, saved: true }
            });
            delete track.id;
            track.playback = { artwork: Illusive.get_track_artwork(document_directory, track), added: false, successful: false };
            return track;
        } catch (error) {
            return generror_catch(error, "Failed to Parse RawSQLTrack", "CRITICAL", { uid: row.uid });
        }
    }
    export async function fetch_track_data() {
        const imported_filter = get_native_platform() === "NODE" ? " AND imported_id = ''" : "";
        const raw_rows = await sqlite().wrap_client(db.$client).execute_async(`SELECT * FROM tracks WHERE deleted = 0${imported_filter} ORDER BY json_extract(meta, '$.added_date') ASC, id ASC`);
        const document_directory = SQLfs.document_directory("");
        const tracks: Track[] = [];
        for (const row of raw_rows) {
            const track = raw_sql_track_to_track(reinterpret_cast<RawTrackRow>(row), document_directory);
            if (!("error" in track)) tracks.push(track);
        }
        GLOBALS.global_var.sql_tracks = tracks;
    }
    export async function get_tracks() {
        const tracks = await db.select().from(tracks_table).where(eq(tracks_table.deleted, false));
        return sql_tracks_to_tracks(tracks);
    }
    export async function clear_tracks() {
        const tracks_to_delete = await db.select({ uid: tracks_table.uid }).from(tracks_table);
        for (const track of tracks_to_delete) {
            await ChangeTracker.log_change('tracks', 'delete', track.uid, { uid: track.uid });
        }
        await db.delete(tracks_table);
        GLOBALS.global_var.sql_tracks = [];
    }
    export async function fetch_track_data_from_uid(track_uid: Track['uid']): Promise<Track | ResponseError | undefined> {
        const track = await db.select().from(tracks_table).where(and(eq(tracks_table.deleted, false), eq(tracks_table.uid, track_uid))).get();
        if (track === undefined) return undefined;
        return sql_track_to_track(track);
    }

    function build_new_track(track: Track): Track {
        const new_track_meta = {
            ...reinterpret_cast<TrackMetaData>(track.meta),
            added_date: reinterpret_cast<ISOString>(new Date().toISOString()),
            last_played_date: reinterpret_cast<ISOString>(new Date(0).toISOString()),
            plays: 0
        };
        return {
            ...track,
            duration: isNaN(track.duration) || track.duration <= 0 ? 0 : track.duration,
            plays: isNaN(track.plays as number) ? 0 : (track.plays ?? 0),
            meta: new_track_meta
        };
    }
    function run_new_track_side_effects(track: Track) {
        if (Prefs.get_pref('auto_cache_thumbnails')) download_thumbnail(track).catch(catch_log);
        if (Prefs.get_pref('auto_download') && is_empty(track.media_uri)) GLOBALS.global_var.download_track(track).catch(catch_log);
        if (Prefs.get_pref('auto_cache_lyrics') && is_empty(track.lyrics_uri) && is_empty(track.synced_lyrics_uri)) GLOBALS.global_var.download_track_lyrics(track).catch(catch_log);
    }
    export async function insert_all_tracks(tracks: Track[]) {
        const insert_chunk_size = 50;
        const new_tracks = tracks.filter(track => !track_exists(track, GLOBALS.global_var.sql_tracks)).map(build_new_track);
        if (new_tracks.length === 0) return;
        await db.transaction(async (tx) => {
            for (let i = 0; i < new_tracks.length; i += insert_chunk_size)
                await tx.insert(tracks_table).values(new_tracks.slice(i, i + insert_chunk_size));
        });
        await ChangeTracker.log_changes('tracks', 'insert', new_tracks.map(track => track.uid));
        const parsed_tracks: Track[] = [];
        for (const new_track of new_tracks) {
            const parsed_track = sql_track_to_track(new_track);
            if ("error" in parsed_track) continue;
            parsed_tracks.push(parsed_track);
            run_new_track_side_effects(new_track);
        }
        SQLGlobal.add_global_track_items(parsed_tracks);
    }

    export async function insert_track(track: Track, notify = true): Promise<boolean> {
        if (track_exists(track, GLOBALS.global_var.sql_tracks)) return false;
        const new_track = build_new_track(track);
        await db.insert(tracks_table).values(new_track);
        await ChangeTracker.log_change('tracks', 'insert', track.uid, new_track);

        const parsed_track = sql_track_to_track(new_track)
        if ("error" in parsed_track) return false;
        SQLGlobal.add_global_track_item(parsed_track, notify);
        run_new_track_side_effects(track);
        return true;
    }
    export async function update_track(track_uid: Track['uid'], new_track: Track) {
        const sanitized_track = {
            ...new_track,
            duration: isNaN(new_track.duration) || new_track.duration <= 0 ? 0 : new_track.duration,
            plays: isNaN(new_track.plays as number) ? 0 : (new_track.plays ?? 0),
            sync_error: null,
        };
        await db.update(tracks_table).set(sanitized_track).where(eq(tracks_table.uid, track_uid));
        await ChangeTracker.log_change('tracks', 'update', track_uid, new_track);
        SQLGlobal.update_global_track_item(track_uid, new_track);
    }
    export async function update_track_meta_data(track_uid: Track['uid'], new_meta: TrackMetaData) {
        await db.update(tracks_table).set({ meta: new_meta, sync_error: null }).where(eq(tracks_table.uid, track_uid));
        await ChangeTracker.log_change('tracks', 'update', track_uid, { meta: new_meta });
        SQLGlobal.update_global_track_property(track_uid, 'meta', new_meta);
    }

    export async function update_track_with_new_track_data(old_track: Track, new_track: Track) {
        const merged_track = merge_track_with_new_track(old_track, new_track);
        await update_track(merged_track.uid, merged_track);
        return merged_track;
    }
    export async function delete_track(track_uid: Track['uid']) {
        await db.update(tracks_table).set({ deleted: true }).where(eq(tracks_table.uid, track_uid));
        await ChangeTracker.log_change('tracks', 'delete', track_uid, { uid: track_uid });
        SQLGlobal.delete_global_track_item(track_uid);
    }
    export async function undelete_track(track_uid: Track['uid']) {
        await db.update(tracks_table).set({ deleted: false }).where(eq(tracks_table.uid, track_uid));
        await ChangeTracker.log_change('tracks', 'update', track_uid, { uid: track_uid });
        const track = await db.select().from(tracks_table).where(eq(tracks_table.uid, track_uid)).get();
        if (track === undefined) return;
        const itrack = sql_track_to_track(track);
        if ("error" in itrack) return;
        SQLGlobal.add_global_track_item(itrack);
    }

    export async function download_thumbnail(track: Track) {
        const best_artwork = await Illusive.get_best_track_artwork(SQLfs.document_directory(""), track);
        if (!(typeof best_artwork === "string" && is_empty(track.thumbnail_uri))) return;
        const ext = extract_file_extension(best_artwork, "photo");
        const thumbnail_uri = track.uid + ext;
        const thumbnail_download = await SQLfs.download_to_file(best_artwork, SQLfs.thumbnail_directory(thumbnail_uri));
        if (error_undefined(thumbnail_download) === undefined) return;
        if (!is_empty(track.youtube_id) && is_empty(track.artwork_url)) {
            const full_path = SQLfs.thumbnail_directory(thumbnail_uri);
            try {
                const imageRef = await ImageManipulator.manipulate(full_path).renderAsync();
                const { width, height } = imageRef;
                if (width !== height) {
                    const size = Math.min(width, height);
                    const cropped = await ImageManipulator.manipulate(full_path)
                        .crop({ originX: (width - size) / 2, originY: (height - size) / 2, width: size, height: size })
                        .renderAsync();
                    const result = await cropped.saveAsync({ compress: 1, format: SaveFormat.JPEG });
                    await SQLfs.delete_item(full_path);
                    await fs().move(result.uri, full_path, {});
                }
            } catch (e) {
                console.warn("Failed to crop thumbnail:", e);
            }
        }
        await db.update(tracks_table).set({ thumbnail_uri }).where(eq(tracks_table.uid, track.uid));
        SQLGlobal.update_global_track_property(track.uid, 'thumbnail_uri', thumbnail_uri);
        SQLGlobal.update_global_track_property(track.uid, 'playback', { ...track.playback!, artwork: Illusive.get_track_artwork(SQLfs.document_directory(""), track) });
        return track.uid + ext;
    }

    export async function clean_thumbnail_cache() {
        const files = await SQLfs.read_directory(SQLfs.thumbnail_directory(""));
        if ("error" in files) return;
        const promises: Promises = [];
        for (const file of files)
            promises.push(SQLfs.delete_item(SQLfs.thumbnail_directory(file)))

        await db.update(tracks_table).set({ thumbnail_uri: "" });
        await Promise.all(promises);
        SQLGlobal.update_global_track_all_property('thumbnail_uri', '');
    }

    export async function restore_thumbnail_cache(tracks?: Track[]) {
        const to_restore = tracks ?? GLOBALS.global_var.sql_tracks;
        for (const track of to_restore)
            if (is_empty(track.imported_id) && is_empty(track.thumbnail_uri))
                download_thumbnail(track).catch(catch_ignore);
    }

    export async function lyrics_exist(track: Track): Promise<{ exists: false } | { exists: true, path: string }> {
        if (is_empty(track.lyrics_uri)) return { exists: false };
        const or_path = "nonexist.txt";
        const info = await SQLfs.info(SQLfs.lyrics_directory(track.lyrics_uri ?? or_path));
        if (!info.exists || info.is_directory) return { exists: false };
        return { exists: true, path: track.lyrics_uri ?? or_path };
    }

    export async function save_track_lyrics(track: Track, lyrics: Lyrics.LyricsResult) {
        const lyrics_file = `${track.uid}.txt`;
        const synced_lyrics_file = `${track.uid}.sync.txt`;
        await SQLfs.create_file(SQLfs.lyrics_directory(lyrics_file), lyrics.plain);
        if (lyrics.synced !== undefined) {
            await SQLfs.create_file(SQLfs.synced_lyrics_directory(synced_lyrics_file), lyrics.synced);
        }
        const synced_lyrics_uri = lyrics.synced === undefined ? undefined : synced_lyrics_file;
        const new_track = {
            ...track,
            lyrics_uri: lyrics_file,
            synced_lyrics_uri: synced_lyrics_uri
        };
        await db.update(tracks_table).set(new_track).where(eq(tracks_table.uid, track.uid));
        await ChangeTracker.log_change('tracks', 'update', track.uid, { lyrics_uri: lyrics_file, synced_lyrics_uri: synced_lyrics_uri });
        SQLGlobal.update_global_track_item(track.uid, new_track);
        return lyrics_file;
    }
    export async function undownload_track_lyrics(track: Track) {
        await SQLfs.delete_item(SQLfs.lyrics_directory(`${track.uid}.txt`));
        await SQLfs.delete_item(SQLfs.synced_lyrics_directory(`${track.uid}.sync.txt`));
        const new_track = {
            ...track,
            lyrics_uri: '',
            synced_lyrics_uri: ''
        };
        await db.update(tracks_table).set(new_track).where(eq(tracks_table.uid, track.uid));
        await ChangeTracker.log_change('tracks', 'update', track.uid, { lyrics_uri: '', synced_lyrics_uri: '' });
        SQLGlobal.update_global_track_item(track.uid, new_track);
    }

    export async function read_track_lyrics(track: Track) {
        if (is_empty(track.lyrics_uri)) return undefined;
        return await SQLfs.read_file(SQLfs.lyrics_directory(track.lyrics_uri!));
    }
    export async function read_track_synced_lyrics(track: Track) {
        if (is_empty(track.synced_lyrics_uri)) return undefined;
        return await SQLfs.read_file(SQLfs.synced_lyrics_directory(track.synced_lyrics_uri!));
    }
}
