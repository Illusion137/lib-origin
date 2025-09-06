import { db_all, db_get, db_run } from "@illusive/db/database";
import { artists_table, type SQLArtist } from "@illusive/db/schema";
import { eq } from "drizzle-orm";

export namespace SQLArtists {
    export const artists_artwork_memo: Record<SQLArtist['uri'], SQLArtist['artwork_url']|undefined> = {};
    
    export async function get_all_sql_artists(): Promise<SQLArtist[]>{
        return await db_all<SQLArtist>(db => db.select().from(artists_table));
    }
    
    export async function get_sql_artist_artwork_url(uri: string): Promise<string|undefined> {
        const result = artists_artwork_memo[uri] ?? (await db_get<SQLArtist>(db => 
            db.select({artwork_url: artists_table.artwork_url})
            .from(artists_table)
            .where(eq(artists_table.uri, uri))
        ))?.artwork_url;
        artists_artwork_memo[uri] = result;
        return result;
    }
    
    export async function insert_all_into_sql_artists(sql_artists: SQLArtist[]){
        await db_run(db => db.insert(artists_table).values(sql_artists));
    }
    
    export async function clear_all_sql_artists(){
        await db_run(db => db.delete(artists_table));
    }
}