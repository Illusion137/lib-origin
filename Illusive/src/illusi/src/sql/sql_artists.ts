import type { Promises, SQLArtist } from "../../../types";
import { ExampleObj } from "../example_objs";
import { db_exec_async, db_get_all_async, db_get_all_sync, db_run_async, sql_delete_from, sql_insert_values, sql_select, sql_where } from "./sql_utils";

const artists_artwork_memo = {};

export async function get_all_sql_artists(){
    return (await db_get_all_async<SQLArtist>(sql_select<SQLArtist>("artists", "*")));
}

export function get_sql_artist_artwork_url_sync(uri: string): string|undefined {
    const artwork_url = db_get_all_sync<SQLArtist>(`${sql_select<SQLArtist>("artists", "artwork_url")} ${sql_where<SQLArtist>(["uri", uri])}`)?.[0].artwork_url;
    artists_artwork_memo[uri] = artwork_url;
    return artwork_url;
}

export async function insert_all_into_sql_artists(sql_artists: SQLArtist[]){
    const promises: Promises = [];
    for(const sql_artist of sql_artists){
        promises.push(db_run_async(sql_insert_values("artists", ExampleObj.artist_example0), [sql_artist.name, sql_artist.uri, sql_artist.artwork_url]));
    }
    await Promise.all(promises);
}

export async function clear_all_sql_artists(){
    await db_exec_async(sql_delete_from("artists"));
}