import { remove_topic } from "@common/utils/clean_util";
import { Constants } from "@illusive/constants";
import { artists_table, type SQLArtist,type SQLArtistInsert } from "@illusive/db/schema";
import { create_uri } from "@illusive/illusive_utils";
import type { ArtistSortMode, CompactArtist, NamedUUID, Track } from "@illusive/types";
import { and, eq } from "drizzle-orm";
import { db } from "@illusive/db/database";

export namespace SQLArtists {
    export const default_profile_picture_url = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
    export const artists_artwork_memo: Record<SQLArtist['uri'], SQLArtist['artwork_url']|number|undefined> = {};
    export const artists_memo: Record<SQLArtist['uri'], SQLArtist> = {};
    
    export async function get_all_sql_artists(): Promise<SQLArtist[]>{
        artists_artwork_memo[create_uri("illusi", Constants.import_uri_id)] = Constants.sudo_profile_picture_index;
        artists_artwork_memo[create_uri("illusi", Constants.local_illusi_uri_id)] = Constants.sumi_profile_picture_index;

        const artists: SQLArtist[] = await db.select().from(artists_table).where(eq(artists_table.deleted, false));
        for(const artist of artists){
            artists_artwork_memo[artist.uri] = artist.artwork_url;
            artists_memo[artist.uri] = artist;
        }
        return artists;
    }

    export async function get_sql_artist_artwork_uri(uri: string): Promise<string|number|undefined> {
        const result = artists_artwork_memo[uri] ??
            (await db.select({artwork_url: artists_table.artwork_url})
            .from(artists_table)
            .where(and(eq(artists_table.deleted, false), eq(artists_table.uri, uri)))
            .get())?.artwork_url;
        artists_artwork_memo[uri] = result;
        return result;
    }
    
    export async function insert_sql_artists(sql_artist: SQLArtistInsert){
        artists_artwork_memo[sql_artist.uri] = sql_artist.artwork_url;
        artists_memo[sql_artist.uri] = sql_artist as SQLArtist;
        await db.insert(artists_table).values(sql_artist);
        // await ChangeTracker.log_change('artists', 'insert', sql_artist.uri, sql_artist);
    }

    export async function insert_all_into_sql_artists(sql_artists: SQLArtistInsert[]){
        for(const sql_artist of sql_artists){
            artists_artwork_memo[sql_artist.uri] = sql_artist.artwork_url;
            artists_memo[sql_artist.uri] = sql_artist as SQLArtist;
            // await ChangeTracker.log_change('artists', 'insert', sql_artist.uri, sql_artist);
        }
        await db.insert(artists_table).values(sql_artists);
    }
    
    export async function clear_all_sql_artists(){
        // const artists_to_delete = await db.select({ uri: artists_table.uri }).from(artists_table);
        // for (const artist of artists_to_delete) {
            // await ChangeTracker.log_change('artists', 'delete', artist.uri, { uri: artist.uri });
        // }
        await db.delete(artists_table);
    }

    export function sort_compact_artists(mode: ArtistSortMode, artists: NamedUUID[], global_tracks: Track[]): CompactArtist[] {
        switch (mode) {
            case "NEWEST":
                return artists.slice().reverse().map(nammed_uuid_to_compact_artist);
            case "OLDEST":
                return artists.map(nammed_uuid_to_compact_artist);
            case "MOST_PLAYED":
                return sort_compact_artists_by_most_played(artists, global_tracks);
            case "LEAST_PLAYED":
                return sort_compact_artists_by_most_played(artists, global_tracks).reverse();
            default:
                return artists.map(nammed_uuid_to_compact_artist);
        }
    }

    export function sort_compact_artists_by_most_played(artists: NamedUUID[], global_tracks: Track[]): CompactArtist[] {
        const name_plays: [string, number][] = global_tracks.map((track) => [remove_topic(track.artists[0].name), track.meta?.plays ?? 0]);
        const name_plays_map = new Map<string, number>();
        for (const name_play of name_plays) {
            name_plays_map.set(name_play[0], (name_plays_map.get(name_play[0]) ?? 0) + name_play[1]);
        }
        return artists
            .slice()
            .sort((a, b) => (name_plays_map.get(remove_topic(b?.name ?? "")) ?? 0) - (name_plays_map.get(remove_topic(a?.name ?? "")) ?? 0))
            .map(nammed_uuid_to_compact_artist);
    }

    export function nammed_uuid_to_compact_artist(artist: NamedUUID): CompactArtist {
        return { name: artist, is_official_artist_channel: true, profile_artwork_url: artists_artwork_memo[artist.uri ?? ""] ?? default_profile_picture_url};
    }
}