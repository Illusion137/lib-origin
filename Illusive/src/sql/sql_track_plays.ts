import { db } from "@illusive/db/database";
import { track_plays_table } from "@illusive/db/schema";
import type { Track } from "@illusive/types";
import { and, eq, gt, lt } from "drizzle-orm";
import { groupby } from "@common/utils/util";
import { DrizzleUtils } from "@common/utils/drizzle_utils";

export namespace SQLTrackPlays {
    interface DateRange {
        date_start?: Date;
        date_end?: Date;
    }
    interface DateRangeNum {
        date_start: number;
        date_end: number;
    }
    function date_range_num(date_range: DateRange): DateRangeNum {
        const date_start = date_range.date_start?.getTime() ?? 0;
        const date_end = date_range.date_end?.getTime() ?? FAR_DATE;
        return { date_start, date_end };
    }
    export async function insert_track_play(track_uid: Track['uid']) {
        const data = { track_uid };
        await db.insert(track_plays_table).values(data);
        // await ChangeTracker.log_change('track_plays', 'insert', gen_uuid(), data);
    }
    const FAR_DATE = 1e14;
    export async function count_all_track_plays(date_range: DateRange) {
        const { date_start, date_end } = date_range_num(date_range);
        const timestamps_objs = await db.select({ track_uid: track_plays_table.track_uid, created_at: track_plays_table.created_at })
            .from(track_plays_table)
            .where(
                and(
                    eq(track_plays_table.deleted, false),
                    gt(track_plays_table.created_at, date_start),
                    lt(track_plays_table.created_at, date_end)
                )
            );
        return groupby(timestamps_objs, (t) => t.track_uid);
    }
    export function count_all_track_plays_sync(date_range: DateRange) {
        const { date_start, date_end } = date_range_num(date_range);
        const dz = new DrizzleUtils(db.$client);
        const timestamps_objs = dz.get_all_sync_dz(db.select({ track_uid: track_plays_table.track_uid, created_at: track_plays_table.created_at })
            .from(track_plays_table)
            .where(
                and(
                    eq(track_plays_table.deleted, false),
                    gt(track_plays_table.created_at, date_start),
                    lt(track_plays_table.created_at, date_end)
                )
            ));
        return groupby(timestamps_objs, (t) => t.track_uid);
    }
    export function all_track_plays_sync(date_range: DateRange) {
        const { date_start, date_end } = date_range_num(date_range);
        const dz = new DrizzleUtils(db.$client);
        const timestamps_objs = dz.get_all_sync_dz(db.select({ track_uid: track_plays_table.track_uid, created_at: track_plays_table.created_at })
            .from(track_plays_table)
            .where(
                and(
                    eq(track_plays_table.deleted, false),
                    gt(track_plays_table.created_at, date_start),
                    lt(track_plays_table.created_at, date_end)
                )
            ));
        return timestamps_objs;
    }
    export async function count_track_plays(track_uid: Track['uid'], date_range: DateRange) {
        const { date_start, date_end } = date_range_num(date_range);
        const timestamps_objs = await db.select({ created_at: track_plays_table.created_at })
            .from(track_plays_table)
            .where(
                and(
                    eq(track_plays_table.deleted, false),
                    eq(track_plays_table.track_uid, track_uid),
                    gt(track_plays_table.created_at, date_start),
                    lt(track_plays_table.created_at, date_end)
                )
            );
        return timestamps_objs.length;
    }
    export function count_track_plays_sync(track_uid: Track['uid'], date_range: DateRange) {
        const { date_start, date_end } = date_range_num(date_range);
        const dz = new DrizzleUtils(db.$client);
        const timestamps_objs = dz.get_all_sync_dz(db.select({ created_at: track_plays_table.created_at })
            .from(track_plays_table)
            .where(
                and(
                    eq(track_plays_table.deleted, false),
                    eq(track_plays_table.track_uid, track_uid),
                    gt(track_plays_table.created_at, date_start),
                    lt(track_plays_table.created_at, date_end)
                )
            ));
        return timestamps_objs.length;
    }
    export function get_track_plays_dates_sync(track_uid: Track['uid'], date_range: DateRange) {
        const { date_start, date_end } = date_range_num(date_range);
        const dz = new DrizzleUtils(db.$client);
        const timestamps_objs = dz.get_all_sync_dz(db.select({ created_at: track_plays_table.created_at })
            .from(track_plays_table)
            .where(
                and(
                    eq(track_plays_table.deleted, false),
                    eq(track_plays_table.track_uid, track_uid),
                    gt(track_plays_table.created_at, date_start),
                    lt(track_plays_table.created_at, date_end)
                )
            ));
        return timestamps_objs;
    }
}