import { db_exec } from "@illusive/db/database";
import { track_plays_table } from "@illusive/db/schema";
import type { Track } from "@illusive/types";
import { eq } from "drizzle-orm";

export namespace SQLTrackPlays {
    export async function insert_track_play(track_uid: Track['uid']){
        await db_exec(async(db) => await db.insert(track_plays_table).values({track_uid}));
    }
    export async function count_track_plays(track_uid: Track['uid'], date_range: {
        date_start?: Date,
        date_end?: Date,
    }){
        const timestamps_objs = await db_exec(async(db) => await db.select({Timestamp: track_plays_table.Timestamp})
            .from(track_plays_table)
            .where(eq(track_plays_table.track_uid, track_uid))
        );
        if(date_range.date_start === undefined && date_range.date_end === undefined) return timestamps_objs.length;
        const timestamps = timestamps_objs.map(item => item.Timestamp);
        let count = 0;
        for(const timestamp of timestamps) {
            const satisfies_date_start = date_range.date_start === undefined ? true 
                : date_range.date_start.getTime() < timestamp;
            const satisfies_date_end = date_range.date_end === undefined ? true 
                : date_range.date_end.getTime() < timestamp;
            if(satisfies_date_start && satisfies_date_end){
                count++;
            }
        }
        return count;
    }
}