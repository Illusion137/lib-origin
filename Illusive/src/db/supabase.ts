import { createClient, type SupportedStorage } from "@supabase/supabase-js";
import { MMKV } from 'react-native-mmkv';
import type { Database } from './database.types';

const storage = new MMKV({ id: 'supabase-storage' })

const mmkv_storage_config = {
    setItem: (key, data) => storage.set(key, data),
    getItem: (key) => storage.getString(key) ?? null,
    removeItem: (key) => storage.delete(key),
} satisfies SupportedStorage;

export const supabase = createClient<Database>(process.env.EXPO_PUBLIC_SUPABASE_PROJECT_URL ?? '', process.env.EXPO_PUBLIC_SUPABASE_PUBLIC_KEY ?? '', {
    auth: {
        storage: mmkv_storage_config,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
});