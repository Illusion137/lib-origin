import { TimedCache } from "@common/types";
import { gen_uuid, is_empty } from "@common/utils/util";
import { db } from "@illusive/db/database";
import { playlists_table, playlists_tracks_table, tracks_table } from "@illusive/db/schema";
import { default_playlists } from "@illusive/default_playlists";
import { GLOBALS } from '@illusive/globals';
import { track_query_filter, tracks_exclude, tracks_include, tracks_intersection, tracks_mask } from "@illusive/illusive_utils";
import type { CompactPlaylistData, InheritedPlaylist, InheritedSearch, Playlist, PlaylistsTracks, Promises, SortType, SQLPlaylist, Track } from "@illusive/types";
import { and, eq } from 'drizzle-orm';
import { SQLTracks } from "./sql_tracks";
import { reinterpret_cast } from "@common/cast";
import { catch_ignore } from "@common/utils/error_util";
import { force_json_parse_array } from "@common/utils/parse_util";

export namespace SQLPlaylists {
    function date_time(date?: string): number{
        if(date) return new Date(date).getTime();
        return 0;
    }
    export function sort_playlist_tracks(sort_mode: SortType, tracks: Track[]): Track[] {
        switch(sort_mode) {
            case undefined:
            case "OLDEST":                  return tracks;
            case "NEWEST":                  return tracks.slice().reverse();
            case "ALPHABETICAL":            return tracks.sort((a, b) => a.title.localeCompare(b.title) );
            case "ALPHABETICAL_REVERSE":    return tracks.sort((a, b) => b.title.localeCompare(a.title) );
            case "DURATION_HILOW":          return tracks.sort((a, b) => b.duration - a.duration);
            case "DURATION_LOWHI":          return tracks.sort((a, b) => a.duration - b.duration);
            case "PLAYS_HILOW":             return tracks.sort((a, b) => (b.meta?.plays ?? 0) - (a.meta?.plays ?? 0));
            case "PLAYS_LOWHI":             return tracks.sort((a, b) => (a.meta?.plays ?? 0) - (b.meta?.plays ?? 0));
            case "VIEWS_HILOW":             return tracks.sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0));
            case "VIEWS_LOWHI":             return tracks.sort((a, b) => (a.plays ?? 0) - (b.plays ?? 0));
            case "ADDED_DATE_HILOW":        return tracks.sort((a, b) => date_time(b.meta?.added_date) - date_time(a.meta?.added_date)); 
            case "ADDED_DATE_LOWHI":        return tracks.sort((a, b) => date_time(a.meta?.added_date) - date_time(b.meta?.added_date));
            case "DOWNLOAD_DATE_HILOW":     return tracks.sort((a, b) => date_time(b.meta?.downloaded_date) - date_time(a.meta?.downloaded_date));
            case "DOWNLOAD_DATE_LOWHI":     return tracks.sort((a, b) => date_time(a.meta?.downloaded_date) - date_time(b.meta?.downloaded_date));
            case "LAST_PLAYED_DATE_HILOW":  return tracks.sort((a, b) => date_time(b.meta?.last_played_date) - date_time(a.meta?.last_played_date));
            case "LAST_PLAYED_DATE_LOWHI":  return tracks.sort((a, b) => date_time(a.meta?.last_played_date) - date_time(b.meta?.last_played_date));
            case "LAST_SAMPLED_DATE_HILOW": return tracks.sort((a, b) => date_time(b.meta?.last_sampled_date) - date_time(a.meta?.last_sampled_date));
            case "LAST_SAMPLED_DATE_LOWHI": return tracks.sort((a, b) => date_time(a.meta?.last_sampled_date) - date_time(b.meta?.last_sampled_date));
            case "LONGEST_PLAYED_HILOW":    return tracks.sort((a, b) => (b.duration * (b.meta?.plays ?? 0)) - (a.duration * (a.meta?.plays ?? 0)));
            case "LONGEST_PLAYED_LOWHI":    return tracks.sort((a, b) => (a.duration * (a.meta?.plays ?? 0)) - (b.duration * (b.meta?.plays ?? 0)));
            default: return tracks;
        }
    }

    export async function track_exists_in_playlist(playlist_track: PlaylistsTracks) {
        return await db
                .$count(playlists_tracks_table,
                    and(
                        eq(playlists_tracks_table.uuid, playlist_track.uuid),
                        eq(playlists_tracks_table.track_uid, playlist_track.track_uid)
                    )
            ) !== 0;
    }
    export async function playlists_count(){
        return await db.$count(playlists_table) ?? 0;
    }
    export async function add_saved_data_to_write_playlist_tracks(playlist_uuid: string, tracks: Track[]): Promise<void> {
        const promises: Promises = tracks.map(async(track) => {
            track.downloading_data = {saved: true, progress: 0, playlist_saved: await track_exists_in_playlist({uuid: playlist_uuid, track_uid: track.uid})}
        });
        await Promise.all(promises);
    }
    
    type IgnoreTracks = "IGNORE"|"PROMISE"|"NO_IGNORE";
    export function sql_playlist_to_playlist_no_visual_data(sql_playlist: SQLPlaylist|Playlist): Playlist{
        return {
            ...sql_playlist,
            inherited_playlists: typeof sql_playlist.inherited_playlists === "object" ? sql_playlist.inherited_playlists : force_json_parse_array(sql_playlist.inherited_playlists ?? "[]"),
            linked_playlists: typeof sql_playlist.linked_playlists === "object" ? sql_playlist.linked_playlists : force_json_parse_array(sql_playlist.linked_playlists ?? "[]"),
            inherited_searchs: typeof sql_playlist.inherited_searchs === "object" ? sql_playlist.inherited_searchs : force_json_parse_array(sql_playlist.inherited_searchs ?? "[]"),
            visual_data: undefined,
            date: new Date(sql_playlist.date!).toISOString()
        };
    }
    export async function raw_playlist_tracks(){
        return (await db
            .select()
            .from(playlists_tracks_table)
        );
    }
    export async function unique_playlist_uuids_from_playlist_tracks(){
        const unique_uuids = new Set<string>((await raw_playlist_tracks()).map(p => p.uuid));
        return [...unique_uuids.values()];
    }
    const playlist_tracks_cache = new TimedCache<string, Track[]>(5000);
    export async function playlist_tracks(playlist_uuid: string, playlist_no_visual_data?: Playlist, seen_playlist_uuids = new Set<string>(), skip_inheritance = false) {
        const default_playlist_names = default_playlists.map(playlist => playlist.name);
        if(default_playlist_names.includes(playlist_uuid)) return await default_playlists.find(playlist => playlist.name === playlist_uuid)!.track_function();
        if(!skip_inheritance && playlist_tracks_cache.get(playlist_uuid)) return playlist_tracks_cache.get(playlist_uuid)!;
        const playlist = await db
            .select()
            .from(tracks_table)
            .innerJoin(playlists_tracks_table, 
                and(
                    eq(playlists_tracks_table.track_uid, tracks_table.uid),
                    eq(playlists_tracks_table.uuid, playlist_uuid)
                )
            ).orderBy(playlists_tracks_table.id);
        
        let tracks: Track[] = playlist.map(p => reinterpret_cast<Track>(SQLTracks.sql_track_to_track(p.tracks))).filter(track => !("error" in track));
        if(skip_inheritance) return tracks;
        seen_playlist_uuids.add(playlist_uuid);
        const cplaylist_data = playlist_no_visual_data ? playlist_no_visual_data : await playlist_data(playlist_uuid, "IGNORE");
        if(cplaylist_data === undefined) {
            playlist_tracks_cache.add(playlist_uuid, tracks);
            return tracks;
        }
        for(const inherited_playlist of cplaylist_data.inherited_playlists!) {
            if(!seen_playlist_uuids.has(inherited_playlist.uuid)) {
                const inherited_tracks = await playlist_tracks(inherited_playlist.uuid, undefined, seen_playlist_uuids);
                switch (inherited_playlist.mode) {
                    case "INCLUDE"     : tracks = tracks_include(tracks, inherited_tracks); break;
                    case "EXCLUDE"     : tracks = tracks_exclude(tracks, inherited_tracks); break;
                    case "MASK"        : tracks = tracks_mask(tracks, inherited_tracks); break;
                    case "INTERSECTION": tracks = tracks_intersection(tracks, inherited_tracks); break;
                }
            }
        }
        for(const inherited_search of cplaylist_data.inherited_searchs!) {
            const inherited_tracks = track_query_filter(is_empty(GLOBALS.global_var.sql_tracks) ? await SQLTracks.get_tracks() : GLOBALS.global_var.sql_tracks, inherited_search.query);
            switch (inherited_search.mode) {
                case "INCLUDE"     : tracks = tracks_include(tracks, inherited_tracks); break;
                case "EXCLUDE"     : tracks = tracks_exclude(tracks, inherited_tracks); break;
                case "MASK"        : tracks = tracks_mask(tracks, inherited_tracks); break;
                case "INTERSECTION": tracks = tracks_intersection(tracks, inherited_tracks); break;
            }
        }
        const sorted_playlist_tracks = sort_playlist_tracks(cplaylist_data.sort!, tracks);
        playlist_tracks_cache.add(playlist_uuid, sorted_playlist_tracks);
        return sorted_playlist_tracks;
    }
    export async function sql_playlist_to_playlist(sql_playlist: SQLPlaylist|Playlist, ignore_tracks: IgnoreTracks = "NO_IGNORE", ignore_inheritance = true): Promise<Playlist> {
        const playlist_no_visual_data = sql_playlist_to_playlist_no_visual_data(sql_playlist);
        const tracks = ignore_tracks === "IGNORE" ? 
            [] : 
                ignore_tracks === "PROMISE" ? 
                    playlist_tracks(sql_playlist.uuid, playlist_no_visual_data, new Set<string>(), ignore_inheritance) 
                    : await playlist_tracks(sql_playlist.uuid, playlist_no_visual_data, new Set<string>(), ignore_inheritance);
        return {
            ...playlist_no_visual_data,
            visual_data: ignore_tracks === "PROMISE" ? 
                {four_track: tracks as Track[], track_count: 0} :
                {four_track: tracks as Track[], track_count: (tracks as Track[]).length}
        }
    }
    
    let all_playlist_data_memo: Playlist[] = [];
    export function get_all_playlist_data_memo(){
        return all_playlist_data_memo;
    }
    export async function resolve_all_playlist_data_memo(){
        all_playlist_data_memo = await Promise.all(all_playlist_data_memo.map(async(playlist) => ({...playlist, visual_data: {...playlist.visual_data ?? {}, four_track: await Promise.resolve(playlist.visual_data!.four_track ?? []) }})))
    }
    export async function all_playlists_data(ignore_tracks?: IgnoreTracks) {
        const playlists = await db.select().from(playlists_table);
        all_playlist_data_memo = await Promise.all( playlists.map(async(playlist) => sql_playlist_to_playlist(playlist, ignore_tracks ?? "PROMISE", playlist.archived ?? false)));
        resolve_all_playlist_data_memo().catch(catch_ignore);
        return all_playlist_data_memo;
    }
    
    export async function compact_playlists() {
        const playlists: CompactPlaylistData[] = [];
        for (const playlist of await all_playlists_data()) {
            playlists.push({
                title: playlist.title,
                four_track: playlist.visual_data!.four_track!,
                track_count: playlist.visual_data!.track_count!,
                track_callback: async () => await playlist_tracks(playlist.uuid),
                type: "PLAYLIST",
                thumbnail_uri: playlist.thumbnail_uri,
                pinned: playlist.pinned ?? false
            })
        }
        return playlists;
    }
    
    export async function deep_track_exists_in_playlist(playlist_uuid: string, track: Track){
        const tracks = await playlist_tracks(playlist_uuid, undefined, new Set(), true);
        return SQLTracks.track_exist_in_other(tracks, track);
    }
    
    export async function deep_tracks_exists_in_playlist(playlist_uuid: string, tracks: Track[]): Promise<boolean[]>{
        const ptracks = await playlist_tracks(playlist_uuid, undefined, new Set(), true);
        return tracks.map(track => SQLTracks.track_exist_in_other(ptracks, track));
    }
    
    export async function insert_all_tracks_playlist(many_playlist_tracks: PlaylistsTracks[]) {
        await Promise.all( many_playlist_tracks.map( async(playlist_track) => insert_track_playlist(playlist_track) ) );
    }
    export async function insert_track_playlist(playlist_track: PlaylistsTracks) {
        if(await track_exists_in_playlist(playlist_track)) return;
        await db.insert(playlists_tracks_table).values(playlist_track);
    }
    
    export async function delete_all_tracks_playlist(many_playlist_tracks: PlaylistsTracks[]) {
        await Promise.all( many_playlist_tracks.map( async(playlist_track) => delete_track_playlist(playlist_track) ) );
    }
    export async function delete_track_playlist(playlist_track: PlaylistsTracks) {
        await db
            .delete(playlists_tracks_table)
            .where(
                and(
                    eq(playlists_tracks_table.uuid, playlist_track.uuid),
                    eq(playlists_tracks_table.track_uid, playlist_track.track_uid),
                )
        );
    }
    export async function delete_track_from_all_playlists(track_uid: PlaylistsTracks['track_uid']) {
        await db
            .delete(playlists_tracks_table)
            .where(
                eq(playlists_tracks_table.track_uid, track_uid)
        );
    }
    export async function all_playlists_names(): Promise<{"title": string}[]> {
        return await db.select({title: playlists_table.title}).from(playlists_table);
    }
    const playlist_name_memo: Record<string, string> = {};
    export function get_playlist_name_sync(playlist_uuid: Playlist['uuid']) {
        const default_playlist_names = default_playlists.map(playlist => playlist.name);
        const try_default_playlist_name_find = default_playlist_names.find(name => name === playlist_uuid);
        if(try_default_playlist_name_find) return try_default_playlist_name_find;
        if(playlist_name_memo[playlist_uuid]) return playlist_name_memo[playlist_uuid];
        const found_playlist = all_playlist_data_memo.find(playlist => playlist.uuid === playlist_uuid);
        if(found_playlist) return found_playlist.title;
        
        db.select({title: playlists_table.title}).from(playlists_table).where(eq(playlists_table.uuid, playlist_uuid)).get().then(result => {
            if(result) playlist_name_memo[playlist_uuid] = result.title;
        }).catch(catch_ignore);
        
        return undefined;
    }
    export async function playlist_data(playlist_uuid: Playlist['uuid'], ignore_tracks: IgnoreTracks = "NO_IGNORE") {
        const found = all_playlist_data_memo.find(playlist => playlist.uuid === playlist_uuid);
        if(found) return found;
        
        const playlist = await db.select().from(playlists_table).where(eq(playlists_table.uuid, playlist_uuid)).get();
        if(!playlist) return undefined;
        return await sql_playlist_to_playlist(playlist, ignore_tracks);
    }
    export async function update_playlist(playlist_uuid: Playlist['uuid'], new_playlist: Playlist) {
        await db.update(playlists_table).set(new_playlist).where(eq(playlists_table.uuid, playlist_uuid));
    }
    export async function create_playlist(title: string, cuuid?: string): Promise<string> {
        const playlist_names = await all_playlists_names();
        let count = 2;
        if(playlist_names.findIndex((item) => item.title == title) != -1) {
            while(playlist_names.findIndex((item) => item.title == `${title} ${count}`) != -1 && count <= 100)
                count++;
            if(count > 0)
                title = `${title} ${count}`;
        }
        const playlist_uuid = cuuid ?? gen_uuid();
        await db.insert(playlists_table).values({uuid: playlist_uuid, title});
        return playlist_uuid;
    }
    export async function delete_playlist(playlist_uuid: string) {
        await db.transaction(async(tx) => {
            await tx.delete(playlists_table).where(eq(playlists_table.uuid, playlist_uuid));
            await tx.delete(playlists_tracks_table).where(eq(playlists_tracks_table.uuid, playlist_uuid));
        });
    }
    export async function delete_all_playlists() {
        const playlists = await all_playlists_data();
        await Promise.all( playlists.map(async(playlist) => delete_playlist(playlist.uuid)) );
    }
    export async function pin_unpin_playlist(playlist_uuid: string, pin: boolean) {
        (await db.update(playlists_table).set({pinned: pin}).where(eq(playlists_table.uuid, playlist_uuid)));
    }
    export async function public_private_playlist(playlist_uuid: string, is_public: boolean) {
        (await db.update(playlists_table).set({public: is_public}).where(eq(playlists_table.uuid, playlist_uuid)));
    }
    export async function archive_playlist(playlist_uuid: string, archive: boolean) {
        (await db.update(playlists_table).set({archived: archive}).where(eq(playlists_table.uuid, playlist_uuid)));
    }
    export async function is_playlist_pinned(playlist_uuid: string): Promise<boolean> {
        const pinned_result = await db.select({pinned: playlists_table.pinned})
            .from(playlists_table)
            .where(eq(playlists_table.uuid, playlist_uuid))
            .get();
        return Boolean(pinned_result?.pinned);
    }
    export async function update_playlist_title(playlist_uuid: string, title: string) {
        (await db.update(playlists_table).set({title: title}).where(eq(playlists_table.uuid, playlist_uuid)));
    }
    export async function update_playlist_description(playlist_uuid: string, description: string) {
        (await db.update(playlists_table).set({description: description}).where(eq(playlists_table.uuid, playlist_uuid)));
    }
    export async function update_playlist_sort_mode(playlist_uuid: string, sort_mode: SortType) {
        (await db.update(playlists_table).set({sort: sort_mode}).where(eq(playlists_table.uuid, playlist_uuid)));
    }
    export async function update_playlist_inherited_playlists(playlist_uuid: string, inherited_playlists: InheritedPlaylist[]) {
        (await db.update(playlists_table).set({inherited_playlists: inherited_playlists}).where(eq(playlists_table.uuid, playlist_uuid)));
    }
    export async function update_playlist_inherited_searchs(playlist_uuid: string, inherited_searchs: InheritedSearch[]) {
        (await db.update(playlists_table).set({inherited_searchs: inherited_searchs}).where(eq(playlists_table.uuid, playlist_uuid)));
    }
    export function inherited_playlists_action(inherited_playlists: InheritedPlaylist[], new_iplaylist: InheritedPlaylist, action: "ADD"|"REMOVE"): InheritedPlaylist[] {
        if(action === "ADD") return inherited_playlists.concat(new_iplaylist);
        else return inherited_playlists.filter(item => !(item.uuid === new_iplaylist.uuid && item.mode === new_iplaylist.mode));
    }
    export function inherited_searches_action(inherited_searches: InheritedSearch[], new_isearch: InheritedSearch, action: "ADD"|"REMOVE"): InheritedSearch[] {
        if(action === "ADD") return inherited_searches.concat(new_isearch);
        else return inherited_searches.filter(item => !(item.query === new_isearch.query && item.mode === new_isearch.mode));
    }
}