-- ============================================================
-- Playlist custom artwork
--
-- playlists.artwork_path: content-hash filename ("<sha256>.webp") of the
-- 500x500 webp stored in the playlist-artworks bucket. NULL = no custom
-- artwork uploaded for this playlist.
--
-- Bucket is content-addressed and immutable: objects are named by the
-- sha256 of their bytes, so identical artworks dedupe across users and an
-- object's content never changes (clients may cache forever).
-- ============================================================
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS artwork_path text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('playlist-artworks', 'playlist-artworks', true, 2097152, ARRAY['image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public             = EXCLUDED.public,
    file_size_limit    = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read (public playlists hand these URLs to any user); authenticated
-- insert only. No UPDATE/DELETE policies: objects are immutable and may be
-- shared by many playlists/users, so nothing is ever overwritten or removed.
DROP POLICY IF EXISTS "playlist_artworks_select" ON storage.objects;
CREATE POLICY "playlist_artworks_select" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'playlist-artworks');

DROP POLICY IF EXISTS "playlist_artworks_insert" ON storage.objects;
CREATE POLICY "playlist_artworks_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'playlist-artworks');
