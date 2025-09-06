import { reinterpret_cast } from "@common/cast";
import type { ResponseError } from "@common/types";
import { generror_catch } from "@common/utils/error_util";
import { wait } from "@common/utils/timed_util";
import { error_undefined, extract_file_extension, is_empty, random_of } from "@common/utils/util";
import { db_all, db_get } from "@illusive/db/database";
import { tracks_table } from "@illusive/db/schema";
import { GLOBALS } from "@illusive/globals";
import { Illusive } from "@illusive/illusive";
import { all_track_ids, generate_unique_track_tints, track_exists, track_primary_key } from "@illusive/illusive_utilts";
import { clean_album_title } from "@illusive/parsers/apple_music_parser";
import { Prefs } from "@illusive/prefs";
import type { ISOString, NamedUUID, OnErrorCallback, Promises, SQLTrack, Track, TrackMetaData } from "@illusive/types";
import { eq } from 'drizzle-orm';
import { SQLfs } from "./sql_fs";
import { SQLGlobal } from "./sql_global";

export namespace SQLTracks {
    const bad_artist_names = [',', '&', 'and'];
    
    export async function fixup(track: Track, t: Track){
        let update = false;
        if(JSON.stringify(track.album).length > JSON.stringify(t.album).length || clean_album_title(t.album?.name ?? "--NULLISH--") === track.album?.name){
            t.album = track.album;
            update = true;
        }
        if(JSON.stringify(track.artists).length > JSON.stringify(t.artists).length){
            t.artists = track.artists;
            update = true;
        }
        if(update) await update_track(t.uid, t);
    }
    export async function check_fixerupper_track(track: Track){
        if(!Prefs.get_pref('quick_fixer_upper')) return;
        const promises: Promises = [];
        for(const t of GLOBALS.global_var.sql_tracks){
            if(track.uid === t.uid) continue;
            if(!is_empty(track.applemusic_id) && !is_empty(t.applemusic_id) && track.applemusic_id === t.applemusic_id){
                promises.push(fixup(track, t));
            }
            if(!is_empty(track.youtube_id) && !is_empty(t.youtube_id) && track.youtube_id === t.youtube_id){
                promises.push(fixup(track, t));
            }
        }
        return await Promise.all(promises);
    }
    
    function find_track_in_globals_with_key(track: Track, primary_key: keyof Track){
        return GLOBALS.global_var.sql_tracks.find(t => !is_empty(t[primary_key]) && t[primary_key] === track[primary_key]);
    }
    
    export function add_playback_saved_data_to_track(track: Track){
        track.playback = {
            artwork: Illusive.get_track_artwork(SQLfs.document_directory(""), track),
            added: false,
            successful: false
        }
        const saved = track_exists(track, GLOBALS.global_var.sql_tracks);
        track.downloading_data = {saved: saved, progress: 0, playlist_saved: false};
        if(saved && is_empty(track.media_uri) && is_empty(track.lyrics_uri) && is_empty(track.thumbnail_uri)) {
            const primary_key = track_primary_key(track);
            const found_track = find_track_in_globals_with_key(track, primary_key);
            if(found_track) track.uid = found_track.uid;
            track.media_uri = found_track?.media_uri;
            track.thumbnail_uri = found_track?.thumbnail_uri;
            track.lyrics_uri = found_track?.lyrics_uri;
            track.meta = found_track?.meta;
        }
        check_fixerupper_track(track).catch(e => e);
        return track;
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
            imported_id: is_empty(track.imported_id) ? new_track.imported_id : track.imported_id,
            illusi_id: is_empty(track.illusi_id) ? new_track.illusi_id : track.illusi_id,
            youtube_id: is_empty(track.youtube_id) ? new_track.youtube_id : track.youtube_id,
            youtubemusic_id: is_empty(track.youtubemusic_id) ? new_track.youtubemusic_id : track.youtubemusic_id,
            spotify_id: is_empty(track.spotify_id) ? new_track.spotify_id : track.spotify_id,
            amazonmusic_id: is_empty(track.amazonmusic_id) ? new_track.amazonmusic_id : track.amazonmusic_id,
            applemusic_id: is_empty(track.applemusic_id) ? new_track.applemusic_id : track.applemusic_id,
            soundcloud_id: is_empty(track.soundcloud_id) ? new_track.soundcloud_id : track.soundcloud_id,
            soundcloud_permalink: is_empty(track.soundcloud_permalink) ? new_track.soundcloud_permalink : track.soundcloud_permalink,
            artwork_url: is_empty(track.artwork_url) ? new_track.artwork_url : track.artwork_url,
            meta: track.meta
        }
    }
    export function sql_track_to_track(maybe_sql_track: SQLTrack|Track): Track|ResponseError {
        try {
            if(typeof maybe_sql_track.artists !== "string") return reinterpret_cast<Track>(maybe_sql_track);
            const sql_track = reinterpret_cast<SQLTrack>(maybe_sql_track);
            const meta: TrackMetaData = JSON.parse(sql_track.meta!);
            return {
                ...sql_track,
                uid: sql_track.uid,
                artists: JSON.parse(sql_track.artists).filter((artist: NamedUUID) => !bad_artist_names.includes(artist.name.trim())),
                album: JSON.parse(sql_track.album!),
                prods: sql_track.prods?.trim(),
                tags: JSON.parse(sql_track.tags!),
                explicit: sql_track.explicit,
                unreleased: Boolean(sql_track.unreleased),
                meta: {
                    ...meta,
                    plays: meta.plays ?? 0,
                    added_date: meta.added_date ?? new Date(0).toISOString(),
                    last_played_date: meta.last_played_date ?? new Date(0).toISOString()
                },
                playback: {artwork: Illusive.get_track_artwork(SQLfs.document_directory(""), sql_track as unknown as Track), added: false, successful: false},
                downloading_data: {playlist_saved: true, progress: 0, saved: true}
            };
        } catch (error) {
            return generror_catch(error, "Failed to Parse SQLTrack", {maybe_sql_track});
        }
    }
    export function sql_tracks_to_tracks(sql_tracks: SQLTrack[]|Track[], on_error?: OnErrorCallback): Track[]{
        const mapped = sql_tracks.map(sql_track_to_track);
        mapped.filter(track => "error" in track).forEach(err => { on_error?.(err); });
        return mapped.filter(track => !("error" in track)) as Track[];
    }
    export async function fix_track_added_metadata(){
        for(const track of GLOBALS.global_var.sql_tracks){
            if(is_empty(track.media_uri)) continue;
            const downloaded_date = await SQLfs.file_created_at(SQLfs.media_directory(track.media_uri!));
            await update_track_meta_data(track.uid, {...track.meta!, added_date: downloaded_date.toISOString() as ISOString, downloaded_date: downloaded_date.toISOString() as ISOString});
        }
    }
    export async function mark_track_downloaded(track_uid: Track['uid'], media_uri: string) {
        await db_all(db => db.update(tracks_table).set({media_uri}).where(eq(tracks_table.uid, track_uid)));
        SQLGlobal.update_global_track_property(track_uid, 'media_uri', media_uri);
        const track = GLOBALS.global_var.sql_tracks.find(t => t.uid === track_uid);
        if(track === undefined) return;
        await update_track_meta_data(track_uid, {...track.meta!, downloaded_date: new Date().toISOString() as ISOString});
    }
    export async function mark_all_tracks_undownloaded() {
        await Promise.all(GLOBALS.global_var.sql_tracks.map(async (track) => {
            if(is_empty(track.media_uri)) return;
            await SQLfs.delete_item(SQLfs.media_directory(track.media_uri!));
            track.media_uri = "";
        }));
        await db_all(db => db.update(tracks_table).set({media_uri: ""}));
        SQLGlobal.update_global_track_all_property('media_uri', '');
    }
    export async function mark_track_undownloaded(track_uid: Track['uid'], media_uri: string) {
        if(is_empty(media_uri)) return;
        const found = GLOBALS.global_var.sql_tracks.find(track => track.uid === track_uid);
        if(found && !is_empty(found.imported_id)) return;
        await db_all(db => db.update(tracks_table).set({media_uri: ""}).where(eq(tracks_table.uid, track_uid)));
        await SQLfs.delete_item(SQLfs.media_directory(media_uri));
        SQLGlobal.update_global_track_property(track_uid, 'media_uri', '');
    }
    export async function clear_track_youtube(track_uid: Track['uid']) {
        await db_all(db => db.update(tracks_table).set({youtube_id: ""}).where(eq(tracks_table.uid, track_uid)));
        SQLGlobal.update_global_track_property(track_uid, 'youtube_id', '');
    }
    
    
    export function track_exist_in_other(tracks: Track[], track: Track){
        const evil_set = new Set<string>(tracks.map(all_track_ids).flat());
        for(const id of all_track_ids(track)){
            if(evil_set.has(id)) return true;
        }
        return false;
    }
    export async function track_from_service_id(ftrack: Track) {
        const potential_keys: (keyof Track)[] = ["youtube_id", "youtubemusic_id", "spotify_id", "amazonmusic_id", "applemusic_id", "soundcloud_id"];
        let track_id = "";
        let key: keyof Track = "youtube_id";
        for(const k of potential_keys) {
            if(!is_empty(ftrack[k])) {
                track_id = ftrack[k] as string;
                key = k;
                break;
            }
        }
        if(is_empty(key) || is_empty(track_id)) return undefined;
        const track = await db_all(db => db.select().from(tracks_table).where(eq(tracks_table[key], track_id)).get());
        if(!track) return undefined;
        return sql_track_to_track(track);
    }
    export async function track_from_uid(track_uid: Track['uid']) {
        const track = await db_get<SQLTrack>(db => db.select().from(tracks_table).where(eq(tracks_table.uid, track_uid)));
        if(track === undefined) return undefined;
        return sql_track_to_track(track);
    }
    export async function track_uid_exists(track: Track) {
        const count = await db_all(db => db.$count(tracks_table, eq(tracks_table.uid, track.uid)));
        return count !== 0;
    }
    let time_since_last_fetched_track_data = new Date(0);
    export async function fetch_track_data() {
        if(new Date().getTime() - time_since_last_fetched_track_data.getTime() < 5000) return;
        const tracks = await db_all(db => db.select().from(tracks_table));
        GLOBALS.global_var.sql_tracks = sql_tracks_to_tracks(tracks);
        time_since_last_fetched_track_data = new Date();
        if(Prefs.get_pref('album_track_tinting')){
            generate_unique_track_tints(GLOBALS.global_var.sql_tracks, GLOBALS.global_var.tint_table);
        }
    }
    export async function get_tracks(){
        const tracks = await db_all<SQLTrack>(db => db.select().from(tracks_table));
        return sql_tracks_to_tracks(tracks);
    }
    export async function clear_tracks() {
        await db_all(db => db.delete(tracks_table));
        GLOBALS.global_var.sql_tracks = [];
    }
    export async function fetch_track_data_from_uid(track_uid: Track['uid']): Promise<Track|ResponseError|undefined> {
        const track = await db_all(db => db.select().from(tracks_table).where(eq(tracks_table.uid, track_uid)).get());
        if(track === undefined) return undefined;
        return sql_track_to_track(track);
    }
    
    export async function insert_all_tracks(tracks: Track[]) {
        const promise_tracks: Promises = [];
        for(const track of tracks)
            promise_tracks.push(insert_track(track));
        await Promise.all(promise_tracks);
    }
    export async function insert_track(track: Track) {
        if( track_exists(track, GLOBALS.global_var.sql_tracks) ) return;
        await db_all(db => db.insert(tracks_table).values(track));
        GLOBALS.global_var.sql_tracks.push(track);
        if(Prefs.get_pref('auto_cache_thumbnails')) download_thumbnail(track).catch(e => e);
        if(Prefs.get_pref('auto_download') && is_empty(track.media_uri)) GLOBALS.global_var.download_track(track).catch(e => e);
        if(Prefs.get_pref('auto_cache_lyrics') && is_empty(track.lyrics_uri)) {
            await wait(random_of([500, 1000, 800, 2000, 2500, 1200]));
            await try_download_track_lyrics(track);
        }
    }
    export async function update_track(track_uid: Track['uid'], new_track: Track) {
        await db_all(db => db.update(tracks_table).set(new_track).where(eq(tracks_table.uid, track_uid)));
        SQLGlobal.update_global_track_item(track_uid, new_track);
    }
    export async function update_track_meta_data(track_uid: Track['uid'], new_meta: TrackMetaData) {
        await db_all(db => db.update(tracks_table).set({meta: new_meta}).where(eq(tracks_table.uid, track_uid)));
        SQLGlobal.update_global_track_property(track_uid, 'meta', new_meta);
    }
    
    export async function update_track_with_new_track_data(old_track: Track, new_track: Track) {
        const merged_track = merge_track_with_new_track(old_track, new_track);
        await update_track(merged_track.uid, merged_track);
        return merged_track;
    }
    export async function delete_track(track_uid: Track['uid']) {
        await db_all(db => db.delete(tracks_table).where(eq(tracks_table.uid, track_uid)));
        const idx = GLOBALS.global_var.sql_tracks.findIndex(track => track.uid === track_uid);
        GLOBALS.global_var.sql_tracks.splice(idx, 1);
    }

    export async function download_thumbnail(track: Track) {
        const best_artwork = await Illusive.get_best_track_artwork(SQLfs.document_directory(""), track);
        if(!(typeof best_artwork === "object" && is_empty(track.thumbnail_uri))) return;
        const ext = extract_file_extension(best_artwork.uri, "photo");
        const thumbnail_uri = track.uid + ext;
        const thumbnail_download = await SQLfs.download_to_file(best_artwork.uri, SQLfs.thumbnail_directory(thumbnail_uri));
        if(error_undefined(thumbnail_download) === undefined) return;
        await db_all(db => db.update(tracks_table).set({thumbnail_uri}).where(eq(tracks_table.uid, track.uid)));
        SQLGlobal.update_global_track_property(track.uid, 'thumbnail_uri', thumbnail_uri);
        SQLGlobal.update_global_track_property(track.uid, 'playback', {...track.playback!, artwork: Illusive.get_track_artwork(SQLfs.document_directory(""), track)});
        return track.uid + ext;
    }

    export async function clean_thumbnail_cache() {
        const files = await SQLfs.read_directory(SQLfs.thumbnail_directory(""));
        if("error" in files) return;
        const promises: Promises = [];
        for(const file of files)
            promises.push(SQLfs.delete_item(SQLfs.thumbnail_directory(file)))
        await db_all(db => db.update(tracks_table).set({thumbnail_uri: ""}));
        // await db_all_async(`${sql_update_table("tracks")} ${sql_set<Track>(["thumbnail_uri", ""])}`);
        await Promise.all(promises);
        SQLGlobal.update_global_track_all_property('thumbnail_uri', '');
    }

    export async function restore_thumbnail_cache(tracks?: Track[]) {
        const to_restore = tracks ?? GLOBALS.global_var.sql_tracks;
        for(const track of to_restore)
            if(is_empty(track.imported_id) && is_empty(track.thumbnail_uri))
                download_thumbnail(track).catch(e => e);
    }

    export async function save_track_lyrics(track: Track, lyrics: string){
        const lyrics_file = `${track.uid}.txt`;
        await SQLfs.create_file(SQLfs.lyrics_directory(lyrics_file), lyrics);
        const new_track = {
            ...track,
            lyrics_uri: lyrics_file
        };
        await db_all(db => db.update(tracks_table).set(new_track).where(eq(tracks_table.uid, track.uid)));
        SQLGlobal.update_global_track_item(track.uid, new_track);
    }
    export async function try_download_track_lyrics(track: Track){
        if(!is_empty(track.lyrics_uri)) return;
        const lyrics_maybe = await Illusive.get_track_lryics(track);
        if(typeof lyrics_maybe === "object") {
            return "bad";
        }
        await save_track_lyrics(track, lyrics_maybe);
        return "ok";
    }
    export async function undownload_track_lyrics(track: Track){
        await SQLfs.delete_item(SQLfs.lyrics_directory(`${track.uid}.txt`));
        const new_track = {
            ...track,
            lyrics_uri: ''
        };
        await db_all(db => db.update(tracks_table).set(new_track).where(eq(tracks_table.uid, track.uid)));
        SQLGlobal.update_global_track_item(track.uid, new_track);
    }

    export async function read_track_lyrics(track: Track){
        if(is_empty(track.lyrics_uri)) return undefined;
        return await SQLfs.read_file(SQLfs.lyrics_directory(track.lyrics_uri!));
    }

    export async function batch_download_track_lyrics(tracks: Track[]){
        for(const track of tracks){
            await try_download_track_lyrics(track);
            await wait(random_of([500, 1000, 800, 2000, 2500, 1200]));
        }
    }
}
