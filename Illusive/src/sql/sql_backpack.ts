import type { ResponseError } from "@common/types";
import { backpack_table } from "@illusive/db/schema";
import { GLOBALS } from "@illusive/globals";
import { track_exists } from "@illusive/illusive_utils";
import type { Track } from "@illusive/types";
import { eq } from "drizzle-orm";
import { SQLTracks } from "./sql_tracks";
import { db } from "@illusive/db/database";
import { Illusive } from "@illusive/illusive";
import { ChangeTracker } from "@illusive/db/sync/change_tracker";

export namespace SQLBackpack {
    export async function empty_backpack() {
        const tracks_to_delete = await db.select({ uid: backpack_table.uid }).from(backpack_table);
        for (const track of tracks_to_delete) {
            await ChangeTracker.log_change('backpack', 'delete', track.uid, { uid: track.uid });
        }
        await db.delete(backpack_table);
    }
    export async function delete_from_backpack(track_uid: string) {
        await db.delete(backpack_table).where(eq(backpack_table.uid, track_uid));
        await ChangeTracker.log_change('backpack', 'delete', track_uid, { uid: track_uid });
    }
    export async function toss_from_backpack(replacement_track: Track) {
        await Promise.all([
            SQLTracks.insert_track(replacement_track),
            delete_from_backpack(replacement_track.uid)
        ]);
    }
    
    export async function backpack_tracks() {
        const sql_tracks = await db.select().from(backpack_table);
        const tracks: Track[] = SQLTracks.sql_tracks_to_tracks(sql_tracks);
        for(const track of tracks) track.playback!.artwork = Illusive.illusi_dark_icon_index;
        return tracks;
    }
    export async function add_to_backpack(uid: string, error_callback?: (err: ResponseError) => void) {
        if(track_exists({uid, title:"", artists:[], duration:0}, GLOBALS.global_var.sql_tracks)) return;
        const track = await SQLTracks.track_from_uid(uid);
        if(track === undefined) return;
        if("error" in track) {
            error_callback?.(track);
            return;
        }
        await Promise.all([
            SQLTracks.delete_track(uid),
            db.insert(backpack_table).values(track)
        ]);
        await ChangeTracker.log_change('backpack', 'insert', uid, track);
    }
}
