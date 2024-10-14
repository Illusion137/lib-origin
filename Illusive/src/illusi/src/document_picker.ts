import * as SQLActions from './sql_actions'
import * as DocumentPicker from 'react-native-document-picker'
import * as FileSystem from 'expo-file-system'
import { Audio } from 'expo-av';
import { generate_new_uid } from '../../../../origin/src/utils/util';
import { Alert } from 'react-native';
import { extract_file_extension, path_to_directory } from '../../illusive_utilts';
import { Playlist, Track } from '../..//types';
import { Illusive } from '../../illusive';

function handle_document_picker_error(error: unknown) {
    if (DocumentPicker.isCancel(error)){} // User cancelled the picker, exit any dialogs or menus and move on
    else if (DocumentPicker.isInProgress(error)){}
    else throw error;
}

export async function upload_playlist_thumbnail(playlist: Playlist, callback: () => Promise<void>){
    try {
        const thumbnail_uri = await DocumentPicker.pickSingle({type: [DocumentPicker.types.images], copyTo: 'documentDirectory'});
        if("copyError" in thumbnail_uri) throw thumbnail_uri.copyError;
        
        await FileSystem.moveAsync({from: thumbnail_uri.fileCopyUri!, to: SQLActions.thumbnail_directory() + thumbnail_uri.name});
        
        playlist.thumbnail_uri = thumbnail_uri.name!;
        await SQLActions.update_playlist(playlist.uuid, playlist);
        
        const directory = path_to_directory(thumbnail_uri.fileCopyUri!);
        await FileSystem.deleteAsync(SQLActions.document_directory(directory), { idempotent: true });
    } catch (error) { handle_document_picker_error(error); }
}

export async function upload_track_thumbnail(track: Track, callback: () => Promise<void>){

}

export async function upload_music_files(callback: () => Promise<void>) {
    try {
        const audio_files = await DocumentPicker.pickMultiple({type: [DocumentPicker.types.audio, DocumentPicker.types.video], copyTo: 'documentDirectory'});

        const all_promise_tracks: Promise<void>[] = [];
        const all_file_copy_tracks: string[] = [];

        for(const audio_file of audio_files){
            try {
                if(audio_file.copyError !== undefined) throw audio_file.copyError;
                if(typeof(audio_file.name) !== "string") throw "Audio-file name is undefined";
                if(typeof(audio_file.fileCopyUri) !== "string") throw "Audio-file copy-uri is undefined";

                all_file_copy_tracks.push(audio_file.fileCopyUri);
                const file_name = audio_file.name.replace(/\..+/, ''); // FILE NAME WITHOUT EXTENSION
                const file_extension = extract_file_extension(audio_file.name);
                const uid = generate_new_uid(file_name);
                const new_file_uri = encodeURI(uid + file_extension);
                const new_file_uri_full_path = SQLActions.document_directory("") + Illusive.media_archive_path + new_file_uri;
                const directory = path_to_directory(audio_file.fileCopyUri);
                await FileSystem.moveAsync({from: audio_file.fileCopyUri, to: new_file_uri_full_path});

                const sound_temp = new Audio.Sound();
                await sound_temp.loadAsync({uri: new_file_uri_full_path});
                const meta_data = await sound_temp.getStatusAsync();
                await sound_temp.unloadAsync();

                if(meta_data.isLoaded === false) throw "Unable to load audio metadata";
                if(meta_data.durationMillis === undefined) throw "Unable to access audio metadata duration";

                all_promise_tracks.push(
                    SQLActions.insert_track({
                        "uid": uid,
                        "title": file_name,
                        "artists": [{"name": "Sudo", "uri": null}],
                        "duration": Math.round(meta_data.durationMillis/1000) ?? 0,
                        "media_uri": new_file_uri,
                        "imported_id": uid,
                    })
                );
                all_promise_tracks.push(FileSystem.deleteAsync(SQLActions.document_directory(directory), { idempotent: true }));
            } catch (error) { Alert.alert("Document Error", String(error)); }
        }
        
        await Promise.all(all_promise_tracks);
        await SQLActions.fetch_track_data();
        if(callback !== undefined) await callback();
    } catch (error) { handle_document_picker_error(error); }
}