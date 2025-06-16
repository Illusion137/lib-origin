import { is_empty } from "../../../../origin/src/utils/util";
import { Illusive } from "../../illusive";
import { Track } from "../../types";
import * as SQLfs from './sql/sql_fs';
import * as SQLTracks from './sql/sql_tracks';

export async function try_download_track_lyrics(track: Track){
    const lyrics_maybe = await Illusive.get_track_lryics(track);
    if(typeof lyrics_maybe === "object") {
        return "bad";
    }
    const lyrics_file = `${track.uid}.txt`;
    await SQLfs.create_file(SQLfs.lyrics_directory(lyrics_file), lyrics_maybe);
    await SQLTracks.update_track(track.uid, {
        ...track,
        lyrics_uri: lyrics_file
    });
    return "ok";
}
export async function download_track_lyrics(track: Track, lyrics: string){
    const lyrics_file = `${track.uid}.txt`;
    await SQLfs.create_file(SQLfs.lyrics_directory(`${track.uid}.txt`), lyrics);
    await SQLTracks.update_track(track.uid, {
        ...track,
        lyrics_uri: lyrics_file
    });
}
export async function undownload_track_lyrics(track: Track){
    await SQLfs.delete_item(SQLfs.lyrics_directory(`${track.uid}.txt`));
    await SQLTracks.update_track(track.uid, {
        ...track,
        lyrics_uri: ''
    });
}

export async function read_track_lyrics(track: Track){
    if(is_empty(track.lyrics_uri)) return undefined;
    return await SQLfs.read_file(SQLfs.lyrics_directory(track.lyrics_uri!));
}