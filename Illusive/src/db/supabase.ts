import 'dotenv/config';
import { createClient, type SupportedStorage } from "@supabase/supabase-js";
import { MMKV } from 'react-native-mmkv';
import { SQLTracks } from '@illusive/sql/sql_tracks';
import type { Database } from './database.types';
import { separate_array } from '@common/utils/util';
import type { Track } from '@illusive/types';

const storage = new MMKV({ id: 'supabase-storage' })

const mmkv_storage_config = {
    setItem: (key, data) => storage.set(key, data),
    getItem: (key) => storage.getString(key) ?? null,
    removeItem: (key) => storage.delete(key),
} satisfies SupportedStorage;

export const supabase = createClient<Database>(process.env.SUPABASE_PROJECT_URL, process.env.SUPABASE_PUBLIC_KEY, {
    auth: {
        storage: mmkv_storage_config,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
});

export namespace SosuSync {
    function merge_track(server_track: Track, local_track: Track): {track: Track, push: boolean}{
        return {track: server_track, push: false};
    }
    async function pull_tracks(last_synced_time_epoch_ms: number){ 
        return await supabase.from("utracks").select(`
            deleted, 
            tracks (
                uuid,
                title,
                artists,
                album,
                duration,
                prods,
                tags,
                explicit,
                service_uris,
                artwork_url,
                created_at,
                modified_at
                )
            `).gt('modified_at', last_synced_time_epoch_ms);;
        // supabase.from("utracks").select("track_uuid tracks(track_uuid)").eq("user_uid", supabase.auth).gte("modified_at", last_synced_time_epoch_ms);
    }
    async function push_tracks(){ return; }
    export async function sync_tracks(last_synced_time_epoch_ms: number){
        const local_tracks = await SQLTracks.get_tracks();
        const local_tracks_uuids = new Set<string>(local_tracks.map(track => track.illusi_id ?? ""));
        const local_push_tracks = await SQLTracks.get_tracks(); // TODO call this as await SQLTracks.get_push_tracks();
        const server_tracks = await pull_tracks(last_synced_time_epoch_ms); // TODO use minimum sync time of all the tracks
        if(server_tracks.error !== null){
            // TODO handle error
            return;
        }
        const [pulled_tracks_to_delete, __no_delete__, pulled_tracks_to_insert, pulled_tracks_to_merge] = separate_array(server_tracks.data, [
            track => track.deleted && local_tracks_uuids.has(track.tracks.uuid),
            track => track.deleted && !local_tracks_uuids.has(track.tracks.uuid),
            track => track.tracks.modified_at === track.tracks.created_at && !local_tracks_uuids.has(track.tracks.uuid),
            _ => true
        ]);
        // pulled_tracks_to_delete.forEach(async(track) => {await SQLTracks.delete_track(track.tracks)});
        // pulled_tracks_to_insert.forEach(async(track) => {await SQLTracks.insert_track(track.tracks)});

        await push_tracks();
    }
}