import { try_json_parse, is_empty, milliseconds_of } from '../../../../../common/utils/util';
import { Prefs } from "../../../prefs";
import type { CompactPlaylist, SQLCount, IllusiveThumbnail, NamedUUID, SQLCompactPlaylist, SQLTimestampedCompactPlaylist, TimestampedCompactPlaylist, Promises } from "../../../types";
import { ExampleObj } from "../example_objs";
import { db_exec_async, db_get_all_async, db_run_async, sql_delete_from, sql_insert_values, sql_select } from "./sql_utils";
import * as SQLTracks from './sql_tracks';
import { groupby } from '../../../illusive_utilts';
import { Constants } from '../../../constants';

export function compact_playlist_to_sqllite_insertion(compact_playlist: CompactPlaylist){
    if(compact_playlist.song_track) delete compact_playlist.song_track.playback;
    if(compact_playlist.song_track) delete compact_playlist.song_track.downloading_data;
    return [
        JSON.stringify(compact_playlist.title),
        JSON.stringify(compact_playlist.artist),
        compact_playlist.artwork_url ?? "",
        compact_playlist.artwork_thumbnails ? JSON.stringify(compact_playlist.artwork_thumbnails) : "[]",
        compact_playlist.explicit ?? "NONE",
        compact_playlist.album_type ?? "SINGLE",
        compact_playlist.type ?? "ALBUM",
        compact_playlist.date ?? new Date(0).toISOString(),
        compact_playlist.song_track ? JSON.stringify(compact_playlist.song_track) : null
    ];
}

export async function new_releases_count(): Promise<number>{
    return (await db_get_all_async<SQLCount>(sql_select<SQLCount>("new_releases", "COUNT(1)")))[0]['COUNT(1)'] ?? 0;
}

export async function sql_compact_playlist_to_compact_playlist(playlist: SQLCompactPlaylist): Promise<CompactPlaylist>{
    const title: NamedUUID = JSON.parse(playlist.title);
    const artist = try_json_parse<NamedUUID[]>(playlist.artist);
    const artwork_thumbnails = is_empty(playlist.artwork_thumbnails) ? undefined : try_json_parse<IllusiveThumbnail[]>(playlist.artwork_thumbnails!);
    // const song_track = is_empty(playlist.song_track) ? undefined : try_json_parse<Track>(playlist.song_track!);
    return {
        ...playlist,
        title: "error" in title ? {name: "UNKNOWN", uri: null} : title,
        artist: "error" in artist ? [] : artist,
        artwork_thumbnails: artwork_thumbnails === undefined || "error" in artwork_thumbnails ? undefined : artwork_thumbnails,
        song_track: is_empty(playlist.song_track) ? undefined : JSON.parse(playlist.song_track!)
        // song_track === undefined || song_track === null || "error" in song_track ? undefined : (await SQLTracks.add_playback_saved_data_to_track(song_track))
    }
}

export async function get_all_new_releases(){
    return await Promise.all((await db_get_all_async<SQLTimestampedCompactPlaylist>(sql_select<SQLTimestampedCompactPlaylist>("new_releases", "*"))).map(sql_compact_playlist_to_compact_playlist)) as TimestampedCompactPlaylist[];
}

function add_playback_saved_data_to_new_releases(releases: CompactPlaylist[]): CompactPlaylist[]{
    for(const release of releases){
        if(release.song_track !== undefined){
            release.song_track = SQLTracks.add_playback_saved_data_to_track(release.song_track);
        }
    }
    return releases;
}

export async function get_not_seen_new_releases(): Promise<CompactPlaylist[]>{
    const new_releases = await get_all_new_releases();
    if(new_releases.length === 0) return [];
    const sameday_refreshed_groups = groupby(new_releases, (t) => new Date(t.Timestamp).toDateString());
    const artist_uri_exclusion_set = new Set<string>();
    const sameday_refreshed_days_keys = Object.keys(sameday_refreshed_groups).reverse();
    if(sameday_refreshed_days_keys.length === 1) return add_playback_saved_data_to_new_releases(new_releases);

    const manually_last_refreshed_date = Prefs.get_pref('automatic_new_releases_last_refreshed');
    const most_recent_day_index_temp = sameday_refreshed_days_keys.findIndex(key => key === manually_last_refreshed_date.toDateString());
    const most_recent_day_index = most_recent_day_index_temp === -1 ? 0 : most_recent_day_index_temp;

    const not_seen_initial = sameday_refreshed_days_keys.slice(0, most_recent_day_index + 1).map(key => sameday_refreshed_groups[key]).flat();
    
    const most_recent_time = Prefs.get_pref('new_releases_last_refreshed');
    const filtered_recent_keys = sameday_refreshed_days_keys.slice(most_recent_day_index + 1).filter(key => most_recent_time.getTime() - new Date(key).getTime() <= milliseconds_of({days: Constants.new_releases_backdate_days}));

    const not_seen: CompactPlaylist[] = not_seen_initial;
    not_seen.forEach(release => { release.artist.forEach(artist => artist_uri_exclusion_set.add(artist.uri ?? "")); });

    for(const key of filtered_recent_keys){
        const release_day_group = sameday_refreshed_groups[key];
        for(const release of release_day_group){
            if(release.artist.some(artist => artist_uri_exclusion_set.has(artist.uri ?? ""))) 
                continue;
            not_seen.push(release);
        }
        release_day_group.forEach(release => { release.artist.forEach(artist => artist_uri_exclusion_set.add(artist.uri ?? "")); });
    }

    for(const not_seen_playlist of not_seen){
        if(not_seen_playlist.song_track!== undefined){
            not_seen_playlist.song_track= SQLTracks.add_playback_saved_data_to_track(not_seen_playlist.song_track);
        }
    }
    return add_playback_saved_data_to_new_releases(not_seen);
}

export async function delete_all_from_new_releases(){
    await db_exec_async(sql_delete_from("new_releases"));
}
export async function insert_all_into_new_releases(new_releases: CompactPlaylist[]){
    const promises: Promises = [];
    for(const new_release of new_releases){
        promises.push(db_run_async(sql_insert_values("new_releases", ExampleObj.new_releases_example0), compact_playlist_to_sqllite_insertion(new_release)));
    }
    await Promise.all(promises);
}

export async function refresh_new_releases(new_releases: CompactPlaylist[]){
    await Promise.all([
        insert_all_into_new_releases(new_releases),
        Prefs.save_pref('new_releases_last_refreshed', new Date())
    ]);
}