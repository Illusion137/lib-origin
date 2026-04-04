import { generate_new_uid } from '@common/utils/util';
import type { Playlist, Promises, Track } from '@illusive/types';
import { alert_error } from '@illusive/illusi/src/alert';
import { get_audio_duration } from '@native/get_audio_duration/get_audio_duration';
import { SQLPlaylists } from '@illusive/sql/sql_playlists';
import { SQLfs } from '@illusive/sql/sql_fs';
import { SQLTracks } from '@illusive/sql/sql_tracks';
import { Constants } from './constants';
import { create_uri } from './illusive_utils';
import { document_picker } from '@native/document_picker/document_picker';

export async function upload_sqlite_db() {
    return await document_picker().pick_file();
}

export async function upload_playlist_thumbnail(playlist: Playlist, callback: (playlist: Playlist) => Promise<void>) {
    try {
        const img = await document_picker().pick_image();
        if(img === null) return;
        if("error" in img) {
            alert_error(img);
            return;
        }
        const file_name = img.name + img.extension;
        await SQLfs.copy_to_custom_thumbnail_directory(img.uri, file_name);
        playlist.thumbnail_uri = file_name;
        await SQLPlaylists.update_playlist(playlist.uuid, playlist);
        if (callback !== undefined) await callback(playlist);
    } catch (error) {
        if ((error as Error)?.message.includes("cancelled")) return;
        alert_error({ error: error as Error });
    }
}

export async function upload_playlist_thumbnail_document(playlist: Playlist, callback: (playlist: Playlist) => Promise<void>) {
    try {
        const img = await document_picker().pick_image();
        if(img === null) return;
        if("error" in img) {
            alert_error(img);
            return;
        }
        const file_name = img.name + img.extension;
        await SQLfs.copy_to_custom_thumbnail_directory(img.uri, file_name);
        playlist.thumbnail_uri = file_name;
        await SQLPlaylists.update_playlist(playlist.uuid, playlist);
        if (callback !== undefined) await callback(playlist);
    } catch (error) {
        if ((error as Error)?.message.includes("cancelled")) return;
        alert_error({ error: error as Error });
    }
}

export async function upload_track_thumbnail(track: Track, callback: (track: Track) => Promise<void>) {
    try {
        const img = await document_picker().pick_image();
        if(img === null) return;
        if("error" in img) {
            alert_error(img);
            return;
        }
        const file_name = img.name + img.extension;
        await SQLfs.copy_to_custom_thumbnail_directory(img.uri, file_name);
        await SQLTracks.update_track(track.uid, { ...track, thumbnail_uri: file_name });

        if (callback !== undefined) await callback(track);
    } catch (error) {
        if ((error as Error)?.message.includes("cancelled")) return;
        alert_error({ error: error as Error });
    }
}

export async function upload_music_files() {
    try {
        const audio_files = await document_picker().pick_multiple_files(["public.audio", "public.movie"]);
        if ("error" in audio_files) {
            alert_error(audio_files);
            return;
        }

        const all_added_tracks: Track[] = []
        const all_promise_tracks: Promises = [];

        for (const audio_file of audio_files) {
            try {
                if ("error" in audio_file) throw audio_file.error;
                if (typeof (audio_file.name) !== "string") throw new Error("Audio-file name is undefined");

                const file_extension = audio_file.extension;
                const file_name = audio_file.name;
                const uid = generate_new_uid(file_name);
                const new_file_uri = encodeURI(uid + file_extension);
                const new_file_uri_full_path = await SQLfs.copy_to_media_directory(audio_file.uri, new_file_uri);
                const audio_duration_seconds = await get_audio_duration().get_audio_duration(new_file_uri_full_path);

                if (audio_duration_seconds === -1) throw new Error("Unable to access audio metadata duration");

                const track = {
                    uid: uid,
                    title: file_name,
                    artists: [{ name: Constants.import_uri_id, uri: create_uri("illusi", Constants.import_uri_id) }],
                    duration: audio_duration_seconds,
                    media_uri: new_file_uri,
                    imported_id: uid,
                };
                all_added_tracks.push(track)
                all_promise_tracks.push(
                    SQLTracks.insert_track(track)
                );
            } catch (error) { alert_error({ error: error as Error }); }
        }

        await Promise.all(all_promise_tracks);
    } catch (error) {
        if ("error" in (error as object)) return;
        alert_error({ error: error as Error });
    }
}
