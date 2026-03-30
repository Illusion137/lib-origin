-- Drop unique indexes on service ID columns in the global tracks table.
-- These constraints prevented inserting a local track whose service ID
-- already belonged to a different UID in the pool, causing 23505 errors
-- during initial sync now that inline dedup/UID-merging has been removed.
-- Deduplication will be handled separately by a background cron job.

DROP INDEX IF EXISTS public.tracks_youtube_id_idx;
DROP INDEX IF EXISTS public.tracks_youtubemusic_id_idx;
DROP INDEX IF EXISTS public.tracks_soundcloud_id_idx;
DROP INDEX IF EXISTS public.tracks_soundcloud_plink_idx;
DROP INDEX IF EXISTS public.tracks_spotify_id_idx;
DROP INDEX IF EXISTS public.tracks_amazonmusic_id_idx;
DROP INDEX IF EXISTS public.tracks_applemusic_id_idx;
DROP INDEX IF EXISTS public.tracks_bandlab_id_idx;
DROP INDEX IF EXISTS public.tracks_illusi_id_idx;
DROP INDEX IF EXISTS public.tracks_imported_id_idx;
