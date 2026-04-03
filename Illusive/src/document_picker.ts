import * as DocumentPicker from 'react-native-document-picker'
import { extract_file_extension, generate_new_uid } from '@common/utils/util';
import type { Playlist, Promises, Track } from '@illusive/types';
import { alert_error } from '@illusive/illusi/src/alert';
import { get_audio_duration } from '@native/get_audio_duration/get_audio_duration';
import { SQLPlaylists } from '@illusive/sql/sql_playlists';
import { SQLfs } from '@illusive/sql/sql_fs';
import { SQLTracks } from '@illusive/sql/sql_tracks';
import { Constants } from './constants';
import { create_uri } from './illusive_utils';
import { ensure_photo_access } from './permissions';
import { document_picker } from '@native/document_picker/document_picker';

function handle_document_picker_error(error: unknown) {
    if (DocumentPicker.isCancel(error)) { } else if (DocumentPicker.isInProgress(error)) { } else alert_error({ error: error as Error });
}

export async function upload_sqlite_db() {
    try {
        return await DocumentPicker.pickSingle({ copyTo: 'cachesDirectory' });
    } catch (error) {
        handle_document_picker_error(error);
        return { error: error as Error };
    }
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
        const thumbnail_uri = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.images], copyTo: 'documentDirectory' });
        if ("copyError" in thumbnail_uri) throw new Error(thumbnail_uri.copyError);
        if (thumbnail_uri.fileCopyUri === null) throw new Error("thumbnail_uri.fileCopyUri is null");
        if (thumbnail_uri.name === null) throw new Error("thumbnail_uri.name is null");
        await SQLfs.move_to_thumbnail_directory(thumbnail_uri.fileCopyUri, thumbnail_uri.name);

        playlist.thumbnail_uri = thumbnail_uri.name!;
        await SQLPlaylists.update_playlist(playlist.uuid, playlist);

        await SQLfs.delete_folder_of_file(thumbnail_uri.fileCopyUri);
        if (callback !== undefined) await callback(playlist);
    } catch (error) {
        if ((error as Error)?.message.includes("cancelled")) return;
        alert_error({ error: error as Error });
    }
}

export async function upload_track_thumbnail(track: Track, callback: (track: Track) => Promise<void>) {
    try {
        await ensure_photo_access();
        // RN 0.84 + New Architecture: single-image openPicker() silently hangs (broken JSI promise path).
        // Workaround: multiple:true + maxFiles:1 uses a different (working) code path.
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
        const audio_files = await DocumentPicker.pickMultiple({ type: [DocumentPicker.types.audio, DocumentPicker.types.video], copyTo: 'documentDirectory' });

        const all_added_tracks: Track[] = []
        const all_promise_tracks: Promises = [];
        const all_file_copy_tracks: string[] = [];

        for (const audio_file of audio_files) {
            try {
                if (audio_file.copyError !== undefined) throw new Error(audio_file.copyError);
                if (typeof (audio_file.name) !== "string") throw new Error("Audio-file name is undefined");
                if (typeof (audio_file.fileCopyUri) !== "string") throw new Error("Audio-file copy-uri is undefined");

                all_file_copy_tracks.push(audio_file.fileCopyUri);
                const file_extension = extract_file_extension(audio_file.name, "video");
                const file_name = audio_file.name.replace(file_extension, ''); // FILE NAME WITHOUT EXTENSION
                const uid = generate_new_uid(file_name);
                const new_file_uri = encodeURI(uid + file_extension);
                const new_file_uri_full_path = await SQLfs.move_to_media_directory(audio_file.fileCopyUri, new_file_uri);

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
                all_promise_tracks.push(SQLfs.delete_folder_of_file(audio_file.fileCopyUri));
            } catch (error) { alert_error({ error: error as Error }); }
        }

        await Promise.all(all_promise_tracks);
    } catch (error) { handle_document_picker_error(error); }
}