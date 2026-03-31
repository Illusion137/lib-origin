import { db } from "@illusive/db/database";
import { track_plays_table } from "@illusive/db/schema";
import type { Track } from "@illusive/types";
import { and, eq } from "drizzle-orm";
import { ChangeTracker } from "@illusive/db/sync/change_tracker";
import { gen_uuid } from "@common/utils/util";

export namespace SQLTrackPlays {
    export async function insert_track_play(track_uid: Track['uid']){
        const data = {track_uid};
        await db.insert(track_plays_table).values(data);
        await ChangeTracker.log_change('track_plays', 'insert', gen_uuid(), data);
    }
    export async function count_track_plays(track_uid: Track['uid'], date_range: {
        date_start?: Date,
        date_end?: Date,
    }){
        // TODO unfuck this
        const timestamps_objs = await db.select({created_at: track_plays_table.created_at})
            .from(track_plays_table)
            .where(and(eq(track_plays_table.deleted, false), eq(track_plays_table.track_uid, track_uid)));
        if(date_range.date_start === undefined && date_range.date_end === undefined) return timestamps_objs.length;
        const timestamps = timestamps_objs.map(item => item.created_at);
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