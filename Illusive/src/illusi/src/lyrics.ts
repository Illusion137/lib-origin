import { wait } from "@common/utils/timed_utilt";
import { is_empty, random_of } from "@common/utils/util";
import { Illusive } from "@illusive/illusive";
import type { Track } from "@illusive/types";
import { ExampleObj } from "@illusive/illusi/src/example_objs";
import * as SQLfs from '@illusive/illusi/src/sql/sql_fs';
import { db_run_async, obj_to_update_sql, sql_update_table, sql_where, update_global_track_item } from "@illusive/illusi/src/sql/sql_utils";

export async function save_track_lyrics(track: Track, lyrics: string){
    const lyrics_file = `${track.uid}.txt`;
    await SQLfs.create_file(SQLfs.lyrics_directory(lyrics_file), lyrics);
    const new_track = {
        ...track,
        lyrics_uri: lyrics_file
    };
    await db_run_async(`${sql_update_table("tracks")} SET ${obj_to_update_sql(new_track, ExampleObj.track_example0)} ${sql_where<Track>(["uid", track.uid])}`);
    update_global_track_item(track.uid, new_track);
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
    await db_run_async(`${sql_update_table("tracks")} SET ${obj_to_update_sql(new_track, ExampleObj.track_example0)} ${sql_where<Track>(["uid", track.uid])}`);
    update_global_track_item(track.uid, new_track);
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