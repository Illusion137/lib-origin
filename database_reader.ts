import { SQLTrack, Track, TrackMetaData } from './Illusive/src/types';
import { ResponseError } from './origin/src/utils/types';
import stracks from './sample/illusi/illusi-db-1400.tracks.json';
const sql_tracks: SQLTrack[] = stracks as any as SQLTrack[];
// import { SQLTrack } from './Illusive/src/types';

export function sql_track_to_track(sql_track: SQLTrack): Track|ResponseError {
    try {
        const meta: TrackMetaData = JSON.parse(sql_track.meta!);
        return Object.assign(sql_track, {
            artists: JSON.parse(sql_track.artists),
            album: JSON.parse(sql_track.album!),
            prods: sql_track.prods?.trim(),
            tags: JSON.parse(sql_track.tags!),
            explicit: sql_track.explicit,
            unreleased: Boolean(sql_track.unreleased),
            meta: {
                plays: meta.plays,
                added_date: meta.added_date,
                last_played_date: meta.last_played_date
            },
            downloading: {}
        });
    } catch (error) {
        return {error: new Error((error as Error).message, {'cause': JSON.stringify(sql_track)})};
    }
}

async function main(){
    const tracks = sql_tracks.map(sql_track_to_track);
    const bad = tracks.filter(t => "error" in t);
    console.log(bad);
    // const db = new SQL.Database("/Users/illusion/dev/Illusi/lib-origin/sample/illusi/illusi-db-1400.sqlite3", (err) => console.error(err));
    // db.all<SQLTrack>("SELECT * from tracks", (err, rows) => {
        // console.error("[GET ERROR]: ", err);
        // console.log(rows.length);
    // });
} main().catch(e => console.log(e));