import { try_json_parse } from '@common/utils/parse_util';
import { groupby, is_empty, milliseconds_of } from '@common/utils/util';
import { Constants } from '@illusive/constants';
import { db } from '@illusive/db/database';
import { new_releases_table } from '@illusive/db/schema';
import { Prefs } from "@illusive/prefs";
import type { CompactPlaylist, IllusiveThumbnail, NamedUUID, Promises, SQLCompactPlaylist, TimestampedCompactPlaylist,Track } from "@illusive/types";
import { SQLTracks } from './sql_tracks';
import { reinterpret_cast } from '@common/cast';
import { GLOBALS } from '@illusive/globals';
import { desc, eq } from 'drizzle-orm';
import { ChangeTracker } from '@illusive/db/sync/change_tracker';
import { gen_uuid } from '@common/utils/util';

export namespace SQLNewReleases {
    export async function new_releases_count(): Promise<number>{
        return await db.$count(new_releases_table, eq(new_releases_table.deleted, false));
    }
    
    export async function sql_compact_playlist_to_compact_playlist(playlist: CompactPlaylist|SQLCompactPlaylist): Promise<CompactPlaylist>{
        if(typeof playlist.title === "object") return reinterpret_cast<CompactPlaylist>(playlist);
        const sql_playlist = reinterpret_cast<SQLCompactPlaylist>(playlist);
        const title = try_json_parse<NamedUUID>(sql_playlist.title);
        const artist = try_json_parse<NamedUUID[]>(sql_playlist.artist);
        const artwork_thumbnails = is_empty(sql_playlist.artwork_thumbnails) ? undefined : try_json_parse<IllusiveThumbnail[]>(sql_playlist.artwork_thumbnails!);
        const song_track = is_empty(sql_playlist.song_track) ? undefined : try_json_parse<Track>(sql_playlist.song_track!);
        return {
            ...sql_playlist,
            title: "error" in title ? {name: "UNKNOWN", uri: null} : title,
            artist: "error" in artist ? [] : artist,
            artwork_thumbnails: artwork_thumbnails === undefined || "error" in artwork_thumbnails ? undefined : artwork_thumbnails,
            song_track: song_track === undefined || song_track === null || "error" in song_track ? undefined : SQLTracks.add_playback_saved_data_to_track(song_track)
        }
    }
    
    export async function get_all_new_releases(){
        return await Promise.all(
            (await db.select().from(new_releases_table).where(eq(new_releases_table.deleted, false)).orderBy(desc(new_releases_table.created_at))).map(sql_compact_playlist_to_compact_playlist)
        ) as TimestampedCompactPlaylist[];
    }
    
    function add_playback_saved_data_to_new_releases(releases: CompactPlaylist[]): CompactPlaylist[]{
        for(const release of releases){
            if(release.song_track !== undefined && release.song_track !== null){
                release.song_track = SQLTracks.add_playback_saved_data_to_track(release.song_track);
            }
        }
        return releases;
    }
    
    export async function get_not_seen_new_releases(): Promise<CompactPlaylist[]>{
        let new_releases = await get_all_new_releases();
        if(new_releases.length === 0) return [];
        if(Prefs.get_pref('new_releases_hide_unknowns')){
            const known_artists = GLOBALS.global_var.sql_tracks
            .map(track => track.artists)
            .flat();

            const known_names = known_artists.map(artist => artist.name)
            .filter(uri => !is_empty(uri));
            const known_uris = known_artists.map(artist => artist.uri)
                .filter(uri => !is_empty(uri));

            const known_names_set = new Set(known_names);
            const known_uris_set = new Set(known_uris);
            new_releases = new_releases.filter(release => {
                const release_artists_uris = release.artist
                    .map(artist => artist.uri)
                    .filter(uri => !is_empty(uri));
                if(release_artists_uris.length === 0) return false;
                for(const uri of release_artists_uris){
                    if(known_uris_set.has(uri)) return true;
                }
                
                const release_artists_names = release.artist
                    .map(artist => reinterpret_cast<string>(artist.name))
                    .filter(name => !is_empty(name));
                if(release_artists_names.length === 0) return false;
                for(const name of release_artists_names){
                    if(known_names_set.has(name)) return true;
                }
                return false;
            });
        }
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
            if(not_seen_playlist.song_track !== undefined && not_seen_playlist.song_track !== null){
                not_seen_playlist.song_track = SQLTracks.add_playback_saved_data_to_track(not_seen_playlist.song_track);
            }
        }
        return add_playback_saved_data_to_new_releases(not_seen);
    }
    
    export async function delete_all_from_new_releases(){
        const releases_to_delete = await db.select().from(new_releases_table);
        for (const release of releases_to_delete) {
            const record_id = release.title?.uri ?? gen_uuid();
            await ChangeTracker.log_change('new_releases', 'delete', record_id, { id: release.id });
        }
        await db.delete(new_releases_table);
    }
    export async function insert_all_into_new_releases(new_releases: (CompactPlaylist & {id?: number})[]){
        const promises: Promises = [];
        for(const new_release of new_releases){
            const { id, ...release_data } = new_release; id;
            const promise = db.insert(new_releases_table).values(release_data).onConflictDoNothing();
            promises.push(promise);
            const record_id = new_release.title.uri ?? gen_uuid();
            await ChangeTracker.log_change('new_releases', 'insert', record_id, release_data);
        }
        await Promise.all(promises);
    }
    
    export async function refresh_new_releases(new_releases: CompactPlaylist[]){
        await Promise.all([
            insert_all_into_new_releases(new_releases),
            Prefs.save_pref('new_releases_last_refreshed', new Date())
        ]);
    }
}