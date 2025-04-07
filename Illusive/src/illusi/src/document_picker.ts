import { Audio } from 'expo-av';
import * as DocumentPicker from 'react-native-document-picker'
import { generate_new_uid } from '../../../../origin/src/utils/util';
import { Playlist, Promises, Track } from '../..//types';
import { extract_file_extension } from '../../illusive_utilts';
import * as SQLfs from './sql/sql_fs';
import * as SQLPlaylists from './sql/sql_playlists';
import * as SQLTracks from './sql/sql_tracks';
import * as GLOBALS from './globals';
import { alert_error } from './alert';
import ImagePicker from 'react-native-image-crop-picker';

function handle_document_picker_error(error: unknown) {
    if (DocumentPicker.isCancel(error)) {} else if (DocumentPicker.isInProgress(error)) {} else alert_error({error: error as Error});
}

export async function upload_sqlite_db() {
    try {
        return await DocumentPicker.pickSingle({copyTo: 'cachesDirectory'});
    } catch (error) {
        handle_document_picker_error(error);
        return {error: error as Error};
    }
}

export async function upload_playlist_thumbnail(playlist: Playlist, callback: (playlist: Playlist) => Promise<void>) {
    try {
        const img = await ImagePicker.openPicker({mediaType: 'photo', forceJpg: true});
        if(img.sourceURL === undefined) throw new Error("sourceURL is null");
        if(img.filename === undefined) throw new Error("filename is undefined");
        await SQLfs.copy_to_custom_thumbnail_directory(img.sourceURL, img.filename);
        playlist.thumbnail_uri = img.filename!;
        await SQLPlaylists.update_playlist(playlist.uuid, playlist);
        
        if(callback !== undefined) await callback(playlist);
        await ImagePicker.clean();
    } catch (error) { handle_document_picker_error(error); }
}

export async function upload_playlist_thumbnail_document(playlist: Playlist, callback: (playlist: Playlist) => Promise<void>) {
    try {
        const thumbnail_uri = await DocumentPicker.pickSingle({type: [DocumentPicker.types.images], copyTo: 'documentDirectory'});
        if("copyError" in thumbnail_uri) throw new Error(thumbnail_uri.copyError);
        if(thumbnail_uri.fileCopyUri === null) throw new Error("thumbnail_uri.fileCopyUri is null");
        if(thumbnail_uri.name === null) throw new Error("thumbnail_uri.name is null");
        await SQLfs.move_to_thumbnail_directory(thumbnail_uri.fileCopyUri, thumbnail_uri.name);
        
        playlist.thumbnail_uri = thumbnail_uri.name!;
        await SQLPlaylists.update_playlist(playlist.uuid, playlist);
        
        await SQLfs.delete_folder_of_file(thumbnail_uri.fileCopyUri);
        if(callback !== undefined) await callback(playlist);
    } catch (error) { 
        if((error as Error)?.message.includes("cancelled")) return;
        alert_error({error: error as Error});
    }
}

export async function upload_track_thumbnail(track: Track, callback: (track: Track) => Promise<void>) {
    try {
        const img = await ImagePicker.openPicker({mediaType: 'photo', forceJpg: true});
        if(img.sourceURL === undefined) throw new Error("sourceURL is null");
        if(img.filename === undefined) throw new Error("filename is undefined");
        await SQLfs.copy_to_custom_thumbnail_directory(img.sourceURL, img.filename);
        track.thumbnail_uri = img.filename!
        await SQLTracks.update_track(track.uid, track);
        
        if(callback !== undefined) await callback(track);
        await ImagePicker.clean();
    } catch (error) { 
        if((error as Error)?.message.includes("cancelled")) return;
        alert_error({error: error as Error});
    }
}

export async function upload_music_files(callback: () => Promise<void>) {
    try {
        const audio_files = await DocumentPicker.pickMultiple({type: [DocumentPicker.types.audio, DocumentPicker.types.video], copyTo: 'documentDirectory'});

        const all_added_tracks: Track[] = []
        const all_promise_tracks: Promises = [];
        const all_file_copy_tracks: string[] = [];

        for(const audio_file of audio_files) {
            try {
                if(audio_file.copyError !== undefined) throw new Error(audio_file.copyError);
                if(typeof(audio_file.name) !== "string") throw new Error("Audio-file name is undefined");
                if(typeof(audio_file.fileCopyUri) !== "string") throw new Error("Audio-file copy-uri is undefined");

                all_file_copy_tracks.push(audio_file.fileCopyUri);
                const file_name = audio_file.name.replace(/\..+/, ''); // FILE NAME WITHOUT EXTENSION
                const file_extension = extract_file_extension(audio_file.name);
                const uid = generate_new_uid(file_name);
                const new_file_uri = encodeURI(uid + file_extension);
                const new_file_uri_full_path = await SQLfs.move_to_media_directory(audio_file.fileCopyUri, new_file_uri);

                const sound_temp = new Audio.Sound();
                await sound_temp.loadAsync({uri: new_file_uri_full_path});
                const meta_data = await sound_temp.getStatusAsync();
                await sound_temp.unloadAsync();

                if(meta_data.isLoaded === false) throw new Error("Unable to load audio metadata");
                if(meta_data.durationMillis === undefined) throw new Error("Unable to access audio metadata duration");

                const track = {
                    uid: uid,
                    title: file_name,
                    artists: [{name: "Sudo", uri: null}],
                    duration: Math.round(meta_data.durationMillis/1000) ?? 0,
                    media_uri: new_file_uri,
                    imported_id: uid,
                };
                all_added_tracks.push(track)
                all_promise_tracks.push(
                    SQLTracks.insert_track(track)
                );
                all_promise_tracks.push(SQLfs.delete_folder_of_file(audio_file.fileCopyUri));
            } catch (error) { alert_error({error: error as Error}) ; }
        }
        
        GLOBALS.global_var.sql_tracks.push(...all_added_tracks);
        await Promise.all(all_promise_tracks);
        if(callback !== undefined) await callback();
    } catch (error) { handle_document_picker_error(error); }
}