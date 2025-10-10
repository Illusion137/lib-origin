import { is_empty } from "@common/utils/util";
import { db_exec } from "@illusive/db/database";
import { recently_played_tracks_table } from "@illusive/db/schema";
import { GLOBALS } from "@illusive/globals";
import { Prefs } from "@illusive/prefs";
import type { Track } from "@illusive/types";
import { desc, eq } from "drizzle-orm";
import { SQLTracks } from "./sql_tracks";

export namespace SQLRecentlyPlayed {
    export async function insert_recently_played_track(track: Track) {
        await db_exec(async(db) => await db.transaction(async(tx) => {
            await tx.delete(recently_played_tracks_table).where(eq(recently_played_tracks_table.uid, track.uid));
            await tx.insert(recently_played_tracks_table).values(track);
        }));
    }
    export async function delete_recently_played_track(track: Track) {
        await db_exec(async(db) => await db.delete(recently_played_tracks_table).where(eq(recently_played_tracks_table.uid, track.uid)));
    }
    export async function recently_played_tracks(limit?: number): Promise<Track[]> {
        // TODO dont hard code 1000;
        const recently_played_sql_tracks = await db_exec(db =>db.select().from(recently_played_tracks_table).limit(limit ?? 1000).orderBy(desc(recently_played_tracks_table.id)));
        const mapped_recently_played_tracks = SQLTracks.sql_tracks_to_tracks(recently_played_sql_tracks);
        const global_tracks_uuid_set = new Set<string>(GLOBALS.global_var.sql_tracks.map(({uid}) => uid));
        const global_tracks_uuid_track_map = new Map<string, Track>(GLOBALS.global_var.sql_tracks.map(track => [track.uid, track]));
        for(let i = 0; i < mapped_recently_played_tracks.length; i++) {
            if(global_tracks_uuid_set.has(mapped_recently_played_tracks[i].uid))
                mapped_recently_played_tracks[i] = global_tracks_uuid_track_map.get(mapped_recently_played_tracks[i].uid)!;
            else if(!is_empty(mapped_recently_played_tracks[i].imported_id)) mapped_recently_played_tracks.splice(i, 1);
        }
        return mapped_recently_played_tracks;
    }
    export async function cleanup_recently_played() {
        const recently_played_max_size = Prefs.get_pref('recently_played_max_size');
        const to_delete_recently_played_data = (await recently_played_tracks());
        if(to_delete_recently_played_data.length <= recently_played_max_size) return;
        const sliced_to_delete_recently_played_data = to_delete_recently_played_data.slice(recently_played_max_size);
        
        await Promise.all(
            sliced_to_delete_recently_played_data.map(async track => delete_recently_played_track(track))
        );
    }
}