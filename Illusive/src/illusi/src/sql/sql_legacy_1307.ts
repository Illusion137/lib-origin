import type * as SQLite from '@op-engineering/op-sqlite';
import * as uuid from "react-native-uuid";
import { is_empty } from "@common/utils/util";
import { parse_youtube_title_artist } from '@illusive/parsers/youtube_parser';
import type { ISOString, Track } from "@illusive/types";
import type * as LegacyTypes1307 from '@illusive/illusi/src/legacy/1307/legacy_types';
import * as SQLfs from '@illusive/illusi/src/sql/sql_fs';
import { media_directory } from '@illusive/illusi/src/sql/sql_fs';
import { sql_select } from '@illusive/illusi/src/sql/sql_utils';

export async function legacy_1307_track_to_track(legacy_1307_track: LegacyTypes1307.Track): Promise<Track> {
    const media_info = is_empty(legacy_1307_track.media_uri) ? null : await SQLfs.info(media_directory(legacy_1307_track.media_uri));
    const zero_iso = new Date(0).toISOString() as ISOString;
    const download_date: ISOString = media_info !== null && media_info.exists && !media_info.is_directory ? new Date(media_info.file_modified_ms * 1000).toISOString() as ISOString : zero_iso;
    const parsed_track = parse_youtube_title_artist({uid: legacy_1307_track.uid, duration: 0, title: String(legacy_1307_track.video_name), artists: [{name: String(legacy_1307_track.video_creator), uri: null }]});
    const topiced = legacy_1307_track.video_creator.includes(" - Topic");
    return {
        ...parsed_track,
        uid: legacy_1307_track.uid,
        tags: [],
        duration: legacy_1307_track.video_duration,
        explicit: topiced ? "NONE" : parsed_track.explicit,
        unreleased: topiced ? false : parsed_track.unreleased,
        imported_id: legacy_1307_track.imported ? uuid.default.v4() : "",
        illusi_id: uuid.default.v4(),
        youtube_id: legacy_1307_track.video_id,
        youtubemusic_id: "",
        soundcloud_id: 0,
        soundcloud_permalink: "",
        spotify_id: "",
        amazonmusic_id: "",
        applemusic_id: "",
        artwork_url: "",
        thumbnail_uri: legacy_1307_track.thumbnail_uri,
        media_uri: legacy_1307_track.media_uri,
        lyrics_uri: "",
        meta: {
            plays: 0,
            downloaded_date: download_date,
            last_played_date: zero_iso,
            added_date: new Date(download_date).getTime() === 0 ? new Date().toISOString() as ISOString : download_date
        },
    }
}

export async function get_legacy_1307_track_data(database: SQLite.DB): Promise<LegacyTypes1307.Track[]> {
    return (await database.execute(sql_select("tracks", "*"))).rows as any;
}
export async function get_legacy_1307_playlists(database: SQLite.DB): Promise<LegacyTypes1307.Playlist[]> {
    return (await database.execute(sql_select("playlists", "*"))).rows as any;
}
export async function get_legacy_1307_playlist_tracks(database: SQLite.DB, playlist_name: string): Promise<LegacyTypes1307.Track[]> {
    return (await database.execute(`${sql_select("tracks", "*")} AS t JOIN ${playlist_name.replace(/\s/g, '_')} AS p ON p.track_uid = t.uid ORDER BY p.id`)).rows as any;
}